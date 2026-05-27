import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Clock, Filter } from "lucide-react";
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
    <Card className="p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div>
          <h4 className="tracking-tight">Lịch khám hôm nay</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Ngày {TODAY} • Sắp xếp theo giờ khám</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={scheduleLevelFilter} onValueChange={setScheduleLevelFilter}>
            <SelectTrigger className="w-44"><Filter className="w-3.5 h-3.5 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức độ</SelectItem>
              <SelectItem value="Khẩn cấp">Khẩn cấp</SelectItem>
              <SelectItem value="Cao">Cao</SelectItem>
              <SelectItem value="Trung bình">Trung bình</SelectItem>
              <SelectItem value="Thấp">Thấp</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary">{filteredSchedule.length} ca</Badge>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { l: "Khẩn cấp", v: todayAppts.filter(a => a.level === "Khẩn cấp").length, c: "bg-rose-50 text-rose-700 border-rose-200" },
          { l: "Cao", v: todayAppts.filter(a => a.level === "Cao").length, c: "bg-orange-50 text-orange-700 border-orange-200" },
          { l: "Trung bình", v: todayAppts.filter(a => a.level === "Trung bình").length, c: "bg-amber-50 text-amber-700 border-amber-200" },
          { l: "Thấp", v: todayAppts.filter(a => a.level === "Thấp").length, c: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        ].map((s, i) => (
          <Card key={i} className={`p-3 border ${s.c} animate-slide-up`} style={{ animationDelay: `${0.05 + i * 0.05}s` }}>
            <div className="text-xs">{s.l}</div>
            <div className="mt-1 text-xl tracking-tight">{s.v}</div>
          </Card>
        ))}
      </div>
      {filteredSchedule.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">Không có lịch khám hôm nay.</div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-muted-foreground">
              <tr className="text-left">
                <th className="px-5 py-2.5 font-medium">Giờ</th>
                <th className="px-3 py-2.5 font-medium">Mức độ</th>
                <th className="px-3 py-2.5 font-medium">Bệnh nhân</th>
                <th className="px-3 py-2.5 font-medium">Triệu chứng</th>
                <th className="px-3 py-2.5 font-medium">Sinh hiệu</th>
                <th className="px-3 py-2.5 font-medium">Trạng thái</th>
                <th className="px-5 py-2.5 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map(a => (
                <tr key={a.id} className="border-t hover:bg-slate-50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium">{a.time}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">{a.level && <LevelBadge level={a.level} />}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs">{a.patientName[0]}</AvatarFallback></Avatar>
                      <div>
                        <div>{a.patientName}</div>
                        <div className="text-xs text-muted-foreground">{a.age ? `${a.age} tuổi • ${a.clinic}` : a.clinic}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground max-w-xs truncate">{a.symptoms || "—"}</td>
                  <td className="px-3 py-3">
                    {a.vitals ? (
                      <div className="text-xs space-y-0.5">
                        <div>HA: {a.vitals.bp}</div>
                        <div className="text-muted-foreground">Mạch: {a.vitals.hr} • SpO2: {a.vitals.spo2}</div>
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={a.status === "Hoàn thành" ? "default" : a.status === "Đã hủy" ? "outline" : "secondary"}>{a.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setApptDetail(a)}>Chi tiết</Button>
                      {a.status === "Sắp tới" && (
                        <Button size="sm" className="bg-slate-900 hover:bg-slate-800" onClick={() => {
                          const triage = queue.find(q => q.patient === a.patientName) ?? {
                            id: a.id, level: a.level || "Trung bình", patient: a.patientName, age: a.age || 40,
                            symptoms: a.symptoms || "Khám theo lịch hẹn", waited: "—",
                            vitals: a.vitals || { bp: "120/80", hr: "75", temp: "36.7°C", spo2: "98%" },
                          } as Triage;
                          setConsultPatient(triage);
                          toast.success(`Bắt đầu khám ${a.patientName}`);
                        }}>
                          Bắt đầu khám
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
