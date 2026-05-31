import { useEffect, useState, useRef, useCallback } from "react";
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
  Mic, Save, Sparkles, Pill, History, Search, Filter, Phone, PhoneOff,
  Stethoscope, ClipboardList, UserSearch, User
} from "lucide-react";
import { toast } from "sonner";
import { useStore, store, formatRelative } from "../store";

const ME_NAME = "BS. Nguyễn Văn An";
const ME_ID = 1;

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
  const [searchQuery, setSearchQuery] = useState("");

  const appointments = useStore(s => s.appointments.filter(a => a.doctorName === ME_NAME));
  const TODAY = new Date().toISOString().split("T")[0];
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

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const raw = (e as CustomEvent<string>).detail;
      if (!raw) return;
      let view = raw;
      try { const p = JSON.parse(raw); if (p.view) view = p.view; } catch {}
      const map: Record<string, string> = {
        search: "schedule", appointments: "schedule", overview: "overview",
        patients: "patients", records: "records", consult: "consult", schedule: "schedule",
        profile: "profile",
      };
      if (map[view]) setActive(map[view]);
    };
    window.addEventListener("app:navigate", handleNavigate);
    return () => window.removeEventListener("app:navigate", handleNavigate);
  }, []);

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

  // --- Search logic ---
  const sq = searchQuery.toLowerCase().trim();
  const searchResultsQueue = sq ? queue.filter(t =>
    t.patient.toLowerCase().includes(sq) || t.symptoms.toLowerCase().includes(sq)
  ) : [];
  const searchResultsAppts = sq ? appointments.filter(a =>
    a.patientName.toLowerCase().includes(sq) || (a.symptoms || "").toLowerCase().includes(sq) || a.doctorSpec.toLowerCase().includes(sq)
  ) : [];
  const searchResultsRecords = sq ? records.filter(r =>
    r.p.toLowerCase().includes(sq) || r.t.toLowerCase().includes(sq) || r.m.toLowerCase().includes(sq)
  ) : [];
  const hasResults = searchResultsQueue.length + searchResultsAppts.length + searchResultsRecords.length > 0;

  const searchResultsNode = sq ? (
    <div className="overflow-auto" style={{ maxHeight: '400px' }}>
      {!hasResults && (
        <div className="p-8 text-center">
          <UserSearch className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <div className="text-sm font-medium text-slate-500">Không tìm thấy kết quả cho "{searchQuery}"</div>
          <div className="text-xs text-slate-400 mt-1">Thử tìm theo tên bệnh nhân, triệu chứng hoặc chẩn đoán</div>
        </div>
      )}
      {searchResultsQueue.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-rose-50 text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5 border-b border-rose-100">
            <AlertTriangle className="w-3 h-3" /> Ca chờ khám ({searchResultsQueue.length})
          </div>
          {searchResultsQueue.map(t => (
            <button
              key={`q-${t.id}`}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-0"
              onClick={() => { openConsult(t); setSearchQuery(""); }}
            >
              <Avatar className="w-9 h-9 shrink-0"><AvatarFallback className="bg-gradient-to-br from-rose-500 to-orange-500 text-white text-xs font-bold">{t.patient[0]}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-800 truncate">{t.patient} <span className="text-slate-400 font-normal">({t.age} tuổi)</span></div>
                <div className="text-xs text-slate-500 truncate mt-0.5">{t.symptoms}</div>
              </div>
              <LevelBadge level={t.level} />
            </button>
          ))}
        </div>
      )}
      {searchResultsAppts.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-blue-50 text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 border-b border-blue-100">
            <CalendarDays className="w-3 h-3" /> Lịch hẹn ({searchResultsAppts.length})
          </div>
          {searchResultsAppts.slice(0, 5).map(a => (
            <button
              key={`a-${a.id}`}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-0"
              onClick={() => { setApptDetail(a); setSearchQuery(""); }}
            >
              <Avatar className="w-9 h-9 shrink-0"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-sky-500 text-white text-xs font-bold">{a.patientName[0]}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-800 truncate">{a.patientName}</div>
                <div className="text-xs text-slate-500 truncate mt-0.5">{a.date} • {a.time} • {a.clinic}</div>
              </div>
              <Badge variant={a.status === "Hoàn thành" ? "default" : "secondary"} className="shrink-0 text-[10px]">{a.status}</Badge>
            </button>
          ))}
        </div>
      )}
      {searchResultsRecords.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-violet-50 text-[10px] font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1.5 border-b border-violet-100">
            <FileText className="w-3 h-3" /> Hồ sơ & đơn thuốc ({searchResultsRecords.length})
          </div>
          {searchResultsRecords.slice(0, 5).map((r, i) => (
            <button
              key={`r-${i}`}
              className="w-full text-left px-4 py-3 hover:bg-violet-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-0"
              onClick={() => { setRecordView(r); setSearchQuery(""); }}
            >
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0"><ClipboardList className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-800 truncate">{r.p}</div>
                <div className="text-xs text-slate-500 truncate mt-0.5">{r.t} • {r.d}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  ) : null;

  return (
    <AppShell
      title="Phòng khám của tôi"
      subtitle={`Chào ${ME_NAME}`}
      roleLabel="Bác sĩ"
      roleColor="bg-violet-100 text-violet-700 border border-violet-200"
      initials="VA"
      active={active}
      onNav={(key) => { setActive(key); setSearchQuery(""); }}
      onLogout={onLogout}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchResults={searchResultsNode}
      nav={[
        { key: "overview", label: "Tổng quan & Ca chờ", icon: LayoutDashboard },
        { key: "schedule", label: "Lịch khám hôm nay", icon: CalendarDays },
        { key: "patients", label: "Bệnh nhân", icon: Users },
        { key: "records", label: "Hồ sơ & đơn thuốc", icon: FileText },
        { key: "consult", label: "Tin nhắn tư vấn", icon: MessagesSquare },
        { key: "profile", label: "Cá nhân", icon: User },
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
        <Card className="p-5 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div>
              <h4 className="font-bold text-slate-800 text-sm tracking-tight">Lịch khám hôm nay</h4>
              <p className="text-xs text-slate-400 mt-0.5">Ngày {TODAY} • Sắp xếp theo giờ khám</p>
            </div>
            <div className="flex gap-2 items-center">
              <Select value={scheduleLevelFilter} onValueChange={setScheduleLevelFilter}>
                <SelectTrigger className="w-44 h-9 rounded-xl border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium"><Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-lg">
                  <SelectItem value="all" className="text-xs">Tất cả mức độ</SelectItem>
                  <SelectItem value="Khẩn cấp" className="text-xs text-rose-600 font-bold">Khẩn cấp</SelectItem>
                  <SelectItem value="Cao" className="text-xs text-orange-600 font-bold">Cao</SelectItem>
                  <SelectItem value="Trung bình" className="text-xs text-amber-600 font-medium">Trung bình</SelectItem>
                  <SelectItem value="Thấp" className="text-xs text-emerald-600">Thấp</SelectItem>
                </SelectContent>
              </Select>
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 shrink-0">{filteredSchedule.length} ca</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { l: "Khẩn cấp", v: todayAppts.filter(a => a.level === "Khẩn cấp").length, c: "bg-rose-50 text-rose-700 border-rose-200" },
              { l: "Cao", v: todayAppts.filter(a => a.level === "Cao").length, c: "bg-orange-50 text-orange-700 border-orange-200" },
              { l: "Trung bình", v: todayAppts.filter(a => a.level === "Trung bình").length, c: "bg-amber-50 text-amber-700 border-amber-200" },
              { l: "Thấp", v: todayAppts.filter(a => a.level === "Thấp").length, c: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            ].map((s, i) => (
              <Card key={i} className={`p-4 bg-white border shadow-sm ${s.c}`} style={{ borderRadius: "16px" }}>
                <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${s.c}`}>{s.l}</div>
                <div className="mt-3 text-3xl font-bold text-slate-800 tracking-tight">{s.v}</div>
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
        <Card className="p-5 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-3">Bệnh nhân của tôi</h4>
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
        <Card className="p-5 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm tracking-tight">Hồ sơ và đơn thuốc</h4>
              <p className="text-xs text-slate-400 mt-0.5">Quản lý đơn thuốc và hồ sơ khám bệnh</p>
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
        <Card className="p-0 overflow-hidden h-[calc(100vh-12rem)] bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
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
      {active === "profile" && <Profile />}

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

                const todayStr = new Date().toISOString().split('T')[0];
                const newRec = {
                  p: newRecordPatient,
                  d: todayStr,
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

function Profile() {
  return (
    <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
      <Card className="p-6 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
        <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-5">Thông tin tài khoản</h4>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">VA</div>
          <div>
            <div className="font-bold text-slate-800 text-base">BS. Nguyễn Văn An</div>
            <div className="text-xs text-slate-500 mt-0.5">Bác sĩ • Mã số: BS-2026-00088</div>
            <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[10px] font-bold border border-violet-200">Tài khoản hoạt động</span>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { label: "Chuyên khoa", value: "Tim mạch" },
            { label: "Email", value: "an.nguyenvan@medicare.com" },
            { label: "Số điện thoại", value: "0987 654 321" },
            { label: "Nơi công tác", value: "CN Q1, TP.HCM" },
            { label: "Kinh nghiệm", value: "15 năm" },
            { label: "Học vị", value: "Thạc sĩ, Bác sĩ chuyên khoa I" },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
              <span className="text-xs text-slate-500 font-medium">{item.label}</span>
              <span className="text-xs font-semibold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
        <Button className="mt-5 w-full rounded-xl text-xs h-9 bg-slate-900 hover:bg-slate-800">Chỉnh sửa thông tin</Button>
      </Card>
      <div className="space-y-5">
        <Card className="p-5 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Cài đặt thông báo</h4>
          <div className="space-y-3">
            {[
              { label: "Thông báo ca khẩn cấp (Hệ thống)", on: true },
              { label: "Nhắc lịch khám mới qua SMS", on: true },
              { label: "Báo cáo tin nhắn chờ tư vấn", on: true },
              { label: "Email bản tin y khoa hàng tuần", on: false },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-700 font-medium">{item.label}</span>
                <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${item.on ? "bg-violet-500" : "bg-slate-200"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.on ? "translate-x-4" : ""}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Nhận lương &amp; Thanh toán</h4>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white text-xs font-bold">MB</div>
                <div>
                  <div className="text-xs font-bold text-slate-800">MBBank • **** 8888</div>
                  <div className="text-[10px] text-slate-400">Tài khoản nhận lương</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">Đã liên kết</span>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-3">Bảo mật tài khoản</h4>
          <div className="space-y-2">
            <Button variant="outline" className="w-full rounded-xl text-xs h-9 justify-start border-slate-200 text-slate-700">Đổi mật khẩu</Button>
            <Button variant="outline" className="w-full rounded-xl text-xs h-9 justify-start border-slate-200 text-slate-700">Xác thực 2 bước (2FA)</Button>
            <Button variant="outline" className="w-full rounded-xl text-xs h-9 justify-start border-slate-200 text-slate-700">Đăng nhập sinh trắc học (Vân tay / Face ID)</Button>
          </div>
        </Card>
      </div>
    </div>
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
  const [callOn, setCallOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [chatMode, setChatMode] = useState<"video" | "chat">("video");
  const [chatMsgs, setChatMsgs] = useState([
    { f: "staff" as const, txt: `Chào ${patient.patient}, tôi là bác sĩ trực hôm nay.`, t: "vừa xong" },
    { f: "user" as const, txt: "Dạ chào bác sĩ ạ.", t: "vừa xong" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recordings, setRecordings] = useState<{url:string; dur:number}[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const recChunks = useRef<Blob[]>([]);
  const recTimerRef = useRef<ReturnType<typeof setInterval>>();
  const callTimerRef = useRef<ReturnType<typeof setInterval>>();

  // Camera start/stop
  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = s;
      if (selfVideoRef.current) { selfVideoRef.current.srcObject = s; }
      setCallOn(true);
      toast.success("Đã kết nối camera & mic");
    } catch { toast.error("Không thể truy cập camera/mic"); }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (selfVideoRef.current) selfVideoRef.current.srcObject = null;
    setCallOn(false);
  }, []);

  // Call timer
  useEffect(() => {
    if (callOn) {
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [callOn]);

  // Mic toggle
  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setMicOn(p => !p);
      toast.info(micOn ? "Đã tắt mic" : "Đã bật mic");
    } else { toast.error("Chưa kết nối cuộc gọi"); }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const s = streamRef.current || await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(s, { mimeType: "audio/webm" });
      recChunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) recChunks.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(recChunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordings(p => [...p, { url, dur: recordTime }]);
        const transcript = `[Ghi âm ${fmtTime(recordTime)}] Bệnh nhân mô tả triệu chứng ${patient.symptoms.toLowerCase()}, đã khám lâm sàng.`;
        setNote(prev => (prev ? prev + "\n" : "") + transcript);
        toast.success("Đã lưu ghi âm & chuyển thành ghi chú");
      };
      mr.start();
      mediaRecRef.current = mr;
      setIsRecording(true);
      setRecordTime(0);
      recTimerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    } catch { toast.error("Không thể truy cập mic"); }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop();
    setIsRecording(false);
    if (recTimerRef.current) clearInterval(recTimerRef.current);
  };

  // Cleanup
  useEffect(() => () => { stopCamera(); if (recTimerRef.current) clearInterval(recTimerRef.current); }, [stopCamera]);

  const fmtTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // AI Summary - gọi AI Service thật
  const [aiSummary, setAiSummary] = useState<string[]>([
    `Bệnh nhân ${patient.patient}, ${patient.age} tuổi, vào viện vì: ${patient.symptoms.toLowerCase()}.`,
    `Sinh hiệu: HA ${patient.vitals.bp}, mạch ${patient.vitals.hr}, nhiệt độ ${patient.vitals.temp}, SpO2 ${patient.vitals.spo2}.`,
    "Đang tải phân tích AI..."
  ]);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiDiagnoses, setAiDiagnoses] = useState<string[]>(["Đang phân tích..."]);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const prompt = `Bạn là bác sĩ AI. QUAN TRỌNG: Bạn PHẢI trả lời bằng tiếng Việt CÓ DẤU đầy đủ (ví dụ: "bệnh nhân", "chẩn đoán", "huyết áp", TUYỆT ĐỐI KHÔNG viết không dấu như "benh nhan", "chan doan", "huyet ap"). Hãy phân tích ngắn gọn bệnh nhân sau:
- Tên: ${patient.patient}, ${patient.age} tuổi
- Triệu chứng: ${patient.symptoms}
- Sinh hiệu: HA ${patient.vitals.bp}, mạch ${patient.vitals.hr}bpm, nhiệt độ ${patient.vitals.temp}, SpO2 ${patient.vitals.spo2}
- Mức độ sàng lọc: ${patient.level}

Trả về JSON: {"text": "tóm tắt bằng tiếng Việt CÓ DẤU gồm 4-5 điểm chính, mỗi điểm cách nhau bằng dấu |", "actions": [], "suggestedActions": []}`;

        const res = await fetch("http://127.0.0.1:8000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt, role: "bacsi", history: [] }),
        });
        const data = await res.json();
        if (data.text) {
          const lines = data.text.split("|").map((s: string) => s.trim()).filter(Boolean);
          setAiSummary(lines.length > 0 ? lines : [data.text]);
          // Extract diagnoses from AI response
          const diagMatch = data.text.match(/chẩn đoán[^:]*:(.*?)(?:\.|$)/i);
          if (diagMatch) {
            setAiDiagnoses(diagMatch[1].split(",").map((s: string) => s.trim()).filter(Boolean));
          } else {
            setAiDiagnoses(["Cần thêm xét nghiệm", "Theo dõi sinh hiệu", "Tham khảo chuyên khoa"]);
          }
        }
      } catch {
        setAiSummary([
          `Bệnh nhân ${patient.patient}, ${patient.age} tuổi, vào viện vì: ${patient.symptoms.toLowerCase()}.`,
          `Sinh hiệu lúc tiếp nhận: HA ${patient.vitals.bp}, mạch ${patient.vitals.hr}, nhiệt độ ${patient.vitals.temp}, SpO2 ${patient.vitals.spo2}.`,
          `Tiền sử: tăng huyết áp 5 năm, đang dùng Amlodipine 5mg/ngày.`,
          `Khuyến nghị: ưu tiên đo ECG, xét nghiệm Troponin nếu nghi ngờ tim mạch.`,
        ]);
        setAiDiagnoses(["Cơn tăng huyết áp", "Đau đầu căng thẳng", "Rối loạn tiền đình"]);
      }
      setAiLoading(false);
    };
    fetchAI();
  }, [patient]);

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-700">
                    <Sparkles className="w-4 h-4" /> <span className="text-sm font-medium">AI sàng lọc & tóm tắt</span>
                  </div>
                  {aiLoading && <span className="text-[10px] text-violet-500 animate-pulse">⏳ Đang phân tích...</span>}
                  {!aiLoading && <span className="text-[10px] text-emerald-600">✓ AI Service</span>}
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
                  {aiDiagnoses.map(d => (
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
                {callOn ? (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <div className="text-center text-white/50">
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <div className="text-sm">Camera bệnh nhân</div>
                      <div className="text-xs mt-1 text-white/30">(Đang chờ kết nối...)</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Phone className="w-10 h-10 mx-auto text-white/20 mb-3" />
                    <div className="text-white/40 text-sm mb-4">Chưa kết nối cuộc gọi</div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6" onClick={startCamera}>
                      <Phone className="w-4 h-4 mr-2" /> Bắt đầu gọi
                    </Button>
                  </div>
                )}
                {/* Self video (camera thật) */}
                <div className="absolute bottom-3 right-3 w-36 h-24 bg-slate-700 rounded-lg border-2 border-white/30 overflow-hidden">
                  <video ref={selfVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  {!callOn && <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs bg-slate-800/80">Bạn</div>}
                </div>
                {/* Status */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {callOn ? (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Đang gọi • {fmtTime(callDuration)}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-600 text-white/70 text-[11px]">Chưa kết nối</span>
                  )}
                </div>
                {/* Controls */}
                {callOn && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    <Button size="icon" variant="secondary" className={`rounded-full w-10 h-10 ${!micOn ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}`} onClick={toggleMic}>
                      {micOn ? <Mic className="w-4 h-4" /> : <span className="text-xs font-bold">🔇</span>}
                    </Button>
                    <Button size="icon" className="bg-rose-600 hover:bg-rose-700 text-white rounded-full w-10 h-10" onClick={() => { stopCamera(); toast.info("Đã kết thúc cuộc gọi"); }}>
                      <PhoneOff className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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
              <span className="text-sm">Ghi chú {recordings.length > 0 && <span className="text-xs text-muted-foreground ml-1">({recordings.length} ghi âm)</span>}</span>
              <Button size="sm" variant="outline" onClick={() => setShowTemplate(true)}><FileText className="w-3.5 h-3.5 mr-1" />Template</Button>
            </div>
            {/* Recordings playback */}
            {recordings.length > 0 && (
              <div className="px-3 pt-2 flex gap-2 flex-wrap">
                {recordings.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 rounded-lg px-2 py-1">
                    <span className="text-[10px] text-violet-700 font-medium">🎙 {fmtTime(r.dur)}</span>
                    <audio src={r.url} controls className="h-6" style={{ width: 120 }} />
                  </div>
                ))}
              </div>
            )}
            <Textarea
              className="flex-1 m-3 resize-none"
              placeholder="Ghi chú chẩn đoán, đơn thuốc, dặn dò..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className="px-3 pb-3 flex gap-2">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                className={`flex-1 ${isRecording ? "animate-pulse" : ""}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                <Mic className="w-4 h-4 mr-1" />
                {isRecording ? `Đang ghi... ${fmtTime(recordTime)} — Nhấn để dừng` : "Ghi chú giọng nói"}
              </Button>
              <Button className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={() => {
                if (!note.trim()) { toast.error("Vui lòng ghi chú trước khi hoàn tất"); return; }
                setShowFinishDialog(true);
              }}>
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

      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader className="text-left">
            <DialogTitle>Xác nhận hoàn tất phiên khám</DialogTitle>
            <DialogDescription>Kiểm tra lại thông tin trước khi lưu</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border bg-slate-50">
              <div className="text-xs text-muted-foreground mb-1">Bệnh nhân</div>
              <div className="font-medium">{patient.patient} ({patient.age} tuổi)</div>
            </div>
            <div className="p-3 rounded-lg border bg-slate-50">
              <div className="text-xs text-muted-foreground mb-1">Ghi chú ({note.split('\n').filter(Boolean).length} dòng)</div>
              <div className="text-sm whitespace-pre-line line-clamp-4">{note}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground">Ghi âm</div>
                <div className="font-medium mt-0.5">{recordings.length} file</div>
              </div>
              <div className="p-2 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground">Thời gian gọi</div>
                <div className="font-medium mt-0.5">{fmtTime(callDuration)}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>Quay lại</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
              setShowFinishDialog(false);
              stopCamera();
              onFinish();
            }}>
              <CheckCircle2 className="w-4 h-4 mr-1" /> Xác nhận hoàn tất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


