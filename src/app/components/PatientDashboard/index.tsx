import { useEffect, useState, useRef } from "react";
import { Search, CalendarDays, FileHeart, Bot, Send, HeartPulse, LogOut, Activity, MessagesSquare, ArrowLeft, Sparkles, Bell, ChevronRight, Star, Clock, Stethoscope, X, Mic, Plus, History, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useStore, store, type Appointment } from "../../store";
import { ME, type Doctor } from "./constants";
import { SearchSection } from "./search-section";
import { Appointments } from "./appointments";
import { Records } from "./records";
import { Profile } from "./profile";
import { Tracking } from "./tracking";
import { MessagesTab } from "./messages-tab";
import { DoctorDetailDialog, BookingDialog, EditAppointmentDialog, NewMessageDialog, AppointmentDetailDialog, AppointmentSuccessDialog, CancelConfirmDialog } from "./dialogs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8000";

type ChatMsg = { id: string; role: "bot" | "me"; text: string; time: Date; suggestedActions?: SuggestedAction[] };
type SuggestedAction = { label: string; action: string; data?: Record<string, unknown> };
type Suggestion = { id: string; type: string; title: string; description: string; action: string; actionLabel: string };

const ActionItem = ({ icon: Icon, label, onClick, className, bg, text, hover, badge, delay = 0 }: any) => (
  <div className={`absolute z-30 ${className}`}>
    <motion.button
      animate={{ y: [0, -8, 0], boxShadow: ["0px 8px 32px rgba(0,0,0,0.04)", "0px 16px 40px rgba(16,185,129,0.15)", "0px 8px 32px rgba(0,0,0,0.04)"] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay }}
      whileHover={{ scale: 1.1, y: 0, boxShadow: "0px 16px 40px rgba(16,185,129,0.3)", transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 sm:gap-3 w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] rounded-[28px] bg-white/70 backdrop-blur-2xl border border-white/60 ${hover} transition-colors shadow-lg`}
    >
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] ${bg} flex items-center justify-center ${text} relative shadow-inner`}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-sm" />
        {badge > 0 && <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white">{badge}</span>}
      </div>
      <span className="text-xs sm:text-sm font-bold text-slate-700 leading-tight whitespace-nowrap drop-shadow-sm">{label}</span>
    </motion.button>
  </div>
);

const renderMessage = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-red-600">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <u key={i} className="underline decoration-red-500 decoration-2 underline-offset-2 font-bold text-slate-800">{part.slice(2, -2)}</u>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-emerald-700 font-medium">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
};

export function PatientDashboard({ onLogout, role }: { onLogout: () => void; role: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname.split("/").pop() === "patient" ? "dashboard" : location.pathname.split("/").pop() || "dashboard";
    const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [viewingAppt, setViewingAppt] = useState<Appointment | null>(null);
  const [bookDate, setBookDate] = useState("2026-06-01");
  const [bookTime, setBookTime] = useState("");
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [editingOriginal, setEditingOriginal] = useState<Appointment | null>(null);
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const appointments = useStore(s => s.appointments.filter(a => a.patientName === ME));
  const myThreads = useStore(s =>
    s.threads.filter(t => t.userRole === "benhnhan" && t.userName === ME).sort((a, b) => b.updatedAt - a.updatedAt)
  );
  const DOCTORS = useStore(s => s.doctors);
  const unreadNotifs = useStore(s => s.notifications.filter(n => (n.target === "all" || n.target === "patient") && !n.isRead));

  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [newMsgDoctor, setNewMsgDoctor] = useState<Doctor | null>(null);
  const [newMsgContent, setNewMsgContent] = useState("");
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [bookedDoctor, setBookedDoctor] = useState<Doctor | null>(null);
  const [bookedDate, setBookedDate] = useState("");
  const [bookedTime, setBookedTime] = useState("");
  const [bookedClinic, setBookedClinic] = useState("");
  const [cancelAppointment, setCancelAppointment] = useState<Appointment | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    const saved = localStorage.getItem("ai_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Revive dates
        return parsed.map((m: any) => ({ ...m, time: new Date(m.time) }));
      } catch { return []; }
    }
    return [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return localStorage.getItem("ai_current_session_id") || Date.now().toString();
  });

  useEffect(() => {
    localStorage.setItem("ai_current_session_id", currentSessionId);
  }, [currentSessionId]);

  useEffect(() => {
    localStorage.setItem("ai_chat_history", JSON.stringify(messages));
    if (messages.length > 0) {
      const sessions = JSON.parse(localStorage.getItem("ai_chat_sessions") || "[]");
      const existingIdx = sessions.findIndex((s: any) => s.id === currentSessionId);
      if (existingIdx >= 0) {
        sessions[existingIdx].msgs = messages;
        sessions[existingIdx].date = new Date().toISOString();
      } else {
        sessions.push({ id: currentSessionId, date: new Date().toISOString(), msgs: messages });
      }
      localStorage.setItem("ai_chat_sessions", JSON.stringify(sessions));
      setChatSessions(sessions);
    }
  }, [messages, currentSessionId]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("ai_chat_sessions") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    if (activeView === "dashboard") {
      try {
        const saved = localStorage.getItem("access_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.autoVoiceChat) {
            navigate("/patient/chat");
            setTimeout(() => {
              setIsListening(true);
              toast.info("Chế độ Tiếp cận: Đã tự động bật Mic");
            }, 600);
          }
        }
      } catch {}
    }
  }, [activeView]);

  const upcoming = appointments.filter(a => a.status === "Sắp tới");

  // Badge viewing state
  const [viewedAppts, setViewedAppts] = useState<number>(0);
  const [viewedMsgs, setViewedMsgs] = useState<number>(0);
  const unreadApptsCount = Math.max(0, upcoming.length - viewedAppts);
  const unreadMsgsCount = Math.max(0, myThreads.length - viewedMsgs);

  // Fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, [appointments.length]);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`${AI_SERVICE_URL}/api/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: ME,
          upcomingAppointments: upcoming.map(a => ({
            doctorName: a.doctorName, doctorSpec: a.doctorSpec, date: a.date, time: a.time
          })),
          recentRecords: []
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {
      // Fallback suggestions
      const fallback: Suggestion[] = [];
      if (upcoming[0]) {
        fallback.push({ id: "1", type: "reminder", title: `Lịch khám ${upcoming[0].doctorSpec}`, description: `${upcoming[0].doctorName} • ${upcoming[0].date} lúc ${upcoming[0].time}`, action: "VIEW_APPOINTMENTS", actionLabel: "Xem lịch" });
      }
      fallback.push({ id: "2", type: "health_tip", title: "Khám sức khỏe định kỳ", description: "Đã đến lúc kiểm tra sức khỏe tổng quát 6 tháng/lần", action: "BOOK_APPOINTMENT", actionLabel: "Đặt lịch ngay" });
      setSuggestions(fallback);
    }
  };

  useEffect(() => {
    if (!activeThreadId && myThreads[0]) setActiveThreadId(myThreads[0].id);
  }, [myThreads, activeThreadId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const openChat = () => {
    if (messages.length === 0) {
      const firstUpcoming = upcoming[0];
      let welcomeText = `Chào ${ME.split(" ").pop()}! Tôi là trợ lý AI của MediCare.\n\n`;
      if (firstUpcoming) {
        welcomeText += `Bạn có lịch khám **${firstUpcoming.doctorSpec}** với **${firstUpcoming.doctorName}** vào **${firstUpcoming.date}** lúc **${firstUpcoming.time}**.\n\n`;
      }
      welcomeText += "Tôi có thể giúp bạn:";

      const initialActions: SuggestedAction[] = [
        { label: "Tư vấn triệu chứng", action: "SYMPTOM_CHECK" },
        { label: "Đặt lịch khám mới", action: "BOOK_APPOINTMENT" },
        { label: "Xem hồ sơ bệnh án", action: "VIEW_RECORDS" },
        { label: "Nhắc uống thuốc", action: "MEDICATION_REMINDER" },
      ];

      setMessages([{ id: "welcome", role: "bot", text: welcomeText, time: new Date(), suggestedActions: initialActions }]);
    }
    navigate("/patient/chat");
  };

  const sendChat = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMessages(m => [...m, { id: Date.now().toString(), role: "me", text: t, time: new Date() }]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.filter(m => m.id !== "welcome").slice(-10).map(m => ({ from: m.role === "me" ? "me" : "bot", text: m.text }));
      const res = await fetch(`${AI_SERVICE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "benhnhan", message: t, history }),
      });
      if (res.ok) {
        const data = await res.json();
        handleAiActions(data.actions);
        const sugActions = (data.suggestedActions || []).map((a: any) => ({ label: a.label, action: a.action, data: a.data }));
        setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "bot", text: data.text, time: new Date(), suggestedActions: sugActions.length ? sugActions : undefined }]);
      } else {
        throw new Error(`API ${res.status}`);
      }
    } catch {
      await new Promise(r => setTimeout(r, 500));
      let replyText = "";
      let sugActions: SuggestedAction[] = [];

      if (t.toLowerCase().includes("đau đầu") || t.toLowerCase().includes("nhức đầu")) {
        replyText = "Đau đầu có thể do nhiều nguyên nhân: căng thẳng, thiếu ngủ, huyết áp cao, hoặc vấn đề thần kinh.\n\nNếu đau đầu kéo dài trên 3 ngày hoặc kèm sốt cao, bạn nên đi khám ngay.";
        sugActions = [
          { label: "Đặt lịch khám Thần kinh", action: "BOOK_SPEC", data: { spec: "Thần kinh" } },
          { label: "Xem lịch sử khám", action: "VIEW_RECORDS" },
        ];
      } else if (t.toLowerCase().includes("sốt")) {
        replyText = "Sốt là phản ứng tự nhiên của cơ thể. Hãy đo nhiệt độ và cho tôi biết:\n• Sốt bao nhiêu độ?\n• Có kèm ho, đau họng không?\n• Đã kéo dài bao lâu?\n\nNếu sốt trên 39°C, hãy đến cơ sở y tế gần nhất.";
        sugActions = [
          { label: "Đặt lịch khám ngay", action: "BOOK_APPOINTMENT" },
          { label: "Gọi tư vấn bác sĩ", action: "CALL_DOCTOR" },
        ];
        handleAiActions(["WARNING_RED"]);
      } else if (t.toLowerCase().includes("đặt lịch") || t.toLowerCase().includes("khám") || t.toLowerCase().includes("tìm bác sĩ")) {
        replyText = "Tôi sẽ giúp bạn tìm bác sĩ phù hợp. Bạn muốn khám chuyên khoa nào?";
        sugActions = [
          { label: "Tim mạch", action: "BOOK_SPEC", data: { spec: "Tim mạch" } },
          { label: "Thần kinh", action: "BOOK_SPEC", data: { spec: "Thần kinh" } },
          { label: "Nhi khoa", action: "BOOK_SPEC", data: { spec: "Nhi khoa" } },
          { label: "Xem tất cả", action: "VIEW_SEARCH" },
        ];
      } else if (t.toLowerCase().includes("hồ sơ") || t.toLowerCase().includes("bệnh án")) {
        replyText = "Đây là tổng quan hồ sơ sức khỏe của bạn. Bạn muốn xem chi tiết không?";
        sugActions = [{ label: "Mở hồ sơ bệnh án", action: "VIEW_RECORDS" }];
      } else {
        replyText = "Cảm ơn bạn đã chia sẻ! Tôi có thể hỗ trợ bạn với:";
        sugActions = [
          { label: "Phân tích triệu chứng", action: "SYMPTOM_CHECK" },
          { label: "Đặt lịch khám", action: "BOOK_APPOINTMENT" },
          { label: "Xem hồ sơ", action: "VIEW_RECORDS" },
        ];
      }

      setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "bot", text: replyText, time: new Date(), suggestedActions: sugActions }]);
    }
    setIsTyping(false);
  };

  const handleSuggestedAction = (action: SuggestedAction) => {
    switch (action.action) {
      case "SYMPTOM_CHECK":
        sendChat("Tôi muốn kiểm tra triệu chứng");
        break;
      case "BOOK_APPOINTMENT":
        navigate("/patient/search");
        break;
      case "VIEW_RECORDS":
        navigate("/patient/records");
        break;
      case "VIEW_SEARCH":
        navigate("/patient/search");
        break;
      case "VIEW_APPOINTMENTS":
        navigate("/patient/appointments");
        break;
      case "MEDICATION_REMINDER":
        sendChat("Nhắc tôi uống thuốc");
        break;
      case "BOOK_SPEC": {
        const spec = action.data?.spec as string;
        if (spec) {
          setSpecFilter(spec);
          navigate("/patient/search");
          toast.success(`Đang tìm bác sĩ ${spec}...`);
        }
        break;
      }
      case "CALL_DOCTOR":
        toast.info("Tính năng gọi bác sĩ đang phát triển");
        break;
      default:
        break;
    }
  };

  const handleDashboardSuggestion = (s: Suggestion) => {
    if (!s || !s.action) {
      navigate("/patient/chat");
      return;
    }
    switch (s.action) {
      case "VIEW_APPOINTMENT":
      case "VIEW_APPOINTMENTS":
        navigate("/patient/appointments");
        break;
      case "BOOK_APPOINTMENT":
        navigate("/patient/search");
        break;
      case "VIEW_ARTICLE":
        navigate("/patient/chat");
        toast.info("Đang mở bài viết...");
        break;
      case "SHOW_PACKAGES":
        navigate("/patient/search");
        toast.info("Hãy chọn bác sĩ Khám tổng quát");
        break;
      case "VIEW_MEDICATION":
        navigate("/patient/records");
        break;
      case "VIEW_RECORDS":
        navigate("/patient/records");
        break;
      case "FOLLOW_UP":
      case "BOOK_FOLLOW_UP":
        navigate("/patient/search");
        toast.info("Đặt lịch tái khám");
        break;
      case "HEALTH_CHECKUP":
        navigate("/patient/search");
        toast.info("Đặt lịch khám tổng quát");
        break;
      default:
        navigate("/patient/chat");
        break;
    }
  };

  const handleAiActions = (actions?: string[]) => {
    if (!actions?.length) return;
    for (const action of actions) {
      if (action === "WARNING_RED") toast.error("️ AI phát hiện triệu chứng cần lưu ý!");
    }
  };

  const filtered = DOCTORS.filter(d => (specFilter === "all" || d.spec === specFilter) && (search === "" || d.name.toLowerCase().includes(search.toLowerCase()) || d.spec.toLowerCase().includes(search.toLowerCase())));

  const handleBook = () => {
    if (!bookingDoctor || !bookTime || !bookDate) { toast.error("Vui lòng chọn ngày và giờ khám"); return; }
    const slot = new Date(`${bookDate}T${bookTime}:00`);
    if (isNaN(slot.getTime()) || slot.getTime() < Date.now()) { toast.error("Không thể đặt lịch trong quá khứ"); return; }
    if (slot.getHours() < 7 || slot.getHours() >= 20) { toast.error("Phòng khám chỉ nhận lịch từ 07:00 đến 20:00"); return; }
    if (appointments.some(a => a.date === bookDate && a.time === bookTime && a.status === "Sắp tới")) { toast.error("Bạn đã có lịch trùng giờ."); return; }
    store.addAppointment({ patientName: ME, doctorName: bookingDoctor.name, doctorSpec: bookingDoctor.spec, date: bookDate, time: bookTime, clinic: bookingDoctor.clinic, status: "Sắp tới" });
    
    // Show success dialog
    setBookedDoctor(bookingDoctor);
    setBookedDate(bookDate);
    setBookedTime(bookTime);
    setBookedClinic(bookingDoctor.clinic);
    setShowBookingSuccess(true);
    
    setBookingDoctor(null); setBookTime("");
  };

  const cancelAppt = (id: number) => {
    const a = appointments.find(x => x.id === id);
    if (!a) return;
    if (a.status !== "Sắp tới") { toast.error("Chỉ có thể hủy lịch còn hiệu lực"); return; }
    setCancelAppointment(a);
    setShowCancelConfirm(true);
  };

  const confirmCancelAppt = () => {
    if (!cancelAppointment) return;
    store.updateAppointment(cancelAppointment.id, { status: "Đã hủy" });
    toast.success("Đã hủy lịch hẹn thành công");
    setShowCancelConfirm(false);
    setCancelAppointment(null);
  };

  const updateAppt = () => {
    if (!editing) return;
    store.updateAppointment(editing.id, { date: editing.date, time: editing.time });
    toast.success("Cập nhật lịch thành công");
    setEditing(null);
  };

  const submitNewMsg = () => {
    if (!newMsgDoctor || !newMsgContent.trim()) return;
    const id = store.addThread({ staffId: newMsgDoctor.id, staffName: newMsgDoctor.name, staffSpec: newMsgDoctor.spec, userRole: "benhnhan", userName: ME, topic: "Hỏi bác sĩ", status: "Chờ phản hồi", last: newMsgContent, msgs: [{ f: "user", txt: newMsgContent, t: "vừa xong" }] });
    setActiveThreadId(id); setNewMsgDoctor(null); setNewMsgContent("");
    toast.success(`Đã gửi tin nhắn đến ${newMsgDoctor.name}`);
  };

  // ===== RENDER =====
  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-emerald-50 pointer-events-none" />

      {/* ===== DASHBOARD VIEW: The Radical Orbital Layout ===== */}
      <AnimatePresence mode="wait">
        {activeView === "dashboard" && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.98 }} 
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center relative min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-slate-50 overflow-hidden"
          >
            {/* Ambient Background Glowing Orbs */}
          <div className="absolute top-[15%] left-[20%] w-[30vw] h-[30vw] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[20%] right-[15%] w-[40vw] h-[40vw] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Header - Left (Logo/Title) */}
          <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-3 z-40">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-400/30">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-xl tracking-tight leading-none">MediCare AI</h1>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Hello, {ME.split(" ").pop()}</span>
            </div>
          </div>

          {/* Header - Right (Actions: Notifications, Profile, Logout) */}
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex gap-2 sm:gap-3 z-50">
            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-11 h-11 rounded-full bg-white/70 backdrop-blur-md shadow-sm border border-slate-200 hover:bg-white hover:shadow-md transition-all" 
                onClick={() => setShowNotifs(!showNotifs)}
              >
                <Bell className="w-5 h-5 text-slate-700" />
                {unreadNotifs.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-white">{unreadNotifs.length}</span>}
              </Button>
              <AnimatePresence>
                {showNotifs && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                    className="absolute right-0 mt-3 w-[320px] sm:w-[360px] bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-2xl shadow-emerald-500/10 rounded-3xl z-50 overflow-hidden"
                  >
                      <div className="p-4 border-b border-emerald-100/40 flex justify-between items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-emerald-50/50">
                        <h3 className="font-extrabold text-slate-800">Thông báo của bạn</h3>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-7 px-2" onClick={() => store.markAllNotificationsRead()}>Đọc tất cả</Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full hover:bg-slate-200" onClick={() => setShowNotifs(false)}><X className="w-4 h-4 text-slate-500" /></Button>
                        </div>
                      </div>
                    <div className="p-3 max-h-80 overflow-y-auto">
                      {unreadNotifs.length > 0 ? (
                        unreadNotifs.map(n => (
                          <div 
                            key={n.id} 
                            className="p-3 bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl mb-2 flex items-start gap-3 cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm" 
                            onClick={() => { 
                              store.markNotificationRead(n.id);
                              setShowNotifs(false); 
                              let route = "/patient";
                              const text = (n.title + " " + n.content).toLowerCase();
                              if (text.includes("lịch hẹn") || text.includes("khám")) route = "/patient/appointments";
                              else if (text.includes("tin nhắn")) route = "/patient/messages";
                              else if (text.includes("xét nghiệm") || text.includes("kết quả")) route = "/patient/records";
                              navigate(route);
                            }}
                          >
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Bell className="w-5 h-5" /></div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{n.title}</p>
                              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{n.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500 text-sm font-medium flex flex-col items-center gap-3">
                          <Bell className="w-8 h-8 text-slate-200" />
                          Không có thông báo mới
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div 
              className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-sm border-[3px] border-white" 
              onClick={() => navigate("/patient/profile")}
            >
              MK
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-11 h-11 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 bg-white/70 backdrop-blur-md shadow-sm border border-slate-200 active:scale-95 transition-all" 
              onClick={onLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* ===== THE CENTER ORBITAL HUB ===== */}
          <div className="relative w-[380px] h-[380px] sm:w-[520px] sm:h-[520px] flex items-center justify-center mt-4 sm:mt-12">
            
            {/* Concentric rings decoration behind the buttons */}
            <div className="absolute inset-0 border-[1.5px] border-teal-500/10 rounded-full scale-[0.65]" />
            <div className="absolute inset-0 border-[1.5px] border-teal-500/5 rounded-full scale-[0.85]" />
            <div className="absolute inset-0 border border-teal-500/10 rounded-full border-dashed scale-[1.05] animate-[spin_120s_linear_infinite]" />

            {/* The 5 surrounding buttons arranged in a perfect pentagon/star layout */}
            <ActionItem
              delay={0}
              className="top-[-5%] sm:top-[-8%] left-1/2 -translate-x-1/2"
              icon={Stethoscope} label="Tìm bác sĩ" bg="bg-blue-50" text="text-blue-600" hover="hover:border-blue-200"
              onClick={() => navigate("/patient/search")}
            />
            <ActionItem
              delay={0.2}
              className="top-[22%] sm:top-[25%] right-[-10%] sm:right-[-5%] translate-x-1/2"
              icon={CalendarDays} label="Lịch hẹn" bg="bg-amber-50" text="text-amber-600" hover="hover:border-amber-200"
              badge={unreadApptsCount}
              onClick={() => { navigate("/patient/appointments"); setViewedAppts(upcoming.length); }}
            />
            <ActionItem
              delay={0.4}
              className="bottom-[10%] sm:bottom-[15%] right-[-5%] sm:right-[5%] translate-x-1/2 translate-y-1/2"
              icon={FileHeart} label="Hồ sơ" bg="bg-emerald-50" text="text-emerald-600" hover="hover:border-emerald-200"
              onClick={() => navigate("/patient/records")}
            />
            <ActionItem
              delay={0.6}
              className="bottom-[10%] sm:bottom-[15%] left-[-5%] sm:left-[5%] -translate-x-1/2 translate-y-1/2"
              icon={Activity} label="Theo dõi" bg="bg-purple-50" text="text-purple-600" hover="hover:border-purple-200"
              onClick={() => navigate("/patient/tracking")}
            />
            <ActionItem
              delay={0.8}
              className="top-[22%] sm:top-[25%] left-[-10%] sm:left-[-5%] -translate-x-1/2"
              icon={MessagesSquare} label="Tin nhắn" bg="bg-pink-50" text="text-pink-600" hover="hover:border-pink-200"
              badge={unreadMsgsCount}
              onClick={() => { navigate("/patient/messages"); setViewedMsgs(myThreads.length); }}
            />

            {/* Center Core: The Giant AI Chatbot Button */}
            <motion.button
              animate={{ scale: [1, 1.02, 1], boxShadow: ["0 0 0 0 rgba(16, 185, 129, 0)", "0 0 20px 4px rgba(16, 185, 129, 0.2)", "0 0 0 0 rgba(16, 185, 129, 0)"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openChat}
              className="relative z-40 w-44 h-44 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:shadow-[0_0_80px_rgba(16,185,129,0.5)] group overflow-hidden border-[8px] sm:border-[10px] border-white transition-shadow duration-500"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3),transparent_70%)] animate-pulse" />
              
              <Bot className="w-16 h-16 sm:w-28 sm:h-28 text-white relative z-10 filter drop-shadow-lg group-hover:-translate-y-3 transition-transform duration-500 ease-out" />
              <span className="text-white font-black text-xl sm:text-3xl mt-2 relative z-10 tracking-tight group-hover:-translate-y-1 transition-transform duration-500">Chat AI</span>
              
              {/* Tooltip hint that appears on hover */}
              <span className="absolute bottom-5 sm:bottom-8 text-emerald-50 text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 transition-all duration-500">
                Chạm để bắt đầu
              </span>
            </motion.button>
          </div>

          {/* Smart Suggestion Chips (bottom center) - Multiple chips */}
          {suggestions.length > 0 && !dismissedSuggestion && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="absolute bottom-8 sm:bottom-12 z-40 w-full flex justify-center px-4">
              <div className="flex flex-col items-center gap-3 max-w-lg w-full">
                {/* Main suggestion chip - bigger and easier to click */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-600 backdrop-blur-xl pl-5 pr-3 py-4 rounded-2xl text-white shadow-2xl border border-emerald-500/30 cursor-pointer"
                  onClick={() => { handleDashboardSuggestion(suggestions[suggestionIndex % suggestions.length]); setDismissedSuggestion(true); }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold">{suggestions[suggestionIndex % suggestions.length].title}</div>
                    <div className="text-xs text-emerald-100 mt-0.5 truncate">{suggestions[suggestionIndex % suggestions.length].actionLabel}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-200 shrink-0" />
                </motion.div>
                
                {/* Control buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    className="h-10 px-4 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors cursor-pointer text-white text-xs font-semibold"
                    onClick={(e) => { e.stopPropagation(); setSuggestionIndex(i => i + 1); }}
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Gợi ý khác
                  </button>
                  <button 
                    className="h-10 px-4 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white text-xs font-semibold"
                    onClick={(e) => { e.stopPropagation(); setDismissedSuggestion(true); }}
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ===== CHAT VIEW ===== */}
      {activeView === "chat" && (
        <motion.div 
          key="chat"
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="h-screen flex flex-col bg-white absolute inset-0 z-50"
        >
          {/* Chat Header */}
          <header className="h-16 bg-white border-b border-emerald-100/40 px-4 flex items-center gap-3 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/patient")} className="rounded-full hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm leading-tight">Trợ lý AI MediCare</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[11px] text-emerald-600 font-medium">Đang hoạt động</span>
              </div>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95" onClick={() => {
                setChatSessions(JSON.parse(localStorage.getItem("ai_chat_sessions") || "[]"));
                setShowChatHistory(true);
              }}>
                <History className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                if (messages.length > 0) {
                  setCurrentSessionId(Date.now().toString());
                  setMessages([]);
                  toast.success("Đã mở cuộc trò chuyện mới");
                }
              }} className="text-emerald-600 font-semibold bg-emerald-50 hover:bg-emerald-100 rounded-xl px-3 h-9 active:scale-95">
                <Plus className="w-4 h-4 mr-1.5" />
                Mới
              </Button>
            </div>
          </header>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Xin chào, tôi có thể giúp gì cho bạn?</h3>
                  <p className="text-sm text-slate-500 mb-6">Hãy chọn một gợi ý bên dưới hoặc tự nhập câu hỏi của bạn.</p>
                  <div className="flex flex-wrap justify-center gap-3 max-w-lg">
                    {["Tôi bị đau đầu và buồn nôn", "Lịch khám gần nhất của tôi khi nào?", "Tư vấn dinh dưỡng cho người tiểu đường", "Làm sao để đặt lịch khám mới?", "Có những phương thức thanh toán nào?", "Giải thích kết quả xét nghiệm máu"].map(prompt => (
                      <button 
                        key={prompt}
                        onClick={() => { setInput(prompt); sendChat(prompt); }}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 hover:shadow-sm transition-all active:scale-95 text-left shadow-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "me" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "bot" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`flex flex-col ${msg.role === "me" ? "items-end" : "items-start"} max-w-[85%]`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "bot"
                        ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-emerald-50 text-slate-800 border border-slate-200 rounded-tl-sm"
                        : "bg-emerald-600 text-white rounded-tr-sm shadow-sm"
                    }`}>
                      <div className="whitespace-pre-line leading-relaxed">{renderMessage(msg.text)}</div>
                    </div>

                    {/* Moved suggested actions down above input */}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-emerald-50 border border-slate-200 rounded-tl-sm">
                    <div className="flex gap-1">
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="shrink-0 p-4 bg-white border-t border-emerald-100/40">
            {/* Suggested Action Buttons (Only for the LAST message) */}
            {messages.length > 0 && messages[messages.length - 1].suggestedActions && (
              <div className="max-w-3xl mx-auto flex flex-wrap gap-2 mb-3">
                {messages[messages.length - 1].suggestedActions?.map((sa, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedAction(sa)}
                    className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {sa.label}
                  </button>
                ))}
              </div>
            )}
            <div className="max-w-3xl mx-auto flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(input); } }}
                  placeholder="Nhập triệu chứng hoặc câu hỏi..."
                  className="resize-none min-h-[44px] max-h-32 rounded-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-emerald-50 border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 px-4 py-3 text-sm pr-12"
                  rows={1}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className={`h-11 w-11 rounded-xl shrink-0 transition-all ${isListening ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"}`}
                onClick={() => {
                  setIsListening(!isListening);
                  if (!isListening) toast.info("Đang lắng nghe...");
                  else toast.info("Đã tắt mic");
                }}
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                className={`h-11 w-11 rounded-xl shrink-0 transition-all active:scale-95 ${input.trim() ? "bg-emerald-600 hover:bg-emerald-700 shadow-md" : "bg-slate-200 text-slate-400"}`}
                onClick={() => sendChat(input)}
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">AI mang tính tham khảo, không thay thế chẩn đoán y khoa.</p>
          </div>
        </motion.div>
      )}

      {/* ===== SUB-PAGE VIEWS ===== */}
      {activeView !== "dashboard" && activeView !== "chat" && (
        <motion.div 
          key="subpages"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen flex flex-col relative bg-slate-50 absolute inset-0 z-40"
        >
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-emerald-50 pointer-events-none" />
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-emerald-100/40 px-4 h-14 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/patient")} className="rounded-full hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <h2 className="font-bold text-slate-800 text-base">
              {activeView === "search" ? "Tìm bác sĩ" :
               activeView === "appointments" ? "Lịch hẹn" :
               activeView === "records" ? "Hồ sơ Bệnh án" :
               activeView === "tracking" ? "Theo dõi Chỉ số" :
               activeView === "messages" ? "Tin nhắn Bác sĩ" :
               activeView === "profile" ? "Hồ sơ Cá nhân" : ""}
            </h2>
          </header>
          <div className="flex-1 overflow-auto pb-24 relative z-10">
            <div className="max-w-5xl mx-auto w-full p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {activeView === "search" && <SearchSection search={search} setSearch={setSearch} specFilter={specFilter} setSpecFilter={setSpecFilter} doctors={filtered} onPick={setSelectedDoctor} onBook={setBookingDoctor} />}
                  {activeView === "appointments" && <Appointments 
                    appointments={appointments} 
                    onCancel={cancelAppt} 
                    onEdit={setEditing} 
                    onClickDoctor={(name) => {
                      const doc = DOCTORS.find((d: any) => d.name === name);
                      if (doc) setSelectedDoctor(doc);
                    }}
                    onClickAppt={setViewingAppt}
                  />}
                  {activeView === "records" && <Records />}
                  {activeView === "tracking" && <Tracking onBook={() => { setBookingDoctor(DOCTORS[0]); navigate("/patient/search"); }} skipConfirm={skipConfirm} onSkip={() => setSkipConfirm(true)} onCancelSkip={() => setSkipConfirm(false)} />}
                  {activeView === "messages" && <MessagesTab threads={myThreads} activeThreadId={activeThreadId} setActiveThreadId={setActiveThreadId} reply={reply} setReply={setReply} onSendReply={() => {
                    if (!reply.trim() || !activeThreadId) return;
                    store.appendMessage(activeThreadId, { f: "user", txt: reply, t: "vừa xong" }); setReply("");
                  }} onNewThread={() => setNewMsgDoctor(DOCTORS[0])} />}
                  {activeView === "profile" && <Profile />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Floating Chatbot Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/patient/chat")}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_8px_32px_rgba(16,185,129,0.4)] flex items-center justify-center border-2 border-white/20 hover:shadow-[0_12px_40px_rgba(16,185,129,0.6)] transition-all"
          >
            <Bot className="w-7 h-7" />
          </motion.button>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Floating Chat Button (visible on sub-pages, not on dashboard or chat) */}
      {activeView !== "dashboard" && activeView !== "chat" && (
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="group fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-[2rem] sm:rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_8px_32px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)] flex flex-col items-center justify-center gap-2 hover:scale-110 active:scale-95 transition-all z-40 border-[3px] border-white"
          onClick={openChat}
        >
          <Bot className="w-7 h-7" />
        </motion.button>
      )}

      {/* Dialogs */}
      <DoctorDetailDialog doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} onBook={setBookingDoctor} />
      <BookingDialog doctor={bookingDoctor} bookDate={bookDate} onBookDateChange={setBookDate} bookTime={bookTime} onBookTimeChange={setBookTime} onConfirm={handleBook} onCancel={() => setBookingDoctor(null)} />
      <EditAppointmentDialog editing={editing} onEditingChange={setEditing} editingOriginal={editingOriginal} onUpdate={updateAppt} onCancel={() => { setEditing(null); setEditingOriginal(null); }} appointments={appointments} doctors={DOCTORS} />
      <NewMessageDialog doctor={newMsgDoctor} onDoctorChange={setNewMsgDoctor} content={newMsgContent} onContentChange={setNewMsgContent} doctors={DOCTORS} onSend={submitNewMsg} onCancel={() => { setNewMsgDoctor(null); setNewMsgContent(""); }} />
    
      <AppointmentDetailDialog
        appt={viewingAppt}
        onClose={() => setViewingAppt(null)}
      />

      <AppointmentSuccessDialog
        doctor={bookedDoctor}
        date={bookedDate}
        time={bookedTime}
        clinic={bookedClinic}
        onClose={() => { setShowBookingSuccess(false); setBookedDoctor(null); }}
        onViewAppointments={() => { setShowBookingSuccess(false); setBookedDoctor(null); navigate("/patient/appointments"); }}
      />

      <CancelConfirmDialog
        appointment={cancelAppointment}
        isOpen={showCancelConfirm}
        onClose={() => { setShowCancelConfirm(false); setCancelAppointment(null); }}
        onConfirm={confirmCancelAppt}
      />

      {/* Chat History Dialog */}
      <Dialog open={showChatHistory} onOpenChange={setShowChatHistory}>
        <DialogContent className="sm:max-w-md bg-white/80 backdrop-blur-3xl border-white/50 shadow-2xl p-0 overflow-hidden" style={{ borderRadius: "24px" }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-white/50">
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              Lịch sử Chat
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-slate-50/50 max-h-[60vh] overflow-y-auto space-y-3">
            {chatSessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">Chưa có lịch sử trò chuyện.</div>
            ) : (
              [...chatSessions].reverse().map(session => (
                <div key={session.id} className={`p-4 border rounded-2xl shadow-sm hover:border-emerald-200 hover:shadow-emerald-500/10 transition-all cursor-pointer ${session.id === currentSessionId ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-100"}`} onClick={() => {
                  setMessages(session.msgs);
                  setCurrentSessionId(session.id);
                  setShowChatHistory(false);
                  toast.success("Đã tải lại lịch sử chat");
                }}>
                  <div className="text-xs text-slate-400 mb-2">{new Date(session.date).toLocaleString('vi-VN')}</div>
                  <div className="text-sm text-slate-700 font-medium line-clamp-2">
                    {session.msgs.find((m: any) => m.role === "me")?.text || "Cuộc trò chuyện mới"}
                  </div>
                  <div className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                    {session.msgs.length} tin nhắn
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
