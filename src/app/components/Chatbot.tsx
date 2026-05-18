import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { Bot, X, Send, Sparkles } from "lucide-react";

const SUGGESTIONS: Record<string, string[]> = {
  benhnhan: ["Tôi bị đau đầu kéo dài", "Gợi ý bác sĩ tim mạch", "Đặt lịch khám tổng quát"],
  tuvan: ["Tôi muốn được tư vấn tâm lý", "Chế độ dinh dưỡng phù hợp"],
  bacsi: ["Tóm tắt hồ sơ bệnh nhân hôm nay", "Lịch khám tuần này"],
  chuyengia: ["Tài liệu nghiên cứu mới", "Lên lịch hội chẩn"],
  quanly: ["Doanh thu tháng này", "Số lượt khám tuần qua"],
};

export function Chatbot({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ from: "bot" | "me"; text: string }[]>([
    { from: "bot", text: "Xin chào! Tôi là trợ lý AI MediCare. Tôi có thể giúp gì cho bạn hôm nay?" },
  ]);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMessages(m => [...m, { from: "me", text: t }]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [
        ...m,
        {
          from: "bot",
          text:
            "Cảm ơn bạn. Đây là phản hồi mô phỏng từ AI Chatbot. Để có chẩn đoán chính xác, vui lòng đặt lịch khám với bác sĩ chuyên khoa phù hợp.",
        },
      ]);
    }, 600);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-50"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}
      {open && (
        <Card className="fixed bottom-20 right-6 w-[380px] h-[540px] shadow-2xl flex flex-col z-50 overflow-hidden p-0">
          <div className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div>MediCare AI</div>
                <div className="text-xs opacity-80">Trợ lý y tế thông minh</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded hover:bg-white/20">
              <X className="w-4 h-4" />
            </button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      m.from === "me"
                        ? "bg-sky-500 text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
            {(SUGGESTIONS[role] ?? []).map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
            />
            <Button size="icon" onClick={() => send()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
