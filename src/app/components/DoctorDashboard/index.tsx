import { useEffect, useState } from "react";
import { AppShell } from "../AppShell";
import {
  LayoutDashboard, CalendarDays, Users, Bot, FileText, MessagesSquare, User
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useStore, store } from "../../store";
import { ChatView } from "../ChatView";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { ME_NAME, NOTE_TEMPLATES, type Triage } from "./constants";
import { ConsultationRoom } from "./ConsultationRoom";
import { OverviewPanel } from "./overview-panel";
import { SchedulePanel } from "./schedule-panel";
import { PatientList } from "./patient-list";
import { RecordsPanel } from "./records-panel";
import { ConsultMessages } from "./consult-messages";
import { Dialogs } from "./dialogs";

export function DoctorDashboard({ onLogout, role }: { onLogout: () => void; role: string }) {
  const [active, setActive] = useState("overview");
  const [queue, setQueue] = useState<Triage[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [scheduleLevelFilter, setScheduleLevelFilter] = useState<string>("all");
  const [consultPatient, setConsultPatient] = useState<Triage | null>(null);

  const appointments = useStore(s => s.appointments.filter(a => a.doctorName === ME_NAME));
  const TODAY = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter(a => a.date === TODAY);
  const todayUpcoming = todayAppts.filter(a => a.status === "Sắp tới");
  const filteredSchedule = todayAppts.filter(a => scheduleLevelFilter === "all" || a.level === scheduleLevelFilter);
  const threads = useStore(s =>
    s.threads.filter(t => t.staffId === 2).sort((a, b) => b.updatedAt - a.updatedAt)
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
  const [records, setRecords] = useState<{ p: string; d: string; t: string; m: string }[]>([]);

  const loadRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      const res = await fetch("http://localhost:3000/api/records", { headers });
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.dispatchEvent(new CustomEvent("app:unauthorized"));
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setRecords(data.map((r: any) => ({ p: r.patientName, d: r.date, t: r.title, m: r.note })));
      }
    } catch (e) {
      console.error("Failed to load records:", e);
    }
  };

  useEffect(() => { loadRecords(); }, []);
  useEffect(() => { if (!activeThreadId && threads[0]) setActiveThreadId(threads[0].id); }, [threads, activeThreadId]);
  useEffect(() => {
    if (todayUpcoming.length > 0 && queue.length === 0) {
      setQueue(todayUpcoming.map((a, i) => ({
        id: Number(a.id),
        level: a.level || "Thấp",
        patient: a.patientName,
        age: a.age || 30,
        symptoms: a.symptoms || "Khám định kỳ",
        waited: `${i * 5 + 2} phút`,
        vitals: a.vitals || { bp: "120/80", hr: "80", temp: "37°C", spo2: "98%" }
      })));
    }
  }, [todayUpcoming]);

  useAppNavigate(
    ["overview", "schedule", "patients", "records", "consult", "chat", "profile"],
    setActive,
    { search: "schedule", appointments: "schedule" }
  );

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
        { key: "chat", label: "Chat AI", icon: Bot },
        { key: "records", label: "Hồ sơ & đơn thuốc", icon: FileText },
        { key: "consult", label: "Tin nhắn tư vấn", icon: MessagesSquare },
        { key: "profile", label: "Cá nhân", icon: User },
      ]}
    >
      {active === "overview" && (
        <OverviewPanel
          queue={queue}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          filteredQueue={filteredQueue}
          openConsult={openConsult}
          todayUpcoming={todayUpcoming}
          setApptDetail={setApptDetail}
        />
      )}

      {active === "schedule" && (
        <SchedulePanel
          scheduleLevelFilter={scheduleLevelFilter}
          setScheduleLevelFilter={setScheduleLevelFilter}
          TODAY={TODAY}
          todayAppts={todayAppts}
          filteredSchedule={filteredSchedule}
          setApptDetail={setApptDetail}
          queue={queue}
          setConsultPatient={setConsultPatient}
        />
      )}

      {active === "patients" && (
        <PatientList
          appointments={appointments}
          setPatientFile={setPatientFile}
          queue={queue}
          setConsultPatient={setConsultPatient}
        />
      )}

      {active === "chat" && <ChatView role={role} />}

      {active === "records" && (
        <RecordsPanel
          records={records}
          setRecordView={setRecordView}
          setNewRecord={setNewRecord}
        />
      )}

      {active === "consult" && (
        <ConsultMessages
          threads={threads}
          activeThreadId={activeThreadId}
          setActiveThreadId={setActiveThreadId}
          activeThread={activeThread}
          reply={reply}
          setReply={setReply}
          sendReply={sendReply}
        />
      )}
      {active === "profile" && <Profile />}

      <Dialogs
        patientFile={patientFile}
        setPatientFile={setPatientFile}
        appointments={appointments}
        recordView={recordView}
        setRecordView={setRecordView}
        apptDetail={apptDetail}
        setApptDetail={setApptDetail}
        newRecord={newRecord}
        setNewRecord={setNewRecord}
        newRecordType={newRecordType}
        setNewRecordType={setNewRecordType}
        newRecordPatient={newRecordPatient}
        setNewRecordPatient={setNewRecordPatient}
        newRecordContent={newRecordContent}
        setNewRecordContent={setNewRecordContent}
        showRecordTemplate={showRecordTemplate}
        setShowRecordTemplate={setShowRecordTemplate}
        queue={queue}
        setConsultPatient={setConsultPatient}
        loadRecords={loadRecords}
        NOTE_TEMPLATES={NOTE_TEMPLATES}
        ME_NAME={ME_NAME}
      />
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
