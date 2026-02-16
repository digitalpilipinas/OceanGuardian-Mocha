import { useState, useEffect } from "react";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Check, X, MapPin, Loader2, AlertCircle, Download, FileJson, FileSpreadsheet, CheckCircle2, History } from "lucide-react";
import { Badge } from "@/react-app/components/ui/badge";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/react-app/components/ui/select";

interface Sighting {
    id: number;
    type: string;
    subcategory: string;
    description: string;
    bleach_percent: number;
    severity: number; // 1-5
    image_key?: string;
    latitude: number;
    longitude: number;
    created_at: string;
    user_name: string;
    ai_analysis?: string; // JSON string
    status: string;
}

export default function ScientistDashboard() {
    const { profile, loading: profileLoading } = useUserProfile();
    const [reviews, setReviews] = useState<Sighting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exportFormat, setExportFormat] = useState("csv");
    const [exportDays, setExportDays] = useState("30");

    useEffect(() => {
        if (!profileLoading && profile?.role !== "scientist" && profile?.role !== "admin") {
            setError("Access Denied: Scientist/Admin only.");
        }
    }, [profile, profileLoading]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/coral/review-queue");
            if (res.status === 403) {
                throw new Error("Access Denied: Scientist/Admin only.");
            }
            if (!res.ok) throw new Error("Failed to fetch queue");
            const data = await res.json();
            setReviews(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleReview = async (id: number, action: "approve" | "reject") => {
        // Optimistic update
        setReviews((prev) => prev.filter((r) => r.id !== id));

        try {
            await fetch(`/api/coral/review/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
            fetchReviews(); // Revert
        }
    };

    const handleExport = () => {
        const url = `/api/scientist/export?format=${exportFormat}&days=${exportDays}`;
        window.open(url, "_blank");
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container p-8 text-center">
                <div className="max-w-md mx-auto bg-destructive/10 text-destructive p-6 rounded-lg flex flex-col items-center gap-4">
                    <AlertCircle className="h-12 w-12" />
                    <h2 className="text-xl font-bold">Access Denied</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-4 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
                        Scientist <span className="text-primary">Station</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium mt-2">Manage data quality and export research data for conservation.</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={fetchReviews} variant="neomorph" className="h-12 px-6 font-bold">
                        <History className="mr-2 h-5 w-5 text-primary" /> Refresh Queue
                    </Button>
                </div>
            </div>

            {/* Export Section */}
            <Card variant="solid" className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <CardContent className="p-8 relative z-10 flex flex-col lg:flex-row items-center gap-8">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold flex items-center gap-3 text-foreground mb-1">
                            <div className="p-2 rounded-xl neo-flat">
                                <Download className="h-5 w-5 text-primary" />
                            </div>
                            Research Data Export
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">Download verified sightings data for in-depth analysis and reporting.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        <Select value={exportDays} onValueChange={setExportDays}>
                            <SelectTrigger className="w-[160px] h-12 neo-interactive bg-background/50 border-none rounded-xl font-bold">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent className="glass-liquid border-white/10">
                                <SelectItem value="7">Last 7 Days</SelectItem>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="90">Last 90 Days</SelectItem>
                                <SelectItem value="365">Last Year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={exportFormat} onValueChange={setExportFormat}>
                            <SelectTrigger className="w-[140px] h-12 neo-interactive bg-background/50 border-none rounded-xl font-bold">
                                <SelectValue placeholder="Format" />
                            </SelectTrigger>
                            <SelectContent className="glass-liquid border-white/10">
                                <SelectItem value="csv">CSV File</SelectItem>
                                <SelectItem value="geojson">GeoJSON</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="neomorph-primary" className="h-12 px-8 font-bold text-sm uppercase tracking-widest" onClick={handleExport}>
                            {exportFormat === "csv" ? <FileSpreadsheet className="mr-2 h-5 w-5" /> : <FileJson className="mr-2 h-5 w-5" />}
                            Export Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-8">
                <h2 className="text-2xl font-black flex items-center gap-4 text-foreground">
                    <div className="p-2 rounded-xl neo-flat">
                        <Check className="h-6 w-6 text-primary" />
                    </div>
                    Verification Queue <span className="text-muted-foreground font-medium ml-2 text-lg">({reviews.length} Pending)</span>
                </h2>

                {reviews.length === 0 ? (
                    <Card variant="neomorph" className="border-dashed border-2 border-primary/20 bg-background/50">
                        <CardContent className="py-20 text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 neo-flat">
                                <CheckCircle2 className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">All Clear!</p>
                            <p className="text-muted-foreground mt-2 font-medium">The verification queue is currently empty. Excellent work, Doctor.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reviews.map((item) => (
                            <Card key={item.id} className="overflow-hidden flex flex-col">
                                {item.image_key ? (
                                    <div className="aspect-video bg-muted relative">
                                        <img
                                            src={`/api/sightings/${item.id}/photo`}
                                            alt="Coral"
                                            className="w-full h-full object-cover"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                        <Badge className="absolute top-2 right-2 bg-black/50 hover:bg-black/70">
                                            {item.bleach_percent}% Bleached
                                        </Badge>
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-muted flex items-center justify-center">
                                        <span className="text-muted-foreground">No Image</span>
                                    </div>
                                )}

                                <CardContent className="flex-1 p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold truncate">{item.subcategory || "Coral Report"}</h3>
                                            <p className="text-xs text-muted-foreground">by {item.user_name}</p>
                                        </div>
                                        <Badge variant={item.severity > 3 ? "destructive" : "secondary"}>
                                            Sev: {item.severity}
                                        </Badge>
                                    </div>

                                    <p className="text-sm line-clamp-2 text-muted-foreground bg-muted p-2 rounded">
                                        "{item.description}"
                                    </p>

                                    <div className="text-xs text-muted-foreground flex gap-2">
                                        <MapPin className="h-3 w-3" />
                                        {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                                    </div>

                                    {item.ai_analysis && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-900 text-xs">
                                            <span className="font-semibold text-blue-700 dark:text-blue-300">AI Says:</span>
                                            <p className="line-clamp-2">{JSON.parse(item.ai_analysis).recommendation}</p>
                                        </div>
                                    )}
                                </CardContent>

                                <div className="p-4 pt-0 mt-auto flex gap-2">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        size="sm"
                                        onClick={() => handleReview(item.id, "approve")}
                                    >
                                        <Check className="h-4 w-4 mr-1" /> Verify
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        size="sm"
                                        onClick={() => handleReview(item.id, "reject")}
                                    >
                                        <X className="h-4 w-4 mr-1" /> Reject
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
