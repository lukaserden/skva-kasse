import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
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
]

export default function DateRangeFilter({ value, onChange }: Props) {
  const label =
    value.from && value.to
      ? `${format(value.from, "dd.MM.yyyy")} - ${format(value.to, "dd.MM.yyyy")}`
      : "Zeitraum wählen"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="secondary"
              size="sm"
              onClick={() => onChange(preset.range)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Calendar
          mode="range"
          selected={{
            from: value.from || undefined,
            to: value.to || undefined,
          }}
          onSelect={(range) => onChange(range as DateRange)}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
