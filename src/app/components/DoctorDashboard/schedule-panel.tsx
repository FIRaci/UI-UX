import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Clock, Filter, ActivitySquare } from "lucide-react";
import { toast } from "sonner";
import { LevelBadge } from "./LevelBadge";
import { type Triage } from "./constants";
import type { Appointment } from "../../store";

type Props = {
  scheduleLevelFilter: string;
  setScheduleLevelFilter: (v: string) => void;
  TODAY: string;
  todayAppts: Appointment[];
  filteredSchedule: Appointment[];
  setApptDetail: (v: any) => void;
  queue: Triage[];
  setConsultPatient: (v: Triage | null) => void;
};

export function SchedulePanel({
  scheduleLevelFilter, setScheduleLevelFilter, TODAY,
  todayAppts, filteredSchedule, setApptDetail,
  queue, setConsultPatient,
}: Props) {
  return (
    <Card className="p-6 sm:p-8 bg-white/70 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(8,112,184,0.04)] rounded-[2rem] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h4 className="text-2xl font-extrabold tracking-tight text-slate-800">Lịch khám hôm nay</h4>
          <p className="text-sm text-slate-500 mt-1 font-medium">Ngày {TODAY} • Hệ thống tự động sắp xếp theo giờ khám</p>
        </div>
        <div className="flex gap-3 items-center">
          <Select value={scheduleLevelFilter} onValueChange={setScheduleLevelFilter}>
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
          <div className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md shadow-slate-900/20 shrink-0">
            {filteredSchedule.length} ca
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l: "Khẩn cấp", v: todayAppts.filter(a => a.level === "Khẩn cấp").length, c: "from-rose-50 to-rose-100/50 border-rose-200 text-rose-700 shadow-rose-500/5" },
          { l: "Cao", v: todayAppts.filter(a => a.level === "Cao").length, c: "from-orange-50 to-orange-100/50 border-orange-200 text-orange-700 shadow-orange-500/5" },
          { l: "Trung bình", v: todayAppts.filter(a => a.level === "Trung bình").length, c: "from-amber-50 to-amber-100/50 border-amber-200 text-amber-700 shadow-amber-500/5" },
          { l: "Thấp", v: todayAppts.filter(a => a.level === "Thấp").length, c: "from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-700 shadow-emerald-500/5" },
        ].map((s, i) => (
          <Card key={i} className={`p-4 bg-gradient-to-br border ${s.c} shadow-sm rounded-2xl animate-in zoom-in-95`} style={{ animationDelay: `${i * 75}ms` }}>
            <div className="text-[11px] font-extrabold uppercase tracking-widest opacity-80 mb-1.5">{s.l}</div>
            <div className="text-3xl font-black tracking-tight">{s.v}</div>
          </Card>
        ))}
      </div>

      {filteredSchedule.length === 0 ? (
        <div className="py-20 text-center bg-slate-50/50 rounded-3xl border border-slate-200/50 border-dashed">
          <ActivitySquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <div className="text-slate-500 font-medium">Không có lịch khám nào phù hợp.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSchedule.map((a, i) => (
            <Card 
              key={a.id} 
              className="p-5 bg-white border border-slate-200/60 shadow-sm hover:shadow-xl transition-all rounded-[1.5rem] group animate-in fade-in slide-in-from-bottom-4 flex flex-col"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="inline-flex items-center gap-1.5 text-slate-600 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-xl">
                  <Clock className="w-4 h-4 text-blue-500" /> {a.time}
                </div>
                {a.level && <LevelBadge level={a.level} />}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-12 h-12 border-2 border-white shadow-md rounded-2xl shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm">
                    {a.patientName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-extrabold text-slate-800 text-lg truncate group-hover:text-blue-700 transition-colors">{a.patientName}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                    {a.age ? `${a.age} tuổi • ${a.clinic}` : a.clinic}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100 flex-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Lý do khám</div>
                <div className="text-sm text-slate-700 font-medium line-clamp-2">{a.symptoms || "Không có ghi chú thêm."}</div>
                {a.vitals && (
                  <div className="mt-3 pt-3 border-t border-slate-200/50 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                     <div>HA: <span className="text-slate-800">{a.vitals.bp}</span></div>
                     <div>Mạch: <span className="text-slate-800">{a.vitals.hr}</span></div>
                     <div>SpO2: <span className="text-slate-800">{a.vitals.spo2}</span></div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-auto">
                <Badge variant={a.status === "Hoàn thành" ? "default" : a.status === "Đã hủy" ? "outline" : "secondary"} className="rounded-lg px-2.5 py-1">
                  {a.status}
                </Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-xl h-9 text-xs font-bold" onClick={() => setApptDetail(a)}>Chi tiết</Button>
                  {a.status === "Sắp tới" && (
                    <Button size="sm" className="rounded-xl h-9 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md" onClick={() => {
                      const triage = queue.find(q => q.patient === a.patientName) ?? {
                        id: a.id, level: a.level || "Trung bình", patient: a.patientName, age: a.age || 40,
                        symptoms: a.symptoms || "Khám theo lịch hẹn", waited: "—",
                        vitals: a.vitals || { bp: "120/80", hr: "75", temp: "36.7°C", spo2: "98%" },
                      } as Triage;
                      setConsultPatient(triage);
                      toast.success(`Bắt đầu khám ${a.patientName}`);
                    }}>
                      Khám ngay
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
