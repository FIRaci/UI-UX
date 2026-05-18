import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { Bot, X, Send, Sparkles, AlertTriangle, Calendar, Search } from "lucide-react";
import { toast } from "sonner";
import { store } from "../store";

type MessageAction = {
  label: string;
  icon?: any;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary";
};

type Message = {
  from: "bot" | "me";
  text: string;
  actions?: MessageAction[];
};

const SUGGESTIONS: Record<string, string[]> = {
  benhnhan: ["Tôi bị đau đầu kéo dài", "Hôm nay tôi thấy hơi mệt", "Tôi muốn đặt lịch khám"],
  tuvan: ["Tôi muốn được tư vấn tâm lý", "Chế độ dinh dưỡng phù hợp"],
  bacsi: ["Tóm tắt hồ sơ bệnh nhân hôm nay", "Lịch khám tuần này"],
  chuyengia: ["Tài liệu nghiên cứu mới", "Lên lịch hội chẩn"],
  quanly: ["Doanh thu tháng này", "Số lượt khám tuần qua"],
};

export function Chatbot({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Xin chào! Tôi là trợ lý chuyên gia AI MediCare. Tôi có thể phân tích triệu chứng và giúp bạn thao tác nhanh trên hệ thống. Bạn đang cảm thấy thế nào?" },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const processIntent = (t: string): Omit<Message, "from"> => {
    const text = t.toLowerCase();
    
    if (text.includes("đau đầu") || text.includes("chóng mặt") || text.includes("đau lưng")) {
      return {
        text: "Dựa trên hồ sơ của bạn và dữ liệu y khoa, triệu chứng này có thể do căng thẳng hoặc thay đổi huyết áp. Tuy nhiên, AI không thể thay thế chẩn đoán y khoa. Hãy đặt lịch khám ngay với bác sĩ chuyên khoa để được tư vấn chính xác nhất.",
        actions: [
          { label: "Tìm bác sĩ", icon: <Search className="w-3.5 h-3.5 mr-1.5" />, onClick: () => { window.dispatchEvent(new CustomEvent("app:navigate", { detail: "search" })); setOpen(false); } }
        ]
      };
    }
    
    if (text.includes("mệt") || text.includes("không ổn") || text.includes("khó thở") || text.includes("đau ngực")) {
      return {
        text: "⚠️ Hệ thống AI nhận thấy các từ khóa nguy cơ cao. Đây có thể là dấu hiệu cảnh báo khẩn cấp về tim mạch hoặc hô hấp. Tôi đã chuẩn bị sẵn lệnh gửi thông báo khẩn cấp đến bác sĩ phụ trách của bạn (BS. Nguyễn Văn An). Bạn có muốn gửi ngay không?",
        actions: [
          { variant: "destructive", label: "Gửi báo động cho Bác sĩ", icon: <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />, onClick: () => {
              store.addThread({
                staffId: 2, staffName: "BS. Nguyễn Văn An", staffSpec: "Tim mạch",
                userRole: "benhnhan", userName: "Nguyễn Minh Khoa", topic: "CẢNH BÁO SỨC KHỎE",
                status: "Chờ phản hồi", last: "Bệnh nhân báo cáo: " + t,
                msgs: [{ f: "user", txt: `Tôi cảm thấy không ổn: ${t}`, t: "Vừa xong" }]
              });
              toast.error("Đã gửi cảnh báo khẩn cấp đến Bác sĩ phụ trách!");
              setOpen(false);
          }}
        ]
      };
    }

    if (text.includes("lịch") || text.includes("khám")) {
      return {
        text: "Bạn có thể quản lý lịch hẹn hiện tại hoặc đặt lịch hẹn mới tại các phòng khám của chúng tôi. Bạn muốn thực hiện thao tác nào?",
        actions: [
          { label: "Lịch hẹn của tôi", icon: <Calendar className="w-3.5 h-3.5 mr-1.5" />, onClick: () => { window.dispatchEvent(new CustomEvent("app:navigate", { detail: "appointments" })); setOpen(false); } },
          { label: "Đặt lịch mới", icon: <Search className="w-3.5 h-3.5 mr-1.5" />, onClick: () => { window.dispatchEvent(new CustomEvent("app:navigate", { detail: "search" })); setOpen(false); } }
        ]
      };
    }

    return {
      text: "Tôi hiểu rồi. Dữ liệu này sẽ được lưu vào hệ thống phân tích AI để các chuyên gia có thể tham khảo trong lần khám tới của bạn. Nếu cần hỗ trợ thêm thao tác nào, hãy nói với tôi nhé."
    };
  };

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
          ...processIntent(t)
        },
      ]);
    }, 600);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
<<<<<<< HEAD
          className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-50"
=======
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-50 animate-bounce"
>>>>>>> 187e3e5cc9fc7c8b08134ec4f6be1c5fa6a09c39
        >
          <Bot className="w-6 h-6" />
        </button>
      )}
      {open && (
<<<<<<< HEAD
        <Card className="fixed bottom-20 right-6 w-[380px] h-[540px] shadow-2xl flex flex-col z-50 overflow-hidden p-0">
          <div className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white p-4 flex items-center justify-between">
=======
        <Card className="fixed bottom-6 right-6 w-[380px] h-[580px] shadow-2xl flex flex-col z-50 overflow-hidden p-0 animate-fade-in" style={{ borderRadius: "24px" }}>
          <div className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white p-4 flex items-center justify-between shadow-sm">
>>>>>>> 187e3e5cc9fc7c8b08134ec4f6be1c5fa6a09c39
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold">Chuyên gia AI</div>
                <div className="text-xs opacity-90">Hỗ trợ 24/7</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <ScrollArea className="flex-1 p-4 bg-slate-50/50">
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col gap-2 ${m.from === "me" ? "items-end" : "items-start"}`}>
                  <div className={`flex items-end gap-2 max-w-[85%]`}>
                    {m.from === "bot" && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`px-3.5 py-2.5 text-sm shadow-sm leading-relaxed ${
                        m.from === "me"
                          ? "bg-sky-500 text-white rounded-2xl rounded-br-sm"
                          : "bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1 w-full pl-8">
                      {m.actions.map((act, idx) => (
                        <Button
                          key={idx}
                          variant={act.variant || "default"}
                          size="sm"
                          className={`justify-start h-9 rounded-xl text-xs w-max shadow-sm ${!act.variant ? "bg-slate-900 hover:bg-slate-800" : ""}`}
                          onClick={act.onClick}
                        >
                          {act.icon}
                          {act.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="px-3 pb-2 pt-2 bg-white flex gap-1.5 flex-wrap border-t border-slate-100">
            {(SUGGESTIONS[role] ?? []).map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-2.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors font-medium"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="p-3 bg-white flex gap-2">
            <Input
              placeholder="Nhập triệu chứng hoặc câu hỏi..."
              value={input}
              className="rounded-xl border-slate-200 focus-visible:ring-sky-500/20"
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
            />
            <Button size="icon" onClick={() => send()} className="rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
