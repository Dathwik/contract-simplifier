// components/RiskBadge.tsx
import { RiskLevel } from "@/lib/types";

const styles: Record<RiskLevel, string> = {
  low:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border border-amber-200",
  high:   "bg-red-100 text-red-700 border border-red-200",
};

export default function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)} Risk
    </span>
  );
}