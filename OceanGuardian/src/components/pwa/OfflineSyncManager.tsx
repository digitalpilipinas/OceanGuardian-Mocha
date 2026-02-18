import { useCallback, useEffect, useRef } from "react";
import { offlineStorage, type SightingData } from "../../lib/offline-storage";
import { useToast } from "@/react-app/components/ui/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";

const INITIAL_SYNC_DELAY_MS = 2000;
const PERIODIC_SYNC_INTERVAL_MS = 30_000;

function buildSightingBody(sighting: SightingData): Record<string, unknown> {
    const body: Record<string, unknown> = {
        type: sighting.type,
        subcategory: sighting.subcategory,
        description: sighting.description,
        severity: sighting.severity,
        latitude: sighting.latitude,
        longitude: sighting.longitude,
        client_request_id: sighting.id,
    };

    if (sighting.imageKey) body.image_key = sighting.imageKey;
    if (sighting.aiAnalysis) body.ai_analysis = sighting.aiAnalysis;

    if (sighting.type === "coral") {
        if (sighting.waterTemp) body.water_temp = parseFloat(sighting.waterTemp);
        if (sighting.bleachPercent) body.bleach_percent = parseInt(sighting.bleachPercent, 10);
        if (sighting.depth) body.depth = parseFloat(sighting.depth);
    }

    return body;
}

async function readErrorMessage(response: Response): Promise<string> {
    try {
        const json = await response.json();
        if (typeof json?.error === "string" && json.error.length > 0) {
            return json.error;
        }
    } catch {
        // fall through to status text
    }
    return response.statusText || "Request failed";
}

function emitRefreshEvents() {
    window.dispatchEvent(new Event("og:sightings-refresh"));
    window.dispatchEvent(new Event("og:user-data-refresh"));
}

export function OfflineSyncManager() {
    const { toast } = useToast();
    const { profile: user } = useUserProfile();
    const syncInProgressRef = useRef(false);

    const syncSightings = useCallback(async () => {
        if (!user?.id || !navigator.onLine || syncInProgressRef.current) return;

        syncInProgressRef.current = true;

        try {
            const pending = await offlineStorage.getPendingSightings(user.id);
            if (pending.length === 0) return;

            toast({
                title: "Syncing Data",
                description: `Uploading ${pending.length} offline report(s)...`,
                action: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
            });

            let successCount = 0;
            let failedCount = 0;

            for (const sighting of pending) {
                let sightingId = sighting.serverSightingId ?? null;

                try {
                    if (!sightingId) {
                        const createRes = await fetch("/api/sightings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(buildSightingBody(sighting)),
                        });

                        if (!createRes.ok) {
                            const message = await readErrorMessage(createRes);
                            throw new Error(`Create failed (${createRes.status}): ${message}`);
                        }

                        const result = await createRes.json() as { sighting?: { id?: number } };
                        sightingId = Number(result.sighting?.id);
                        if (!Number.isFinite(sightingId) || sightingId <= 0) {
                            throw new Error("Create response did not include a valid sighting id");
                        }
                    }

                    if (sighting.photoBlob && sightingId) {
                        const photoForm = new FormData();
                        const file = new File([sighting.photoBlob], "offline-photo.jpg", { type: "image/jpeg" });
                        photoForm.append("photo", file);

                        const photoRes = await fetch(`/api/sightings/${sightingId}/photo`, {
                            method: "POST",
                            body: photoForm,
                        });

                        if (!photoRes.ok) {
                            const message = await readErrorMessage(photoRes);
                            throw new Error(`Photo upload failed (${photoRes.status}): ${message}`);
                        }
                    }

                    await offlineStorage.removeSighting(sighting.id);
                    successCount++;
                } catch (err) {
                    failedCount++;
                    const errorMessage = err instanceof Error ? err.message : "Unknown sync error";
                    console.error(`Failed to sync sighting ${sighting.id}`, err);
                    await offlineStorage.saveSighting({
                        ...sighting,
                        serverSightingId: sightingId ?? sighting.serverSightingId ?? null,
                        attemptCount: (sighting.attemptCount ?? 0) + 1,
                        lastAttemptAt: Date.now(),
                        lastError: errorMessage,
                    });
                }
            }

            if (successCount > 0) {
                toast({
                    title: "Sync Complete",
                    description: `Successfully uploaded ${successCount} reports.`,
                    action: <CheckCircle className="h-4 w-4 text-green-500" />,
                });
                emitRefreshEvents();
            }

            if (failedCount > 0) {
                toast({
                    title: "Sync Pending",
                    description: `${failedCount} report(s) are still queued and will retry automatically.`,
                });
            }
        } catch (err) {
            console.error("Sync process error", err);
        } finally {
            syncInProgressRef.current = false;
        }
    }, [toast, user?.id]);

    useEffect(() => {
        const handleOnline = () => {
            void syncSightings();
        };
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                void syncSightings();
            }
        };

        window.addEventListener("online", handleOnline);
        document.addEventListener("visibilitychange", handleVisibility);

        const intervalId = window.setInterval(() => {
            void syncSightings();
        }, PERIODIC_SYNC_INTERVAL_MS);

        let initialTimeoutId: number | undefined;

        if (navigator.onLine) {
            initialTimeoutId = window.setTimeout(() => {
                void syncSightings();
            }, INITIAL_SYNC_DELAY_MS);
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            document.removeEventListener("visibilitychange", handleVisibility);
            window.clearInterval(intervalId);
            if (typeof initialTimeoutId === "number") {
                window.clearTimeout(initialTimeoutId);
            }
        };
    }, [syncSightings]);

    return null;
}
