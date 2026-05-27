import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Clock, Search, MessagesSquare, FileHeart } from "lucide-react";
import type { Appointment } from "../../store";

function StatCard({ label, value, color, delay }: { label: string; value: string; color: string; delay?: string }) {
  return (
    <Card className="p-4 bg-white border border-slate-100 shadow-sm animate-slide-up" style={{ borderRadius: "16px", animationDelay: delay }}>
      <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>{label}</div>
      <div className="mt-3 text-3xl font-bold text-slate-800 tracking-tight">{value}</div>
    </Card>
  );
}

export function Overview({ onJump, appts, threads }: { onJump: (v: string) => void; appts: Appointment[]; threads: any[] }) {
  const upcoming = appts.find((a: Appointment) => a.status === "Sắp tới");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
        <StatCard label="Lịch hẹn sắp tới" value={appts.filter((a: Appointment) => a.status === "Sắp tới").length.toString()} color="bg-sky-50 text-sky-700 border-sky-100" delay="0.05s" />
        <StatCard label="Đã khám" value={appts.filter((a: Appointment) => a.status === "Hoàn thành").length.toString()} color="bg-emerald-50 text-emerald-700 border-emerald-100" delay="0.1s" />
        <StatCard label="Tin nhắn" value={threads.length.toString()} color="bg-violet-50 text-violet-700 border-violet-100" delay="0.15s" />
        <StatCard label="Điểm sức khỏe" value="86/100" color="bg-amber-50 text-amber-700 border-amber-100" delay="0.2s" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-2 bg-gradient-to-br from-sky-600 via-sky-700 to-emerald-700 text-white shadow-md relative overflow-hidden animate-slide-up card-hover" style={{ borderRadius: "20px" }}>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs font-semibold opacity-90 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Lịch hẹn khám gần nhất</div>
          {upcoming ? (
            <>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">{upcoming.doctorName}</h2>
              <p className="opacity-95 mt-1 text-sm font-medium">{upcoming.doctorSpec} • {upcoming.date} lúc {upcoming.time} • {upcoming.clinic}</p>
              <div className="mt-5 flex gap-2.5">
                <Button variant="secondary" className="rounded-xl text-xs px-4" onClick={() => onJump("appointments")}>Xem chi tiết</Button>
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl text-xs px-4" onClick={() => onJump("messages")}>Nhắn tin bác sĩ</Button>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <p className="opacity-90 text-sm">Bạn không có lịch hẹn khám nào sắp tới.</p>
              <Button variant="secondary" className="rounded-xl text-xs px-4 mt-3" onClick={() => onJump("search")}>Đặt lịch ngay</Button>
            </div>
          )}
        </Card>
        <Card className="p-5 bg-white border border-slate-100 shadow-sm card-hover" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Hành động nhanh</h4>
          <div className="grid gap-2.5">
            <Button variant="outline" className="rounded-xl justify-start text-xs border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => onJump("search")}><Search className="w-4 h-4 mr-2.5 text-slate-400" /> Tìm bác sĩ chuyên khoa</Button>
            <Button variant="outline" className="rounded-xl justify-start text-xs border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => onJump("messages")}><MessagesSquare className="w-4 h-4 mr-2.5 text-slate-400" /> Hỏi đáp bác sĩ trực tuyến</Button>
            <Button variant="outline" className="rounded-xl justify-start text-xs border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => onJump("records")}><FileHeart className="w-4 h-4 mr-2.5 text-slate-400" /> Tra cứu hồ sơ bệnh án</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
