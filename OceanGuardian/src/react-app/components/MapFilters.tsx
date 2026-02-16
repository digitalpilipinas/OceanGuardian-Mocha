import { useState } from "react";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Trash2, Fish, Anchor, Waves, Filter, X } from "lucide-react";
import { SightingType } from "@/react-app/pages/MapView";

interface MapFiltersProps {
  selectedTypes: SightingType[];
  onFilterChange: (types: SightingType[]) => void;
  totalSightings: number;
}

const filterOptions = [
  { type: "garbage" as SightingType, icon: Trash2, label: "Garbage", color: "bg-red-500" },
  { type: "floating" as SightingType, icon: Anchor, label: "Floating", color: "bg-orange-500" },
  { type: "wildlife" as SightingType, icon: Fish, label: "Wildlife", color: "bg-green-500" },
  { type: "coral" as SightingType, icon: Waves, label: "Coral", color: "bg-coral-500" },
];

export default function MapFilters({
  selectedTypes,
  onFilterChange,
  totalSightings,
}: MapFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleType = (type: SightingType) => {
    if (selectedTypes.includes(type)) {
      // Don't allow deselecting if it's the last one
      if (selectedTypes.length > 1) {
        onFilterChange(selectedTypes.filter((t) => t !== type));
      }
    } else {
      onFilterChange([...selectedTypes, type]);
    }
  };

  const selectAll = () => {
    onFilterChange(["garbage", "floating", "wildlife", "coral"]);
  };

  const activeCount = selectedTypes.length;
  const allSelected = activeCount === 4;

  return (
    <Card className="shadow-lg">
      <CardContent className="p-3">
        {/* Collapsed View */}
        {!isExpanded && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {allSelected ? "All Types" : `${activeCount} Type${activeCount !== 1 ? "s" : ""}`}
              </span>
              <Badge variant="secondary" className="text-xs">
                {totalSightings}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-8 px-2"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter Sightings</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedTypes.includes(option.type);

                return (
                  <Button
                    key={option.type}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleType(option.type)}
                    className="justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                );
              })}
            </div>

            {!allSelected && (
              <Button variant="ghost" size="sm" onClick={selectAll} className="w-full">
                Select All
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
