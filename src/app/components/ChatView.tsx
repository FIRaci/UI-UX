import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Bot, Send, Sparkles, AlertCircle, Users } from "lucide-react";
import { toast } from "sonner";

type Message = { id: string; role: "me" | "bot"; text: string; time: Date };

const ROLE_CONFIG: Record<string, { welcome: string; prompts: string[]; avatar: string }> = {
  benhnhan: {
    welcome: "Xin chào! Tôi là trợ lý sức khỏe AI. Bạn đang gặp vấn đề gì về sức khỏe hôm nay?",
    prompts: ["Tôi bị đau đầu", "Tôi bị sốt", "Tôi bị đau bụng", "Tôi mệt mỏi"],
    avatar: "BN",
  },
  bacsi: {
    welcome: "Xin chào bác sĩ! Tôi có thể giúp bạn tra cứu hồ sơ bệnh nhân, lịch khám, và tài liệu y khoa.",
    prompts: ["Bệnh nhân chờ hôm nay", "Lịch khám tuần này", "Tra cứu phác đồ"],
    avatar: "BS",
  },
  chuyengia: {
    welcome: "Xin chào chuyên gia! Tôi sẵn sàng hỗ trợ đánh giá heuristic, phân tích pain point và khảo sát SUS.",
    prompts: ["Phân tích UI", "Ghi nhận pain point", "Đánh giá Heuristic"],
    avatar: "CG",
  },
  tuvan: {
    welcome: "Xin chào! Tôi là trợ lý AI. Bạn cần tư vấn về vấn đề sức khỏe gì hôm nay?",
    prompts: ["Tôi cần tư vấn tâm lý", "Chế độ dinh dưỡng", "Bài tập thư giãn"],
    avatar: "TV",
  },
  quanly: {
    welcome: "Xin chào! Tôi có thể giúp bạn xem báo cáo vận hành, lịch hệ thống và thống kê doanh thu.",
    prompts: ["Báo cáo doanh thu", "Số lượt khám", "Lịch hệ thống"],
    avatar: "QL",
  },
};

const ROLE_RESPONSES: Record<string, (msg: string) => string> = {
  benhnhan: (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes("đau đầu") || lower.includes("nhức đầu")) return "Đau đầu có thể do nhiều nguyên nhân như căng thẳng, thiếu ngủ, hoặc tăng huyết áp. Bạn đã nghỉ ngơi chưa? Nếu đau kéo dài hoặc kèm theo chóng mặt, hãy đến phòng khám để được thăm khám. Tôi có thể giúp bạn đặt lịch khám ngay.";
    if (lower.includes("sốt") || lower.includes("nóng")) return "Sốt là phản ứng tự nhiên của cơ thể chống lại nhiễm trùng. Bạn hãy đo nhiệt độ, uống nhiều nước và nghỉ ngơi. Nếu sốt trên 39°C kéo dài hơn 2 ngày, hoặc kèm khó thở, hãy đến cơ sở y tế gần nhất.";
    if (lower.includes("đau bụng")) return "Đau bụng có thể do rối loạn tiêu hóa, viêm dạ dày, hoặc ngộ độc thực phẩm. Bạn có kèm theo buồn nôn, tiêu chảy hay sốt không? Hãy mô tả thêm để tôi phân tích chính xác hơn.";
    if (lower.includes("mệt") || lower.includes("mỏi")) return "Mệt mỏi kéo dài có thể do thiếu máu, rối loạn giấc ngủ, hoặc căng thẳng. Bạn có thường xuyên thức khuya không? Một chế độ dinh dưỡng cân bằng và ngủ đủ 7-8 tiếng sẽ cải thiện đáng kể.";
    return "Cảm ơn bạn đã chia sẻ. Để tôi phân tích chính xác hơn, bạn có thể mô tả thêm chi tiết về triệu chứng của mình không? Ví dụ: triệu chứng bắt đầu khi nào, mức độ thế nào?";
  },
  bacsi: (_) => {
    return "Dữ liệu hồ sơ bệnh nhân đã được tải. Hôm nay có 5 ca chờ khám, trong đó 1 ca khẩn cấp (Trần Văn Hậu - đau ngực dữ dội). Bạn có muốn tôi hiển thị lịch sử bệnh án của bệnh nhân này không?";
  },
  chuyengia: (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes("ui") || lower.includes("giao diện") || lower.includes("design")) return "Phân tích UI nhanh: Giao diện MediCare AI sử dụng tông màu xanh dương - xanh lá (blue/emerald) thể hiện sự tin cậy và sức khỏe. Các dashboard có cấu trúc sidebar rõ ràng. Gợi ý cải thiện: thêm breadcrumb cho navigation sâu hơn, tối ưu contrast cho người lớn tuổi.";
    if (lower.includes("pain point") || lower.includes("lỗi")) return "Pain points đã ghi nhận: 2 báo cáo từ tuần này — (1) Khó hủy lịch từ dashboard bệnh nhân, (2) Thiếu bộ lọc trong biểu đồ quản lý. Khuyến nghị: thêm nút Hủy trực tiếp trên thẻ lịch hẹn.";
    return "Chào chuyên gia! Tôi sẵn sàng hỗ trợ đánh giá Heuristic (10 nguyên tắc Nielsen), ghi nhận Pain Points hoặc phân tích SUS Survey. Bạn muốn bắt đầu với phần nào?";
  },
  tuvan: (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes("tâm lý") || lower.includes("stress") || lower.includes("lo âu")) return "Tư vấn tâm lý: Căng thẳng và lo âu là phản ứng bình thường, nhưng nếu kéo dài có thể ảnh hưởng sức khỏe. Một số kỹ thuật thư giãn: hít thở sâu 4-7-8, thiền 10 phút/ngày, tập thể dục nhẹ. Bạn có muốn tôi gợi ý các gói tư vấn tâm lý phù hợp không?";
    if (lower.includes("dinh dưỡng") || lower.includes("ăn") || lower.includes("diet")) return "Chế độ dinh dưỡng: Bạn nên ăn đa dạng thực phẩm, ưu tiên rau xanh (3-5 phần/ngày), protein nạc (cá, ức gà), và uống đủ 2 lít nước. Tránh đồ ăn nhanh và nước ngọt có ga. Tôi có thể gợi ý thực đơn mẫu cho bạn!";
    if (lower.includes("tập") || lower.includes("yoga") || lower.includes("thể dục")) return "Bài tập thư giãn: Yoga nhẹ nhàng 15-20 phút/ngày giúp giảm căng thẳng và cải thiện tuần hoàn máu. Bạn có thể bắt đầu với tư thế em bé (Child's Pose), tư thế mèo - bò (Cat-Cow), và tư thế xác chết (Savasana).";
    return "Xin chào! Tôi là trợ lý tư vấn sức khỏe. Bạn cần hỗ trợ về vấn đề gì hôm nay? Tôi có thể tư vấn tâm lý, dinh dưỡng, hoặc gợi ý bài tập thư giãn.";
  },
  quanly: (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes("doanh thu")) return "Báo cáo doanh thu tháng này: Tổng doanh thu dự kiến 1.28 tỷ đồng (+12.5% so với tháng trước). Phòng khám Tim mạch dẫn đầu với 31.8% doanh thu. 223 bệnh nhân mới trong tháng. Bạn có muốn xem báo cáo chi tiết không?";
    if (lower.includes("lượt khám") || lower.includes("bệnh nhân")) return "Số liệu hôm nay: 42 lượt khám, trong đó 15 bệnh nhân mới. Tỷ lệ lấp đầy lịch đạt 78%. Phòng khám CN Quận 1 đang đông nhất (28 lượt). Hệ thống đang hoạt động ở mức ổn định.";
    return "Xin chào quản lý! Bảng điều khiển đã sẵn sàng. Hôm nay có 42 lượt khám, doanh thu ước tính 87 triệu đồng. Bạn muốn xem báo cáo nào? Tôi có thể hiển thị doanh thu, số lượt khám, hoặc tình trạng lịch hệ thống.";
  },
};

export function ChatView({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.benhnhan;
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "bot", text: config.welcome, time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMessages(m => [...m, { id: Date.now().toString(), role: "me", text: t, time: new Date() }]);
    setInput("");
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const reply = ROLE_RESPONSES[role]?.(t) ?? "Cảm ơn bạn! Tôi đã nhận được thông tin và đang phân tích. Bạn có thể cho tôi biết thêm chi tiết được không?";
        setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "bot", text: reply, time: new Date() }]);
      } catch {
        setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "bot", text: "Xin lỗi, tôi đang gặp sự cố xử lý. Vui lòng thử lại sau.", time: new Date() }]);
      }
      setIsTyping(false);
    }, 1000 + Math.random() * 800);
  };

  const navigate = (view: string) => {
    window.dispatchEvent(new CustomEvent("app:navigate", { detail: view }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 h-[calc(100vh-12rem)]">
      <div className="flex flex-col min-h-0">
        <Card className="p-3 mb-3 bg-amber-50 border-amber-200 flex items-start gap-2" style={{ borderRadius: "12px" }}>
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <b>Luu y:</b> Ket qua AI chi mang tinh ho tro tham khao va khong thay the chan doan y khoa chuyen nghiep.
          </p>
        </Card>

        <Card className="flex-1 overflow-hidden flex flex-col p-0 border border-slate-100 shadow-sm" style={{ borderRadius: "16px" }}>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === "me" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-emerald-600" />
                      </div>
                    )}
                    {msg.role === "me" && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">{config.avatar}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div className={`px-4 py-2.5 rounded-2xl ${
                        msg.role === "bot"
                          ? "bg-slate-100 text-slate-900 rounded-tl-sm"
                          : "bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-tr-none"
                      }`}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.text}</p>
                      </div>
                      <div className={`text-[11px] text-muted-foreground mt-1 px-1 ${msg.role === "me" ? "text-right" : ""}`}>
                        {msg.time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
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

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {messages.length === 1 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <div className="text-xs text-muted-foreground mb-2">Goi y nhanh:</div>
              <div className="flex flex-wrap gap-2">
                {config.prompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => send(p)}
                    className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition text-sm"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex gap-2 items-end max-w-3xl mx-auto">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                placeholder="Nhap tin nhan..."
                className="resize-none min-h-[48px] max-h-32 rounded-xl border-slate-200"
                rows={1}
              />
              <Button
                size="icon"
                className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-sm"
                onClick={() => send(input)}
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center">Nhan Enter de gui, Shift+Enter de xuong dong</p>
          </div>
        </Card>
      </div>

      <div className="space-y-3 hidden xl:block">
        <Card className="p-4 border border-slate-100 shadow-sm" style={{ borderRadius: "16px" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">Phan tich AI</h4>
          </div>
          <div className="text-center py-4 text-slate-400">
            <Bot className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">Hay nhan tin de AI phan tich</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
