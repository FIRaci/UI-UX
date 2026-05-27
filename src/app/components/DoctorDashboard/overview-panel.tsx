import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Clock, AlertTriangle, Filter } from "lucide-react";
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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
      <div className="space-y-5">
        <Card className="p-0 overflow-hidden border-rose-200 bg-gradient-to-br from-rose-50/50 to-orange-50/30 shadow-md relative animate-pulse" style={{ borderRadius: "20px" }}>
          <div className="p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/25">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-bold tracking-wider uppercase">CẢNH BÁO KHẨN CẤP</span>
                <span className="text-xs text-rose-500 font-semibold">• vừa xong</span>
              </div>
              <div className="mt-2 text-base font-bold text-slate-800 tracking-tight">
                {URGENT_ALERT.patient} <span className="text-slate-500 font-medium">({URGENT_ALERT.age} tuổi)</span>
              </div>
              <div className="text-sm text-rose-700 mt-1 font-semibold">{URGENT_ALERT.symptoms}</div>
              <div className="text-xs text-slate-500 mt-1">AI phân tích: <span className="font-semibold text-rose-600">{URGENT_ALERT.trigger}</span></div>
            </div>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10 rounded-xl px-4 text-xs font-semibold shrink-0 h-10"
              onClick={() => {
                const urgent = queue.find(q => q.patient === URGENT_ALERT.patient);
                if (urgent) openConsult(urgent);
                else toast.success("Đã xử lý cảnh báo");
              }}
            >
              Xử lý ngay
            </Button>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-slate-100 shadow-sm animate-fade-in" style={{ borderRadius: "20px" }}>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div>
              <h4 className="font-bold text-slate-800 text-sm tracking-tight">Danh sách ca chờ khám</h4>
              <p className="text-xs text-slate-400 mt-0.5">Sắp xếp theo mức độ ưu tiên sàng lọc lâm sàng</p>
            </div>
            <div className="flex gap-2 items-center">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-44 h-9 rounded-xl border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium"><Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-lg">
                  <SelectItem value="all" className="text-xs">Tất cả mức độ</SelectItem>
                  <SelectItem value="Khẩn cấp" className="text-xs text-rose-600 font-bold">Khẩn cấp</SelectItem>
                  <SelectItem value="Cao" className="text-xs text-orange-600 font-bold">Cao</SelectItem>
                  <SelectItem value="Trung bình" className="text-xs text-amber-600 font-medium">Trung bình</SelectItem>
                  <SelectItem value="Thấp" className="text-xs text-emerald-600">Thấp</SelectItem>
                </SelectContent>
              </Select>
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 shrink-0">{filteredQueue.length} ca</span>
            </div>
          </div>
          {filteredQueue.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">Không có ca nào trong danh sách chờ.</div>
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr className="text-left">
                    <th className="px-5 py-3">Mức độ</th>
                    <th className="px-3 py-3">Bệnh nhân</th>
                    <th className="px-3 py-3">Triệu chứng</th>
                    <th className="px-3 py-3">Chờ</th>
                    <th className="px-5 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-5 py-4"><LevelBadge level={t.level} /></td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-9 h-9 border border-slate-100 shadow-sm"><AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">{t.patient[0]}</AvatarFallback></Avatar>
                          <div>
                            <div className="font-bold text-slate-700 text-sm">{t.patient}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{t.age} tuổi • HA {t.vitals.bp} • Mạch {t.vitals.hr}bpm</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-slate-600 max-w-xs truncate font-medium">{t.symptoms}</td>
                      <td className="px-3 py-4"><span className="inline-flex items-center gap-1 text-slate-500 text-xs font-medium bg-slate-100 px-2 py-0.5 rounded"><Clock className="w-3.5 h-3.5 text-slate-400" />{t.waited}</span></td>
                      <td className="px-5 py-4 text-right">
                        <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-xs rounded-xl px-4 h-9 shadow-sm" onClick={() => openConsult(t)}>Mở bệnh án</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Khẩn cấp", v: queue.filter(q => q.level === "Khẩn cấp").length, c: "bg-rose-50 text-rose-700 border-rose-100" },
            { l: "Đang chờ", v: queue.length, c: "bg-amber-50 text-amber-700 border-amber-100" },
            { l: "Lịch sắp tới", v: todayUpcoming.length, c: "bg-sky-50 text-sky-700 border-sky-100" },
            { l: "Đã khám hôm nay", v: 0, c: "bg-emerald-50 text-emerald-700 border-emerald-100" },
          ].map((s, i) => (
            <Card key={i} className="p-4 bg-white border border-slate-100 shadow-sm animate-slide-up" style={{ borderRadius: "16px", animationDelay: `${0.05 + i * 0.05}s` }}>
              <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${s.c}`}>{s.l}</div>
              <div className="mt-3 text-3xl font-bold text-slate-800 tracking-tight">{s.v}</div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-4 h-fit xl:sticky xl:top-4 bg-white border border-slate-100 shadow-sm card-hover" style={{ borderRadius: "20px" }}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-800 text-sm tracking-tight">Lịch hẹn hôm nay</h4>
          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 shrink-0">{todayUpcoming.length} ca</span>
        </div>
        <div className="space-y-3">
          {todayUpcoming.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Không có lịch hẹn sắp tới.</div>
          ) : todayUpcoming.slice(0, 8).map(p => (
            <Card key={p.id} className="p-3 border border-slate-100 hover:shadow-md transition-all cursor-pointer animate-slide-up card-hover" style={{ borderRadius: "14px", animationDelay: `${0.05 + todayUpcoming.indexOf(p) * 0.05}s` }} onClick={() => setApptDetail(p)}>
              <div className="min-w-0">
                <div className="font-bold text-slate-700 text-sm truncate">{p.patientName}</div>
                <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {p.time} • {p.clinic}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
