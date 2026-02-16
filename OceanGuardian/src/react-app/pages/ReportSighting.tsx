import { useState } from "react";
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
import { Trash2, Fish, Anchor, Waves, Upload, MapPin, Camera, Star } from "lucide-react";
import { SightingType } from "@/react-app/pages/MapView";

const sightingTypes = [
  { value: "garbage" as SightingType, label: "Beach Garbage/Debris", icon: Trash2, color: "text-red-500" },
  { value: "floating" as SightingType, label: "Floating Trash", icon: Anchor, color: "text-orange-500" },
  { value: "wildlife" as SightingType, label: "Wildlife Sighting", icon: Fish, color: "text-green-500" },
  { value: "coral" as SightingType, label: "Coral Bleaching", icon: Waves, color: "text-coral-500" },
];

const subcategories = {
  garbage: ["Plastic bottle", "Plastic bag", "Food wrapper", "Cigarette butt", "Other"],
  floating: ["Ghost net", "Plastic debris", "Oil spill", "Large trash", "Other"],
  wildlife: ["Sea turtle", "Dolphin", "Whale", "Fish", "Seabird", "Other"],
  coral: ["Bleached coral", "Damaged coral", "Healthy coral", "Other"],
};

export default function ReportSighting() {
  const navigate = useNavigate();
  const { user, redirectToLogin } = useAuth();

  const [formData, setFormData] = useState({
    type: "" as SightingType | "",
    subcategory: "",
    description: "",
    severity: 3,
    location: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureLocation = () => {
    setIsCapturingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }));
          setIsCapturingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsCapturingLocation(false);
          alert("Unable to get your location. Please enter it manually.");
        }
      );
    } else {
      setIsCapturingLocation(false);
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Submit to API in next task
    console.log("Form data:", formData);
    console.log("Photo:", photo);

    // For now, just show success and navigate back
    alert("Sighting reported successfully! (This will be saved to database in the next task)");
    navigate("/map");
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 max-w-2xl">
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
            {/* Sighting Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Sighting Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as SightingType, subcategory: "" })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select what you found..." />
                </SelectTrigger>
                <SelectContent>
                  {sightingTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            {formData.type && (
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
                    {subcategories[formData.type].map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="photo">Photo {formData.type === "coral" ? "*" : "(Optional)"}</Label>
              <div className="space-y-3">
                {photoPreview ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img src={photoPreview} alt="Preview" className="w-full h-64 object-cover" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <label htmlFor="photo" className="cursor-pointer block">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                )}
              </div>
              {formData.type === "coral" && (
                <p className="text-xs text-muted-foreground">
                  Photo required for coral bleaching reports for AI analysis
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what you observed in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            {/* Severity Rating */}
            <div className="space-y-2">
              <Label>Severity / Importance</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: rating })}
                    className="transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating <= formData.severity
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                1 = Minor observation, 5 = Critical/urgent issue
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="Latitude, Longitude or address"
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

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/map")} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  !formData.type ||
                  !formData.subcategory ||
                  !formData.description ||
                  !formData.location ||
                  (formData.type === "coral" && !photo)
                }
              >
                Submit Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
