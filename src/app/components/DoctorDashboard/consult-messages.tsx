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
    <Card className="p-0 overflow-hidden h-[calc(100vh-12rem)] animate-fade-in border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] bg-white">
      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] h-full">
        {/* Sidebar */}
        <div className="border-r border-slate-100 bg-slate-50/50 flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm shrink-0">
            <h2 className="text-base font-black text-slate-800 tracking-tight">Hộp thư tư vấn</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{threads.length} cuộc hội thoại</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {threads.map(t => {
                const isActive = activeThread?.id === t.id;
                return (
                  <button 
                    key={t.id} 
                    onClick={() => { setActiveThreadId(t.id); setChatMode("chat"); }}
                    className={`w-full p-4 rounded-2xl flex items-start gap-3 transition-all duration-300 text-left border ${isActive ? "bg-white border-violet-200 shadow-md shadow-violet-500/10 scale-[1.02]" : "bg-transparent border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm"}`}
                  >
                    <Avatar className={`w-11 h-11 border-2 ${isActive ? "border-violet-100 shadow-sm" : "border-white"}`}>
                      <AvatarFallback className={`font-bold ${isActive ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {t.userName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2 mb-0.5">
                        <span className={`font-bold truncate ${isActive ? "text-violet-900" : "text-slate-800"}`}>{t.userName}</span>
                        <span className={`text-[10px] font-semibold shrink-0 ${isActive ? "text-violet-500" : "text-slate-400"}`}>{formatRelative(t.updatedAt)}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500 truncate mb-1">
                        {t.topic}
                      </div>
                      <div className={`text-xs truncate ${isActive ? "text-slate-700 font-medium" : "text-slate-400"}`}>{t.last}</div>
                      {t.status === "Chờ phản hồi" && <Badge className="mt-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold">Cần phản hồi</Badge>}
                    </div>
                  </button>
                );
              })}
              {threads.length === 0 && (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-5 h-5 text-slate-300" />
                  </div>
                  <div className="text-slate-400 text-sm font-medium">Hộp thư trống</div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col bg-white h-full overflow-hidden relative">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-slate-100 p-4 px-6 flex items-center justify-between bg-white/80 backdrop-blur-xl shrink-0 z-10 relative">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border border-slate-100 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold">{activeThread.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-slate-800 text-base">{activeThread.userName}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-medium text-emerald-600">Đang trực tuyến</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-medium text-slate-500">{activeThread.topic}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {activeThread.status !== "Đã kết thúc" && (
                    <>
                      <Button size="sm" variant={chatMode === "chat" ? "default" : "ghost"} className={`h-8 rounded-lg px-4 text-xs font-bold transition-all ${chatMode === "chat" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`} onClick={() => setChatMode("chat")}>
                        <MessageCircle className="w-4 h-4 mr-1.5" />Chat
                      </Button>
                      <Button size="sm" variant={chatMode === "video" ? "default" : "ghost"} className={`h-8 rounded-lg px-4 text-xs font-bold transition-all ${chatMode === "video" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`} onClick={() => { if (!callOn) startCamera(); else setChatMode("video"); }}>
                        <Video className="w-4 h-4 mr-1.5" />Video
                      </Button>
                    </>
                  )}
                  {activeThread.status === "Đã kết thúc" && <Badge variant="outline" className="h-8 border-slate-200 bg-slate-50 text-slate-500 font-bold">Đã kết thúc</Badge>}
                </div>
              </div>

              {chatMode === "video" ? (
                <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
                  {/* Video UI remains same as it was already okay in fullscreen */}
                  {callOn ? (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <div className="text-center text-white/50">
                        <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <div className="text-sm font-medium tracking-wide uppercase">Camera bệnh nhân</div>
                        <div className="text-xs mt-2 text-white/30 animate-pulse">Đang kết nối luồng video...</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Phone className="w-8 h-8 text-white/40" />
                      </div>
                      <div className="text-white/50 text-sm font-medium mb-6">Sẵn sàng bắt đầu cuộc gọi tư vấn</div>
                      <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-emerald-500/20" onClick={startCamera}>
                        <Phone className="w-5 h-5 mr-2" /> Bắt đầu gọi
                      </Button>
                    </div>
                  )}
                  <div className="absolute bottom-6 right-6 w-48 h-32 bg-slate-800 rounded-2xl border-4 border-white/10 shadow-2xl overflow-hidden transition-transform hover:scale-105">
                    <video ref={selfVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    {!callOn && <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs font-bold uppercase tracking-widest bg-slate-900/80">Bạn</div>}
                  </div>
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    {callOn ? (
                      <div className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        Đang gọi • {fmtTime(callDuration)}
                      </div>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white/60 text-xs font-semibold border border-white/10">Chưa kết nối</span>
                    )}
                  </div>
                  {callOn && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/40 backdrop-blur-xl p-3 rounded-3xl border border-white/10 shadow-2xl">
                      <Button size="icon" variant="secondary" className={`rounded-full w-12 h-12 transition-all ${!micOn ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-white/10 hover:bg-white/20 text-white border-0"}`} onClick={toggleMic}>
                        {micOn ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5 line-through" />}
                      </Button>
                      <Button size="icon" className="bg-rose-500 hover:bg-rose-600 text-white rounded-full w-12 h-12 shadow-lg shadow-rose-500/30" onClick={() => { stopCamera(); toast.info("Đã kết thúc cuộc gọi"); }}>
                        <PhoneOff className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-slate-50/50 pointer-events-none z-0"></div>
                  <div className="flex-1 overflow-y-auto p-6 relative z-10 min-h-0">
                    <div className="space-y-6 max-w-3xl mx-auto pb-4">
                      {activeThread.msgs.map((m, i) => (
                        <div key={i} className={`flex ${m.f === "staff" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                          <div className="flex flex-col gap-1 max-w-[75%]">
                            <div className={`px-5 py-3.5 shadow-sm text-[15px] leading-relaxed ${
                              m.f === "staff" 
                                ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-[24px] rounded-tr-[4px] shadow-violet-500/20" 
                                : "bg-white border border-slate-100 text-slate-800 rounded-[24px] rounded-tl-[4px]"
                            }`}>
                              {m.txt}
                            </div>
                            <div className={`text-[10px] font-semibold px-2 ${m.f === "staff" ? "text-slate-400 text-right" : "text-slate-400"}`}>
                              {m.t}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {activeThread.status !== "Đã kết thúc" ? (
                    <div className="p-4 bg-white border-t border-slate-100 shrink-0 z-10 relative">
                      <div className="max-w-3xl mx-auto flex w-full relative items-center">
                        <Input 
                          placeholder="Nhập tin nhắn tư vấn chuyên môn..." 
                          value={reply} 
                          onChange={e => setReply(e.target.value)} 
                          onKeyDown={e => e.key === "Enter" && sendReply()} 
                          className="w-full h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-violet-500/20 focus:border-violet-500 pl-5 pr-14 text-[15px] shadow-sm transition-all" 
                        />
                        <Button 
                          onClick={sendReply}
                          className="absolute right-1.5 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/20 p-0"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 z-10 relative">
                      <div className="text-center text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        Phiên tư vấn này đã kết thúc
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <MessageCircle className="w-8 h-8 text-violet-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">Tin nhắn tư vấn</h3>
              <p className="text-sm font-medium">Chọn một cuộc hội thoại bên trái để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
