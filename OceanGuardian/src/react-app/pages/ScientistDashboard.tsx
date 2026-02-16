import { useState, useEffect } from "react";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Check, X, MapPin, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/react-app/components/ui/badge";

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
    const [reviews, setReviews] = useState<Sighting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
        <div className="container mx-auto p-4 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Scientist Review Queue</h1>
                    <p className="text-muted-foreground">Validate mock AI coral health reports ({reviews.length} pending)</p>
                </div>
                <Button onClick={fetchReviews} variant="outline" size="sm">Refresh</Button>
            </div>

            {reviews.length === 0 ? (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No pending reviews. Good job! 🪸
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
    );
}
