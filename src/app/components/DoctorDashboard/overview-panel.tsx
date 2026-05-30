import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Clock, AlertTriangle, Filter, HeartPulse, Activity } from "lucide-react";
import { toast } from "sonner";
import { LevelBadge } from "./LevelBadge";
import { URGENT_ALERT, type Triage } from "./constants";
import type { Appointment } from "../../store";

type Props = {
  queue: Triage[];
  levelFilter: string;
  setLevelFilter: (v: string) => void;
  filteredQueue: Triage[];
  openConsult: (t: Triage) => void;
  todayUpcoming: Appointment[];
  setApptDetail: (v: any) => void;
};

export function OverviewPanel({
  queue, levelFilter, setLevelFilter, filteredQueue,
  openConsult, todayUpcoming, setApptDetail,
}: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
      <div className="space-y-8">
        {/* Urgent Alert - Premium Redesign */}
        <Card className="p-0 overflow-hidden border-rose-200/50 bg-gradient-to-br from-rose-50/80 to-white shadow-[0_20px_40px_-15px_rgba(225,29,72,0.15)] relative animate-in zoom-in-95 duration-500 rounded-3xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shrink-0 shadow-xl shadow-rose-500/30 ring-4 ring-rose-100 relative">
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-400 border-2 border-white animate-ping"></span>
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-bold tracking-widest uppercase border border-rose-200/50">CẢNH BÁO KHẨN CẤP</span>
                <span className="text-xs text-rose-500 font-semibold">• Hệ thống AI phát hiện</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                {URGENT_ALERT.patient} <span className="text-slate-500 font-medium text-base ml-1">({URGENT_ALERT.age} tuổi)</span>
              </div>
              <div className="text-base text-rose-700 mt-1 font-semibold">{URGENT_ALERT.symptoms}</div>
              <div className="text-sm text-slate-500 mt-1.5 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-rose-500" />
                 Phân tích: <span className="font-bold text-rose-600">{URGENT_ALERT.trigger}</span>
              </div>
            </div>
            <Button
              className="bg-gradient-to-br from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-xl shadow-rose-600/20 rounded-2xl px-6 h-12 text-sm font-bold shrink-0 w-full sm:w-auto transition-transform active:scale-95 border-0"
              onClick={() => {
                const urgent = queue.find(q => q.patient === URGENT_ALERT.patient);
                if (urgent) openConsult(urgent);
                else toast.success("Đã xử lý cảnh báo");
              }}
            >
              Tiếp nhận & Xử lý
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Bệnh nhân đang chờ ({filteredQueue.length})</h4>
            <p className="text-sm text-slate-500 mt-0.5">Sắp xếp theo mức độ ưu tiên (Triage) bằng AI</p>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-48 h-10 rounded-xl border-slate-200 bg-white shadow-sm text-slate-700 text-sm font-semibold focus:ring-blue-500/20">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="all" className="font-medium">Tất cả mức độ</SelectItem>
                <SelectItem value="Khẩn cấp" className="text-rose-600 font-bold">Khẩn cấp</SelectItem>
                <SelectItem value="Cao" className="text-orange-600 font-bold">Cao</SelectItem>
                <SelectItem value="Trung bình" className="text-amber-600 font-bold">Trung bình</SelectItem>
                <SelectItem value="Thấp" className="text-emerald-600 font-bold">Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredQueue.length === 0 ? (
          <div className="py-16 text-center bg-white/50 border border-slate-200/50 rounded-3xl border-dashed">
             <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
             <div className="text-slate-500 font-medium">Không có ca nào trong danh sách chờ.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQueue.map((t, index) => (
              <Card 
                key={t.id} 
                className="p-5 bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all rounded-[1.5rem] animate-in fade-in slide-in-from-bottom-4 group cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => openConsult(t)}
              >
                <div className="flex justify-between items-start mb-4">
                  <LevelBadge level={t.level} />
                  <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs font-semibold bg-slate-100/80 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" /> {t.waited}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12 border-2 border-white shadow-md rounded-2xl group-hover:scale-105 transition-transform">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm">
                      {t.patient[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 text-base truncate">{t.patient}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{t.age} tuổi</div>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Triệu chứng</div>
                  <div className="text-sm text-slate-700 font-medium line-clamp-2">{t.symptoms}</div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                   <div className="flex gap-2">
                     <div className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                       HA: {t.vitals.bp}
                     </div>
                     <div className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                       Nhịp: {t.vitals.hr}
                     </div>
                   </div>
                   <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold -mr-2">
                     Mở án &rarr;
                   </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Right Sidebar Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { l: "Khẩn cấp", v: queue.filter(q => q.level === "Khẩn cấp").length, c: "from-rose-50 to-white border-rose-100 text-rose-700" },
            { l: "Đang chờ", v: queue.length, c: "from-amber-50 to-white border-amber-100 text-amber-700" },
            { l: "Sắp tới", v: todayUpcoming.length, c: "from-sky-50 to-white border-sky-100 text-sky-700" },
            { l: "Đã khám", v: 0, c: "from-emerald-50 to-white border-emerald-100 text-emerald-700" },
          ].map((s, i) => (
            <Card key={i} className={`p-4 bg-gradient-to-b border shadow-sm animate-in zoom-in-95 rounded-2xl ${s.c}`} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1">{s.l}</div>
              <div className="text-3xl font-black tracking-tight">{s.v}</div>
            </Card>
          ))}
        </div>

        {/* Schedule Widget */}
        <Card className="p-5 bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg shadow-slate-200/30 rounded-[1.5rem]">
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-extrabold text-slate-800 text-base tracking-tight">Lịch sắp tới</h4>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold shrink-0">{todayUpcoming.length} ca</span>
          </div>
          
          <div className="space-y-3">
            {todayUpcoming.length === 0 ? (
              <div className="py-8 text-center text-sm font-medium text-slate-400">Không có lịch hẹn.</div>
            ) : todayUpcoming.slice(0, 8).map((p, i) => (
              <div 
                key={p.id} 
                className="group flex gap-3 p-3 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-md transition-all cursor-pointer animate-in fade-in slide-in-from-right-4"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => setApptDetail(p)}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                  {p.time.split(":")[0]}
                  <span className="text-[10px] font-normal ml-0.5 opacity-60">h</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-700 transition-colors">{p.patientName}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                    {p.time} • {p.clinic}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
