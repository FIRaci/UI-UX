import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Bot, Sparkles } from "lucide-react";
import type { ConsultHistory } from "./constants";
import { HISTORY, DOCTORS } from "./constants";

interface DashboardTabProps {
  onNavigate: (tab: string) => void;
  onViewHistory: (h: ConsultHistory) => void;
}

export function DashboardTab({ onNavigate, onViewHistory }: DashboardTabProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0" style={{ borderRadius: "16px" }}>
        <div className="flex items-center gap-2 opacity-90">
          <Bot className="w-5 h-5" /> <span>Trợ lý sức khỏe AI</span>
        </div>
        <h2 className="mt-2 tracking-tight">Cảm thấy không khỏe?</h2>
        <p className="opacity-90 mt-1">AI sẽ phân tích triệu chứng và gợi ý bác sĩ phù hợp nhất với bạn</p>
        <Button size="lg" className="mt-4 bg-white text-emerald-600 hover:bg-white/90" onClick={() => onNavigate("ai")}>
          <Sparkles className="w-4 h-4 mr-2" /> Bắt đầu tư vấn AI
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-slate-100 hover:shadow-sm transition-all animate-slide-up card-hover" style={{ borderRadius: "14px" }}>
          <div className="inline-flex px-2 py-0.5 rounded-md text-xs bg-emerald-50 text-emerald-700">Hoàn thành</div>
          <div className="mt-2 text-2xl tracking-tight font-bold">{HISTORY.length}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Lượt tư vấn AI</div>
        </Card>
        <Card className="p-4 border border-slate-100 hover:shadow-sm transition-all animate-slide-up card-hover" style={{ borderRadius: "14px", animationDelay: "0.1s" }}>
          <div className="inline-flex px-2 py-0.5 rounded-md text-xs bg-teal-50 text-teal-700">Sẵn sàng</div>
          <div className="mt-2 text-2xl tracking-tight font-bold">{DOCTORS.length}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Bác sĩ được gợi ý</div>
        </Card>
        <Card className="p-4 border border-slate-100 hover:shadow-sm transition-all animate-slide-up card-hover" style={{ borderRadius: "14px", animationDelay: "0.15s" }}>
          <div className="inline-flex px-2 py-0.5 rounded-md text-xs bg-violet-50 text-violet-700">Gần đây</div>
          <div className="mt-2 text-2xl tracking-tight font-bold">
            {HISTORY[0]?.severity === "Cao" ? "Cao" : "Ổn định"}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">Tình trạng sức khỏe</div>
        </Card>
      </div>

      <Card className="p-5 border border-slate-100" style={{ borderRadius: "16px" }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="tracking-tight font-bold text-slate-800">Lịch sử tư vấn gần đây</h4>
          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => onNavigate("history")}>Xem tất cả</Button>
        </div>
        {HISTORY.slice(0, 2).map(h => (
          <div
            key={h.id}
            className="p-3 border border-slate-100 rounded-xl mb-2 hover:bg-slate-50 hover:border-emerald-100 transition cursor-pointer"
            onClick={() => onViewHistory(h)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={h.severity === "Khẩn cấp" ? "destructive" : "secondary"}>{h.severity}</Badge>
                  <span className="text-sm text-muted-foreground">{h.date}</span>
                </div>
                <div className="text-sm mt-1"><b>Triệu chứng:</b> {h.symptoms.join(", ")}</div>
                <div className="text-sm text-muted-foreground mt-0.5">Chuyên khoa: {h.specialty}</div>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
