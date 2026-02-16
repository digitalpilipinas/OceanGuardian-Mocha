import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
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
import { Trash2, Fish, Anchor, Waves, Upload, MapPin, Camera, Loader2, CheckCircle, AlertTriangle, Thermometer, Droplets, ArrowDown } from "lucide-react";
import type { SightingType } from "@/react-app/pages/MapView";

const sightingTypes = [
  { value: "garbage" as SightingType, label: "Beach Garbage", icon: Trash2, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", activeBg: "bg-red-100 dark:bg-red-900/50", emoji: "🗑️" },
  { value: "floating" as SightingType, label: "Floating Trash", icon: Anchor, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", activeBg: "bg-orange-100 dark:bg-orange-900/50", emoji: "🚢" },
  { value: "wildlife" as SightingType, label: "Wildlife", icon: Fish, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", activeBg: "bg-green-100 dark:bg-green-900/50", emoji: "🐢" },
  { value: "coral" as SightingType, label: "Coral Health", icon: Waves, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800", activeBg: "bg-pink-100 dark:bg-pink-900/50", emoji: "🪸" },
];

const subcategories: Record<string, string[]> = {
  garbage: ["Plastic bottle", "Plastic bag", "Food wrapper", "Cigarette butt", "Fishing line", "Other"],
  floating: ["Ghost net", "Plastic debris", "Oil spill", "Large trash", "Microplastics", "Other"],
  wildlife: ["Sea turtle", "Dolphin", "Whale", "Fish", "Seabird", "Jellyfish", "Other"],
  coral: ["Bleached coral", "Damaged coral", "Healthy coral", "Algae overgrowth", "Other"],
};

const severityLevels = [
  { value: 1, emoji: "🟢", label: "Minor" },
  { value: 2, emoji: "🟡", label: "Low" },
  { value: 3, emoji: "🟠", label: "Moderate" },
  { value: 4, emoji: "🔴", label: "Serious" },
  { value: 5, emoji: "🚨", label: "Critical" },
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
  const { user, redirectToLogin } = useAuth();

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
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in to report a sighting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              You need to be signed in to report marine sightings
            </p>
            <Button onClick={() => redirectToLogin()} className="w-full" size="lg">
              Sign in with Google
            </Button>
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
      setTimeout(() => navigate("/map"), 2500);
    } catch (err) {
      console.error("Submit error:", err);
      alert(err instanceof Error ? err.message : "Failed to submit sighting");
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitResult) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto overflow-hidden">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full animate-bounce">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Sighting Reported! 🎉</h2>
            <p className="text-muted-foreground">
              Thank you for helping protect our oceans
            </p>
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary">+{submitResult.xp} XP</p>
              <p className="text-sm text-muted-foreground">Experience earned</p>
            </div>
            <p className="text-sm text-muted-foreground">Redirecting to map...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCoral = formData.type === "coral";
  const coralLocked = isCoral && userLevel < 6;

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            Report a Sighting
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Help protect our oceans by reporting what you see
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sighting Type — Visual Icon Grid */}
            <div className="space-y-2">
              <Label>What did you find? *</Label>
              <div className="grid grid-cols-2 gap-3">
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
                        relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                        ${isSelected
                          ? `${type.activeBg} ${type.border} ring-2 ring-offset-1 ring-current ${type.color} scale-[1.02] shadow-md`
                          : `${type.bg} border-transparent hover:${type.border} hover:shadow-sm`
                        }
                      `}
                    >
                      <span className="text-2xl">{type.emoji}</span>
                      <Icon className={`h-5 w-5 ${type.color}`} />
                      <span className="text-xs font-medium">{type.label}</span>
                      {isSelected && (
                        <div className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ${type.color.replace("text-", "bg-")}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coral Level Gate Warning */}
            {coralLocked && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Level 6 Required</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Coral health reports require Level 6+ for accuracy. You're currently Level {userLevel}.
                    Keep reporting other sightings to level up!
                  </p>
                </div>
              </div>
            )}

            {/* Subcategory */}
            {formData.type && !coralLocked && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Specific Type *</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder="Select specific type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(subcategories[formData.type] || []).map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Coral-Specific Fields */}
            {isCoral && !coralLocked && (
              <div className="space-y-4 bg-pink-50/50 dark:bg-pink-950/10 rounded-lg p-4 border border-pink-100 dark:border-pink-900/30">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-pink-700 dark:text-pink-300">
                  <Waves className="h-4 w-4" /> Coral Health Data
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="waterTemp" className="text-xs flex items-center gap-1">
                      <Thermometer className="h-3 w-3" /> Temp (°C)
                    </Label>
                    <Input
                      id="waterTemp"
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      placeholder="28.5"
                      value={formData.waterTemp}
                      onChange={(e) => setFormData({ ...formData, waterTemp: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bleachPercent" className="text-xs flex items-center gap-1">
                      <Droplets className="h-3 w-3" /> Bleach %
                    </Label>
                    <Input
                      id="bleachPercent"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="40"
                      value={formData.bleachPercent}
                      onChange={(e) => setFormData({ ...formData, bleachPercent: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="depth" className="text-xs flex items-center gap-1">
                      <ArrowDown className="h-3 w-3" /> Depth (m)
                    </Label>
                    <Input
                      id="depth"
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      placeholder="5"
                      value={formData.depth}
                      onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Photo Upload */}
            {formData.type && !coralLocked && (
              <div className="space-y-2">
                <Label htmlFor="photo">Photo {isCoral ? "* (Required for coral)" : "(Optional, +5 XP)"}</Label>
                <div className="space-y-3">
                  {photoPreview ? (
                    <div className="relative rounded-lg overflow-hidden border">
                      <img src={photoPreview} alt="Preview" className="w-full h-64 object-cover" />
                      <div className="absolute top-2 right-2 flex gap-2">
                        {photo && (
                          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {(photo.size / 1024).toFixed(0)} KB
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <label htmlFor="photo" className="cursor-pointer block">
                        {isCompressing ? (
                          <>
                            <Loader2 className="h-12 w-12 mx-auto text-primary mb-2 animate-spin" />
                            <p className="text-sm text-muted-foreground">Compressing image...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-1">
                              Click to upload or take a photo
                            </p>
                            <p className="text-xs text-muted-foreground">Auto-compressed to &lt; 1MB</p>
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
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you observed in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/500
                </p>
              </div>
            )}

            {/* Severity — Emoji Slider */}
            {formData.type && !coralLocked && (
              <div className="space-y-3">
                <Label>Severity / Importance</Label>
                <div className="flex items-center justify-between gap-1">
                  {severityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: level.value })}
                      className={`
                        flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 flex-1
                        ${formData.severity === level.value
                          ? "bg-primary/10 ring-2 ring-primary scale-105"
                          : "hover:bg-muted"
                        }
                      `}
                    >
                      <span className={`text-xl ${formData.severity === level.value ? "scale-125" : ""} transition-transform`}>
                        {level.emoji}
                      </span>
                      <span className="text-[10px] font-medium">{level.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {formData.type && !coralLocked && (
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="Latitude, Longitude"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCaptureLocation}
                    disabled={isCapturingLocation}
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    {isCapturingLocation ? "Getting..." : "GPS"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use GPS to automatically capture your current location
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            {formData.type && !coralLocked && (
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/map")} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
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
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
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
