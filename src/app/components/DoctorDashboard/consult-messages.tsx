import { Card } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Send } from "lucide-react";
import { formatRelative, type Thread } from "../../store";

type Props = {
  threads: Thread[];
  activeThreadId: number | null;
  setActiveThreadId: (v: number | null) => void;
  activeThread: Thread | null;
  reply: string;
  setReply: (v: string) => void;
  sendReply: () => void;
};

export function ConsultMessages({
  threads, activeThreadId, setActiveThreadId,
  activeThread, reply, setReply, sendReply,
}: Props) {
  return (
    <Card className="p-0 overflow-hidden h-[calc(100vh-12rem)] animate-fade-in">
      <div className="grid grid-cols-[300px_1fr] h-full">
        <div className="border-r overflow-auto">
          <div className="p-3 border-b"><span className="text-sm">Tin nhắn tư vấn ({threads.length})</span></div>
          {threads.map(t => (
            <button key={t.id} onClick={() => setActiveThreadId(t.id)}
              className={`w-full p-3 flex items-start gap-3 border-b hover:bg-slate-50 text-left ${activeThread?.id === t.id ? "bg-violet-50" : ""}`}>
              <Avatar><AvatarFallback className="bg-violet-100 text-violet-700">{t.userName[0]}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="truncate">{t.userName}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{formatRelative(t.updatedAt)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{t.userRole === "benhnhan" ? "Bệnh nhân" : "Người tư vấn"} • {t.topic}</div>
                <div className="text-sm text-muted-foreground truncate mt-0.5">{t.last}</div>
                {t.status === "Chờ phản hồi" && <Badge className="mt-1 bg-amber-100 text-amber-700 border border-amber-200">Cần phản hồi</Badge>}
              </div>
            </button>
          ))}
          {threads.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">Chưa có tin nhắn</div>}
        </div>
        <div className="flex flex-col">
          {activeThread ? (
            <>
              <div className="border-b p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback className="bg-violet-100 text-violet-700">{activeThread.userName[0]}</AvatarFallback></Avatar>
                  <div>
                    <div>{activeThread.userName}</div>
                    <div className="text-xs text-muted-foreground">{activeThread.userRole === "benhnhan" ? "Bệnh nhân" : "Người tư vấn"} • {activeThread.topic}</div>
                  </div>
                </div>
                {activeThread.status === "Đã kết thúc" && <Badge variant="outline">Đã kết thúc</Badge>}
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  {activeThread.msgs.map((m, i) => (
                    <div key={i} className={`flex ${m.f === "staff" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.f === "staff" ? "bg-violet-500 text-white rounded-br-sm" : "bg-slate-100 rounded-bl-sm"}`}>
                        {m.txt}
                        {m.t && <div className={`text-[10px] mt-0.5 ${m.f === "staff" ? "text-white/70" : "text-muted-foreground"}`}>{m.t}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {activeThread.status !== "Đã kết thúc" ? (
                <div className="p-3 border-t flex gap-2">
                  <Input placeholder="Nhập câu trả lời..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === "Enter" && sendReply()} />
                  <Button size="icon" onClick={sendReply}><Send className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="p-3 border-t text-center text-sm text-muted-foreground">Hội thoại đã kết thúc</div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Chọn tin nhắn để xem</div>
          )}
        </div>
      </div>
    </Card>
  );
}
