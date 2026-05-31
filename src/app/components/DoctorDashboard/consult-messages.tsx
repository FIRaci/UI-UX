import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Send, Video, Phone, PhoneOff, Mic, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { formatRelative, type Thread } from "../../store";

const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

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

  return (
    <Card className="p-0 overflow-hidden h-[calc(100vh-12rem)] animate-fade-in">
      <div className="grid grid-cols-[300px_1fr] h-full">
        <div className="border-r overflow-auto">
          <div className="p-3 border-b"><span className="text-sm">Tin nhắn tư vấn ({threads.length})</span></div>
          {threads.map(t => (
            <button key={t.id} onClick={() => { setActiveThreadId(t.id); setChatMode("chat"); }}
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
                <div className="flex items-center gap-2">
                  {activeThread.status !== "Đã kết thúc" && (
                    <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
                      <Button size="sm" variant={chatMode === "chat" ? "default" : "ghost"} className="h-7 rounded-md text-xs" onClick={() => setChatMode("chat")}>
                        <MessageCircle className="w-3.5 h-3.5 mr-1" />Chat
                      </Button>
                      <Button size="sm" variant={chatMode === "video" ? "default" : "ghost"} className="h-7 rounded-md text-xs" onClick={() => { if (!callOn) startCamera(); else setChatMode("video"); }}>
                        <Video className="w-3.5 h-3.5 mr-1" />Video
                      </Button>
                    </div>
                  )}
                  {activeThread.status === "Đã kết thúc" && <Badge variant="outline">Đã kết thúc</Badge>}
                </div>
              </div>
              {chatMode === "video" ? (
                <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
                  {callOn ? (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <div className="text-center text-white/50">
                        <Video className="w-12 h-12 mx-auto mb-2 opacity-40" />
                        <div className="text-sm">Camera bệnh nhân</div>
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
