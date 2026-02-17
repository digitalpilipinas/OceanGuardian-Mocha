
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, PlusSquare, Download } from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { Button } from "../../react-app/components/ui/button";

export function InstallPrompt() {
    const { deferredPrompt, isIOS, isStandalone, installPWA } = usePWAInstall();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show prompt if available and not already installed
        if (!isStandalone && (deferredPrompt || isIOS)) {
            // Delay slightly to not clutter initial load
            const timer = setTimeout(() => setIsOpen(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [deferredPrompt, isIOS, isStandalone]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
                >
                    <div className="relative overflow-hidden rounded-xl border border-white/20 bg-slate-900/90 p-4 shadow-xl backdrop-blur-xl">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-blue-500/20 p-3">
                                <Download className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white">Install OceanGuardian</h3>
                                <p className="mt-1 text-sm text-slate-300">
                                    Add to your home screen for the best experience and offline access.
                                </p>

                                {isIOS ? (
                                    <div className="mt-3 space-y-2 rounded-lg bg-white/5 p-3 text-sm text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Share className="h-4 w-4 text-blue-400" />
                                            <span>Tap the Share button</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <PlusSquare className="h-4 w-4 text-blue-400" />
                                            <span>Select "Add to Home Screen"</span>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={installPWA}
                                        className="mt-3 w-full bg-blue-600 hover:bg-blue-500"
                                    >
                                        Install App
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
                        <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-cyan-500/20 blur-2xl" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
