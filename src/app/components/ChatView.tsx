import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Bot, Send, Sparkles, AlertCircle, Users } from "lucide-react";
import { toast } from "sonner";

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8000";

const ROLE_CONFIG: Record<string, { welcome: string; prompts: string[]; avatar: string }> = {
  benhnhan: {
    welcome: "Xin chào! Tôi là trợ lý sức khỏe AI của MediCare. Tôi có thể giúp gì cho bạn hôm nay? Vui lòng mô tả triệu chứng của bạn để tôi phân tích.",
    prompts: ["Tôi bị đau đầu", "Tôi bị sốt", "Tôi bị đau bụng", "Tôi mệt mỏi"],
    avatar: "BN",
  },
  bacsi: {
    welcome: "Xin chào bác sĩ! Tôi là trợ lý AI hỗ trợ chẩn đoán. Tôi có thể phân tích hồ sơ bệnh án và đề xuất hướng điều trị.",
    prompts: ["Phân tích hồ sơ bệnh nhân", "Đề xuất chẩn đoán", "Kiểm tra tương tác thuốc", "Tra cứu y văn"],
    avatar: "BS",
  },
  tuvan: {
    welcome: "Xin chào! Tôi là trợ lý AI hỗ trợ tư vấn. Hãy cho tôi biết bạn cần hỗ trợ gì về đặt lịch hoặc gói khám?",
    prompts: ["Gói khám sức khỏe", "Đặt lịch hẹn", "Tư vấn sức khỏe", "Bảo hiểm y tế"],
    avatar: "TV",
  },
  quanly: {
    welcome: "Xin chào quản lý! Tôi có thể giúp bạn xem báo cáo vận hành và thống kê hệ thống.",
    prompts: ["Báo cáo vận hành", "Thống kê bệnh nhân", "Hiệu suất phòng khám", "Cảnh báo tồn kho"],
    avatar: "QL",
  },
};

const ROLE_RESPONSES: Record<string, (msg: string) => string> = {
  benhnhan: (msg: string) => {
    if (msg.includes("đau đầu") || msg.includes("nhức đầu")) return "Đau đầu có thể do nhiều nguyên nhân như căng thẳng, thiếu ngủ, hoặc vấn đề về thị lực. Bạn có thể cho tôi biết thêm: cơn đau ở vị trí nào? Đau âm ỉ hay đau nhói? Đã kéo dài bao lâu?";
    if (msg.includes("sốt") || msg.includes("nóng")) return "Sốt là phản ứng tự nhiên của cơ thể. Bạn hãy đo nhiệt độ và cho tôi biết: sốt bao nhiêu độ? Có kèm ho, đau họng hay không? Đã uống thuốc gì chưa?";
    if (msg.includes("đau bụng")) return "Đau bụng có thể do nhiều nguyên nhân khác nhau. Bạn có thể mô tả: đau ở vùng nào? Đau quặn hay âm ỉ? Có buồn nôn hoặc tiêu chảy không?";
    if (msg.includes("mệt") || msg.includes("mỏi")) return "Mệt mỏi kéo dài có thể do thiếu ngủ, thiếu dinh dưỡng hoặc các vấn đề sức khỏe tiềm ẩn. Bạn ngủ được bao nhiêu tiếng mỗi đêm? Có hoa mắt chóng mặt không?";
    return "Cảm ơn bạn đã chia sẻ! Để tôi phân tích kỹ hơn, bạn có thể cho tôi biết thêm chi tiết về tình trạng của bạn không?";
  },
  bacsi: (msg: string) => "Cảm ơn bác sĩ! Tôi đã phân tích thông tin và sẵn sàng hỗ trợ chẩn đoán. Bác sĩ có thể cung cấp thêm thông tin về triệu chứng hoặc kết quả xét nghiệm?",
  tuvan: (msg: string) => "Cảm ơn bạn! Tôi đã nhận được yêu cầu và đang tìm kiếm thông tin phù hợp. Bạn muốn đặt lịch khám ở phòng khám nào?",
  quanly: (msg: string) => "Cảm ơn quản lý! Tôi đang tổng hợp dữ liệu vận hành. Bạn muốn xem báo cáo nào trước?",
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

  const send = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMessages(m => [...m, { id: Date.now().toString(), role: "me", text: t, time: new Date() }]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages
        .filter(m => m.id !== "welcome")
        .slice(-10)
        .map(m => ({ from: m.role === "me" ? "me" : "bot", text: m.text }));

      const res = await fetch(`${AI_SERVICE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, message: t, history }),
      });

      if (res.ok) {
        const data = await res.json();
        handleAiActions(data.actions);
        setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "bot", text: data.text, time: new Date() }]);
      } else {
        throw new Error(`API ${res.status}`);
      }
    } catch {
      // fallback: local response when AI service offline
      await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
      const reply = ROLE_RESPONSES[role]?.(t) ?? "Cảm ơn bạn! Tôi đã nhận được thông tin và đang phân tích. Bạn có thể cho tôi biết thêm chi tiết được không?";
      setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "bot", text: reply, time: new Date() }]);
      // fallback actions
      if (role === "benhnhan" && (t.includes("đau") || t.includes("sốt"))) {
        handleAiActions(["WARNING_RED", "NAVIGATE_APPOINTMENT"]);
      } else if (role === "bacsi" && (t.includes("hồ sơ") || t.includes("bệnh án"))) {
        handleAiActions(["SHOW_PATIENT_HISTORY"]);
      } else if (role === "quanly" && (t.includes("báo cáo") || t.includes("doanh thu"))) {
        handleAiActions(["SHOW_REPORTS"]);
      } else if (role === "tuvan" && (t.includes("gói") || t.includes("khám"))) {
        handleAiActions(["SHOW_PACKAGES"]);
      }
    }

    setIsTyping(false);
  };

  const handleAiActions = (actions?: string[]) => {
    if (!actions?.length) return;
    for (const action of actions) {
      if (action === "WARNING_RED") toast.error("AI cảnh báo: Cần kiểm tra y tế ngay!");
      else if (action === "NAVIGATE_APPOINTMENT") {
        toast.success("AI đề xuất đặt lịch khám", {
          action: { label: "Đặt ngay", onClick: () => navigate("appointments") },
        });
      } else if (action === "SHOW_PATIENT_HISTORY") toast.info("AI đề xuất xem lịch sử bệnh án");
      else if (action === "HIGHLIGHT_CRITICAL") toast.warning("AI phát hiện dấu hiệu nghiêm trọng");
      else if (action === "SHOW_PACKAGES") toast.info("AI đề xuất gói khám phù hợp");
      else if (action === "SHOW_REPORTS") toast.info("AI đang tải báo cáo");
      else if (action === "ALERT_OVERLOAD") toast.warning("AI cảnh báo quá tải hệ thống");
    }
  };

  const navigate = (view: string) => {
    window.dispatchEvent(new CustomEvent("app:navigate", { detail: view }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 h-[calc(100vh-7.5rem)] min-h-[500px]">
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
              <div className="text-xs text-muted-foreground mb-2">Gợi ý nhanh:</div>
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
                placeholder="Nhập tin nhắn..."
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
          <div className="text-center py-4 text-slate-400">
            <Bot className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">Hãy nhắn tin để AI phân tích</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
