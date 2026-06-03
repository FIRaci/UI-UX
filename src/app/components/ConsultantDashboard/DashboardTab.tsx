import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Bot, Sparkles, CalendarClock, Info, Check } from "lucide-react";
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
        <div className="grid grid-cols-[2fr_1fr] gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 opacity-90 mb-2">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">Trợ lý sức khỏe AI</span>
            </div>
            <h2 className="tracking-tight text-3xl font-bold leading-snug">Cảm thấy không khỏe?</h2>
            <p className="opacity-90 mt-2 text-base leading-relaxed">AI sẽ phân tích triệu chứng và gợi ý bác sĩ phù hợp nhất với bạn</p>
            <Button size="lg" className="mt-5 w-full bg-white text-emerald-600 hover:bg-white/90" onClick={() => onNavigate("ai")}>
              <Sparkles className="w-4 h-4 mr-2" /> Bắt đầu tư vấn AI
            </Button>
          </div>
          <div className="hidden sm:flex flex-col items-start justify-between h-full py-1">
            {[
              "Phân tích triệu chứng",
              "Gợi ý bác sĩ phù hợp",
              "Đặt lịch nhanh chóng",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-base font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-slate-100 hover:shadow-md transition-all flex flex-row items-center gap-4 cursor-pointer" style={{ borderRadius: "16px" }} onClick={() => onNavigate("history")}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-emerald-600">{HISTORY.length}</span>
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-base">Lượt tư vấn AI</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">Hoàn thành</div>
          </div>
        </Card>
        <Card className="p-4 border border-slate-100 hover:shadow-md transition-all flex flex-row items-center gap-4 cursor-pointer" style={{ borderRadius: "16px" }} onClick={() => onNavigate("doctors")}>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-teal-600">{DOCTORS.length}</span>
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-base">Bác sĩ được gợi ý</div>
            <div className="text-xs text-teal-600 font-medium mt-0.5">Sẵn sàng</div>
          </div>
        </Card>
        <Card className="p-4 border border-slate-100 hover:shadow-md transition-all flex flex-row items-center gap-4 cursor-pointer" style={{ borderRadius: "16px" }} onClick={() => document.getElementById("upcoming-appointments")?.scrollIntoView({ behavior: "smooth" })}>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-violet-600">{appointments.length}</span>
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-base">Lịch hẹn đã đặt</div>
            <div className="text-xs text-violet-600 font-medium mt-0.5">Sắp tới</div>
          </div>
        </Card>
      </div>

      {appointments.length > 0 && (
        <Card id="upcoming-appointments" className="p-5 border border-slate-100" style={{ borderRadius: "16px" }}>
          <h4 className="tracking-tight font-bold text-slate-800 mb-3 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-emerald-600" /> Lịch hẹn sắp tới
          </h4>
          <div className="space-y-2">
            {appointments.map(a => (
              <div key={a.id} className="p-4 border border-emerald-100 bg-emerald-50/40 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CalendarClock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 truncate text-base">{a.doctorName}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{a.specialty} · {a.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-sm px-3 py-1">Đã xác nhận</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
        {[...HISTORY].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2).map(h => (
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

      <Card className="p-3 bg-amber-50 border-amber-200 flex flex-row items-center gap-2" style={{ borderRadius: "12px" }}>
        <Info className="w-4 h-4 text-amber-600 shrink-0" aria-hidden />
        <p className="text-xs text-amber-800">
          Thông tin và phân tích AI trong ứng dụng chỉ mang tính hỗ trợ tham khảo, không thay thế chẩn đoán y khoa chuyên nghiệp. Trường hợp khẩn cấp, hãy gọi 115.
        </p>
      </Card>
    </div>
  );
}
