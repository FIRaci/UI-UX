import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import type { ConsultHistory } from "./constants";
import { HISTORY } from "./constants";

interface HistoryTabProps {
  onViewHistory: (h: ConsultHistory) => void;
}

export function HistoryTab({ onViewHistory }: HistoryTabProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4 border border-slate-100" style={{ borderRadius: "14px" }}>
        <h4 className="tracking-tight font-bold text-slate-800 mb-1">Lịch sử tư vấn</h4>
        <p className="text-sm text-muted-foreground">Lịch sử tư vấn AI và các khuyến nghị</p>
      </Card>

      {HISTORY.map(h => (
        <Card
          key={h.id}
          className="p-4 border border-slate-100 hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer card-hover"
          style={{ borderRadius: "14px" }}
          onClick={() => onViewHistory(h)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={h.severity === "Khẩn cấp" ? "destructive" : h.severity === "Cao" ? "default" : "secondary"}>
                  {h.severity}
                </Badge>
                <span className="text-sm text-muted-foreground">{h.date}</span>
                <Badge variant="outline">{h.specialty}</Badge>
              </div>
              <div className="text-sm space-y-1">
                <div><b>Triệu chứng đã thảo luận:</b> {h.symptoms.join(", ")}</div>
                <div className="text-muted-foreground"><b>Khuyến nghị hành động:</b> {h.actions[0]}</div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
