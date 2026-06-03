import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Plus, Send, Video, Phone, PhoneOff, Mic, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { store, formatRelative } from "../../store";

const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

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
  const [callOn, setCallOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [chatMode, setChatMode] = useState<"video" | "chat">("chat");
  const [callDuration, setCallDuration] = useState(0);

  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval>>();

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = s;
      if (selfVideoRef.current) selfVideoRef.current.srcObject = s;
      setCallOn(true);
      setChatMode("video");
      toast.success("Đã kết nối camera & mic");
    } catch { toast.error("Không thể truy cập camera/mic"); }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (selfVideoRef.current) selfVideoRef.current.srcObject = null;
    setCallOn(false);
  }, []);

  useEffect(() => {
    if (callOn) {
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [callOn]);

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setMicOn(p => !p);
      toast.info(micOn ? "Đã tắt mic" : "Đã bật mic");
    } else { toast.error("Chưa kết nối cuộc gọi"); }
  };

  const activeThread = threads.find(t => t.id === activeThreadId) ?? null;

  return (
    <Card className="p-0 overflow-hidden h-[calc(100vh-12rem)] animate-fade-in">
      <div className="grid grid-cols-[300px_1fr] h-full">
        <div className="border-r overflow-auto">
          <div className="p-3 border-b flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">Hội thoại ({threads.length})</span>
            <Button size="sm" variant="outline" className="active:scale-95 transition-all text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" onClick={onNewThread}><Plus className="w-3.5 h-3.5 mr-1" />Mới</Button>
          </div>
          {threads.map(t => (
            <div
              key={t.id}
              className={`group w-full p-4 flex items-start gap-3 border-b transition-all hover:bg-slate-50 ${activeThreadId === t.id ? "bg-sky-50 border-sky-100" : ""}`}
            >
              <button
                onClick={() => { setActiveThreadId(t.id); setChatMode("chat"); }}
                className="flex-1 flex items-start gap-3 text-left active:scale-[0.98]"
              >
                <div className="relative shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-sky-100 text-sky-700 text-lg font-bold">
                      {t.staffName.split(" ").pop()?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {t.status === "Chờ phản hồi" && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-sm ${t.status === "Chờ phản hồi" ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>{t.staffName}</span>
                    <span className={`text-[11px] shrink-0 ${t.status === "Chờ phản hồi" ? "font-bold text-sky-600" : "text-slate-400"}`}>{formatRelative(t.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-slate-500 line-clamp-1">
                      {t.last}
                    </span>
                  </div>
                </div>
              </button>
              <button
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-100 transition-all shrink-0 mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Xóa hội thoại này?")) {
                    store.deleteThread(t.id);
                    if (activeThreadId === t.id) {
                      setActiveThreadId(threads.find(x => x.id !== t.id)?.id || 0);
                    }
                    toast.success("Đã xóa hội thoại");
                  }
                }}
                title="Xóa hội thoại"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
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
                <div className="flex items-center gap-2">
                  {activeThread.status !== "Đã kết thúc" && (
                    <>
                      <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
                        <Button size="sm" variant={chatMode === "chat" ? "default" : "ghost"} className="h-7 rounded-md text-xs" onClick={() => setChatMode("chat")}>
                          <MessageCircle className="w-3.5 h-3.5 mr-1" />Chat
                        </Button>
                        <Button
                          size="sm"
                          variant={chatMode === "video" ? "default" : "ghost"}
                          className="h-7 rounded-md text-xs"
                          onClick={() => { if (!callOn) startCamera(); else setChatMode("video"); }}
                        >
                          <Video className="w-3.5 h-3.5 mr-1" />Video
                        </Button>
                      </div>
                      <Button size="sm" variant="destructive" className="active:scale-95 transition-all h-8 opacity-70 hover:opacity-100" onClick={() => {
                        if (window.confirm("Bạn có chắc muốn kết thúc hội thoại này?")) {
                          store.setThreadStatus(activeThread.id, "Đã kết thúc");
                          if (callOn) stopCamera();
                          toast.success("Đã kết thúc hội thoại");
                        }
                      }}>Kết thúc hội thoại</Button>
                    </>
                  )}
                </div>
              </div>
              {chatMode === "video" ? (
                <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
                  {callOn ? (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <div className="text-center text-white/50">
                        <Video className="w-12 h-12 mx-auto mb-2 opacity-40" />
                        <div className="text-sm">Camera bác sĩ</div>
                        <div className="text-xs mt-1 text-white/30">(Đang chờ kết nối...)</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Phone className="w-10 h-10 mx-auto text-white/20 mb-3" />
                      <div className="text-white/40 text-sm mb-4">Chưa kết nối cuộc gọi</div>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6" onClick={startCamera}>
                        <Phone className="w-4 h-4 mr-2" /> Bắt đầu gọi
                      </Button>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 w-36 h-24 bg-slate-700 rounded-lg border-2 border-white/30 overflow-hidden">
                    <video ref={selfVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    {!callOn && <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs bg-slate-800/80">Bạn</div>}
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {callOn ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Đang gọi • {fmtTime(callDuration)}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-600 text-white/70 text-[11px]">Chưa kết nối</span>
                    )}
                  </div>
                  {callOn && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      <Button size="icon" variant="secondary" className={`rounded-full w-10 h-10 ${!micOn ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}`} onClick={toggleMic}>
                        {micOn ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4 line-through" />}
                      </Button>
                      <Button size="icon" className="bg-rose-600 hover:bg-rose-700 text-white rounded-full w-10 h-10" onClick={() => { stopCamera(); toast.info("Đã kết thúc cuộc gọi"); }}>
                        <PhoneOff className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
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
                      <Input placeholder="Nhập tin nhắn..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === "Enter" && onSendReply()} className="rounded-xl border-slate-200 focus-visible:ring-sky-500" />
                      <Button size="icon" onClick={onSendReply} className="rounded-xl active:scale-95 transition-all bg-sky-500 hover:bg-sky-600"><Send className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <div className="p-3 border-t text-center text-sm text-muted-foreground">Hội thoại đã kết thúc</div>
                  )}
                </>
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
