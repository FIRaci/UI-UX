import { useEffect, useState } from "react";
import { AppShell } from "../AppShell";
import {
  LayoutDashboard, CalendarDays, Users, Bot, FileText, MessagesSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useStore, store } from "../../store";
import { ChatView } from "../ChatView";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { ME_NAME, INITIAL_QUEUE, NOTE_TEMPLATES, type Triage } from "./constants";
import { ConsultationRoom } from "./ConsultationRoom";
import { OverviewPanel } from "./overview-panel";
import { SchedulePanel } from "./schedule-panel";
import { PatientList } from "./patient-list";
import { RecordsPanel } from "./records-panel";
import { ConsultMessages } from "./consult-messages";
import { Dialogs } from "./dialogs";

export function DoctorDashboard({ onLogout, role }: { onLogout: () => void; role: string }) {
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
      console.warn("Records API chưa khả dụng (sẽ hoạt động khi backend được kích hoạt ở Phase 2)");
    }
  };

  useEffect(() => { loadRecords(); }, []);
  useEffect(() => { if (!activeThreadId && threads[0]) setActiveThreadId(threads[0].id); }, [threads, activeThreadId]);

  useAppNavigate(
    ["overview", "schedule", "patients", "records", "consult", "chat"],
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
