import { useState, useEffect } from "react";
import { AppShell } from "../AppShell";
import { toast } from "sonner";
import { LayoutDashboard, Bot, Users, CalendarCheck, History, BookOpen } from "lucide-react";
import {
  ME_NAME, DOCTORS, slotsForDay,
  type Appointment, type ChatMessage, type AIInsight,
  type DoctorRec, type ConsultHistory, type Article, type BookingDay, type Severity,
} from "./constants";
import { DashboardTab } from "./DashboardTab";
import { ChatArea } from "./ChatArea";
import { DoctorList } from "./DoctorList";
import { AppointmentBooking } from "./AppointmentBooking";
import { HistoryTab } from "./HistoryTab";
import { LibraryTab } from "./LibraryTab";
import { Dialogs } from "./Dialogs";

export function ConsultantDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState("dashboard");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Xin chào! Tôi là trợ lý sức khỏe AI. Hôm nay bạn đang gặp vấn đề gì về sức khỏe? Hãy mô tả triệu chứng của bạn một cách tự nhiên nhé.",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIInsight>({
    symptoms: [],
    specialty: null,
    severity: null,
    confidence: null,
    nextAction: null,
  });
  const [conversationStep, setConversationStep] = useState(0);

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRec | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewingDoctor, setViewingDoctor] = useState<DoctorRec | null>(null);
  const [viewingHistory, setViewingHistory] = useState<ConsultHistory | null>(null);
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancelingAppt, setCancelingAppt] = useState<Appointment | null>(null);

  const WD = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const bookingDays: BookingDay[] = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`;
    const dayLabel = i === 0 ? "Hôm nay" : i === 1 ? "Mai" : WD[d.getDay()];
    const fullLabel = i === 0 ? "Hôm nay" : i === 1 ? "Ngày mai" : `${WD[d.getDay()]} ${dateLabel}`;
    return { key, dateLabel, dayLabel, fullLabel };
  });
  const [selectedDate, setSelectedDate] = useState(bookingDays[0].key);
  const selectedDayLabel = bookingDays.find(d => d.key === selectedDate)?.fullLabel ?? "Hôm nay";
  const selectedDayIndex = Math.max(0, bookingDays.findIndex(d => d.key === selectedDate));
  const availableSlots = selectedDoctor ? slotsForDay(selectedDoctor, selectedDayIndex) : [];

  useEffect(() => { setSelectedSlot(""); }, [selectedDoctor, selectedDate]);

  const goToBooking = (doc: DoctorRec) => {
    setSelectedDoctor(doc);
    if (!appointmentNotes && aiInsight.symptoms.length > 0) {
      setAppointmentNotes(`Triệu chứng đã trao đổi với AI: ${aiInsight.symptoms.join(", ")}.`);
    }
    setActive("appointments");
  };

  const generateAIResponse = (userMessage: string, step: number): { message: string; insight?: Partial<AIInsight> } => {
    const lower = userMessage.toLowerCase();
    const detectedSymptoms: string[] = [];
    if (lower.includes("đau đầu") || lower.includes("nhức đầu")) detectedSymptoms.push("Đau đầu");
    if (lower.includes("đau ngực")) detectedSymptoms.push("Đau ngực");
    if (lower.includes("khó thở") || lower.includes("thở không ra")) detectedSymptoms.push("Khó thở");
    if (lower.includes("sốt") || lower.includes("nóng người")) detectedSymptoms.push("Sốt");
    if (lower.includes("mất ngủ") || lower.includes("không ngủ được")) detectedSymptoms.push("Mất ngủ");
    if (lower.includes("lo âu") || lower.includes("stress") || lower.includes("căng thẳng")) detectedSymptoms.push("Lo âu");
    if (lower.includes("đau bụng")) detectedSymptoms.push("Đau bụng");
    if (lower.includes("buồn nôn")) detectedSymptoms.push("Buồn nôn");
    if (lower.includes("chóng mặt") || lower.includes("hoa mắt")) detectedSymptoms.push("Chóng mặt");

    const isEmergency = detectedSymptoms.includes("Đau ngực") || detectedSymptoms.includes("Khó thở");
    if (isEmergency) {
      return {
        message: "⚠️ Đau ngực hoặc khó thở có thể là dấu hiệu cấp cứu. Nếu triệu chứng dữ dội, lan ra tay/hàm, vã mồ hôi hoặc tăng nhanh, hãy GỌI 115 hoặc đến cơ sở y tế gần nhất ngay. Bạn không nên chờ đặt lịch khám thông thường.",
        insight: {
          symptoms: detectedSymptoms,
          specialty: "Tim mạch",
          severity: "Khẩn cấp",
          confidence: 0.9,
          nextAction: "Gọi 115 hoặc đến cấp cứu ngay nếu triệu chứng nặng",
        },
      };
    }

    if (step === 0 && detectedSymptoms.length > 0) {
      let specialty = "Tổng quát";
      const severity: Severity = "Trung bình";
      if (detectedSymptoms.includes("Lo âu") || detectedSymptoms.includes("Mất ngủ")) {
        specialty = "Tâm lý";
      } else if (detectedSymptoms.includes("Đau đầu")) {
        specialty = "Thần kinh";
      }
      return {
        message: `Tôi hiểu rồi, bạn đang gặp ${detectedSymptoms.join(", ").toLowerCase()}. Triệu chứng này đã kéo dài bao lâu rồi?`,
        insight: { symptoms: detectedSymptoms, specialty, severity, confidence: 0.65 },
      };
    }
    if (step === 1 && (lower.includes("ngày") || lower.includes("tuần") || lower.includes("tháng"))) {
      return {
        message: "Cảm ơn bạn đã chia sẻ. Mức độ nghiêm trọng của triệu chứng như thế nào? (nhẹ, trung bình, hay nặng)",
        insight: { confidence: 0.75 },
      };
    }
    if (step === 2 && (lower.includes("nhẹ") || lower.includes("trung bình") || lower.includes("nặng"))) {
      let severity: Severity = "Trung bình";
      if (lower.includes("nặng")) severity = "Cao";
      if (lower.includes("nhẹ")) severity = "Thấp";
      return {
        message: `Dựa trên thông tin bạn cung cấp, tôi đánh giá đây là tình trạng mức độ ${severity.toLowerCase()}. Bạn có triệu chứng nào khác đi kèm không? Ví dụ: sốt, buồn nôn, hoặc đau ở vị trí khác?`,
        insight: { severity, confidence: 0.85, nextAction: severity === "Cao" ? "Đặt lịch khám trong 24-48h" : "Theo dõi thêm 2-3 ngày" },
      };
    }
    if (step >= 3) {
      return {
        message: `Dựa trên cuộc trao đổi của chúng ta, tôi khuyến nghị bạn nên:\n\n• Đặt lịch khám với bác sĩ chuyên khoa\n• Theo dõi và ghi chú các triệu chứng\n• Nghỉ ngơi đầy đủ và uống đủ nước\n\nBạn có muốn xem danh sách bác sĩ phù hợp không?`,
        insight: { confidence: 0.9 },
      };
    }
    if (detectedSymptoms.length > 0) {
      return {
        message: "Tôi đã ghi nhận thêm triệu chứng này. Bạn mô tả rõ hơn được không: nó xuất hiện khi nào và kéo dài bao lâu?",
        insight: { symptoms: detectedSymptoms },
      };
    }
    return { message: "Tôi hiểu rồi. Bạn có thể chia sẻ thêm chi tiết về triệu chứng này không? Ví dụ: khi nào bạn thấy nó xuất hiện nhiều nhất?" };
  };

  const sendChatMessage = (message: string) => {
    if (!message.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = generateAIResponse(message, conversationStep);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiResponse.message,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      setConversationStep(prev => prev + 1);
      if (aiResponse.insight) {
        setAiInsight(prev => ({ ...prev, ...aiResponse.insight }));
      }
    }, 1500 + Math.random() * 1000);
  };

  const bookAppointment = () => {
    if (!selectedDoctor || !selectedSlot) { toast.error("Vui lòng chọn bác sĩ và khung giờ"); return; }
    setShowConfirm(true);
  };

  const confirmBooking = () => {
    if (!selectedDoctor) return;
    setAppointments(prev => [
      ...prev,
      {
        id: Date.now(),
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        time: `${selectedSlot} · ${selectedDayLabel}`,
        notes: appointmentNotes,
      },
    ]);
    toast.success(`Đã đặt lịch với ${selectedDoctor.name} lúc ${selectedSlot}`);
    setShowConfirm(false);
    setSelectedDoctor(null);
    setSelectedSlot("");
    setAppointmentNotes("");
    setActive("dashboard");
  };

  const confirmCancel = () => {
    if (!cancelingAppt) return;
    setAppointments(prev => prev.filter(a => a.id !== cancelingAppt.id));
    toast.success("Đã hủy lịch hẹn");
    setCancelingAppt(null);
  };

  return (
    <AppShell
      title="Trợ lý sức khỏe AI"
      subtitle={`Chào ${ME_NAME} 👋`}
      roleLabel="Người cần tư vấn"
      roleColor="bg-emerald-100 text-emerald-700 border border-emerald-200"
      initials="PT"
      active={active}
      onNav={setActive}
      onLogout={onLogout}
      nav={[
        { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
        { key: "ai", label: "Tư vấn AI", icon: Bot },
        { key: "doctors", label: "Bác sĩ được gợi ý", icon: Users },
        { key: "appointments", label: "Đặt lịch khám", icon: CalendarCheck },
        { key: "history", label: "Lịch sử tư vấn", icon: History },
        { key: "library", label: "Thư viện", icon: BookOpen },
      ]}
    >
      {active === "dashboard" && (
        <DashboardTab
          appointments={appointments}
          onNavigate={setActive}
          onViewHistory={setViewingHistory}
          onCancelAppt={setCancelingAppt}
        />
      )}

      {active === "ai" && (
        <ChatArea
          messages={chatMessages}
          input={chatInput}
          isTyping={isTyping}
          insight={aiInsight}
          onSend={sendChatMessage}
          onInputChange={setChatInput}
          onViewDoctors={() => setActive("doctors")}
        />
      )}

      {active === "doctors" && (
        <DoctorList
          onViewDoctor={setViewingDoctor}
          onBookDoctor={goToBooking}
        />
      )}

      {active === "appointments" && (
        <AppointmentBooking
          selectedDoctor={selectedDoctor}
          selectedSlot={selectedSlot}
          appointmentNotes={appointmentNotes}
          bookingDays={bookingDays}
          selectedDate={selectedDate}
          availableSlots={availableSlots}
          onDoctorChange={setSelectedDoctor}
          onSlotChange={setSelectedSlot}
          onNotesChange={setAppointmentNotes}
          onDateChange={setSelectedDate}
          onBook={bookAppointment}
        />
      )}

      {active === "history" && (
        <HistoryTab onViewHistory={setViewingHistory} />
      )}

      {active === "library" && (
        <LibraryTab onReadArticle={setReadingArticle} />
      )}

      <Dialogs
        showConfirm={showConfirm}
        cancelingAppt={cancelingAppt}
        selectedDoctor={selectedDoctor}
        selectedSlot={selectedSlot}
        selectedDayLabel={selectedDayLabel}
        appointmentNotes={appointmentNotes}
        viewingDoctor={viewingDoctor}
        viewingHistory={viewingHistory}
        readingArticle={readingArticle}
        onCloseConfirm={() => setShowConfirm(false)}
        onCloseCancelingAppt={() => setCancelingAppt(null)}
        onCloseViewDoctor={() => setViewingDoctor(null)}
        onCloseViewHistory={() => setViewingHistory(null)}
        onCloseReadingArticle={() => setReadingArticle(null)}
        onConfirmBooking={confirmBooking}
        onConfirmCancel={confirmCancel}
        onBookFromDoctor={(doc) => { setViewingDoctor(null); goToBooking(doc); }}
        onNavigateToDoctors={() => { setViewingHistory(null); setActive("doctors"); }}
      />
    </AppShell>
  );
}
