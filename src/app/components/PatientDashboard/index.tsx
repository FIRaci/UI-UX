import { useEffect, useState, useRef } from "react";
import { LayoutDashboard, Search, CalendarDays, FileHeart, Activity, MessagesSquare, Bot, User, HeartPulse, LogOut, ArrowLeft, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useStore, store, type Appointment, type Message } from "../../store";
import { ME, type Doctor } from "./constants";
import { Overview } from "./overview";
import { SearchSection } from "./search-section";
import { Appointments } from "./appointments";
import { MessagesTab } from "./messages-tab";
import { Records } from "./records";
import { Tracking } from "./tracking";
import { Profile } from "./profile";
import { DoctorDetailDialog, BookingDialog, EditAppointmentDialog, NewMessageDialog } from "./dialogs";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8000";

export function PatientDashboard({ onLogout, role }: { onLogout: () => void; role: string }) {
  const [activeView, setActiveView] = useState<string>("overview");
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookDate, setBookDate] = useState("2026-05-12");
  const [bookTime, setBookTime] = useState("");
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [editingOriginal, setEditingOriginal] = useState<Appointment | null>(null);
  const [skipConfirm, setSkipConfirm] = useState(false);

  const appointments = useStore(s => s.appointments.filter(a => a.patientName === ME));
  const myThreads = useStore(s =>
    s.threads.filter(t => t.userRole === "benhnhan" && t.userName === ME).sort((a, b) => b.updatedAt - a.updatedAt)
  );
  const DOCTORS = useStore(s => s.doctors);

  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [newMsgDoctor, setNewMsgDoctor] = useState<Doctor | null>(null);
  const [newMsgContent, setNewMsgContent] = useState("");

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "bot", text: "Xin chào! Tôi là trợ lý sức khỏe AI của MediCare. Tôi có thể giúp gì cho bạn hôm nay? Vui lòng mô tả triệu chứng của bạn hoặc chọn tính năng phía trên.", time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeThreadId && myThreads[0]) setActiveThreadId(myThreads[0].id);
  }, [myThreads, activeThreadId]);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const raw = (e as CustomEvent<string>).detail;
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.view) { setActiveView(parsed.view); if (parsed.threadId) setActiveThreadId(parsed.threadId); }
      } catch {
        setActiveView(raw);
      }
    };
    window.addEventListener("app:navigate", handleNavigate);
    return () => window.removeEventListener("app:navigate", handleNavigate);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
        setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "bot", text: data.text, time: new Date() }]);
      } else {
        throw new Error(`API ${res.status}`);
      }
    } catch {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
      let reply = "Cảm ơn bạn đã chia sẻ! Để tôi phân tích kỹ hơn, bạn có thể cho tôi biết thêm chi tiết về tình trạng của bạn không?";
      if (t.toLowerCase().includes("đau đầu") || t.toLowerCase().includes("nhức đầu")) reply = "Đau đầu có thể do căng thẳng, thiếu ngủ, hoặc vấn đề về thị lực. Bạn có thể cho tôi biết thêm: cơn đau ở vị trí nào? Đã kéo dài bao lâu?";
      else if (t.toLowerCase().includes("sốt")) reply = "Bạn hãy đo nhiệt độ và cho tôi biết: sốt bao nhiêu độ? Có kèm ho, đau họng hay không?";
      else if (t.toLowerCase().includes("đặt lịch") || t.toLowerCase().includes("khám")) {
        reply = "Tôi có thể giúp bạn đặt lịch khám. Hãy mở tính năng Tìm bác sĩ nhé.";
        handleAiActions(["NAVIGATE_APPOINTMENT"]);
      }
      
      setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "bot", text: reply, time: new Date() }]);
      if (t.includes("đau") || t.includes("sốt")) handleAiActions(["WARNING_RED", "NAVIGATE_APPOINTMENT"]);
    }
    setIsTyping(false);
  };

  const handleAiActions = (actions?: string[]) => {
    if (!actions?.length) return;
    for (const action of actions) {
      if (action === "WARNING_RED") toast.error("AI cảnh báo: Cần kiểm tra y tế ngay!");
      else if (action === "NAVIGATE_APPOINTMENT") {
        toast.success("AI đề xuất đặt lịch khám", { action: { label: "Đặt ngay", onClick: () => setActiveView("search") } });
      } else if (action === "SHOW_PATIENT_HISTORY") toast.info("AI đề xuất xem lịch sử bệnh án");
      else if (action === "HIGHLIGHT_CRITICAL") toast.warning("AI phát hiện dấu hiệu nghiêm trọng");
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
    toast.success("Đặt lịch thành công!");
    setBookingDoctor(null); setBookTime("");
  };

  const cancelAppt = (id: number) => {
    const a = appointments.find(x => x.id === id);
    if (!a) return;
    if (a.status !== "Sắp tới") { toast.error("Chỉ có thể hủy lịch còn hiệu lực"); return; }
    toast("Xác nhận hủy lịch?", { action: { label: "Hủy lịch", onClick: () => { store.updateAppointment(id, { status: "Đã hủy" }); toast.success("Đã hủy lịch hẹn"); } }, cancel: { label: "Đóng", onClick: () => {} } });
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

  const NAV_ITEMS = [
    { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { key: "search", label: "Tìm bác sĩ", icon: Search },
    { key: "appointments", label: "Lịch hẹn", icon: CalendarDays },
    { key: "messages", label: "Tin nhắn", icon: MessagesSquare },
    { key: "records", label: "Hồ sơ", icon: FileHeart },
    { key: "tracking", label: "Theo dõi", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header Glassmorphism */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-40 px-6 flex items-center justify-between shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 cursor-pointer" onClick={() => setActiveView("overview")}>
            <HeartPulse className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="tracking-tight leading-tight font-bold text-slate-800 text-base">MediCare AI</div>
            <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5 text-blue-600">Trợ lý y tế cá nhân</div>
          </div>
        </div>

        {/* Quick Nav for Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {NAV_ITEMS.slice(0, 4).map(item => (
            <Button key={item.key} variant={activeView === item.key ? "secondary" : "ghost"} size="sm" onClick={() => setActiveView(item.key)} className="text-sm rounded-full px-4 font-medium transition-all hover:bg-blue-50 hover:text-blue-600">
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          ))}
          <Button variant="ghost" size="icon" onClick={() => setActiveView("overview")} className="rounded-full"><LayoutDashboard className="w-4 h-4" /></Button>
        </div>

        {/* User Utilities */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:flex rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
          </Button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer border border-slate-200" onClick={() => setActiveView("profile")}>
            MK
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-16 relative w-full h-screen overflow-hidden bg-slate-50">
        {activeView === "chat" ? (
          <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full py-6 px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-4">
              <Button variant="ghost" size="icon" onClick={() => setActiveView("overview")} className="rounded-full hover:bg-slate-200 bg-slate-100">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Trợ lý sức khỏe AI</h1>
                <p className="text-slate-500 text-sm font-medium">Sẵn sàng giải đáp mọi thắc mắc của bạn</p>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Warning bar */}
              <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                 <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                 <p className="text-xs text-amber-800 font-medium">Lưu ý: Kết quả AI chỉ mang tính hỗ trợ tham khảo và không thay thế chẩn đoán y khoa chuyên nghiệp.</p>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`flex gap-3 max-w-[85%] ${msg.role === "me" ? "flex-row-reverse" : ""}`}>
                        {msg.role === "bot" && (
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
                            <Bot className="w-5 h-5 text-emerald-600" />
                          </div>
                        )}
                        {msg.role === "me" && (
                          <Avatar className="w-10 h-10 shrink-0 border border-slate-200 shadow-sm rounded-2xl">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-bold">MK</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className={`px-5 py-3.5 rounded-3xl ${
                            msg.role === "bot"
                              ? "bg-slate-100/80 text-slate-800 rounded-tl-md shadow-sm border border-slate-200/50"
                              : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-md shadow-md shadow-blue-500/20"
                          }`}>
                            <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.text}</p>
                          </div>
                          <div className={`text-[11px] text-slate-400 mt-1.5 px-1 font-medium ${msg.role === "me" ? "text-right" : ""}`}>
                            {msg.time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[85%]">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
                          <Bot className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="px-5 py-4 rounded-3xl bg-slate-100/80 rounded-tl-md shadow-sm border border-slate-200/50">
                          <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Quick Prompts */}
              {messages.length === 1 && (
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Hoặc chọn một hành động:</div>
                  <div className="flex flex-wrap gap-2.5">
                    {["Tôi bị đau đầu", "Tôi bị sốt", "Đặt lịch khám", "Xem hồ sơ"].map((p, i) => (
                      <button key={i} onClick={() => {
                        if (p === "Đặt lịch khám") setActiveView("search");
                        else if (p === "Xem hồ sơ") setActiveView("records");
                        else sendChat(p);
                      }} className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all text-sm font-medium shadow-sm hover:shadow active:scale-95 text-slate-600">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Box */}
              <div className="p-4 bg-white border-t border-slate-100 rounded-b-3xl">
                <div className="flex gap-3 items-end bg-slate-50 rounded-2xl p-2 border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(input); } }}
                    placeholder="Mô tả triệu chứng hoặc đặt câu hỏi..."
                    className="resize-none min-h-[44px] max-h-32 border-0 bg-transparent focus-visible:ring-0 px-2 py-3 text-[15px]"
                    rows={1}
                  />
                  <Button
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-transform active:scale-95"
                    onClick={() => sendChat(input)}
                    disabled={!input.trim() || isTyping}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-slate-50">
            <div className="max-w-6xl mx-auto w-full p-4 md:p-6 pb-24 pt-8">
              {activeView !== "overview" && (
                <div className="flex items-center gap-4 mb-6 animate-in slide-in-from-left-4">
                  <Button variant="ghost" size="icon" onClick={() => setActiveView("overview")} className="rounded-full hover:bg-slate-200 bg-slate-100 shadow-sm border border-slate-200">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                  </Button>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                    {NAV_ITEMS.find(n => n.key === activeView)?.label || "Tính năng"}
                  </h2>
                </div>
              )}
              
              {activeView === "overview" && <Overview onJump={setActiveView} appts={appointments} threads={myThreads} />}
              {activeView === "search" && <SearchSection search={search} setSearch={setSearch} specFilter={specFilter} setSpecFilter={setSpecFilter} doctors={filtered} onPick={setSelectedDoctor} onBook={setBookingDoctor} />}
              {activeView === "appointments" && <Appointments appointments={appointments} onCancel={cancelAppt} onEdit={setEditing} />}
              {activeView === "messages" && <MessagesTab threads={myThreads} activeThreadId={activeThreadId} setActiveThreadId={setActiveThreadId} reply={reply} setReply={setReply} onSendReply={() => {
                if (!reply.trim() || !activeThreadId) return;
                store.appendMessage(activeThreadId, { f: "user", txt: reply, t: "vừa xong" }); setReply("");
              }} onNewThread={() => setNewMsgDoctor(DOCTORS[0])} />}
              {activeView === "records" && <Records />}
              {activeView === "tracking" && <Tracking onBook={() => { setBookingDoctor(DOCTORS[0]); setActiveView("search"); toast.info("Đã điền BS. Nguyễn Văn An"); }} skipConfirm={skipConfirm} onSkip={() => setSkipConfirm(true)} onCancelSkip={() => setSkipConfirm(false)} />}
              {activeView === "profile" && <Profile />}
            </div>
          </div>
        )}
      </main>



      {/* Dialogs */}
      <DoctorDetailDialog doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} onBook={setBookingDoctor} />
      <BookingDialog doctor={bookingDoctor} bookDate={bookDate} onBookDateChange={setBookDate} bookTime={bookTime} onBookTimeChange={setBookTime} onConfirm={handleBook} onCancel={() => setBookingDoctor(null)} />
      <EditAppointmentDialog editing={editing} onEditingChange={setEditing} editingOriginal={editingOriginal} onUpdate={updateAppt} onCancel={() => { setEditing(null); setEditingOriginal(null); }} appointments={appointments} doctors={DOCTORS} />
      <NewMessageDialog doctor={newMsgDoctor} onDoctorChange={setNewMsgDoctor} content={newMsgContent} onContentChange={setNewMsgContent} doctors={DOCTORS} onSend={submitNewMsg} onCancel={() => { setNewMsgDoctor(null); setNewMsgContent(""); }} />
    </div>
  );
}
