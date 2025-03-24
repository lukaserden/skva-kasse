import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalendarSearch, X } from "lucide-react";

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets = [
  {
    label: "Heute",
    range: { from: new Date(), to: new Date() },
  },
  {
    label: "Letzte 7 Tage",
    range: { from: subDays(new Date(), 6), to: new Date() },
  },
  {
    label: "Letzte 30 Tage",
    range: { from: subDays(new Date(), 29), to: new Date() },
  },
  {
    label: "Dieser Monat",
    range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
  },
];

export default function DateRangeFilter({ value, onChange }: Props) {
  const label =
    value.from && value.to
      ? `${format(value.from, "dd.MM.yyyy")} - ${format(
          value.to,
          "dd.MM.yyyy"
        )}`
      : "Zeitraum wählen";

  // Hilfsfunktion zur Validierung
  const safeChange = (range: DateRange) => {
    if (range.from && range.to && range.to < range.from) {
      onChange({ from: range.from, to: undefined });
    } else {
      onChange(range);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-[220px] text-left font-normal relative pr-10 pl-6")}
        >
          <CalendarSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          {label}
          {(value.from || value.to) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ from: undefined, to: undefined });
              }}
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-destructive rounded focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Zeitraum zurücksetzen"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-4 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="secondary"
              size="sm"
              onClick={() => safeChange(preset.range)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Manuelle Eingabe */}
        <div className="flex gap-2 items-center">
          <Input
            type="date"
            value={value.from ? format(value.from, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const from = e.target.value
                ? new Date(e.target.value)
                : undefined;
              safeChange({ from, to: value.to });
            }}
          />
          <span className="text-muted-foreground">bis</span>
          <Input
            type="date"
            value={value.to ? format(value.to, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const to = e.target.value ? new Date(e.target.value) : undefined;
              safeChange({ from: value.from, to });
            }}
          />
        </div>

        {/* Kalender */}
        <Calendar
          mode="range"
          selected={{
            from: value.from,
            to: value.to,
          }}
          onSelect={(range) => {
            safeChange({
              from: range?.from,
              to: range?.to ?? undefined,
            });
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
