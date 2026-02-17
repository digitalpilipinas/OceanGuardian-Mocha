
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="fixed left-0 right-0 top-0 z-[100] flex justify-center p-2"
                >
                    <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/90 px-4 py-2 text-sm font-medium text-red-200 shadow-lg backdrop-blur-md">
                        <WifiOff className="h-4 w-4" />
                        <span>You are offline. Changes will be saved locally.</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
