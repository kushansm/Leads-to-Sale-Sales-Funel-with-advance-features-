import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Status ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  new:           { label: "New",           variant: "secondary" as const },
  contacting:    { label: "Contacting",    variant: "outline" as const },
  interested:    { label: "Interested",    variant: "default" as const },
  evaluating:    { label: "Evaluating",    variant: "default" as const },
  proposal_sent: { label: "Proposal Sent", variant: "default" as const },
  negotiation:   { label: "Negotiation",   variant: "default" as const },
  won:           { label: "Won",           variant: "default" as const },
  lost:          { label: "Lost",          variant: "destructive" as const },
  dormant:       { label: "Dormant",       variant: "outline" as const },
} as const;

const STATUS_COLORS: Record<string, string> = {
  new:           "bg-slate-100 text-slate-700 border-slate-200",
  contacting:    "bg-blue-50 text-blue-700 border-blue-200",
  interested:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  evaluating:    "bg-purple-50 text-purple-700 border-purple-200",
  proposal_sent: "bg-yellow-50 text-yellow-700 border-yellow-200",
  negotiation:   "bg-orange-50 text-orange-700 border-orange-200",
  won:           "bg-green-50 text-green-700 border-green-200",
  lost:          "bg-red-50 text-red-600 border-red-200",
  dormant:       "bg-gray-100 text-gray-500 border-gray-300",
};

export function LeadStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize text-xs font-medium", STATUS_COLORS[status])}
    >
      {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label ?? status}
    </Badge>
  );
}

// ─── Temperature ──────────────────────────────────────────────────────────────

const TEMP_CONFIG: Record<string, { label: string; emoji: string; className: string }> = {
  hot:  { label: "Hot",  emoji: "🔥", className: "bg-red-50 text-red-600 border-red-200" },
  warm: { label: "Warm", emoji: "☀️", className: "bg-amber-50 text-amber-600 border-amber-200" },
  cold: { label: "Cold", emoji: "❄️", className: "bg-cyan-50 text-cyan-600 border-cyan-200" },
};

export function LeadTemperatureBadge({ temperature }: { temperature: string }) {
  const cfg = TEMP_CONFIG[temperature] ?? { label: temperature, emoji: "", className: "" };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium gap-1", cfg.className)}>
      <span>{cfg.emoji}</span>
      {cfg.label}
    </Badge>
  );
}
