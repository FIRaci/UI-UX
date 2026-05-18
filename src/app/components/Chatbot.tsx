import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { Bot, X, Send, Sparkles, AlertTriangle, Calendar, Search, Users, FileText, MessagesSquare, LayoutDashboard, BookOpen, BarChart3, Bell, Briefcase, ChevronUp } from "lucide-react";
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Xin chào! Tôi là trợ lý chuyên gia AI MediCare. Tôi có thể phân tích triệu chứng và giúp bạn thao tác nhanh trên hệ thống. Bạn đang cảm thấy thế nào?" },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const navigate = (detail: string) => {
    window.dispatchEvent(new CustomEvent("app:navigate", { detail }));
    setOpen(false);
  };

  const processIntent = (t: string): Omit<Message, "from"> => {
    const text = t.toLowerCase();

    if (role === "bacsi") {
      if (text.includes("lịch") || text.includes("khám")) {
        return {
          text: "Bạn có một lịch khám hôm nay. Hãy xem danh sách bệnh nhân và quản lý ca khám trực tiếp từ bảng điều khiển.",
          actions: [
            { label: "Lịch khám hôm nay", icon: <Calendar className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("schedule") },
            { label: "Bệnh nhân chờ", icon: <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("overview") },
          ]
        };
      }
      if (text.includes("bệnh nhân") || text.includes("hồ sơ")) {
        return {
          text: "Danh sách bệnh nhân đang chờ và hồ sơ y tế sẵn sàng để bạn tra cứu.",
          actions: [
            { label: "Danh sách bệnh nhân", icon: <Users className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("patients") },
            { label: "Hồ sơ & đơn thuốc", icon: <FileText className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("records") },
          ]
        };
      }
      if (text.includes("tin nhắn") || text.includes("tư vấn")) {
        return {
          text: "Bạn có tin nhắn tư vấn từ bệnh nhân. Hãy kiểm tra và phản hồi.",
          actions: [
            { label: "Tin nhắn tư vấn", icon: <MessagesSquare className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("consult") },
          ]
        };
      }
    }

    if (role === "chuyengia") {
      if (text.includes("tài liệu") || text.includes("nghiên cứu") || text.includes("phác đồ")) {
        return {
          text: "Thư viện phác đồ SOP và tài liệu nghiên cứu y khoa đã sẵn sàng để tra cứu.",
          actions: [
            { label: "So khớp phác đồ (SOP)", icon: <BookOpen className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("knowledge") },
            { label: "Phân tích lâm sàng", icon: <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("analytics") },
          ]
        };
      }
      if (text.includes("hội chẩn") || text.includes("cấp cứu")) {
        return {
          text: "Có ca cấp cứu đang chờ hội chẩn. Hãy vào phòng hội chẩn khẩn cấp ngay.",
          actions: [
            { variant: "destructive", label: "Hội chẩn cấp cứu", icon: <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("emergency") },
          ]
        };
      }
      if (text.includes("ai") || text.includes("kịch bản")) {
        return {
          text: "Bạn có thể quản lý các kịch bản AI và luồng tư vấn tự động cho chatbot.",
          actions: [
            { label: "Quản lý kịch bản AI", icon: <Bot className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("aimgmt") },
          ]
        };
      }
    }

    if (role === "tuvan") {
      if (text.includes("tư vấn") || text.includes("tâm lý") || text.includes("chuyên gia")) {
        return {
          text: "Bạn có thể tìm chuyên gia phù hợp và bắt đầu cuộc tư vấn ngay.",
          actions: [
            { label: "Tìm chuyên gia", icon: <Search className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("find") },
            { label: "Cuộc tư vấn của tôi", icon: <MessagesSquare className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("chats") },
          ]
        };
      }
      if (text.includes("dinh dưỡng") || text.includes("tài liệu") || text.includes("kiến thức")) {
        return {
          text: "Thư viện kiến thức sức khỏe với nhiều bài viết chuyên sâu từ các chuyên gia.",
          actions: [
            { label: "Thư viện kiến thức", icon: <BookOpen className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("library") },
          ]
        };
      }
    }

    if (role === "quanly") {
      if (text.includes("doanh thu") || text.includes("báo cáo") || text.includes("thống kê")) {
        return {
          text: "Báo cáo doanh thu và thống kê vận hành phòng khám sẵn sàng để xem.",
          actions: [
            { label: "Báo cáo & thống kê", icon: <BarChart3 className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("reports") },
            { label: "Tổng quan", icon: <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("overview") },
          ]
        };
      }
      if (text.includes("lịch") || text.includes("khám")) {
        return {
          text: "Lịch khám hệ thống và quản lý bệnh nhân đang sẵn sàng.",
          actions: [
            { label: "Lịch khám hệ thống", icon: <Calendar className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("schedule") },
            { label: "Quản lý bệnh nhân", icon: <Users className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("patients") },
          ]
        };
      }
      if (text.includes("thông báo") || text.includes("nhân sự")) {
        return {
          text: "Thông báo hệ thống và quản lý nhân sự đang chờ xử lý.",
          actions: [
            { label: "Thông báo", icon: <Bell className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("notify") },
            { label: "Lịch làm việc BS", icon: <Briefcase className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("doctors") },
          ]
        };
      }
    }

    if (text.includes("đau đầu") || text.includes("chóng mặt") || text.includes("đau lưng")) {
      return {
        text: "Dựa trên hồ sơ của bạn và dữ liệu y khoa, triệu chứng này có thể do căng thẳng hoặc thay đổi huyết áp. Tuy nhiên, AI không thể thay thế chẩn đoán y khoa. Hãy đặt lịch khám ngay với bác sĩ chuyên khoa để được tư vấn chính xác nhất.",
        actions: [
          { label: "Tìm bác sĩ", icon: <Search className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("search") }
        ]
      };
    }
    
    if (text.includes("mệt") || text.includes("không ổn") || text.includes("khó thở") || text.includes("đau ngực")) {
      return {
        text: "⚠️ Hệ thống AI nhận thấy các từ khóa nguy cơ cao. Đây có thể là dấu hiệu cảnh báo khẩn cấp về tim mạch hoặc hô hấp. Tôi đã chuẩn bị sẵn lệnh gửi thông báo khẩn cấp đến bác sĩ phụ trách của bạn (BS. Nguyễn Văn An). Bạn có muốn gửi ngay không?",
        actions: [
          { variant: "destructive", label: "Gửi báo động cho Bác sĩ", icon: <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />, onClick: () => {
              const id = store.addThread({
                staffId: 2, staffName: "BS. Nguyễn Văn An", staffSpec: "Tim mạch",
                userRole: "benhnhan", userName: "Nguyễn Minh Khoa", topic: "CẢNH BÁO SỨC KHỎE",
                status: "Chờ phản hồi", last: "Bệnh nhân báo cáo: " + t,
                msgs: [{ f: "user", txt: `Tôi cảm thấy không ổn: ${t}`, t: "Vừa xong" }]
              });
              window.dispatchEvent(new CustomEvent("app:navigate", { detail: JSON.stringify({ view: "messages", threadId: id }) }));
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
          { label: "Lịch hẹn của tôi", icon: <Calendar className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("appointments") },
          { label: "Đặt lịch mới", icon: <Search className="w-3.5 h-3.5 mr-1.5" />, onClick: () => navigate("search") }
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
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-50 animate-bounce"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}
      {open && (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[580px] shadow-2xl flex flex-col z-50 overflow-hidden p-0 animate-fade-in" style={{ borderRadius: "24px" }}>
          <div className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white p-4 flex items-center justify-between shadow-sm">
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

          <ScrollArea className="flex-1 p-4 bg-slate-50/50" ref={scrollAreaRef} onScroll={e => {
            const el = e.currentTarget;
            setShowScrollTop(el.scrollTop > 150);
          }}>
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
            {showScrollTop && (
              <button
                onClick={() => scrollAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all z-10"
              >
                <ChevronUp className="w-4 h-4 text-slate-600" />
              </button>
            )}
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
