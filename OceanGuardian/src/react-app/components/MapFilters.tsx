import { useState } from "react";
import { CardContent } from "@/react-app/components/ui/card";
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
  { type: "garbage" as SightingType, icon: Trash2, label: "Garbage", color: "bg-red-500" },
  { type: "floating" as SightingType, icon: Anchor, label: "Floating", color: "bg-orange-500" },
  { type: "wildlife" as SightingType, icon: Fish, label: "Wildlife", color: "bg-green-500" },
  { type: "coral" as SightingType, icon: Waves, label: "Coral", color: "bg-pink-500" },
];

const dateRanges = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const severityOptions = [
  { value: 1, label: "Any", icon: Waves },
  { value: 2, label: "2+", icon: Waves },
  { value: 3, label: "3+", icon: Waves },
  { value: 4, label: "4+", icon: Waves },
  { value: 5, label: "5", icon: AlertTriangle },
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
    <div className="bg-secondary/90 border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        {/* Collapsed View */}
        {!isExpanded && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                {allSelected ? "All Types" : `${activeCount} Type${activeCount !== 1 ? "s" : ""}`}
              </span>
              <Badge variant="neomorph" className="text-[10px] bg-white/5 text-white/60 border-none font-black px-2 py-0.5">
                {totalSightings}
              </Badge>
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-8 w-8 p-0 hover:bg-white/10 text-white/60 hover:text-white"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Filters</span>
                <Badge variant="neomorph" className="text-[10px] bg-white/5 text-white/40 border-none font-black px-3 py-1">
                  {totalSightings} results
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 p-0 hover:bg-white/10 text-white/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Type Filters */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Category</span>
              <div className="grid grid-cols-2 gap-2">
                {filterOptions.map((option) => {
                  const isSelected = selectedTypes.includes(option.type);
                  return (
                    <button
                      key={option.type}
                      onClick={() => toggleType(option.type)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all duration-300 border
                        ${isSelected
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                          : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                        }
                      `}
                    >
                      <option.icon className={`h-4 w-4 ${isSelected ? "text-white" : "text-white/50"}`} />
                      <span className="tracking-widest uppercase text-[10px]">{option.label}</span>
                    </button>
                  );
                })}
              </div>
              {!allSelected && (
                <button onClick={selectAll} className="text-[10px] font-black uppercase tracking-widest text-primary/80 hover:text-primary transition-colors w-full text-center pt-2 italic">
                  Reset Categories
                </button>
              )}
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                <Clock className="h-3 w-3" /> Time Horizon
              </span>
              <div className="flex gap-2">
                {dateRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => onDateRangeChange(range.value)}
                    className={`
                      flex-1 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 border
                      ${dateRange === range.value
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/10"
                        : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white/50"
                      }
                    `}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" /> Minimum Priority
              </span>
              <div className="flex gap-2">
                {severityOptions.map((sev) => (
                  <button
                    key={sev.value}
                    onClick={() => onMinSeverityChange(sev.value)}
                    className={`
                      flex-1 flex flex-col items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 border
                      ${minSeverity === sev.value
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/10"
                        : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white/50"
                      }
                    `}
                  >
                    <div className={`h-2 w-2 rounded-full ${sev.value === 1 ? "bg-green-500" :
                      sev.value === 2 ? "bg-yellow-500" :
                        sev.value === 3 ? "bg-orange-500" :
                          sev.value === 4 ? "bg-red-500" :
                            "bg-red-700 animate-pulse"
                      }`} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{sev.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}
