import { useState, useMemo } from "react";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Trash2, Fish, Anchor, Waves, Filter, X, Clock, AlertTriangle } from "lucide-react";
import { SightingType } from "@/react-app/pages/MapView";

interface MapFiltersProps {
  selectedTypes: SightingType[];
  onFilterChange: (types: SightingType[]) => void;
  totalSightings: number;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  minSeverity: number;
  onMinSeverityChange: (severity: number) => void;
}

const filterOptions = [
  { type: "garbage" as SightingType, icon: Trash2, label: "Garbage", color: "bg-red-500", emoji: "🗑️" },
  { type: "floating" as SightingType, icon: Anchor, label: "Floating", color: "bg-orange-500", emoji: "🚢" },
  { type: "wildlife" as SightingType, icon: Fish, label: "Wildlife", color: "bg-green-500", emoji: "🐢" },
  { type: "coral" as SightingType, icon: Waves, label: "Coral", color: "bg-pink-500", emoji: "🪸" },
];

const dateRanges = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const severityOptions = [
  { value: 1, label: "Any", emoji: "🟢" },
  { value: 2, label: "2+", emoji: "🟡" },
  { value: 3, label: "3+", emoji: "🟠" },
  { value: 4, label: "4+", emoji: "🔴" },
  { value: 5, label: "5", emoji: "🚨" },
];

export default function MapFilters({
  selectedTypes,
  onFilterChange,
  totalSightings,
  dateRange,
  onDateRangeChange,
  minSeverity,
  onMinSeverityChange,
}: MapFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleType = (type: SightingType) => {
    if (selectedTypes.includes(type)) {
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
  const hasActiveFilters = !allSelected || dateRange !== "all" || minSeverity > 1;

  return (
    <Card className="shadow-lg backdrop-blur-sm bg-card/95">
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
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Filters</span>
                <Badge variant="secondary" className="text-xs">
                  {totalSightings} results
                </Badge>
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

            {/* Type Filters */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</span>
              <div className="grid grid-cols-2 gap-2">
                {filterOptions.map((option) => {
                  const isSelected = selectedTypes.includes(option.type);
                  return (
                    <button
                      key={option.type}
                      onClick={() => toggleType(option.type)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }
                      `}
                    >
                      <span className="text-sm">{option.emoji}</span>
                      <span className="text-xs">{option.label}</span>
                    </button>
                  );
                })}
              </div>
              {!allSelected && (
                <button onClick={selectAll} className="text-xs text-primary hover:underline w-full text-center pt-1">
                  Select All
                </button>
              )}
            </div>

            {/* Date Range */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3" /> Time Range
              </span>
              <div className="flex gap-1.5">
                {dateRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => onDateRangeChange(range.value)}
                    className={`
                      flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all
                      ${dateRange === range.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }
                    `}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Min Severity
              </span>
              <div className="flex gap-1.5">
                {severityOptions.map((sev) => (
                  <button
                    key={sev.value}
                    onClick={() => onMinSeverityChange(sev.value)}
                    className={`
                      flex-1 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md transition-all
                      ${minSeverity === sev.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }
                    `}
                  >
                    <span className="text-sm">{sev.emoji}</span>
                    <span className="text-[10px] font-medium">{sev.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
