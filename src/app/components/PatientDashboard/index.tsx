import { useEffect, useState } from "react";
import { AppShell } from "../AppShell";
import { LayoutDashboard, Search, CalendarDays, FileHeart, Activity, MessagesSquare, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { useStore, store, type Appointment } from "../../store";
import { ChatView } from "../ChatView";
import { ME, DOCTORS } from "./constants";
import { Overview } from "./overview";
import { SearchSection } from "./search-section";
import { Appointments } from "./appointments";
import { MessagesTab } from "./messages-tab";
import { Records } from "./records";
import { Tracking } from "./tracking";
import { Profile } from "./profile";
import { DoctorDetailDialog, BookingDialog, EditAppointmentDialog, NewMessageDialog } from "./dialogs";

export function PatientDashboard({ onLogout, role }: { onLogout: () => void; role: string }) {
  const [active, setActive] = useState("overview");
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [bookDate, setBookDate] = useState("2026-05-12");
  const [bookTime, setBookTime] = useState("");
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [editingOriginal, setEditingOriginal] = useState<Appointment | null>(null);
  const [skipConfirm, setSkipConfirm] = useState(false);

  const appointments = useStore(s => s.appointments.filter(a => a.patientName === ME));
  const myThreads = useStore(s =>
    s.threads.filter(t => t.userRole === "benhnhan" && t.userName === ME).sort((a, b) => b.updatedAt - a.updatedAt)
  );

  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [newMsgDoctor, setNewMsgDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [newMsgContent, setNewMsgContent] = useState("");

  useEffect(() => {
    if (!activeThreadId && myThreads[0]) setActiveThreadId(myThreads[0].id);
  }, [myThreads, activeThreadId]);

  useEffect(() => {
    const NAV_KEYS = new Set(["overview", "search", "appointments", "chat", "messages", "records", "tracking", "profile"]);
    const handleNavigate = (e: Event) => {
      const raw = (e as CustomEvent<string>).detail;
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.view && NAV_KEYS.has(parsed.view)) { setActive(parsed.view); if (parsed.threadId) setActiveThreadId(parsed.threadId); }
      } catch {
        if (NAV_KEYS.has(raw)) setActive(raw);
      }
    };
    window.addEventListener("app:navigate", handleNavigate);
    return () => window.removeEventListener("app:navigate", handleNavigate);
  }, []);

  const filtered = DOCTORS.filter(d =>
    (specFilter === "all" || d.spec === specFilter) &&
    (search === "" || d.name.toLowerCase().includes(search.toLowerCase()) || d.spec.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBook = () => {
    if (!bookingDoctor || !bookTime || !bookDate) {
      toast.error("Vui lòng chọn ngày và giờ khám");
      return;
    }
    const slot = new Date(`${bookDate}T${bookTime}:00`);
    if (isNaN(slot.getTime()) || slot.getTime() < Date.now()) {
      toast.error("Không thể đặt lịch trong quá khứ");
      return;
    }
    const hours = slot.getHours();
    if (hours < 7 || hours >= 20) {
      toast.error("Phòng khám chỉ nhận lịch từ 07:00 đến 20:00");
      return;
    }
    if (appointments.some(a => a.patientName === ME && a.date === bookDate && a.time === bookTime && a.status === "Sắp tới")) {
      toast.error("Bạn đã có lịch trùng giờ. Vui lòng chọn thời gian khác.");
      return;
    }
    store.addAppointment({
      patientName: ME,
      doctorName: bookingDoctor.name,
      doctorSpec: bookingDoctor.spec,
      date: bookDate,
      time: bookTime,
      clinic: bookingDoctor.clinic,
      status: "Sắp tới",
    });
    toast.success("Đặt lịch thành công! Bác sĩ và phòng khám đã được cập nhật.");
    setBookingDoctor(null);
    setBookTime("");
  };

  const startEdit = (a: Appointment) => {
    setEditing(a);
    setEditingOriginal(a);
  };

  const cancelAppt = (id: number) => {
    const a = appointments.find(x => x.id === id);
    if (!a) return;
    if (a.status !== "Sắp tới") {
      toast.error("Chỉ có thể hủy lịch còn hiệu lực");
      return;
    }
    const apptTime = new Date(`${a.date}T${a.time}:00`).getTime();
    if (apptTime - Date.now() < 2 * 60 * 60 * 1000) {
      toast.error("Vui lòng hủy lịch trước thời điểm khám ít nhất 2 giờ");
      return;
    }
    toast("Xác nhận hủy lịch?", {
      description: `${a.doctorName} • ${a.date} ${a.time}`,
      action: {
        label: "Hủy lịch",
        onClick: () => {
          store.updateAppointment(id, { status: "Đã hủy" });
          toast.success("Đã hủy lịch hẹn");
        },
      },
      cancel: { label: "Đóng", onClick: () => {} },
    });
  };

  const updateAppt = () => {
    if (!editing) return;
    const slot = new Date(`${editing.date}T${editing.time}:00`);
    if (isNaN(slot.getTime()) || slot.getTime() < Date.now()) {
      toast.error("Thời gian mới phải ở tương lai");
      return;
    }
    const h = slot.getHours();
    if (h < 7 || h >= 20) {
      toast.error("Khung giờ làm việc 07:00 – 20:00");
      return;
    }
    if (appointments.some(a => a.id !== editing.id && a.patientName === ME && a.date === editing.date && a.time === editing.time && a.status === "Sắp tới")) {
      toast.error("Khung giờ đã có lịch khác");
      return;
    }
    store.updateAppointment(editing.id, { date: editing.date, time: editing.time });
    toast.success("Cập nhật lịch thành công");
    setEditing(null);
  };

  const sendReply = () => {
    if (!reply.trim() || !activeThreadId) return;
    const threadId = activeThreadId;
    store.appendMessage(threadId, { f: "user", txt: reply, t: "vừa xong" });
    setReply("");
  };

  const submitNewMsg = () => {
    if (!newMsgDoctor) return;
    if (!newMsgContent.trim()) {
      toast.error("Vui lòng nhập nội dung tin nhắn");
      return;
    }
    const id = store.addThread({
      staffId: newMsgDoctor.id,
      staffName: newMsgDoctor.name,
      staffSpec: newMsgDoctor.spec,
      userRole: "benhnhan",
      userName: ME,
      topic: "Hỏi bác sĩ",
      status: "Chờ phản hồi",
      last: newMsgContent,
      msgs: [{ f: "user", txt: newMsgContent, t: "vừa xong" }],
    });
    setActiveThreadId(id);
    setNewMsgDoctor(null);
    setNewMsgContent("");
    toast.success(`Đã gửi tin nhắn đến ${newMsgDoctor.name}`);
  };

  return (
    <AppShell
      title="Bảng điều khiển"
      subtitle={`Xin chào, ${ME}`}
      roleLabel="Bệnh nhân"
      roleColor="bg-sky-100 text-sky-700 border border-sky-200"
      initials="MK"
      active={active}
      onNav={setActive}
      onLogout={onLogout}
      nav={[
        { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
        { key: "search", label: "Tìm bác sĩ", icon: Search },
        { key: "appointments", label: "Lịch hẹn của tôi", icon: CalendarDays },
        { key: "chat", label: "Chat AI", icon: Bot },
        { key: "messages", label: "Tin nhắn bác sĩ", icon: MessagesSquare },
        { key: "records", label: "Hồ sơ sức khỏe", icon: FileHeart },
        { key: "tracking", label: "Theo dõi sức khỏe", icon: Activity },
        { key: "profile", label: "Cá nhân", icon: User },
      ]}
    >
      {active === "overview" && <Overview onJump={setActive} appts={appointments} threads={myThreads} />}
      {active === "search" && (
        <SearchSection
          search={search} setSearch={setSearch}
          specFilter={specFilter} setSpecFilter={setSpecFilter}
          doctors={filtered}
          onPick={setSelectedDoctor}
          onBook={setBookingDoctor}
        />
      )}
      {active === "appointments" && (
        <Appointments
          appointments={appointments}
          onCancel={cancelAppt}
          onEdit={startEdit}
        />
      )}
      {active === "chat" && <ChatView role={role} />}
      {active === "messages" && (
        <MessagesTab
          threads={myThreads}
          activeThreadId={activeThreadId}
          setActiveThreadId={setActiveThreadId}
          reply={reply}
          setReply={setReply}
          onSendReply={sendReply}
          onNewThread={() => setNewMsgDoctor(DOCTORS[0])}
        />
      )}
      {active === "records" && <Records />}
      {active === "tracking" && (
        <Tracking
          onBook={() => {
            setBookingDoctor(DOCTORS[0]);
            setActive("search");
            toast.info("Đã tự điền thông tin BS. Nguyễn Văn An");
          }}
          skipConfirm={skipConfirm}
          onSkip={() => setSkipConfirm(true)}
          onCancelSkip={() => setSkipConfirm(false)}
        />
      )}
      {active === "profile" && <Profile />}

      <DoctorDetailDialog doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} onBook={setBookingDoctor} />
      <BookingDialog
        doctor={bookingDoctor}
        bookDate={bookDate}
        onBookDateChange={setBookDate}
        bookTime={bookTime}
        onBookTimeChange={setBookTime}
        onConfirm={handleBook}
        onCancel={() => setBookingDoctor(null)}
      />
      <EditAppointmentDialog
        editing={editing}
        onEditingChange={setEditing}
        editingOriginal={editingOriginal}
        onUpdate={updateAppt}
        onCancel={() => { setEditing(null); setEditingOriginal(null); }}
        appointments={appointments}
      />
      <NewMessageDialog
        doctor={newMsgDoctor}
        onDoctorChange={setNewMsgDoctor}
        content={newMsgContent}
        onContentChange={setNewMsgContent}
        doctors={DOCTORS}
        onSend={submitNewMsg}
        onCancel={() => { setNewMsgDoctor(null); setNewMsgContent(""); }}
      />
    </AppShell>
  );
}
