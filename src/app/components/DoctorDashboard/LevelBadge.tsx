import type { Triage } from "./constants";

const map: Record<Triage["level"], string> = {
  "Khẩn cấp": "bg-rose-100 text-rose-700 border border-rose-200",
  "Cao": "bg-orange-100 text-orange-700 border border-orange-200",
  "Trung bình": "bg-amber-100 text-amber-700 border border-amber-200",
  "Thấp": "bg-emerald-100 text-emerald-700 border border-emerald-200",
};
const dot: Record<Triage["level"], string> = {
  "Khẩn cấp": "bg-rose-500 animate-pulse",
  "Cao": "bg-orange-500",
  "Trung bình": "bg-amber-500",
  "Thấp": "bg-emerald-500",
};

export function LevelBadge({ level }: { level: Triage["level"] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs ${map[level]}`}>
      <span className={`w-2 h-2 rounded-full ${dot[level]}`} />
      {level}
    </span>
  );
}
