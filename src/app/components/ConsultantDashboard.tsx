import { useState } from "react";
import { AppShell } from "./AppShell";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import {
  LayoutDashboard, Bot, Users, CalendarCheck, History,
  Sparkles, AlertCircle, CheckCircle2, Send, Star, Clock, MessageSquare, BookOpen
} from "lucide-react";
import { toast } from "sonner";

const ME_NAME = "Phạm Thanh Tâm";

type DoctorRec = {
  id: number;
  name: string;
  specialty: string;
  matchReason: string;
  rating: number;
  availability: string;
  tags: string[];
  nextSlot: string;
};
type ConsultHistory = {
  id: number;
  date: string;
  symptoms: string[];
  severity: "Khẩn cấp" | "Cao" | "Trung bình" | "Thấp";
  actions: string[];
  specialty: string;
  bookingRec: string;
};

const DOCTORS: DoctorRec[] = [
  {
    id: 1,
    name: "BS. Nguyễn Văn An",
    specialty: "Tim mạch",
    matchReason: "Chuyên gia về đau ngực và rối loạn nhịp tim, phù hợp với triệu chứng của bạn",
    rating: 4.9,
    availability: "Còn 3 slot hôm nay",
    tags: ["Tim mạch", "Huyết áp", "ECG"],
    nextSlot: "14:00 - Hôm nay",
  },
  {
    id: 2,
    name: "CV. Đỗ Thanh Hằng",
    specialty: "Tâm lý",
    matchReason: "Chuyên trị lo âu, stress và rối loạn giấc ngủ",
    rating: 4.8,
    availability: "Online 24/7",
    tags: ["Lo âu", "Stress", "Mất ngủ"],
    nextSlot: "Bất kỳ lúc nào",
  },
  {
    id: 3,
    name: "BS. Trần Minh Đức",
    specialty: "Hô hấp",
    matchReason: "Bác sĩ đầu ngành về các bệnh phổi và đường hô hấp",
    rating: 4.7,
    availability: "Còn 2 slot chiều nay",
    tags: ["Phổi", "Ho", "Hen suyễn"],
    nextSlot: "15:30 - Hôm nay",
  },
];

const HISTORY: ConsultHistory[] = [
  {
    id: 1,
    date: "2026-05-10",
    symptoms: ["Đau đầu", "Mất ngủ", "Lo âu"],
    severity: "Trung bình",
    actions: ["Nghỉ ngơi đầy đủ", "Tập thở 4-7-8", "Hạn chế caffeine sau 14h"],
    specialty: "Tâm lý",
    bookingRec: "Nên đặt lịch tư vấn tâm lý nếu triệu chứng kéo dài > 2 tuần",
  },
  {
    id: 2,
    date: "2026-05-05",
    symptoms: ["Đau ngực nhẹ", "Hồi hộp"],
    severity: "Cao",
    actions: ["Đo huyết áp 2 lần/ngày", "Hạn chế muối", "Tái khám nếu đau tăng"],
    specialty: "Tim mạch",
    bookingRec: "Khuyến nghị đặt lịch khám tim mạch trong 3 ngày",
  },
];

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

type AIInsight = {
  symptoms: string[];
  specialty: string | null;
  severity: "Khẩn cấp" | "Cao" | "Trung bình" | "Thấp" | null;
  confidence: number | null;
  nextAction: string | null;
};

const QUICK_PROMPTS = [
  "Tôi bị đau đầu",
  "Tôi bị đau ngực",
  "Tôi khó thở",
  "Tôi bị sốt",
  "Tôi bị mất ngủ",
  "Tôi bị đau bụng",
];

type Article = {
  t: string; c: string; d: string; author: string; date: string;
  cover: string; lead: string; sections: { h: string; p: string }[];
};
const ARTICLES: Article[] = [
  {
    t: "Quản lý stress hiệu quả", c: "Tâm lý", d: "5 phút đọc",
    author: "CV. Đỗ Thanh Hằng", date: "02/05/2026",
    cover: "linear-gradient(135deg,#a78bfa,#60a5fa)",
    lead: "Stress là phản ứng bình thường của cơ thể trước áp lực, nhưng kéo dài có thể ảnh hưởng nghiêm trọng đến sức khỏe thể chất và tinh thần.",
    sections: [
      { h: "Nhận diện dấu hiệu", p: "Mất ngủ, khó tập trung, dễ cáu gắt, đau đầu hoặc đau cơ kéo dài đều là tín hiệu cảnh báo. Hãy ghi chú lại tần suất xuất hiện trong 1-2 tuần để có đánh giá chính xác." },
      { h: "Kỹ thuật thở 4-7-8", p: "Hít vào trong 4 giây, giữ hơi 7 giây, thở ra 8 giây. Lặp 4 chu kỳ mỗi sáng và tối giúp hệ thần kinh phó giao cảm hoạt động ổn định hơn." },
      { h: "Cân bằng công việc", p: "Áp dụng quy tắc 90/20: làm việc tập trung 90 phút rồi nghỉ 20 phút. Tránh kiểm tra email/điện thoại 1 giờ trước khi ngủ." },
    ],
  },
  {
    t: "Chế độ ăn cho người cao huyết áp", c: "Dinh dưỡng", d: "8 phút đọc",
    author: "CV. Lý Mai Phương", date: "28/04/2026",
    cover: "linear-gradient(135deg,#34d399,#10b981)",
    lead: "Chế độ ăn DASH được chứng minh giảm 8-14 mmHg huyết áp tâm thu nếu duy trì đều đặn ít nhất 8 tuần.",
    sections: [
      { h: "Nguyên tắc chung", p: "Giảm muối <1.500mg/ngày, tăng kali từ chuối, khoai lang, rau xanh đậm. Hạn chế đồ chiên rán, thực phẩm chế biến sẵn và rượu bia." },
      { h: "Thực đơn mẫu", p: "Sáng: yến mạch + chuối + sữa hạt. Trưa: cá hồi áp chảo + cơm lứt + rau luộc. Tối: ức gà + salad rau củ + 1 quả táo." },
      { h: "Lưu ý khi đi chợ", p: "Đọc nhãn dinh dưỡng, ưu tiên sản phẩm <140mg natri/khẩu phần. Mua thực phẩm tươi thay cho đồ đóng hộp khi có thể." },
    ],
  },
  {
    t: "Bài tập thư giãn trước khi ngủ", c: "Tâm lý", d: "3 phút đọc",
    author: "CV. Đỗ Thanh Hằng", date: "20/04/2026",
    cover: "linear-gradient(135deg,#f472b6,#a78bfa)",
    lead: "Một bài tập kéo giãn 5 phút trước khi ngủ giúp giảm 30% thời gian đi vào giấc ngủ sâu.",
    sections: [
      { h: "Tư thế em bé", p: "Quỳ gối, gập người về trước, hai tay duỗi thẳng. Giữ 60 giây, hít thở sâu bằng bụng." },
      { h: "Vặn cột sống nằm", p: "Nằm ngửa, co một gối kéo qua bên đối diện, đầu xoay ngược lại. Giữ mỗi bên 45 giây." },
      { h: "Quét cơ thể", p: "Nhắm mắt, di chuyển ý thức từ đỉnh đầu xuống chân, thả lỏng từng nhóm cơ. Thực hiện trong 3-5 phút." },
    ],
  },
  {
    t: "Hiểu về sức khỏe tim mạch", c: "Tim mạch", d: "10 phút đọc",
    author: "BS. Nguyễn Văn An", date: "15/04/2026",
    cover: "linear-gradient(135deg,#fb7185,#f97316)",
    lead: "Bệnh tim mạch là nguyên nhân tử vong hàng đầu tại Việt Nam, nhưng 80% trường hợp có thể phòng ngừa được.",
    sections: [
      { h: "Yếu tố nguy cơ", p: "Tăng huyết áp, rối loạn lipid máu, đái tháo đường, hút thuốc, ít vận động và béo phì là 6 yếu tố cần kiểm soát đầu tiên." },
      { h: "Tầm soát định kỳ", p: "Người >40 tuổi nên đo huyết áp 6 tháng/lần, xét nghiệm lipid máu hàng năm, ECG nếu có triệu chứng đau ngực hoặc khó thở." },
      { h: "Vận động thông minh", p: "150 phút cường độ vừa hoặc 75 phút cường độ cao mỗi tuần. Đi bộ nhanh, bơi, đạp xe đều phù hợp." },
    ],
  },
  {
    t: "Chăm sóc da theo mùa", c: "Da liễu", d: "6 phút đọc",
    author: "BS. Trần Thị Bình", date: "10/04/2026",
    cover: "linear-gradient(135deg,#fcd34d,#fb923c)",
    lead: "Da chúng ta phản ứng khác nhau với độ ẩm và nhiệt độ. Routine chăm sóc cần điều chỉnh theo mùa.",
    sections: [
      { h: "Mùa hè", p: "Sữa rửa mặt dịu nhẹ, kem chống nắng SPF 50+ thoa lại sau mỗi 2-3 giờ. Dưỡng ẩm gel nhẹ tránh bít tắc lỗ chân lông." },
      { h: "Mùa đông", p: "Chuyển sang cleanser dạng kem, dưỡng ẩm chứa ceramide và hyaluronic acid. Hạn chế tắm nước quá nóng." },
      { h: "Khi giao mùa", p: "Da dễ kích ứng nhất, ưu tiên sản phẩm tối giản 3 bước: rửa - dưỡng - chống nắng." },
    ],
  },
  {
    t: "Tư thế ngồi đúng cho dân văn phòng", c: "Cơ xương khớp", d: "4 phút đọc",
    author: "BS. Vũ Quốc Đạt", date: "05/04/2026",
    cover: "linear-gradient(135deg,#38bdf8,#6366f1)",
    lead: "Ngồi sai tư thế 8 tiếng/ngày làm tăng 40% nguy cơ thoái hóa cột sống cổ và lưng dưới.",
    sections: [
      { h: "Quy tắc 90 độ", p: "Khuỷu tay, hông và đầu gối đều tạo góc 90°. Hai chân đặt phẳng trên sàn hoặc kê bục thấp." },
      { h: "Vị trí màn hình", p: "Đỉnh màn hình ngang tầm mắt, cách mặt 50-70cm. Tránh nghiêng cổ xuống nhìn laptop liên tục." },
      { h: "Nghỉ ngắn 20-20-20", p: "Mỗi 20 phút nhìn vật cách 20 feet trong 20 giây. Đứng dậy vận động nhẹ mỗi giờ một lần." },
    ],
  },
];

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
        <div className="space-y-5">
          <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0" style={{ borderRadius: "16px" }}>
            <div className="flex items-center gap-2 opacity-90">
              <Bot className="w-5 h-5" /> <span>Trợ lý sức khỏe AI</span>
            </div>
            <h2 className="mt-2 tracking-tight">Cảm thấy không khỏe?</h2>
            <p className="opacity-90 mt-1">AI sẽ phân tích triệu chứng và gợi ý bác sĩ phù hợp nhất với bạn</p>
            <Button size="lg" className="mt-4 bg-white text-emerald-600 hover:bg-white/90" onClick={() => setActive("ai")}>
              <Sparkles className="w-4 h-4 mr-2" /> Bắt đầu tư vấn AI
            </Button>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border border-slate-100 hover:shadow-sm transition-all" style={{ borderRadius: "14px" }}>
              <div className="inline-flex px-2 py-0.5 rounded-md text-xs bg-emerald-50 text-emerald-700">Hoàn thành</div>
              <div className="mt-2 text-2xl tracking-tight font-bold">{HISTORY.length}</div>
              <div className="text-sm text-muted-foreground mt-0.5">Lượt tư vấn AI</div>
            </Card>
            <Card className="p-4 border border-slate-100 hover:shadow-sm transition-all" style={{ borderRadius: "14px" }}>
              <div className="inline-flex px-2 py-0.5 rounded-md text-xs bg-teal-50 text-teal-700">Sẵn sàng</div>
              <div className="mt-2 text-2xl tracking-tight font-bold">{DOCTORS.length}</div>
              <div className="text-sm text-muted-foreground mt-0.5">Bác sĩ được gợi ý</div>
            </Card>
            <Card className="p-4 border border-slate-100 hover:shadow-sm transition-all" style={{ borderRadius: "14px" }}>
              <div className="inline-flex px-2 py-0.5 rounded-md text-xs bg-violet-50 text-violet-700">Gần đây</div>
              <div className="mt-2 text-2xl tracking-tight font-bold">
                {HISTORY[0]?.severity === "Cao" ? "Cao" : "Ổn định"}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">Tình trạng sức khỏe</div>
            </Card>
          </div>

          <Card className="p-5 border border-slate-100" style={{ borderRadius: "16px" }}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="tracking-tight font-bold text-slate-800">Lịch sử tư vấn gần đây</h4>
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setActive("history")}>Xem tất cả</Button>
            </div>
            {HISTORY.slice(0, 2).map(h => (
              <div
                key={h.id}
                className="p-3 border border-slate-100 rounded-xl mb-2 hover:bg-slate-50 hover:border-emerald-100 transition cursor-pointer"
                onClick={() => setViewingHistory(h)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={h.severity === "Khẩn cấp" ? "destructive" : "secondary"}>{h.severity}</Badge>
                      <span className="text-sm text-muted-foreground">{h.date}</span>
                    </div>
                    <div className="text-sm mt-1"><b>Triệu chứng:</b> {h.symptoms.join(", ")}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">Chuyên khoa: {h.specialty}</div>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-xl">Chi tiết</Button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {active === "ai" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 h-[calc(100vh-12rem)]">
          <div className="flex flex-col min-h-0">
            <Card className="p-3 mb-3 bg-amber-50 border-amber-200 flex items-start gap-2" style={{ borderRadius: "12px" }}>
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <b>Lưu ý:</b> Kết quả AI chỉ mang tính hỗ trợ tham khảo và không thay thế chẩn đoán y khoa chuyên nghiệp.
              </p>
            </Card>

            <Card className="flex-1 overflow-hidden flex flex-col p-0 border border-slate-100 shadow-sm" style={{ borderRadius: "16px" }}>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        {msg.role === "ai" && (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-emerald-600" />
                          </div>
                        )}
                        {msg.role === "user" && (
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarFallback className="bg-violet-100 text-violet-700">PT</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className={`px-4 py-2.5 rounded-2xl ${
                            msg.role === "ai"
                              ? "bg-slate-100 text-slate-900 rounded-tl-sm"
                              : "bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-tr-none"
                          }`}>
                            <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                          </div>
                          <div className={`text-[11px] text-muted-foreground mt-1 px-1 ${msg.role === "user" ? "text-right" : ""}`}>
                            {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="px-4 py-2.5 rounded-2xl bg-slate-100 rounded-tl-sm">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {chatMessages.length === 1 && (
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                  <div className="text-xs text-muted-foreground mb-2">Gợi ý nhanh:</div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => sendChatMessage(prompt)}
                        className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition text-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex gap-2 items-end max-w-3xl mx-auto">
                  <Textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(chatInput); }
                    }}
                    placeholder="Mô tả triệu chứng của bạn..."
                    className="resize-none min-h-[48px] max-h-32 rounded-xl border-slate-200"
                    rows={1}
                  />
                  <Button
                    size="icon"
                    className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-sm"
                    onClick={() => sendChatMessage(chatInput)}
                    disabled={!chatInput.trim() || isTyping}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 text-center">Nhấn Enter để gửi, Shift+Enter để xuống dòng</p>
              </div>
            </Card>
          </div>

          <div className="space-y-3 hidden xl:block">
            <Card className="p-4 border border-slate-100 shadow-sm" style={{ borderRadius: "16px" }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-800">Phân tích AI</h4>
              </div>
              <div className="space-y-3">
                {aiInsight.symptoms.length > 0 ? (
                  <>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Triệu chứng</div>
                      <div className="flex flex-wrap gap-1">
                        {aiInsight.symptoms.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    {aiInsight.specialty && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Chuyên khoa liên quan</div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{aiInsight.specialty}</Badge>
                      </div>
                    )}
                    {aiInsight.severity && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Mức độ</div>
                        <Badge
                          variant={aiInsight.severity === "Khẩn cấp" ? "destructive" : "secondary"}
                          className={aiInsight.severity === "Cao" ? "bg-orange-100 text-orange-700 border-orange-200" : ""}
                        >
                          {aiInsight.severity}
                        </Badge>
                      </div>
                    )}
                    {aiInsight.confidence !== null && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Độ tin cậy AI</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                              style={{ width: `${(aiInsight.confidence || 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{Math.round((aiInsight.confidence || 0) * 100)}%</span>
                        </div>
                      </div>
                    )}
                    {aiInsight.nextAction && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Khuyến nghị</div>
                        <Card className="p-2 bg-emerald-50 border-emerald-200">
                          <p className="text-xs text-emerald-800">{aiInsight.nextAction}</p>
                        </Card>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-slate-400">
                    <Bot className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs">Hãy mô tả triệu chứng để AI phân tích</p>
                  </div>
                )}
              </div>
            </Card>
            {aiInsight.specialty && (
              <Button
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-sm"
                onClick={() => setActive("doctors")}
              >
                <Users className="w-4 h-4 mr-2" /> Xem bác sĩ phù hợp
              </Button>
            )}
          </div>
        </div>
      )}

      {active === "doctors" && (
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-r from-violet-50 to-teal-50 border-violet-200" style={{ borderRadius: "14px" }}>
            <div className="flex items-center gap-2 text-violet-700">
              <Sparkles className="w-4 h-4" /> <span className="text-sm font-medium">Ghép đôi bởi AI</span>
            </div>
            <p className="text-sm mt-1">Các bác sĩ dưới đây được AI chọn lựa dựa trên triệu chứng và lịch sử của bạn</p>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {DOCTORS.map(doc => (
              <Card key={doc.id} className="p-5 hover:shadow-md hover:border-emerald-100 transition-all duration-300 border border-slate-100" style={{ borderRadius: "16px" }}>
                <div className="flex items-start gap-3">
                  <Avatar className="w-14 h-14 border border-slate-100 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg">
                      {doc.name.split(" ").pop()?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800">{doc.name}</div>
                    <Badge variant="secondary" className="mt-0.5">{doc.specialty}</Badge>
                    <div className="flex items-center gap-3 text-sm mt-2">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" /> {doc.rating}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <Clock className="w-3.5 h-3.5" /> {doc.availability}
                      </span>
                    </div>
                  </div>
                </div>

                <Card className="p-3 bg-emerald-50 border-emerald-200 mt-3" style={{ borderRadius: "10px" }}>
                  <div className="text-xs font-semibold text-emerald-700 mb-1">Lý do phù hợp</div>
                  <p className="text-sm text-slate-700">{doc.matchReason}</p>
                </Card>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {doc.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setViewingDoctor(doc)}>Chi tiết</Button>
                  <Button size="sm" className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                    setSelectedDoctor(doc);
                    setActive("appointments");
                  }}>
                    Đặt lịch ngay
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {active === "appointments" && (
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 border border-slate-100 shadow-sm" style={{ borderRadius: "16px" }}>
            <h3 className="tracking-tight font-bold text-slate-800 mb-4">Đặt lịch khám</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Chọn bác sĩ</label>
                <Select value={selectedDoctor?.id.toString() || ""} onValueChange={v => setSelectedDoctor(DOCTORS.find(d => d.id === Number(v)) || null)}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Chọn bác sĩ..." /></SelectTrigger>
                  <SelectContent>
                    {DOCTORS.map(d => (
                      <SelectItem key={d.id} value={d.id.toString()}>{d.name} - {d.specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDoctor && (
                <>
                  <Card className="p-3 bg-emerald-50 border-emerald-200" style={{ borderRadius: "12px" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800">{selectedDoctor.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedDoctor.specialty}</div>
                      </div>
                      <Badge variant="outline">{selectedDoctor.nextSlot}</Badge>
                    </div>
                  </Card>

                  <div>
                    <label className="text-sm font-medium block mb-2">Chọn khung giờ</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2 rounded-xl border text-sm font-medium transition ${
                            selectedSlot === slot
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Tóm tắt triệu chứng</label>
                    <Textarea
                      rows={4}
                      placeholder="Mô tả ngắn gọn triệu chứng để bác sĩ chuẩn bị..."
                      value={appointmentNotes}
                      onChange={e => setAppointmentNotes(e.target.value)}
                      className="rounded-xl border-slate-200"
                    />
                  </div>
                </>
              )}

              <Button
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                onClick={bookAppointment}
                disabled={!selectedDoctor || !selectedSlot}
              >
                <CalendarCheck className="w-4 h-4 mr-2" /> Xác nhận đặt lịch
              </Button>
            </div>
          </Card>
        </div>
      )}

      {active === "history" && (
        <div className="space-y-4">
          <Card className="p-4 border border-slate-100" style={{ borderRadius: "14px" }}>
            <h4 className="tracking-tight font-bold text-slate-800 mb-1">Lịch sử tư vấn</h4>
            <p className="text-sm text-muted-foreground">Lịch sử tư vấn AI và các khuyến nghị</p>
          </Card>

          {HISTORY.map(h => (
            <Card
              key={h.id}
              className="p-4 border border-slate-100 hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer"
              style={{ borderRadius: "14px" }}
              onClick={() => setViewingHistory(h)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={h.severity === "Khẩn cấp" ? "destructive" : h.severity === "Cao" ? "default" : "secondary"}>
                      {h.severity}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{h.date}</span>
                    <Badge variant="outline">{h.specialty}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><b>Triệu chứng đã thảo luận:</b> {h.symptoms.join(", ")}</div>
                    <div className="text-muted-foreground"><b>Khuyến nghị hành động:</b> {h.actions[0]}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="rounded-xl">Xem chi tiết</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {active === "library" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ARTICLES.map((a, i) => (
            <Card
              key={i}
              className="overflow-hidden bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-md transition-all duration-300 cursor-pointer group"
              style={{ borderRadius: "20px" }}
              onClick={() => setReadingArticle(a)}
            >
              <div className="h-32 relative overflow-hidden">
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]" style={{ background: a.cover }} />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition" />
                <span className="absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-lg bg-white/90 backdrop-blur text-[10px] font-bold text-slate-700 border border-white/20 shadow-sm">{a.c}</span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-800 text-sm tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-1">{a.t}</h4>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{a.lead}</p>
                <div className="text-[11px] mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between font-semibold">
                  <span className="text-slate-600">{a.author}</span>
                  <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{a.d}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đặt lịch</DialogTitle>
            <DialogDescription>Vui lòng kiểm tra lại thông tin</DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Bác sĩ</div>
                  <div className="mt-0.5 font-medium">{selectedDoctor.name}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Chuyên khoa</div>
                  <div className="mt-0.5 font-medium">{selectedDoctor.specialty}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Thời gian</div>
                  <div className="mt-0.5 font-medium">{selectedSlot}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Ngày</div>
                  <div className="mt-0.5 font-medium">Hôm nay</div>
                </div>
              </div>
              {appointmentNotes && (
                <Card className="p-3 bg-slate-50 border-slate-100">
                  <div className="text-xs text-muted-foreground mb-1">Ghi chú</div>
                  <p className="text-sm">{appointmentNotes}</p>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowConfirm(false)}>Hủy</Button>
            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={confirmBooking}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingDoctor} onOpenChange={() => setViewingDoctor(null)}>
        <DialogContent>
          {viewingDoctor && (
            <>
              <DialogHeader className="text-left">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-slate-100">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                      {viewingDoctor.name.split(" ").pop()?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{viewingDoctor.name}</DialogTitle>
                    <DialogDescription>{viewingDoctor.specialty}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Đánh giá</div>
                  <div className="mt-1 flex items-center gap-1 font-semibold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{viewingDoctor.rating}/5.0</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Slot tiếp theo</div>
                  <div className="mt-1 font-medium">{viewingDoctor.nextSlot}</div>
                </div>
              </div>
              <Card className="p-3 bg-emerald-50 border-emerald-200" style={{ borderRadius: "10px" }}>
                <div className="text-xs font-semibold text-emerald-700 mb-1">Lý do phù hợp</div>
                <p className="text-sm text-slate-700">{viewingDoctor.matchReason}</p>
              </Card>
              <div>
                <div className="text-sm font-medium mb-2">Chuyên môn</div>
                <div className="flex flex-wrap gap-1.5">
                  {viewingDoctor.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={() => setViewingDoctor(null)}>Đóng</Button>
                <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  setSelectedDoctor(viewingDoctor);
                  setViewingDoctor(null);
                  setActive("appointments");
                }}>
                  Đặt lịch
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingHistory} onOpenChange={() => setViewingHistory(null)}>
        <DialogContent className="max-w-2xl">
          {viewingHistory && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>Tóm tắt tư vấn AI</DialogTitle>
                <DialogDescription>{viewingHistory.date}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Triệu chứng đã thảo luận</div>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingHistory.symptoms.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Đánh giá mức độ</div>
                  <Badge variant={viewingHistory.severity === "Khẩn cấp" ? "destructive" : "secondary"}>
                    {viewingHistory.severity}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Khuyến nghị hành động</div>
                  <div className="space-y-1.5">
                    {viewingHistory.actions.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Chuyên khoa đề xuất</div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{viewingHistory.specialty}</Badge>
                </div>
                <Card className="p-3 bg-amber-50 border-amber-200" style={{ borderRadius: "10px" }}>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <b>Khuyến nghị đặt lịch:</b> {viewingHistory.bookingRec}
                    </div>
                  </div>
                </Card>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={() => setViewingHistory(null)}>Đóng</Button>
                <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  setViewingHistory(null);
                  setActive("doctors");
                }}>
                  Đặt lịch với chuyên gia
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!readingArticle} onOpenChange={() => setReadingArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {readingArticle && (
            <>
              <div className="h-40 relative" style={{ background: readingArticle.cover }}>
                <Badge variant="secondary" className="absolute bottom-3 left-6 bg-white/90 backdrop-blur">{readingArticle.c}</Badge>
              </div>
              <div className="px-6 pb-6">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl tracking-tight">{readingArticle.t}</DialogTitle>
                  <DialogDescription>{readingArticle.author} • {readingArticle.date} • {readingArticle.d}</DialogDescription>
                </DialogHeader>
                <p className="mt-4 text-base leading-relaxed text-slate-700 italic border-l-4 border-emerald-300 pl-3">
                  {readingArticle.lead}
                </p>
                <div className="mt-5 space-y-4">
                  {readingArticle.sections.map((s, idx) => (
                    <section key={idx}>
                      <h4 className="tracking-tight text-slate-900">{s.h}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700">{s.p}</p>
                    </section>
                  ))}
                </div>
                <DialogFooter className="mt-6">
                  <Button variant="outline" className="rounded-xl" onClick={() => { toast.success("Đã lưu vào mục yêu thích"); }}>Lưu bài viết</Button>
                  <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => setReadingArticle(null)}>Đóng</Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
