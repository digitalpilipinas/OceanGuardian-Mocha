import { useState, useEffect, useRef } from "react";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { Download, Share2, X } from "lucide-react";
import type { UserProfile, UserBadge } from "@/shared/types";

interface ImpactBadgeGeneratorProps {
    badge: UserBadge | { name: string; description: string; icon: string; rarity: string; category: string; earned_at?: string };
    userProfile: UserProfile;
    onClose: () => void;
}

type TemplateType = "social" | "certificate" | "circular" | "grid";

export default function ImpactBadgeGenerator({ badge, userProfile, onClose }: ImpactBadgeGeneratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("social");

    // Safe accessors
    const badgeName = badge.name || "Unknown Badge";
    const badgeDesc = badge.description || "No description";
    const badgeIcon = badge.icon || "🏅"; // Fallback icon
    const badgeRarity = badge.rarity || "common";
    const earnedAt = badge.earned_at || new Date().toISOString();

    // Canvas dimensions based on template
    const getCanvasDimensions = (template: TemplateType) => {
        switch (template) {
            case "social": return { width: 1200, height: 630 }; // OG Image standard
            case "certificate": return { width: 1000, height: 700 }; // Landscape A4-ish ratio
            case "circular": return { width: 800, height: 800 }; // Square
            case "grid": return { width: 1080, height: 1080 }; // Instagram Post
            default: return { width: 800, height: 800 };
        }
    };

    const drawTemplate = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = getCanvasDimensions(selectedTemplate);
        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Helper: Draw rounded rect
        const roundedRect = (x: number, y: number, w: number, h: number, r: number) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        };

        // --- TEMPLATE LOGIC ---
        if (selectedTemplate === "social") {
            // Gradient Background
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, "#e0f2fe"); // sky-100
            gradient.addColorStop(1, "#f0f9ff"); // sky-50

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Accents
            ctx.fillStyle = "#0ea5e9";
            ctx.globalAlpha = 0.1;
            ctx.beginPath();
            ctx.arc(width, 0, 400, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, height, 300, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Badge Icon (Big, Left or Center)
            ctx.font = "200px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(badgeIcon, width / 2, height / 2 - 50);

            // Text
            ctx.fillStyle = "#1e293b";
            ctx.textAlign = "center";

            ctx.font = "bold 60px Inter, sans-serif";
            ctx.fillText("BADGE UNLOCKED", width / 2, height / 2 + 100);

            ctx.font = "bold 80px Inter, sans-serif";
            ctx.fillStyle = "#0284c7";
            ctx.fillText(badgeName, width / 2, height / 2 + 190);

            // Footer
            ctx.fillStyle = "#64748b";
            ctx.font = "40px Inter, sans-serif";
            const dateStr = new Date(earnedAt).toLocaleDateString();
            ctx.fillText(`Earned by ${userProfile.username || "Ocean Guardian"} • ${dateStr}`, width / 2, height - 50);

        } else if (selectedTemplate === "certificate") {
            // Background
            ctx.fillStyle = "#fefce8"; // light yellow/parchment
            ctx.fillRect(0, 0, width, height);

            // Border
            ctx.strokeStyle = "#0ea5e9";
            ctx.lineWidth = 20;
            ctx.strokeRect(40, 40, width - 80, height - 80);

            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 5;
            ctx.strokeRect(70, 70, width - 140, height - 140);

            // Header
            ctx.fillStyle = "#1e293b";
            ctx.textAlign = "center";
            ctx.font = "bold 60px Serif";
            ctx.fillText("Certificate of Achievement", width / 2, 180);

            ctx.font = "40px Sans-serif";
            ctx.fillStyle = "#64748b";
            ctx.fillText("This certifies that", width / 2, 260);

            // User Name
            ctx.font = "italic bold 80px Serif";
            ctx.fillStyle = "#0284c7";
            ctx.fillText(userProfile.username || "Ocean Guardian", width / 2, 360);

            ctx.font = "40px Sans-serif";
            ctx.fillStyle = "#64748b";
            ctx.fillText("has earned the badge", width / 2, 440);

            // Badge
            ctx.font = "100px serif";
            ctx.fillText(badgeIcon, width / 2, 560);

            ctx.font = "bold 50px Sans-serif";
            ctx.fillStyle = "#1e293b";
            ctx.fillText(badgeName, width / 2, 630);

        } else if (selectedTemplate === "circular") {
            // Circular clip
            ctx.save();
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, width / 2 - 20, 0, Math.PI * 2);
            ctx.clip();

            // Background
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width / 2);
            gradient.addColorStop(0, "#f0f9ff");
            gradient.addColorStop(1, "#bae6fd");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Rings
            ctx.strokeStyle = "#0ea5e9";
            ctx.lineWidth = 40;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, width / 2 - 40, 0, Math.PI * 2);
            ctx.stroke();

            // Badge
            ctx.font = "300px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(badgeIcon, width / 2, height / 2 - 50);

            // Curved Text (Simplified: just bottom text for now)
            ctx.font = "bold 60px Sans-serif";
            ctx.fillStyle = "#0284c7";
            ctx.fillText(badgeName, width / 2, height / 2 + 200);

            ctx.restore();

        } else if (selectedTemplate === "grid") {
            // Modern Card Style
            // Card Bg
            ctx.fillStyle = "#1e293b"; // Dark slate
            ctx.fillRect(0, 0, width, height);

            // Inner Card
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 50;
            ctx.fillStyle = "#334155";
            roundedRect(100, 100, width - 200, height - 200, 40);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Icon
            ctx.font = "300px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(badgeIcon, width / 2, height / 2 - 100);

            // Text
            ctx.fillStyle = "#f8fafc";
            ctx.font = "bold 80px Sans-serif";
            ctx.fillText(badgeName, width / 2, height / 2 + 150);

            ctx.fillStyle = "#94a3b8";
            ctx.font = "40px Sans-serif";
            const descLines = wrapText(ctx, badgeDesc, width - 300);
            let yPos = height / 2 + 250;
            descLines.forEach(line => {
                ctx.fillText(line, width / 2, yPos);
                yPos += 50;
            });

            // Rarity Label
            ctx.fillStyle = "#f59e0b";
            ctx.font = "bold 50px Sans-serif";
            ctx.fillText(badgeRarity.toUpperCase(), width / 2, height - 100);
        }
    };

    // Helper to wrap text
    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    useEffect(() => {
        drawTemplate();
    }, [selectedTemplate, badge]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement("a");
        link.download = `badge-${badgeName.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const handleShare = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
            if (!blob) return;

            const file = new File([blob], "badge.png", { type: "image/png" });
            const shareData = {
                title: 'I earned a new badge on Ocean Guardian!',
                text: `Check out my ${badgeName} badge! 🌊 #OceanGuardian`,
                files: [file]
            };

            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                alert("Sharing text copied! (Image sharing not supported on this device/browser)");
            }
        } catch (err) {
            console.error("Error sharing:", err);
            alert("Could not share. Try downloading instead!");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Controls */}
                    <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-700/50 p-6 flex flex-col gap-6 overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Share Badge</h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white md:hidden">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Style</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {(["social", "certificate", "circular", "grid"] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setSelectedTemplate(t)}
                                        className={`
                                            flex flex-col items-start p-3 rounded-lg border transition-all
                                            ${selectedTemplate === t
                                                ? "bg-sky-600/20 border-sky-500/50 text-white"
                                                : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800"
                                            }
                                        `}
                                    >
                                        <span className="font-medium capitalize text-sm">{t}</span>
                                        <span className="text-[10px] opacity-70">
                                            {t === "social" && "Best for Social Media"}
                                            {t === "certificate" && "Official Achievement"}
                                            {t === "circular" && "Profile Picture"}
                                            {t === "grid" && "Collectible Card"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto space-y-3 pt-6">
                            <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-900/20" onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PNG
                            </Button>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleShare}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 bg-slate-950/50 flex flex-col relative overflow-hidden">
                        <div className="absolute top-4 right-4 hidden md:block">
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                            <canvas
                                ref={canvasRef}
                                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                                style={{ maxHeight: 'calc(100vh - 200px)' }}
                            />
                        </div>

                        <div className="p-2 text-center text-xs text-slate-500 border-t border-slate-800/50 bg-slate-900/50">
                            Preview generated in browser
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
