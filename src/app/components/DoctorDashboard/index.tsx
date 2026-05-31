import { useEffect, useState } from "react";
import { AppShell } from "../AppShell";
import {
  LayoutDashboard, CalendarDays, Users, Bot, FileText, MessagesSquare, User
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  const [globalSearch, setGlobalSearch] = useState("");

  const appointments = useStore(s => s.appointments.filter(a => a.doctorName === ME_NAME));
  const TODAY = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter(a => a.date === TODAY);
  const todayUpcoming = todayAppts.filter(a => a.status === "Sắp tới");
  const filteredSchedule = todayAppts
    .filter(a => scheduleLevelFilter === "all" || a.level === scheduleLevelFilter)
    .filter(a => globalSearch === "" || a.patientName.toLowerCase().includes(globalSearch.toLowerCase()));
  const threads = useStore(s =>
    s.threads.filter(t => t.staffName === ME_NAME).sort((a, b) => b.updatedAt - a.updatedAt)
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

  const levelPriority: Record<string, number> = { "Khẩn cấp": 1, "Cao": 2, "Trung bình": 3, "Thấp": 4 };
  const filteredQueue = queue
    .filter(q => levelFilter === "all" || q.level === levelFilter)
    .filter(q => globalSearch === "" || q.patient.toLowerCase().includes(globalSearch.toLowerCase()) || (q.symptoms || "").toLowerCase().includes(globalSearch.toLowerCase()))
    .sort((a, b) => (levelPriority[a.level] || 5) - (levelPriority[b.level] || 5));
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
          todayUpcoming={todayUpcoming.filter(a => globalSearch === "" || a.patientName.toLowerCase().includes(globalSearch.toLowerCase()))}
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
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    clinic: "Chi nhánh Quận 1, TP.HCM",
    degree: "Thạc sĩ, Bác sĩ chuyên khoa I",
    exp: "15 năm thực hành lâm sàng",
    email: "an.nguyenvan@medicare.com"
  });
  const [notifs, setNotifs] = useState({
    urgent: true,
    sms: true,
    email: false
  });

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs(p => ({ ...p, [key]: !p[key] }));
    toast.success("Đã cập nhật tùy chọn thông báo");
  };

  const saveProfile = () => {
    setIsEditing(false);
    toast.success("Thông tin cá nhân đã được lưu!");
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-10">
      <Card className="overflow-hidden bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px]">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-violet-500 to-indigo-500 relative">
          <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
        </div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end mb-6">
            <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl -mt-12 relative z-10">
              <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[18px] text-white flex items-center justify-center text-3xl font-black">
                VA
              </div>
            </div>
            {isEditing ? (
              <Button 
                className="rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 shadow-md"
                onClick={saveProfile}
              >
                Lưu thông tin
              </Button>
            ) : (
              <Button 
                className="rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 h-10 px-6 shadow-md"
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa
              </Button>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">BS. Nguyễn Văn An</h2>
            <div className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
              Tim mạch • BS-2026-00088
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-600 font-bold">Đang hoạt động</span>
            </div>
          </div>

          {/* Details & Settings */}
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Thông tin công tác</h4>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                {[
                  { key: "clinic", label: "Nơi công tác", value: profileData.clinic },
                  { key: "degree", label: "Học vị", value: profileData.degree },
                  { key: "exp", label: "Kinh nghiệm", value: profileData.exp },
                  { key: "email", label: "Email liên hệ", value: profileData.email },
                ].map(item => (
                  <div key={item.key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-slate-500 font-medium shrink-0">{item.label}</span>
                    {isEditing ? (
                      <Input 
                        value={item.value}
                        onChange={(e) => setProfileData(p => ({ ...p, [item.key]: e.target.value }))}
                        className="h-9 text-sm font-bold text-slate-800 bg-white border-slate-200 focus:ring-violet-500 sm:w-2/3"
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-800 text-right">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Tùy chọn thông báo</h4>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                {[
                  { key: "urgent", label: "Nhận thông báo ca khẩn cấp (Triage Đỏ)", on: notifs.urgent },
                  { key: "sms", label: "Nhắc lịch khám mới qua SMS", on: notifs.sms },
                  { key: "email", label: "Email báo cáo cuối tuần", on: notifs.email },
                ].map(item => (
                  <div 
                    key={item.key} 
                    className="flex justify-between items-center cursor-pointer group"
                    onClick={() => toggleNotif(item.key as keyof typeof notifs)}
                  >
                    <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{item.label}</span>
                    <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${item.on ? "bg-violet-500" : "bg-slate-200"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.on ? "translate-x-5" : ""}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
