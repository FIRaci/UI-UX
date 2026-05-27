import { useEffect, useState } from "react";
import { AppShell } from "../AppShell";
import { toast } from "sonner";
import {
  LayoutDashboard, Bot, Users, CalendarCheck, History, BookOpen
} from "lucide-react";
import type { ChatMessage, AIInsight, DoctorRec, ConsultHistory, Article } from "./constants";
import { ME_NAME } from "./constants";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { DashboardTab } from "./DashboardTab";
import { ChatArea } from "./ChatArea";
import { DoctorList } from "./DoctorList";
import { AppointmentBooking } from "./AppointmentBooking";
import { HistoryTab } from "./HistoryTab";
import { LibraryTab } from "./LibraryTab";
import { Dialogs } from "./Dialogs";

export function ConsultantDashboard({ onLogout, role }: { onLogout: () => void; role: string }) {
  const [active, setActive] = useState("dashboard");

  useAppNavigate(["dashboard", "ai", "doctors", "appointments", "history", "library"], setActive);

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

    if (step === 0 && detectedSymptoms.length > 0) {
      let specialty = "Tổng quát";
      let severity: AIInsight["severity"] = "Trung bình";
      if (detectedSymptoms.includes("Đau ngực") || detectedSymptoms.includes("Khó thở")) {
        specialty = "Tim mạch"; severity = "Cao";
      } else if (detectedSymptoms.includes("Lo âu") || detectedSymptoms.includes("Mất ngủ")) {
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
      let severity: AIInsight["severity"] = "Trung bình";
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
    setChatMessages((prev: ChatMessage[]) => [...prev, userMsg]);
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
      setChatMessages((prev: ChatMessage[]) => [...prev, aiMsg]);
      setIsTyping(false);
      setConversationStep((prev: number) => prev + 1);
      if (aiResponse.insight) {
        setAiInsight((prev: AIInsight) => ({ ...prev, ...aiResponse.insight }));
      }
    }, 1500 + Math.random() * 1000);
  };

  const bookAppointment = () => {
    if (!selectedDoctor || !selectedSlot) { toast.error("Vui lòng chọn bác sĩ và khung giờ"); return; }
    setShowConfirm(true);
  };

  const confirmBooking = () => {
    toast.success(`Đã đặt lịch với ${selectedDoctor?.name} lúc ${selectedSlot}`);
    setShowConfirm(false);
    setSelectedDoctor(null);
    setSelectedSlot("");
    setAppointmentNotes("");
    setActive("dashboard");
  };

  return (
    <AppShell
      title="Trợ lý sức khỏe AI"
      subtitle={`Chào ${ME_NAME}`}
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
        <DashboardTab onNavigate={setActive} onViewHistory={setViewingHistory} />
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
          onBookDoctor={(d) => { setSelectedDoctor(d); setActive("appointments"); }}
        />
      )}

      {active === "appointments" && (
        <AppointmentBooking
          selectedDoctor={selectedDoctor}
          selectedSlot={selectedSlot}
          appointmentNotes={appointmentNotes}
          onDoctorChange={setSelectedDoctor}
          onSlotChange={setSelectedSlot}
          onNotesChange={setAppointmentNotes}
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
        onCloseConfirm={() => setShowConfirm(false)}
        selectedDoctor={selectedDoctor}
        selectedSlot={selectedSlot}
        appointmentNotes={appointmentNotes}
        onConfirmBooking={confirmBooking}
        viewingDoctor={viewingDoctor}
        onCloseViewDoctor={() => setViewingDoctor(null)}
        onBookFromDoctor={(d) => { setSelectedDoctor(d); setViewingDoctor(null); setActive("appointments"); }}
        viewingHistory={viewingHistory}
        onCloseViewHistory={() => setViewingHistory(null)}
        onNavigateToDoctors={() => { setViewingHistory(null); setActive("doctors"); }}
        readingArticle={readingArticle}
        onCloseReadingArticle={() => setReadingArticle(null)}
      />
    </AppShell>
  );
}
