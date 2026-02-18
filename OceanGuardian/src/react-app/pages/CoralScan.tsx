import { useState } from "react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/react-app/components/ui/card";
import { Loader2, Upload, Camera, Info } from "lucide-react";
import { useNavigate } from "react-router";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import { offlineStorage, type SightingData } from "@/lib/offline-storage";

type CoralAnalysisResult = {
    bleachPercent: number;
    severity: "Healthy" | "Low" | "Moderate" | "High" | "Severe";
    color: string;
    recommendation: string;
    confidence: number;
    modelVersion: string;
    imageKey: string;
};

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

function isRetryableStatus(status: number): boolean {
    return RETRYABLE_STATUS_CODES.has(status);
}

function mapCoralSeverityToLevel(severity: CoralAnalysisResult["severity"]): number {
    if (severity === "Healthy") return 1;
    if (severity === "Low") return 2;
    if (severity === "Moderate") return 3;
    if (severity === "High") return 4;
    return 5;
}

async function readApiError(response: Response): Promise<string> {
    try {
        const json = await response.json();
        if (typeof json?.error === "string" && json.error.length > 0) {
            return json.error;
        }
    } catch {
        // fall through
    }
    return response.statusText || "Request failed";
}

function emitRefreshEvents() {
    window.dispatchEvent(new Event("og:sightings-refresh"));
    window.dispatchEvent(new Event("og:user-data-refresh"));
}

async function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
        });
    });
}

type SightingSubmitResponse = {
    sighting?: { id?: number };
};

export default function CoralScan() {
    const navigate = useNavigate();
    const { profile: user } = useUserProfile();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<CoralAnalysisResult | null>(null);
    const [saving, setSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch("/api/coral/analyze", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error(await readApiError(res));
            const data = await res.json() as CoralAnalysisResult;
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Failed to analyze image. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const savePendingReport = async (pendingData: SightingData, alertMessage: string) => {
        try {
            await offlineStorage.saveSighting(pendingData);
            emitRefreshEvents();
            alert(alertMessage);
            navigate("/map");
        } catch (queueError) {
            console.error("Failed to save coral report to outbox", queueError);
            alert("Could not save report to local outbox. Please try again.");
        }
    };

    const handleSaveReport = async () => {
        if (!result) return;
        if (!user?.id) {
            alert("Please sign in to save this coral report.");
            navigate("/login");
            return;
        }
        if (!navigator.geolocation) {
            alert("Geolocation is required to save coral reports.");
            return;
        }

        setSaving(true);
        let pendingData: SightingData | null = null;

        try {
            const position = await getCurrentPosition();

            pendingData = {
                id: crypto.randomUUID(),
                userId: user.id,
                timestamp: Date.now(),
                type: "coral",
                subcategory: "Analyzed Scan",
                description: `AI Analysis: ${result.severity} (${result.bleachPercent}% bleaching). ${result.recommendation}`,
                severity: mapCoralSeverityToLevel(result.severity),
                location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                bleachPercent: String(result.bleachPercent),
                imageKey: result.imageKey,
                aiAnalysis: JSON.stringify(result),
                serverSightingId: null,
            };

            if (!navigator.onLine) {
                await savePendingReport(
                    pendingData,
                    "Coral report saved to outbox. It will sync automatically when connection is restored.",
                );
                return;
            }

            const createBody: Record<string, unknown> = {
                type: "coral",
                subcategory: pendingData.subcategory,
                description: pendingData.description,
                severity: pendingData.severity,
                latitude: pendingData.latitude,
                longitude: pendingData.longitude,
                bleach_percent: Number(result.bleachPercent),
                image_key: result.imageKey,
                ai_analysis: pendingData.aiAnalysis,
                client_request_id: pendingData.id,
            };

            const res = await fetch("/api/sightings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createBody),
            });

            if (!res.ok) {
                const errorMessage = await readApiError(res);
                if (isRetryableStatus(res.status)) {
                    await savePendingReport(
                        { ...pendingData, lastError: `Create failed (${res.status}): ${errorMessage}` },
                        "Coral report queued for retry. It will sync automatically.",
                    );
                    return;
                }
                throw new Error(errorMessage || "Failed to save report");
            }

            const submitResult = await res.json() as SightingSubmitResponse;
            const sightingId = Number(submitResult.sighting?.id);
            if (!Number.isFinite(sightingId) || sightingId <= 0) {
                await savePendingReport(
                    { ...pendingData, lastError: "Create response did not include a valid sighting id." },
                    "Coral report queued for retry due to incomplete response.",
                );
                return;
            }

            emitRefreshEvents();
            alert("Report saved successfully! Your contribution helps protect our oceans.");
            navigate("/map");
        } catch (error) {
            if (error instanceof TypeError && pendingData) {
                await savePendingReport(
                    {
                        ...pendingData,
                        lastError: "Network error while saving coral report.",
                    },
                    "Coral report queued for retry due to network error.",
                );
                return;
            }

            const message = error instanceof Error ? error.message : "Error saving report";
            console.error(error);
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container max-w-lg mx-auto p-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="w-6 h-6 text-primary" />
                        Coral Health Scan
                    </CardTitle>
                    <CardDescription>
                        Upload a photo of coral to detect bleaching severity using our AI model.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!result && (
                        <div className="space-y-4">
                            <label className="block w-full aspect-square md:aspect-video rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-muted/10 relative overflow-hidden">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Tap to take photo or upload</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            <Button
                                onClick={handleAnalyze}
                                disabled={!file || analyzing}
                                className="w-full"
                                size="lg"
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing Coral Structure...
                                    </>
                                ) : (
                                    "Analyze Health"
                                )}
                            </Button>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center space-y-2">
                                <div
                                    className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 text-3xl font-bold bg-background shadow-lg"
                                    style={{ borderColor: result.color, color: result.color }}
                                >
                                    {result.bleachPercent}%
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: result.color }}>
                                        {result.severity} Bleaching
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Confidence: {(result.confidence * 100).toFixed(0)}%</p>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg space-y-2 border-l-4" style={{ borderColor: result.color }}>
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Recommendation
                                </h4>
                                <p className="text-sm">{result.recommendation}</p>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => { setFile(null); setPreview(null); setResult(null); }}>
                                    Scan Another
                                </Button>
                                <Button className="flex-1" onClick={handleSaveReport} disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Report"
                                    )}
                                </Button>
                            </div>

                            <p className="text-xs text-center text-muted-foreground pt-4">
                                * AI analysis is experimental. Submit report for scientist validation.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
