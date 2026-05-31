import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Bot, Sparkles, CalendarClock, Info } from "lucide-react";
import { SEVERITY, HISTORY, DOCTORS, type Severity, type Appointment, type ConsultHistory } from "./constants";

function SeverityBadge({ severity }: { severity: Severity }) {
  const s = SEVERITY[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${s.className}`}>
      <s.Icon className="w-3.5 h-3.5" aria-hidden />
      {s.label}
    </span>
  );
}

interface DashboardTabProps {
  appointments: Appointment[];
  onNavigate: (tab: string) => void;
  onViewHistory: (h: ConsultHistory) => void;
  onCancelAppt: (a: Appointment) => void;
}

export function DashboardTab({ appointments, onNavigate, onViewHistory, onCancelAppt }: DashboardTabProps) {
  return (
    <div className="space-y-5">
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
        <Card className="p-4 border border-slate-100 hover:shadow-sm transition-all" style={{ borderRadius: "16px" }}>
          <div className="inline-flex px-2 py-0.5 rounded-md text-xs bg-emerald-50 text-emerald-700">Hoàn thành</div>
          <div className="mt-2 text-2xl tracking-tight font-bold">{HISTORY.length}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Lượt tư vấn AI</div>
        </Card>
        <Card className="p-4 border border-slate-100 hover:shadow-sm transition-all" style={{ borderRadius: "16px" }}>
          <div className="inline-flex px-2 py-0.5 rounded-md text-xs bg-teal-50 text-teal-700">Sẵn sàng</div>
          <div className="mt-2 text-2xl tracking-tight font-bold">{DOCTORS.length}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Bác sĩ được gợi ý</div>
        </Card>
        <Card
          className="p-4 border border-slate-100 hover:shadow-sm transition-all cursor-pointer"
          style={{ borderRadius: "16px" }}
          onClick={() => onNavigate("appointments")}
        >
          <div className="inline-flex px-2 py-0.5 rounded-md text-xs bg-violet-50 text-violet-700">Sắp tới</div>
          <div className="mt-2 text-2xl tracking-tight font-bold">{appointments.length}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Lịch hẹn đã đặt</div>
        </Card>
      </div>

      {appointments.length > 0 && (
        <Card className="p-5 border border-slate-100" style={{ borderRadius: "16px" }}>
          <h4 className="tracking-tight font-bold text-slate-800 mb-3 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-emerald-600" /> Lịch hẹn sắp tới
          </h4>
          <div className="space-y-2">
            {appointments.map(a => (
              <div key={a.id} className="p-3 border border-emerald-100 bg-emerald-50/50 rounded-xl flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-800">{a.doctorName}</div>
                  <div className="text-sm text-muted-foreground">{a.specialty} • {a.time}</div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Đã xác nhận</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    onClick={() => onCancelAppt(a)}
                  >
                    Hủy lịch
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

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
                  <SeverityBadge severity={h.severity} />
                  <span className="text-sm text-muted-foreground">{h.date}</span>
                </div>
                <div className="text-sm mt-1"><b>Triệu chứng:</b> {h.symptoms.join(", ")}</div>
                <div className="text-sm text-muted-foreground mt-0.5">Chuyên khoa: {h.specialty}</div>
              </div>
              <Button size="sm" variant="outline" className="rounded-xl">Chi tiết</Button>
            </div>
          </div>
        ))}
      </Card>

      <Card className="p-3 bg-slate-50 border-slate-200 flex items-start gap-2" style={{ borderRadius: "12px" }}>
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden />
        <p className="text-xs text-slate-600">
          Thông tin và phân tích AI trong ứng dụng chỉ mang tính hỗ trợ tham khảo, không thay thế chẩn đoán y khoa chuyên nghiệp. Trường hợp khẩn cấp, hãy gọi 115.
        </p>
      </Card>
    </div>
  );
}
