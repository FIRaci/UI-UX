import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { SEVERITY, HISTORY, type Severity, type ConsultHistory } from "./constants";

function SeverityBadge({ severity }: { severity: Severity }) {
  const s = SEVERITY[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${s.className}`}>
      <s.Icon className="w-3.5 h-3.5" aria-hidden />
      {s.label}
    </span>
  );
}

interface HistoryTabProps {
  onViewHistory: (h: ConsultHistory) => void;
}

export function HistoryTab({ onViewHistory }: HistoryTabProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4 border border-slate-100" style={{ borderRadius: "16px" }}>
        <h4 className="tracking-tight font-bold text-slate-800 mb-1">Lịch sử tư vấn</h4>
        <p className="text-sm text-muted-foreground">Lịch sử tư vấn AI và các khuyến nghị</p>
      </Card>

      {HISTORY.map(h => (
        <Card
          key={h.id}
          className="p-4 border border-slate-100 hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer"
          style={{ borderRadius: "16px" }}
          onClick={() => onViewHistory(h)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <SeverityBadge severity={h.severity} />
                <span className="text-sm text-muted-foreground">{h.date}</span>
                <Badge variant="outline">{h.specialty}</Badge>
              </div>
              <div className="text-sm space-y-1">
                <div><b>Triệu chứng đã thảo luận:</b> {h.symptoms.join(", ")}</div>
                <div className="text-muted-foreground"><b>Khuyến nghị hành động:</b> {h.actions[0]}</div>
              </div>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl">Xem chi tiết</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
