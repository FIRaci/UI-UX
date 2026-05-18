import { useEffect, useState } from "react";
import { AppShell } from "./AppShell";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import {
  LayoutDashboard, CalendarDays, Users, FileText, MessagesSquare,
  CheckCircle2, Clock, Send, AlertTriangle, ArrowLeft, Video, MessageCircle,
  Mic, Save, Sparkles, Pill, History, Search, Filter, Phone, PhoneOff
} from "lucide-react";
import { toast } from "sonner";
import { useStore, store, formatRelative } from "../store";

const ME_NAME = "BS. Nguyễn Văn An";
const ME_ID = 2;

type Triage = {
  id: number;
  level: "Khẩn cấp" | "Cao" | "Trung bình" | "Thấp";
  patient: string;
  age: number;
  symptoms: string;
  waited: string;
  vitals: { bp: string; hr: string; temp: string; spo2: string };
};

const INITIAL_QUEUE: Triage[] = [
  { id: 1, level: "Khẩn cấp", patient: "Trần Văn Hậu", age: 58, symptoms: "Đau ngực dữ dội, khó thở", waited: "2 phút", vitals: { bp: "160/100", hr: "112", temp: "37.2°C", spo2: "94%" } },
  { id: 2, level: "Cao", patient: "Đặng Quỳnh Anh", age: 34, symptoms: "Sốt cao, đau đầu kéo dài 3 ngày", waited: "12 phút", vitals: { bp: "120/80", hr: "98", temp: "39.1°C", spo2: "97%" } },
  { id: 3, level: "Trung bình", patient: "Phạm Bích Ngọc", age: 47, symptoms: "Đau lưng dưới, tê chân phải", waited: "25 phút", vitals: { bp: "125/82", hr: "78", temp: "36.7°C", spo2: "98%" } },
  { id: 4, level: "Trung bình", patient: "Lê Văn Tú", age: 41, symptoms: "Tái khám tăng huyết áp", waited: "30 phút", vitals: { bp: "138/88", hr: "82", temp: "36.8°C", spo2: "98%" } },
  { id: 5, level: "Thấp", patient: "Mai Hồng Yến", age: 29, symptoms: "Khám sức khỏe định kỳ", waited: "45 phút", vitals: { bp: "118/76", hr: "72", temp: "36.5°C", spo2: "99%" } },
];

const URGENT_ALERT = {
  patient: "Trần Văn Hậu",
  age: 58,
  symptoms: "Đau ngực dữ dội, khó thở, vã mồ hôi",
  trigger: "Triệu chứng nghi nhồi máu cơ tim cấp",
};

const NOTE_TEMPLATES = [
  { name: "Tăng huyết áp", body: "Chẩn đoán: Tăng huyết áp giai đoạn 1.\nKhuyến nghị:\n- Amlodipine 5mg, 1 viên/sáng\n- Theo dõi huyết áp 2 lần/ngày\n- Tái khám sau 4 tuần" },
  { name: "Viêm họng", body: "Chẩn đoán: Viêm họng cấp.\nKê đơn:\n- Amoxicillin 500mg, 3 lần/ngày × 7 ngày\n- Paracetamol khi sốt > 38.5°C\n- Súc miệng nước muối, nghỉ ngơi" },
  { name: "Tái khám tim mạch", body: "Bệnh nhân đáp ứng tốt với phác đồ.\n- Tiếp tục thuốc hiện tại\n- Xét nghiệm lipid máu sau 3 tháng\n- Tái khám 1 tháng/lần" },
];

export function DoctorDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState("overview");
  const [queue, setQueue] = useState<Triage[]>(INITIAL_QUEUE);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [scheduleLevelFilter, setScheduleLevelFilter] = useState<string>("all");
  const [consultPatient, setConsultPatient] = useState<Triage | null>(null);

  const appointments = useStore(s => s.appointments.filter(a => a.doctorName === ME_NAME));
  const TODAY = "2026-05-14";
  const todayAppts = appointments.filter(a => a.date === TODAY);
  const todayUpcoming = todayAppts.filter(a => a.status === "Sắp tới");
  const filteredSchedule = todayAppts.filter(a => scheduleLevelFilter === "all" || a.level === scheduleLevelFilter);
  const threads = useStore(s =>
    s.threads.filter(t => t.staffId === ME_ID).sort((a, b) => b.updatedAt - a.updatedAt)
  );

  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [patientFile, setPatientFile] = useState<string | null>(null);
  const [recordView, setRecordView] = useState<{ p: string; d: string; t: string; m: string } | null>(null);
  const [apptDetail, setApptDetail] = useState<any | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const [newRecordType, setNewRecordType] = useState<"prescription" | "record">("prescription");
  const [newRecordPatient, setNewRecordPatient] = useState("");
  const [newRecordContent, setNewRecordContent] = useState("");
  const [showRecordTemplate, setShowRecordTemplate] = useState(false);
  const [records, setRecords] = useState([
    { p: "Nguyễn Minh Khoa", d: "2026-05-05", t: "Đơn thuốc tim mạch", m: "Amlodipine 5mg • Atorvastatin 10mg" },
    { p: "Trần Thu Hà", d: "2026-05-04", t: "Hồ sơ khám", m: "Khám định kỳ, kết quả ổn định" },
    { p: "Lê Văn Tú", d: "2026-05-02", t: "Đơn thuốc tái khám", m: "Bisoprolol 2.5mg • Aspirin 81mg" },
  ]);
  useEffect(() => { if (!activeThreadId && threads[0]) setActiveThreadId(threads[0].id); }, [threads, activeThreadId]);
  const activeThread = threads.find(t => t.id === activeThreadId) ?? null;

  const sendReply = () => {
    if (!reply.trim() || !activeThread) return;
    store.appendMessage(activeThread.id, { f: "staff", txt: reply, t: "vừa xong" });
    setReply("");
  };

  const filteredQueue = queue.filter(q => levelFilter === "all" || q.level === levelFilter);

  const openConsult = (t: Triage) => {
    setConsultPatient(t);
    toast.info(`Mở bệnh án: ${t.patient}`);
  };

  const finishConsult = () => {
    if (!consultPatient) return;
    setQueue(prev => prev.filter(q => q.id !== consultPatient.id));
    toast.success(`Đã hoàn tất hội chẩn cho ${consultPatient.patient}`);
    setConsultPatient(null);
  };

  if (consultPatient) {
    return (
      <ConsultationRoom
        patient={consultPatient}
        onBack={() => setConsultPatient(null)}
        onFinish={finishConsult}
        onLogout={onLogout}
      />
    );
  }

  return (
    <AppShell
      title="Phòng khám của tôi"
      subtitle={`Chào ${ME_NAME}`}
      roleLabel="Bác sĩ"
      roleColor="bg-violet-100 text-violet-700 border border-violet-200"
      initials="VA"
      active={active}
      onNav={setActive}
      onLogout={onLogout}
      nav={[
        { key: "overview", label: "Tổng quan & Ca chờ", icon: LayoutDashboard },
        { key: "schedule", label: "Lịch khám hôm nay", icon: CalendarDays },
        { key: "patients", label: "Bệnh nhân", icon: Users },
        { key: "records", label: "Hồ sơ & đơn thuốc", icon: FileText },
        { key: "consult", label: "Tin nhắn tư vấn", icon: MessagesSquare },
      ]}
    >
      {active === "overview" && (
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

            <Card className="p-5 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
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
                { l: "Đã khám hôm nay", v: todayAppts.filter(a => a.status === "Hoàn thành").length, c: "bg-emerald-50 text-emerald-700 border-emerald-100" },
              ].map((s, i) => (
                <Card key={i} className="p-4 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "16px" }}>
                  <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${s.c}`}>{s.l}</div>
                  <div className="mt-3 text-3xl font-bold text-slate-800 tracking-tight">{s.v}</div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-4 h-fit xl:sticky xl:top-4 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800 text-sm tracking-tight">Lịch hẹn hôm nay</h4>
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 shrink-0">{todayUpcoming.length} ca</span>
            </div>
            <div className="space-y-3">
              {todayUpcoming.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">Không có lịch hẹn sắp tới.</div>
              ) : todayUpcoming.slice(0, 8).map(p => (
                <Card key={p.id} className="p-3 border border-slate-100 hover:shadow-md transition-all cursor-pointer animate-fade-in" style={{ borderRadius: "14px" }} onClick={() => setApptDetail(p)}>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-700 text-sm truncate">{p.patientName}</div>
                    <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {p.time} • {p.clinic}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-3 h-8 text-xs rounded-xl text-blue-600 border-blue-50 hover:bg-blue-50/50"
                  >
                    Xem chi tiết
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {active === "schedule" && (
        <Card className="p-5">
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
              <Card key={i} className={`p-3 border ${s.c}`}>
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
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={a.status === "Hoàn thành" ? "default" : a.status === "Đã hủy" ? "outline" : "secondary"}>{a.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setApptDetail(a)}>
                            Chi tiết
                          </Button>
                          {a.status === "Sắp tới" && (
                            <Button size="sm" className="bg-slate-900 hover:bg-slate-800" onClick={() => {
                              const triage = queue.find(q => q.patient === a.patientName) ?? {
                                id: a.id,
                                level: a.level || "Trung bình",
                                patient: a.patientName,
                                age: a.age || 40,
                                symptoms: a.symptoms || "Khám theo lịch hẹn",
                                waited: "—",
                                vitals: a.vitals || { bp: "120/80", hr: "75", temp: "36.7°C", spo2: "98%" }
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
      )}

      {active === "patients" && (
        <Card className="p-5">
          <h4 className="tracking-tight mb-3">Bệnh nhân của tôi</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {Array.from(new Set(appointments.map(a => a.patientName))).map(name => {
              const last = appointments.find(a => a.patientName === name);
              return (
                <Card key={name} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12"><AvatarFallback className="bg-violet-100 text-violet-700">{name[0]}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div>{name}</div>
                      <div className="text-sm text-muted-foreground">Lần gần nhất: {last?.date} • {last?.time}</div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => setPatientFile(name)}>Hồ sơ</Button>
                        <Button size="sm" onClick={() => {
                          const triage = queue.find(q => q.patient === name) ?? { id: -1, level: "Trung bình", patient: name, age: 40, symptoms: "Tái khám định kỳ", waited: "—", vitals: { bp: "120/80", hr: "75", temp: "36.7", spo2: "98" } } as Triage;
                          setConsultPatient(triage);
                          toast.success(`Đã mở phiên hội chẩn với ${name}`);
                        }}>Hội chẩn</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            {appointments.length === 0 && <div className="text-muted-foreground col-span-full text-center py-6">Chưa có bệnh nhân.</div>}
          </div>
        </Card>
      )}

      {active === "records" && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="tracking-tight">Hồ sơ và đơn thuốc</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Quản lý đơn thuốc và hồ sơ khám bệnh</p>
            </div>
            <Button onClick={() => setNewRecord(true)} className="bg-violet-600 hover:bg-violet-700">
              <FileText className="w-4 h-4 mr-1" /> Tạo mới
            </Button>
          </div>

          <Tabs defaultValue="all" className="mb-3">
            <TabsList>
              <TabsTrigger value="all">Tất cả ({records.length})</TabsTrigger>
              <TabsTrigger value="prescription">Đơn thuốc ({records.filter(r => r.t.includes("Đơn thuốc")).length})</TabsTrigger>
              <TabsTrigger value="record">Hồ sơ khám ({records.filter(r => r.t.includes("Hồ sơ")).length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2 mt-3">
              {records.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">Chưa có hồ sơ hoặc đơn thuốc.</div>
              ) : records.map((r, i) => (
                <div key={i} className="p-3 border rounded-xl flex justify-between items-start hover:bg-slate-50 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={r.t.includes("Đơn thuốc") ? "default" : "secondary"} className="shrink-0">
                        {r.t.includes("Đơn thuốc") ? "Đơn thuốc" : "Hồ sơ"}
                      </Badge>
                      <span className="font-medium truncate">{r.p}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{r.d}</div>
                    <div className="text-sm mt-1">{r.m}</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setRecordView(r)}>Xem</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success("Đã gửi cho bệnh nhân")}>Gửi</Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="prescription" className="space-y-2 mt-3">
              {records.filter(r => r.t.includes("Đơn thuốc")).length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">Chưa có đơn thuốc.</div>
              ) : records.filter(r => r.t.includes("Đơn thuốc")).map((r, i) => (
                <div key={i} className="p-3 border rounded-xl flex justify-between items-start hover:bg-slate-50 transition">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r.p}</div>
                    <div className="text-sm text-muted-foreground mt-1">{r.d}</div>
                    <div className="text-sm mt-1">{r.m}</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setRecordView(r)}>Xem</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success("Đã gửi cho bệnh nhân")}>Gửi</Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="record" className="space-y-2 mt-3">
              {records.filter(r => r.t.includes("Hồ sơ")).length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">Chưa có hồ sơ khám.</div>
              ) : records.filter(r => r.t.includes("Hồ sơ")).map((r, i) => (
                <div key={i} className="p-3 border rounded-xl flex justify-between items-start hover:bg-slate-50 transition">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r.p}</div>
                    <div className="text-sm text-muted-foreground mt-1">{r.d}</div>
                    <div className="text-sm mt-1">{r.m}</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setRecordView(r)}>Xem</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success("Đã gửi cho bệnh nhân")}>Gửi</Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </Card>
      )}

      {active === "consult" && (
        <Card className="p-0 overflow-hidden h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-[300px_1fr] h-full">
            <div className="border-r overflow-auto">
              <div className="p-3 border-b">
                <span className="text-sm">Tin nhắn tư vấn ({threads.length})</span>
              </div>
              {threads.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`w-full p-3 flex items-start gap-3 border-b hover:bg-slate-50 text-left ${activeThread?.id === t.id ? "bg-violet-50" : ""}`}
                >
                  <Avatar><AvatarFallback className="bg-violet-100 text-violet-700">{t.userName[0]}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="truncate">{t.userName}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{formatRelative(t.updatedAt)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{t.userRole === "benhnhan" ? "Bệnh nhân" : "Người tư vấn"} • {t.topic}</div>
                    <div className="text-sm text-muted-foreground truncate mt-0.5">{t.last}</div>
                    {t.status === "Chờ phản hồi" && <Badge className="mt-1 bg-amber-100 text-amber-700 border border-amber-200">Cần phản hồi</Badge>}
                  </div>
                </button>
              ))}
              {threads.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">Chưa có tin nhắn</div>}
            </div>
            <div className="flex flex-col">
              {activeThread ? (
                <>
                  <div className="border-b p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarFallback className="bg-violet-100 text-violet-700">{activeThread.userName[0]}</AvatarFallback></Avatar>
                      <div>
                        <div>{activeThread.userName}</div>
                        <div className="text-xs text-muted-foreground">{activeThread.userRole === "benhnhan" ? "Bệnh nhân" : "Người tư vấn"} • {activeThread.topic}</div>
                      </div>
                    </div>
                    {activeThread.status === "Đã kết thúc" && (
                      <Badge variant="outline">Đã kết thúc</Badge>
                    )}
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                      {activeThread.msgs.map((m, i) => (
                        <div key={i} className={`flex ${m.f === "staff" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.f === "staff" ? "bg-violet-500 text-white rounded-br-sm" : "bg-slate-100 rounded-bl-sm"}`}>
                            {m.txt}
                            {m.t && <div className={`text-[10px] mt-0.5 ${m.f === "staff" ? "text-white/70" : "text-muted-foreground"}`}>{m.t}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {activeThread.status !== "Đã kết thúc" ? (
                    <div className="p-3 border-t flex gap-2">
                      <Input placeholder="Nhập câu trả lời..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === "Enter" && sendReply()} />
                      <Button size="icon" onClick={sendReply}><Send className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <div className="p-3 border-t text-center text-sm text-muted-foreground">Hội thoại đã kết thúc</div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">Chọn tin nhắn để xem</div>
              )}
            </div>
          </div>
        </Card>
      )}

      <Dialog open={!!patientFile} onOpenChange={() => setPatientFile(null)}>
        <DialogContent className="max-w-xl">
          {patientFile && (() => {
            const visits = appointments.filter(a => a.patientName === patientFile);
            return (
              <>
                <DialogHeader className="text-left">
                  <DialogTitle>Hồ sơ bệnh án — {patientFile}</DialogTitle>
                  <DialogDescription>{visits.length} lượt khám trong hệ thống</DialogDescription>
                </DialogHeader>
                <section className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg border">
                    <div className="text-xs text-muted-foreground">Nhóm máu</div>
                    <div className="mt-0.5">O+</div>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <div className="text-xs text-muted-foreground">Dị ứng</div>
                    <div className="mt-0.5">Penicillin</div>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <div className="text-xs text-muted-foreground">Bệnh nền</div>
                    <div className="mt-0.5">THA độ I</div>
                  </div>
                </section>
                <section>
                  <div className="text-sm tracking-tight mb-1.5">Lịch sử khám</div>
                  <div className="space-y-1.5 max-h-48 overflow-auto">
                    {visits.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Chưa có dữ liệu khám.</div>
                    ) : visits.map(v => (
                      <div key={v.id} className="p-2 rounded border text-sm flex justify-between">
                        <span>{v.date} • {v.time}</span>
                        <span className="text-muted-foreground">{v.doctorSpec} • {v.status}</span>
                      </div>
                    ))}
                  </div>
                </section>
                <DialogFooter>
                  <Button variant="outline" onClick={() => toast.success("Đã in hồ sơ PDF")}>In PDF</Button>
                  <Button onClick={() => setPatientFile(null)}>Đóng</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!recordView} onOpenChange={() => setRecordView(null)}>
        <DialogContent>
          {recordView && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>{recordView.t}</DialogTitle>
                <DialogDescription>Bệnh nhân: {recordView.p} • {recordView.d}</DialogDescription>
              </DialogHeader>
              <section className="p-3 rounded-lg bg-slate-50 border">
                <div className="text-xs text-muted-foreground mb-1">Nội dung</div>
                <p className="text-sm text-slate-800">{recordView.m}</p>
              </section>
              <section>
                <div className="text-sm tracking-tight mb-1">Hướng dẫn</div>
                <ul className="text-sm text-slate-700 space-y-0.5">
                  <li>• Uống thuốc đúng liều, đúng giờ theo đơn.</li>
                  <li>• Theo dõi huyết áp 2 lần/ngày, ghi vào sổ.</li>
                  <li>• Tái khám sau 4 tuần hoặc khi có dấu hiệu bất thường.</li>
                </ul>
              </section>
              <DialogFooter>
                <Button variant="outline" onClick={() => toast.success("Đã gửi đơn cho bệnh nhân")}>Gửi cho BN</Button>
                <Button onClick={() => setRecordView(null)}>Đóng</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!apptDetail} onOpenChange={() => setApptDetail(null)}>
        <DialogContent>
          {apptDetail && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
                <DialogDescription>{apptDetail.patientName}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg border"><div className="text-xs text-muted-foreground">Ngày</div><div className="mt-0.5">{apptDetail.date}</div></div>
                <div className="p-3 rounded-lg border"><div className="text-xs text-muted-foreground">Giờ</div><div className="mt-0.5">{apptDetail.time}</div></div>
                <div className="p-3 rounded-lg border"><div className="text-xs text-muted-foreground">Chi nhánh</div><div className="mt-0.5">{apptDetail.clinic}</div></div>
                <div className="p-3 rounded-lg border"><div className="text-xs text-muted-foreground">Trạng thái</div><div className="mt-0.5">{apptDetail.status}</div></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { toast.success("Đã gọi nhắc lịch"); }}>Gọi nhắc</Button>
                <Button onClick={() => {
                  const triage = queue.find(q => q.patient === apptDetail.patientName) ?? { id: -1, level: "Trung bình", patient: apptDetail.patientName, age: 40, symptoms: apptDetail.doctorSpec, waited: "—", vitals: { bp: "120/80", hr: "75", temp: "36.7", spo2: "98" } } as Triage;
                  setConsultPatient(triage);
                  setApptDetail(null);
                }}>Bắt đầu khám</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={newRecord} onOpenChange={(open) => {
        setNewRecord(open);
        if (!open) {
          setNewRecordPatient("");
          setNewRecordContent("");
          setNewRecordType("prescription");
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="text-left">
            <DialogTitle>Tạo {newRecordType === "prescription" ? "đơn thuốc" : "hồ sơ khám"} mới</DialogTitle>
            <DialogDescription>Nhập thông tin đầy đủ trước khi lưu</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Loại</label>
              <Select value={newRecordType} onValueChange={(v: "prescription" | "record") => setNewRecordType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prescription">Đơn thuốc</SelectItem>
                  <SelectItem value="record">Hồ sơ khám</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Bệnh nhân</label>
              <Select value={newRecordPatient} onValueChange={setNewRecordPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bệnh nhân..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(appointments.map(a => a.patientName))).map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Nội dung</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRecordTemplate(true)}
                >
                  <FileText className="w-3.5 h-3.5 mr-1" /> Chọn template
                </Button>
              </div>
              <Textarea
                className="min-h-[200px] resize-none"
                placeholder={newRecordType === "prescription" ? "Nhập đơn thuốc: tên thuốc, liều lượng, cách dùng..." : "Nhập kết quả khám, chẩn đoán, khuyến nghị..."}
                value={newRecordContent}
                onChange={e => setNewRecordContent(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRecord(false)}>Hủy</Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              onClick={() => {
                if (!newRecordPatient.trim()) {
                  toast.error("Vui lòng chọn bệnh nhân");
                  return;
                }
                if (!newRecordContent.trim()) {
                  toast.error("Vui lòng nhập nội dung");
                  return;
                }

                const today = new Date().toISOString().split('T')[0];
                const newRec = {
                  p: newRecordPatient,
                  d: "2026-05-13",
                  t: newRecordType === "prescription" ? "Đơn thuốc mới" : "Hồ sơ khám mới",
                  m: newRecordContent,
                };
                setRecords(prev => [newRec, ...prev]);
                toast.success(`Đã tạo ${newRecordType === "prescription" ? "đơn thuốc" : "hồ sơ"} cho ${newRecordPatient}`);
                setNewRecord(false);
                setNewRecordPatient("");
                setNewRecordContent("");
              }}
            >
              <Save className="w-4 h-4 mr-1" /> Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRecordTemplate} onOpenChange={() => setShowRecordTemplate(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chọn template</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {NOTE_TEMPLATES.map(t => (
              <Card key={t.name} className="p-3 hover:bg-slate-50 cursor-pointer" onClick={() => {
                setNewRecordContent(prev => (prev ? prev + "\n\n" : "") + t.body);
                setShowRecordTemplate(false);
                toast.success(`Đã chèn template: ${t.name}`);
              }}>
                <div className="text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-1 whitespace-pre-line line-clamp-3">{t.body}</div>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordTemplate(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function LevelBadge({ level }: { level: Triage["level"] }) {
  const map = {
    "Khẩn cấp": "bg-rose-100 text-rose-700 border border-rose-200",
    "Cao": "bg-orange-100 text-orange-700 border border-orange-200",
    "Trung bình": "bg-amber-100 text-amber-700 border border-amber-200",
    "Thấp": "bg-emerald-100 text-emerald-700 border border-emerald-200",
  } as const;
  const dot = {
    "Khẩn cấp": "bg-rose-500 animate-pulse",
    "Cao": "bg-orange-500",
    "Trung bình": "bg-amber-500",
    "Thấp": "bg-emerald-500",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs ${map[level]}`}>
      <span className={`w-2 h-2 rounded-full ${dot[level]}`} />
      {level}
    </span>
  );
}

function ConsultationRoom({
  patient, onBack, onFinish, onLogout,
}: {
  patient: Triage; onBack: () => void; onFinish: () => void; onLogout: () => void;
}) {
  const [tab, setTab] = useState("ai");
  const [note, setNote] = useState("");
  const [drugQuery, setDrugQuery] = useState("");
  const [showTemplate, setShowTemplate] = useState(false);
  const [callOn, setCallOn] = useState(true);
  const [chatMode, setChatMode] = useState<"video" | "chat">("video");
  const [chatMsgs, setChatMsgs] = useState([
    { f: "staff" as const, txt: `Chào ${patient.patient}, tôi là bác sĩ trực hôm nay.`, t: "vừa xong" },
    { f: "user" as const, txt: "Dạ chào bác sĩ ạ.", t: "vừa xong" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const aiSummary = [
    `Bệnh nhân ${patient.patient}, ${patient.age} tuổi, vào viện vì: ${patient.symptoms.toLowerCase()}.`,
    `Sinh hiệu lúc tiếp nhận: HA ${patient.vitals.bp}, mạch ${patient.vitals.hr}, nhiệt độ ${patient.vitals.temp}, SpO2 ${patient.vitals.spo2}.`,
    `Tiền sử: tăng huyết áp 5 năm, đang dùng Amlodipine 5mg/ngày.`,
    `Khuyến nghị AI: ưu tiên đo ECG, xét nghiệm Troponin nếu nghi ngờ tim mạch.`,
  ];

  const history = [
    { d: "2026-04-22", t: "Khám định kỳ tim mạch", note: "HA 130/85, kê tiếp Amlodipine" },
    { d: "2026-02-10", t: "Cấp cứu - đau ngực", note: "ECG bình thường, theo dõi 24h" },
    { d: "2025-11-20", t: "Khám tổng quát", note: "Cholesterol cao nhẹ" },
  ];

  const drugs = [
    { name: "Amlodipine 5mg", desc: "Chẹn kênh canxi - hạ huyết áp", warn: "Phù mắt cá chân ở liều cao" },
    { name: "Atorvastatin 10mg", desc: "Statin - giảm cholesterol", warn: "Theo dõi men gan" },
    { name: "Bisoprolol 2.5mg", desc: "Chẹn beta - chống loạn nhịp", warn: "Không dùng cho hen phế quản" },
    { name: "Aspirin 81mg", desc: "Chống kết tập tiểu cầu", warn: "Tiền sử loét dạ dày" },
  ].filter(d => drugQuery === "" || d.name.toLowerCase().includes(drugQuery.toLowerCase()) || d.desc.toLowerCase().includes(drugQuery.toLowerCase()));

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMsgs(prev => [...prev, { f: "staff", txt: chatInput, t: "vừa xong" }]);
    setChatInput("");
  };

  const saveAndFinish = () => {
    if (!note.trim()) {
      toast.error("Vui lòng ghi chú trước khi hoàn tất");
      return;
    }
    onFinish();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" />Quay lại</Button>
          <div className="h-6 w-px bg-slate-200" />
          <Avatar className="w-8 h-8"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs">{patient.patient[0]}</AvatarFallback></Avatar>
          <div className="min-w-0">
            <div className="text-sm truncate">{patient.patient} <span className="text-muted-foreground">({patient.age} tuổi)</span></div>
            <div className="text-xs text-muted-foreground truncate">Phiên tư vấn • {patient.symptoms}</div>
          </div>
          <LevelBadge level={patient.level} />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">HA {patient.vitals.bp}</Badge>
          <Badge variant="outline" className="text-xs">Mạch {patient.vitals.hr}</Badge>
          <Badge variant="outline" className="text-xs">{patient.vitals.temp}</Badge>
          <Button variant="outline" size="sm" onClick={onLogout}>Đăng xuất</Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 p-4 min-h-0">
        <Card className="p-0 overflow-hidden flex flex-col min-h-0">
          <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 min-h-0">
            <div className="border-b px-4 pt-3">
              <TabsList>
                <TabsTrigger value="ai"><Sparkles className="w-3.5 h-3.5 mr-1" />Tóm tắt AI</TabsTrigger>
                <TabsTrigger value="history"><History className="w-3.5 h-3.5 mr-1" />Lịch sử</TabsTrigger>
                <TabsTrigger value="drugs"><Pill className="w-3.5 h-3.5 mr-1" />Tra cứu thuốc</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="ai" className="flex-1 m-0 overflow-auto p-4 space-y-3">
              <Card className="p-4 bg-gradient-to-br from-violet-50 to-sky-50 border-violet-200">
                <div className="flex items-center gap-2 text-violet-700">
                  <Sparkles className="w-4 h-4" /> <span className="text-sm">AI sàng lọc & tóm tắt</span>
                </div>
                <div className="space-y-2 mt-3">
                  {aiSummary.map((line, i) => (
                    <label key={i} className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="mt-1" />
                      <span className="text-sm">{line}</span>
                    </label>
                  ))}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm">Đề xuất chẩn đoán phân biệt</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Cơn tăng huyết áp", "Đau đầu căng thẳng", "Rối loạn tiền đình"].map(d => (
                    <Badge key={d} variant="secondary">{d}</Badge>
                  ))}
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="flex-1 m-0 overflow-auto p-4 space-y-2">
              {history.map((h, i) => (
                <div key={i} className="p-3 border rounded-xl">
                  <div className="text-xs text-muted-foreground">{h.d}</div>
                  <div className="text-sm mt-0.5">{h.t}</div>
                  <div className="text-sm text-muted-foreground mt-1">{h.note}</div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="drugs" className="flex-1 m-0 overflow-auto p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Tra cứu thuốc..." value={drugQuery} onChange={e => setDrugQuery(e.target.value)} />
              </div>
              {drugs.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Không tìm thấy thuốc.</div>
              ) : drugs.map(d => (
                <Card key={d.name} className="p-3">
                  <div className="text-sm">{d.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.desc}</div>
                  <div className="text-xs text-amber-700 mt-1">⚠ {d.warn}</div>
                  <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => {
                    setNote(prev => (prev ? prev + "\n" : "") + `Kê: ${d.name} - ${d.desc}`);
                    toast.success(`Đã thêm ${d.name} vào ghi chú`);
                  }}>Thêm vào đơn</Button>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </Card>

        <div className="grid grid-rows-[1fr_1fr] gap-4 min-h-0">
          <Card className="p-0 overflow-hidden flex flex-col min-h-0">
            <div className="border-b px-3 py-2 flex items-center justify-between">
              <span className="text-sm">Video call / Chat</span>
              <div className="flex gap-1">
                <Button size="sm" variant={chatMode === "video" ? "default" : "outline"} onClick={() => setChatMode("video")}><Video className="w-3.5 h-3.5 mr-1" />Video</Button>
                <Button size="sm" variant={chatMode === "chat" ? "default" : "outline"} onClick={() => setChatMode("chat")}><MessageCircle className="w-3.5 h-3.5 mr-1" />Chat</Button>
              </div>
            </div>
            {chatMode === "video" ? (
              <div className="flex-1 relative bg-slate-900 flex items-center justify-center">
                <div className="text-white/60 text-sm">[Khu vực video]</div>
                <div className="absolute bottom-3 right-3 w-32 h-20 bg-slate-700 rounded-lg border-2 border-white/30 flex items-center justify-center text-white/60 text-xs">Bạn</div>
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full bg-white ${callOn ? "animate-pulse" : ""}`} />
                    {callOn ? "Đang gọi" : "Đã ngắt"}
                  </span>
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <Button size="icon" variant="secondary" onClick={() => toast.info("Tắt/bật mic")}><Mic className="w-4 h-4" /></Button>
                  <Button
                    size="icon"
                    className={callOn ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                    onClick={() => { setCallOn(!callOn); toast.info(callOn ? "Đã kết thúc cuộc gọi" : "Đã kết nối lại"); }}
                  >
                    {callOn ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-2">
                    {chatMsgs.map((m, i) => (
                      <div key={i} className={`flex ${m.f === "staff" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.f === "staff" ? "bg-violet-500 text-white" : "bg-slate-100"}`}>
                          {m.txt}
                          <div className={`text-[10px] mt-0.5 ${m.f === "staff" ? "text-white/70" : "text-muted-foreground"}`}>{m.t}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-2 border-t flex gap-2">
                  <Input placeholder="Nhập tin nhắn..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} />
                  <Button size="icon" onClick={sendChat}><Send className="w-4 h-4" /></Button>
                </div>
              </>
            )}
          </Card>

          <Card className="p-0 overflow-hidden flex flex-col min-h-0">
            <div className="border-b px-3 py-2 flex items-center justify-between">
              <span className="text-sm">Ghi chú</span>
              <Button size="sm" variant="outline" onClick={() => setShowTemplate(true)}><FileText className="w-3.5 h-3.5 mr-1" />Template</Button>
            </div>
            <Textarea
              className="flex-1 m-3 resize-none"
              placeholder="Ghi chú chẩn đoán, đơn thuốc, dặn dò..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className="px-3 pb-3 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => toast.info("Đang ghi âm... (mô phỏng)")}>
                <Mic className="w-4 h-4 mr-1" /> Ghi chú giọng nói
              </Button>
              <Button className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={saveAndFinish}>
                <Save className="w-4 h-4 mr-1" /> Lưu & Hoàn tất
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={showTemplate} onOpenChange={() => setShowTemplate(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chọn template ghi chú</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {NOTE_TEMPLATES.map(t => (
              <Card key={t.name} className="p-3 hover:bg-slate-50 cursor-pointer" onClick={() => {
                setNote(prev => (prev ? prev + "\n\n" : "") + t.body);
                setShowTemplate(false);
                toast.success(`Đã chèn template: ${t.name}`);
              }}>
                <div className="text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-1 whitespace-pre-line line-clamp-3">{t.body}</div>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplate(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


