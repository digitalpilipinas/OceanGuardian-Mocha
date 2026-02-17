
import { useEffect, useState } from "react";
import { offlineStorage } from "../../lib/offline-storage";
import { useToast } from "@/react-app/components/ui/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

export function OfflineSyncManager() {
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const handleOnline = async () => {
            console.log("Network restored. Checking for pending sightings...");
            await syncSightings();
        };

        window.addEventListener("online", handleOnline);

        // Initial check in case we reload and are already online
        if (navigator.onLine) {
            // Small delay to allow app to hydrate
            setTimeout(syncSightings, 2000);
        }

        return () => {
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    const syncSightings = async () => {
        if (isSyncing) return;

        try {
            const pending = await offlineStorage.getPendingSightings();
            if (pending.length === 0) return;

            setIsSyncing(true);
            toast({
                title: "Syncing Data",
                description: `Uploading ${pending.length} offline report(s)...`,
                action: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
            });

            let successCount = 0;

            for (const sighting of pending) {
                try {
                    // 1. Submit Sighting Data
                    const body: Record<string, unknown> = {
                        type: sighting.type,
                        subcategory: sighting.subcategory,
                        description: sighting.description,
                        severity: sighting.severity,
                        latitude: sighting.latitude,
                        longitude: sighting.longitude,
                    };

                    if (sighting.type === "coral") {
                        if (sighting.waterTemp) body.water_temp = parseFloat(sighting.waterTemp);
                        if (sighting.bleachPercent) body.bleach_percent = parseInt(sighting.bleachPercent);
                        if (sighting.depth) body.depth = parseFloat(sighting.depth);
                    }

                    const res = await fetch("/api/sightings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    });

                    if (!res.ok) throw new Error("Failed to create sighting");
                    const result = await res.json();
                    const sightingId = result.sighting?.id;

                    // 2. Upload Photo (if exists)
                    if (sighting.photoBlob && sightingId) {
                        const photoForm = new FormData();
                        // Convert Blob back to File
                        const file = new File([sighting.photoBlob], "offline-photo.jpg", { type: "image/jpeg" });
                        photoForm.append("photo", file);

                        await fetch(`/api/sightings/${sightingId}/photo`, {
                            method: "POST",
                            body: photoForm,
                        });
                    }

                    // 3. Remove from IndexedDB on success
                    await offlineStorage.removeSighting(sighting.id);
                    successCount++;
                } catch (err) {
                    console.error(`Failed to sync sighting ${sighting.id}`, err);
                    // Keep it in IDB to retry later
                }
            }

            if (successCount > 0) {
                toast({
                    title: "Sync Complete",
                    description: `Successfully uploaded ${successCount} reports.`,
                    action: <CheckCircle className="h-4 w-4 text-green-500" />,
                });
            }
        } catch (err) {
            console.error("Sync process error", err);
        } finally {
            setIsSyncing(false);
        }
    };

    return null; // Headless component
}
