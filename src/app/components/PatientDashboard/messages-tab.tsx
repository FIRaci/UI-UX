import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { store, formatRelative } from "../../store";

export function MessagesTab({
  threads, activeThreadId, setActiveThreadId, reply, setReply, onSendReply, onNewThread
}: {
  threads: any[];
  activeThreadId: number | null;
  setActiveThreadId: (id: number) => void;
  reply: string;
  setReply: (v: string) => void;
  onSendReply: () => void;
  onNewThread: () => void;
}) {
  const activeThread = threads.find(t => t.id === activeThreadId) ?? null;

  return (
    <Card className="p-0 overflow-hidden h-[calc(100vh-12rem)] animate-fade-in">
      <div className="grid grid-cols-[300px_1fr] h-full">
        <div className="border-r overflow-auto">
          <div className="p-3 border-b flex items-center justify-between">
            <span className="text-sm">Hội thoại ({threads.length})</span>
            <Button size="sm" variant="outline" onClick={onNewThread}><Plus className="w-3.5 h-3.5 mr-1" />Mới</Button>
          </div>
          {threads.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveThreadId(t.id)}
              className={`w-full p-3 flex items-start gap-3 border-b hover:bg-slate-50 text-left ${activeThreadId === t.id ? "bg-sky-50" : ""}`}
            >
              <Avatar><AvatarFallback className="bg-sky-100 text-sky-700">{t.staffName.split(" ").pop()?.[0]}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="truncate">{t.staffName}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{formatRelative(t.updatedAt)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{t.topic}</div>
                <div className="text-sm text-muted-foreground truncate mt-0.5">{t.last}</div>
              </div>
            </button>
          ))}
          {threads.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">Chưa có hội thoại</div>}
        </div>
        <div className="flex flex-col">
          {activeThread ? (
            <>
              <div className="border-b p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback className="bg-sky-100 text-sky-700">{activeThread.staffName.split(" ").pop()?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <div>{activeThread.staffName}</div>
                    <div className="text-xs text-muted-foreground">{activeThread.staffSpec} • {activeThread.status}</div>
                  </div>
                </div>
                {activeThread.status !== "Đã kết thúc" && (
                  <Button size="sm" variant="outline" onClick={() => {
                    store.setThreadStatus(activeThread.id, "Đã kết thúc");
                    toast.success("Đã kết thúc cuộc tư vấn");
                  }}>Kết thúc</Button>
                )}
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  {activeThread.msgs.map((m: any, i: number) => (
                    <div key={i} className={`flex ${m.f === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.f === "user" ? "bg-sky-500 text-white rounded-br-sm" : "bg-slate-100 rounded-bl-sm"}`}>
                        {m.txt}
                        {m.t && <div className={`text-[10px] mt-0.5 ${m.f === "user" ? "text-white/70" : "text-muted-foreground"}`}>{m.t}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {activeThread.status !== "Đã kết thúc" ? (
                <div className="p-3 border-t flex gap-2">
                  <Input placeholder="Nhập tin nhắn..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === "Enter" && onSendReply()} />
                  <Button size="icon" onClick={onSendReply}><Send className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="p-3 border-t text-center text-sm text-muted-foreground">Hội thoại đã kết thúc</div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Chọn hội thoại hoặc bắt đầu mới</div>
          )}
        </div>
      </div>
    </Card>
  );
}
