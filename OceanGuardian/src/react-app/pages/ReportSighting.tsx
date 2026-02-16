import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import { useGamification } from "@/react-app/components/GamificationProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Textarea } from "@/react-app/components/ui/textarea";
import { Label } from "@/react-app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";
import { Badge } from "@/react-app/components/ui/badge";
import { Trash2, Fish, Anchor, Waves, Upload, MapPin, Camera, Loader2, CheckCircle, AlertTriangle, Thermometer, Droplets, ArrowDown } from "lucide-react";
import type { SightingType } from "@/react-app/pages/MapView";

const sightingTypes = [
  { value: "garbage" as SightingType, label: "Beach Garbage", icon: Trash2, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", activeBg: "bg-red-100 dark:bg-red-900/50" },
  { value: "floating" as SightingType, label: "Floating Trash", icon: Anchor, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", activeBg: "bg-orange-100 dark:bg-orange-900/50" },
  { value: "wildlife" as SightingType, label: "Wildlife", icon: Fish, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", activeBg: "bg-green-100 dark:bg-green-900/50" },
  { value: "coral" as SightingType, label: "Coral Health", icon: Waves, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800", activeBg: "bg-pink-100 dark:bg-pink-900/50" },
];

const subcategories: Record<string, string[]> = {
  garbage: ["Plastic bottle", "Plastic bag", "Food wrapper", "Cigarette butt", "Fishing line", "Other"],
  floating: ["Ghost net", "Plastic debris", "Oil spill", "Large trash", "Microplastics", "Other"],
  wildlife: ["Sea turtle", "Dolphin", "Whale", "Fish", "Seabird", "Jellyfish", "Other"],
  coral: ["Bleached coral", "Damaged coral", "Healthy coral", "Algae overgrowth", "Other"],
};

const severityLevels = [
  { value: 1, label: "Minor" },
  { value: 2, label: "Low" },
  { value: 3, label: "Moderate" },
  { value: 4, label: "Serious" },
  { value: 5, label: "Critical" },
];

/** Compress an image file to < 1MB using Canvas API */
async function compressImage(file: File, maxSizeKB = 1024): Promise<File> {
  // If already small enough, return as-is
  if (file.size <= maxSizeKB * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");

      // Scale down to max 1920px on longest side
      let { width, height } = img;
      const maxDim = 1920;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height * maxDim) / width;
          width = maxDim;
        } else {
          width = (width * maxDim) / height;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality until under size limit
      let quality = 0.8;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (blob && (blob.size <= maxSizeKB * 1024 || quality <= 0.3)) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              quality -= 0.1;
              tryCompress();
            }
          },
          "image/jpeg",
          quality
        );
      };
      tryCompress();
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function ReportSighting() {
  const navigate = useNavigate();
  const { profile: user } = useUserProfile();
  const redirectToLogin = () => window.location.href = "/login";
  const { triggerLevelUp, triggerBadgeUnlock } = useGamification();

  const [formData, setFormData] = useState({
    type: "" as SightingType | "",
    subcategory: "",
    description: "",
    severity: 3,
    location: "",
    // Coral-specific
    waterTemp: "",
    bleachPercent: "",
    depth: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ xp: number } | null>(null);
  const [userLevel, setUserLevel] = useState<number>(0);

  // Fetch user level for coral gate
  useEffect(() => {
    if (!user) return;
    fetch("/api/profiles/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => { if (p?.level) setUserLevel(p.level); })
      .catch(() => { });
  }, [user]);

  // Auto-capture location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            location: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`,
          }));
        },
        () => { } // Silent fail — user can manually enter
      );
    }
  }, []);

  // If not logged in, prompt to sign in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Card variant="glass" className="max-w-md w-full border-white/10 !bg-black/60 backdrop-blur-2xl p-4">
          <CardHeader className="text-center pb-8">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10">
              <Camera className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black text-white tracking-tighter">Guardian Access Required</CardTitle>
            <p className="text-sm font-bold text-white/40 mt-4 italic">
              You need to be a registered Guardian to transmit real-time marine sightings and earn XP.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center">
            <Button onClick={() => redirectToLogin()} className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 border-none transition-all hover:scale-[1.02] active:scale-95" size="lg">
              Get Started
            </Button>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Join the collective effort</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(compressed);
    } catch {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCaptureLocation = () => {
    setIsCapturingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          }));
          setIsCapturingLocation(false);
        },
        () => {
          setIsCapturingLocation(false);
          alert("Unable to get your location. Please enter it manually.");
        }
      );
    } else {
      setIsCapturingLocation(false);
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const [latStr, lngStr] = formData.location.split(",").map((s) => s.trim());
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lngStr);

      if (isNaN(latitude) || isNaN(longitude)) {
        alert("Invalid location format. Use: latitude, longitude");
        setIsSubmitting(false);
        return;
      }

      const body: Record<string, unknown> = {
        type: formData.type,
        subcategory: formData.subcategory,
        description: formData.description,
        severity: formData.severity,
        latitude,
        longitude,
      };

      // Add coral-specific fields
      if (formData.type === "coral") {
        if (formData.waterTemp) body.water_temp = parseFloat(formData.waterTemp);
        if (formData.bleachPercent) body.bleach_percent = parseInt(formData.bleachPercent);
        if (formData.depth) body.depth = parseFloat(formData.depth);
      }

      const res = await fetch("/api/sightings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit sighting");
      }

      const result = await res.json();
      const sightingId = result.sighting?.id;
      let totalXp = result.xp_earned || 0;

      // Upload photo if provided
      if (photo && sightingId) {
        const photoForm = new FormData();
        photoForm.append("photo", photo);

        const photoRes = await fetch(`/api/sightings/${sightingId}/photo`, {
          method: "POST",
          body: photoForm,
        });

        if (photoRes.ok) {
          const photoResult = await photoRes.json();
          totalXp += photoResult.xp_bonus || 0;
        }
      }

      setSubmitResult({ xp: totalXp });

      // Trigger gamification modals
      if (result.leveled_up) {
        triggerLevelUp(result.old_level, result.new_level);
      }
      if (result.new_badges && Array.isArray(result.new_badges)) {
        for (const badge of result.new_badges) {
          triggerBadgeUnlock({
            name: badge.name as string,
            description: badge.description as string,
            icon: badge.icon as string,
            rarity: badge.rarity as string,
            category: badge.category as string,
          });
        }
      }

      setTimeout(() => navigate("/map"), 3000);
    } catch (err) {
      console.error("Submit error:", err);
      alert(err instanceof Error ? err.message : "Failed to submit sighting");
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitResult) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Card variant="glass" className="max-w-md w-full border-white/10 !bg-black/60 backdrop-blur-2xl">
          <CardContent className="p-10 text-center space-y-8">
            <div className="flex justify-center">
              <div className="bg-primary/20 p-6 rounded-[2.5rem] animate-bounce shadow-2xl shadow-primary/20 border border-primary/20">
                <CheckCircle className="h-16 w-16 text-primary brightness-150" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter">Protocol Complete</h2>
              <p className="text-sm font-bold text-white/40 mt-3 italic">
                Data transmission successful. Thank you for protecting our oceans.
              </p>
            </div>

            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 shadow-inner">
              <p className="text-4xl font-black text-white tracking-tighter">+{submitResult.xp} <span className="text-primary brightness-125">XP</span></p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-2">Guardian Contribution Reward</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing with global map...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCoral = formData.type === "coral";
  const coralLocked = isCoral && userLevel < 6;

  return (
    <div className="container mx-auto px-4 py-14 pb-32 md:pb-14 max-w-3xl">
      <Card variant="glass" className="border-white/10 !bg-black/60 shadow-2xl backdrop-blur-2xl">
        <CardHeader className="pb-10 pt-10 px-10">
          <div className="flex items-center gap-5 justify-between">
            <div>
              <CardTitle className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                <div className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10">
                  <Camera className="h-8 w-8 text-primary brightness-125" />
                </div>
                Transmit <span className="text-primary brightness-125 italic">Sighting</span>
              </CardTitle>
              <p className="text-sm font-bold text-white/40 mt-3 italic tracking-wide">
                Join the global network of ocean protectors. Log your discovery now.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-14">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Sighting Type — Visual Icon Grid */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Objective Category</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sightingTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: type.value, subcategory: "" })
                      }
                      className={`
                        relative flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all duration-500 group
                        ${isSelected
                          ? `bg-primary border-primary text-white shadow-2xl shadow-primary/30 scale-105`
                          : `bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/20`
                        }
                      `}
                    >
                      <Icon className={`h-10 w-10 ${isSelected ? "text-white" : type.color} mb-1 transition-transform group-hover:scale-110`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">{type.label}</span>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_white]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coral Level Gate Warning */}
            {coralLocked && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-8 flex items-start gap-6 shadow-2xl">
                <div className="p-4 rounded-2xl bg-red-500/20">
                  <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-lg font-black text-white tracking-tight">Classification Restricted</p>
                  <p className="text-sm font-bold text-white/40 mt-2 italic">
                    Coral health diagnostics require high-level clearance (Level 6). You are currently <span className="text-red-400">Level {userLevel}</span>.
                    Contribute other data to upgrade your Guardian rank.
                  </p>
                </div>
              </div>
            )}

            {/* Subcategory */}
            {formData.type && !coralLocked && (
              <div className="space-y-4">
                <Label htmlFor="subcategory" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Specific Identification</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                >
                  <SelectTrigger id="subcategory" className="h-16 bg-white/5 border-white/10 rounded-2xl px-8 text-white font-bold text-sm focus:bg-white/10 transition-all">
                    <SelectValue placeholder="Select identification protocol..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 rounded-2xl text-white">
                    {(subcategories[formData.type] || []).map((sub) => (
                      <SelectItem key={sub} value={sub} className="focus:bg-primary/20 focus:text-white rounded-xl py-3 px-6">
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Coral-Specific Fields */}
            {isCoral && !coralLocked && (
              <div className="space-y-6 bg-primary/5 rounded-[2.5rem] p-8 border border-primary/20 shadow-2xl shadow-primary/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary brightness-125 mb-4 ml-2">
                  <Waves className="h-4 w-4" /> Multi-Sensor Data Capture
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="waterTemp" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white/40 ml-2">
                      <Thermometer className="h-3.5 w-3.5" /> Temp
                    </Label>
                    <Input
                      id="waterTemp"
                      type="number"
                      step="0.1"
                      placeholder="28.5"
                      value={formData.waterTemp}
                      onChange={(e) => setFormData({ ...formData, waterTemp: e.target.value })}
                      className="h-14 bg-white/10 border-white/10 rounded-2xl px-6 text-white font-bold placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="bleachPercent" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white/40 ml-2">
                      <Droplets className="h-3.5 w-3.5" /> Bleach
                    </Label>
                    <Input
                      id="bleachPercent"
                      type="number"
                      placeholder="40%"
                      value={formData.bleachPercent}
                      onChange={(e) => setFormData({ ...formData, bleachPercent: e.target.value })}
                      className="h-14 bg-white/10 border-white/10 rounded-2xl px-6 text-white font-bold placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="depth" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white/40 ml-2">
                      <ArrowDown className="h-3.5 w-3.5" /> Depth
                    </Label>
                    <Input
                      id="depth"
                      type="number"
                      placeholder="5m"
                      value={formData.depth}
                      onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                      className="h-14 bg-white/10 border-white/10 rounded-2xl px-6 text-white font-bold placeholder:text-white/10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Photo Upload */}
            {formData.type && !coralLocked && (
              <div className="space-y-4">
                <Label htmlFor="photo" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Visual Verification</Label>
                <div className="space-y-3">
                  {photoPreview ? (
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                      <img src={photoPreview} alt="Preview" className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-6 right-6 flex gap-3">
                        {photo && (
                          <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/10">
                            {(photo.size / 1024).toFixed(0)} KB
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                          className="rounded-full h-10 px-6 font-black text-[10px] uppercase tracking-widest bg-white/10 text-white hover:bg-white/20 border-none"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-4 border-dashed border-white/5 rounded-[3rem] p-16 text-center hover:border-primary/50 hover:bg-white/5 transition-all duration-500 cursor-pointer group shadow-inner">
                      <label htmlFor="photo" className="cursor-pointer block">
                        {isCompressing ? (
                          <>
                            <Loader2 className="h-16 w-16 mx-auto text-primary mb-6 animate-spin opacity-40" />
                            <p className="text-sm font-black text-white/40 uppercase tracking-widest italic animate-pulse">Processing High-Density Data...</p>
                          </>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-white/10 transition-transform group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/30">
                              <Upload className="h-10 w-10 text-white/40 transition-colors group-hover:text-primary" />
                            </div>
                            <p className="text-lg font-black text-white tracking-tight">Capture Optical Data</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-3 italic">
                              Click to upload or use environment camera
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-6">
                              <Badge variant="neomorph" className="bg-primary/20 text-white border-none font-black text-[9px] px-3 py-1">+10 XP BONUS</Badge>
                            </div>
                          </>
                        )}
                      </label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {formData.type && !coralLocked && (
              <div className="space-y-4">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Observed Details</Label>
                <Textarea
                  id="description"
                  placeholder="Summarize your observations for the global database..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  maxLength={500}
                  className="bg-white/5 border-white/10 rounded-3xl p-8 text-white font-bold text-sm focus:bg-white/10 transition-all placeholder:text-white/10 italic"
                />
                <div className="flex justify-between items-center px-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Data Volume Status</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${formData.description.length > 400 ? 'text-orange-500' : 'text-white/40'}`}>
                    {formData.description.length} / 500
                  </p>
                </div>
              </div>
            )}

            {/* Severity — Emoji Slider */}
            {formData.type && !coralLocked && (
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Priority Level</Label>
                <div className="flex items-center justify-between gap-3">
                  {severityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: level.value })}
                      className={`
                        flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 flex-1 border
                        ${formData.severity === level.value
                          ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105"
                          : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white/50"
                        }
                      `}
                    >
                      <div className={`h-2.5 w-2.5 rounded-full ${level.value === 1 ? "bg-green-500 shadow-[0_0_8px_green]" :
                        level.value === 2 ? "bg-yellow-500 shadow-[0_0_8px_yellow]" :
                          level.value === 3 ? "bg-orange-500 shadow-[0_0_8px_orange]" :
                            level.value === 4 ? "bg-red-500 shadow-[0_0_8px_red]" :
                              "bg-red-700 animate-pulse shadow-[0_0_12px_red]"
                        }`} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{level.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {formData.type && !coralLocked && (
              <div className="space-y-4">
                <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Coordinates</Label>
                <div className="flex gap-4">
                  <Input
                    id="location"
                    placeholder="Capture coordinates..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="flex-1 h-14 bg-white/5 border-white/10 rounded-2xl px-8 text-white font-bold text-sm tracking-widest placeholder:text-white/10 focus:bg-white/10 transition-all"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCaptureLocation}
                    disabled={isCapturingLocation}
                    className="h-14 px-8 rounded-2xl border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    {isCapturingLocation ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <>
                        <MapPin className="h-5 w-5 mr-3 text-primary" />
                        Sync GPS
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2 italic">
                  Automatic satellite triangulation recommended for maximum precision.
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            {formData.type && !coralLocked && (
              <div className="flex gap-6 pt-10">
                <Button type="button" variant="ghost" onClick={() => navigate("/map")} className="flex-1 h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-white/30 hover:bg-white/10 hover:text-white transition-all">
                  Abort
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/40 border-none transition-all hover:scale-[1.02] active:scale-95 disabled:grayscale disabled:opacity-50"
                  disabled={
                    isSubmitting ||
                    !formData.type ||
                    !formData.subcategory ||
                    !formData.description ||
                    !formData.location ||
                    (isCoral && !photo)
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Transmitting...
                    </>
                  ) : (
                    "Transmit Report"
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
