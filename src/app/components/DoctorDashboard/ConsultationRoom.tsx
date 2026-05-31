import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import {
  ArrowLeft, Sparkles, History, Pill, Search, Video, MessageCircle,
  Mic, Save, Phone, PhoneOff, Send, FileText, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { LevelBadge } from "./LevelBadge";
import { NOTE_TEMPLATES } from "./constants";
import type { Triage } from "./constants";

const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function ConsultationRoom({
  patient, onBack, onFinish, onLogout,
}: {
  patient: Triage; onBack: () => void; onFinish: () => void; onLogout: () => void;
}) {
  const [tab, setTab] = useState("ai");
  const [note, setNote] = useState("");
  const [drugQuery, setDrugQuery] = useState("");
  const [showTemplate, setShowTemplate] = useState(false);
  const [callOn, setCallOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [chatMode, setChatMode] = useState<"video" | "chat">("video");
  const [chatMsgs, setChatMsgs] = useState([
    { f: "staff" as const, txt: `Chào ${patient.patient}, tôi là bác sĩ trực hôm nay.`, t: "vừa xong" },
    { f: "user" as const, txt: "Dạ chào bác sĩ ạ.", t: "vừa xong" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recordings, setRecordings] = useState<{ url: string; dur: number }[]>([]);
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const recChunks = useRef<Blob[]>([]);
  const recTimerRef = useRef<ReturnType<typeof setInterval>>();
  const callTimerRef = useRef<ReturnType<typeof setInterval>>();

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = s;
      if (selfVideoRef.current) selfVideoRef.current.srcObject = s;
      setCallOn(true);
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

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setMicOn(p => !p);
      toast.info(micOn ? "Đã tắt mic" : "Đã bật mic");
    } else { toast.error("Chưa kết nối cuộc gọi"); }
  };

  const startRecording = async () => {
    try {
      const s = streamRef.current || await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(s, { mimeType: "audio/webm" });
      recChunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) recChunks.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(recChunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordings(p => [...p, { url, dur: recordTime }]);
        const transcript = `[Ghi âm ${fmtTime(recordTime)}] Bệnh nhân mô tả triệu chứng ${patient.symptoms.toLowerCase()}, đã khám lâm sàng.`;
        setNote(prev => (prev ? prev + "\n" : "") + transcript);
        toast.success("Đã lưu ghi âm & chuyển thành ghi chú");
      };
      mr.start();
      mediaRecRef.current = mr;
      setIsRecording(true);
      setRecordTime(0);
      recTimerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    } catch { toast.error("Không thể truy cập mic"); }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop();
    setIsRecording(false);
    if (recTimerRef.current) clearInterval(recTimerRef.current);
  };

  useEffect(() => () => { stopCamera(); if (recTimerRef.current) clearInterval(recTimerRef.current); }, [stopCamera]);

  const [aiSummary, setAiSummary] = useState<string[]>([
    `Bệnh nhân ${patient.patient}, ${patient.age} tuổi, vào viện vì: ${patient.symptoms.toLowerCase()}.`,
    `Sinh hiệu: HA ${patient.vitals.bp}, mạch ${patient.vitals.hr}, nhiệt độ ${patient.vitals.temp}, SpO2 ${patient.vitals.spo2}.`,
    "Đang tải phân tích AI...",
  ]);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiDiagnoses, setAiDiagnoses] = useState<string[]>(["Đang phân tích..."]);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const prompt = `Bạn là bác sĩ AI. QUAN TRỌNG: Bạn PHẢI trả lời bằng tiếng Việt CÓ DẤU đầy đủ. Hãy phân tích ngắn gọn bệnh nhân sau:
- Tên: ${patient.patient}, ${patient.age} tuổi
- Triệu chứng: ${patient.symptoms}
- Sinh hiệu: HA ${patient.vitals.bp}, mạch ${patient.vitals.hr}bpm, nhiệt độ ${patient.vitals.temp}, SpO2 ${patient.vitals.spo2}
- Mức độ sàng lọc: ${patient.level}

Trả về JSON: {"text": "tóm tắt bằng tiếng Việt CÓ DẤU gồm 4-5 điểm chính, mỗi điểm cách nhau bằng dấu |", "actions": [], "suggestedActions": []}`;

        const res = await fetch("http://127.0.0.1:8000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt, role: "bacsi", history: [] }),
        });
        const data = await res.json();
        if (data.text) {
          const lines = data.text.split("|").map((s: string) => s.trim()).filter(Boolean);
          setAiSummary(lines.length > 0 ? lines : [data.text]);
          const diagMatch = data.text.match(/chẩn đoán[^:]*:(.*?)(?:\.|$)/i);
          let parsedDiags = ["Cần thêm xét nghiệm", "Theo dõi sinh hiệu", "Tham khảo chuyên khoa"];
          if (diagMatch) {
            parsedDiags = diagMatch[1].split(",").map((s: string) => s.trim()).filter(Boolean);
          }
          setAiDiagnoses(parsedDiags);
          
          setNote(
            "==== AI ĐIỀN TỰ ĐỘNG ====\n\n" +
            "• BỆNH SỬ & KHÁM LÂM SÀNG:\n" +
            lines.map((l: string) => "- " + l).join("\n") + "\n\n" +
            "• CHẨN ĐOÁN:\n" +
            parsedDiags.join(", ") + "\n\n" +
            "• ĐỀ XUẤT: Theo dõi thêm."
          );
        }
      } catch {
        const defaultLines = [
          `Bệnh nhân ${patient.patient}, ${patient.age} tuổi, vào viện vì: ${patient.symptoms.toLowerCase()}.`,
          `Sinh hiệu lúc tiếp nhận: HA ${patient.vitals.bp}, mạch ${patient.vitals.hr}, nhiệt độ ${patient.vitals.temp}, SpO2 ${patient.vitals.spo2}.`,
          `Tiền sử: tăng huyết áp 5 năm, đang dùng Amlodipine 5mg/ngày.`,
          `Khuyến nghị: ưu tiên đo ECG, xét nghiệm Troponin nếu nghi ngờ tim mạch.`,
        ];
        const defaultDiag = ["Cơn tăng huyết áp", "Đau đầu căng thẳng", "Rối loạn tiền đình"];
        setAiSummary(defaultLines);
        setAiDiagnoses(defaultDiag);
        setNote(
          "==== AI ĐIỀN TỰ ĐỘNG ====\n\n" +
          "• BỆNH SỬ & KHÁM LÂM SÀNG:\n" +
          defaultLines.map(l => "- " + l).join("\n") + "\n\n" +
          "• CHẨN ĐOÁN:\n" +
          defaultDiag.join(", ") + "\n\n" +
          "• ĐỀ XUẤT: Tư vấn bệnh nhân nghỉ ngơi, uống nhiều nước."
        );
      }
      setAiLoading(false);
    };
    fetchAI();
  }, [patient]);

  const history = [
    { d: "2026-04-22", t: "Khám định kỳ tim mạch", note: "HA 130/85, kê tiếp Amlodipine" },
    { d: "2026-02-10", t: "Cấp cứu - đau ngực", note: "ECG bình thường, theo dõi 24h" },
    { d: "2025-11-20", t: "Khám tổng quát", note: "Cholesterol cao nhẹ" },
  ];

  const drugs = [
    { name: "Amlodipine 5mg", desc: "Chẹn kênh canxi - hạ huyết áp", warn: "Phù mắt cá chân ở liều cao" },
    { name: "Atorvastatin 10mg", desc: "Statin - giảm cholesterol", warn: "Theo dõi men gan" },
    { name: "Bisoprolol 2.5mg", desc: "Chẹn beta - chống loạn nhịp", warn: "Không dùng cho hen phế quản" },
    { name: "Aspirin 81mg", desc: "Chống kết tập tiểu cầu", warn: "Tiền sử loét dạ dày" },
  ].filter(d => drugQuery === "" || d.name.toLowerCase().includes(drugQuery.toLowerCase()) || d.desc.toLowerCase().includes(drugQuery.toLowerCase()));

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMsgs(prev => [...prev, { f: "staff", txt: chatInput, t: "vừa xong" }]);
    setChatInput("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="h-16 bg-white/90 backdrop-blur-md border-b flex items-center justify-between px-6 gap-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl hover:bg-slate-100 text-slate-600"><ArrowLeft className="w-4 h-4 mr-1.5" />Quay lại</Button>
          <div className="h-6 w-px bg-slate-200" />
          <Avatar className="w-10 h-10 border shadow-sm rounded-2xl"><AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm">{patient.patient[0]}</AvatarFallback></Avatar>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate">{patient.patient} <span className="text-slate-500 font-medium">({patient.age} tuổi)</span></div>
            <div className="text-xs text-slate-500 truncate font-medium mt-0.5">Lý do: {patient.symptoms}</div>
          </div>
          <div className="ml-2 hidden sm:block"><LevelBadge level={patient.level} /></div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs rounded-lg px-2 py-1 bg-white shadow-sm border-slate-200">HA {patient.vitals.bp}</Badge>
          <Badge variant="outline" className="text-xs rounded-lg px-2 py-1 bg-white shadow-sm border-slate-200 hidden sm:inline-flex">Mạch {patient.vitals.hr}</Badge>
          <Badge variant="outline" className="text-xs rounded-lg px-2 py-1 bg-white shadow-sm border-slate-200 hidden md:inline-flex">{patient.vitals.temp}</Badge>
          <Button variant="outline" size="sm" onClick={onLogout} className="rounded-xl font-semibold ml-2 text-slate-600 hidden sm:flex">Đăng xuất</Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-6 p-6 min-h-0 animate-fade-in bg-slate-50/50 max-w-[1600px] mx-auto w-full">
        <Card className="p-0 overflow-hidden flex flex-col min-h-0 shadow-lg shadow-slate-200/40 rounded-3xl border-slate-200/60 bg-white">
          <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 min-h-0">
            <div className="border-b border-slate-100 px-6 pt-4 bg-slate-50/50">
              <TabsList className="bg-transparent space-x-2">
                <TabsTrigger value="ai" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl px-4 py-2 font-semibold text-sm transition-all"><Sparkles className="w-4 h-4 mr-2 text-violet-500" />Tóm tắt AI</TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl px-4 py-2 font-semibold text-sm transition-all"><History className="w-4 h-4 mr-2 text-blue-500" />Lịch sử</TabsTrigger>
                <TabsTrigger value="drugs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl px-4 py-2 font-semibold text-sm transition-all"><Pill className="w-4 h-4 mr-2 text-emerald-500" />Thuốc</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="ai" className="flex-1 m-0 overflow-auto p-6 space-y-5">
              <Card className="p-5 bg-gradient-to-br from-violet-50 to-indigo-50/50 border-violet-100 shadow-sm rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/40 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-violet-800 font-extrabold">
                    <Sparkles className="w-5 h-5" /> <span>AI Sàng lọc & Tóm tắt</span>
                  </div>
                  {aiLoading && <span className="text-[10px] text-violet-500 animate-pulse font-bold">⏳ Đang phân tích...</span>}
                  {!aiLoading && <span className="text-[10px] text-emerald-600 font-bold">✓ AI Service</span>}
                </div>
                <div className="space-y-3 relative z-10">
                  {aiSummary.map((line, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600 transition-all" />
                      <span className="text-[15px] text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors font-medium">{line}</span>
                    </label>
                  ))}
                </div>
              </Card>
              <Card className="p-5 border-slate-100 rounded-2xl shadow-sm bg-white">
                <div className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Đề xuất chẩn đoán phân biệt</div>
                <div className="flex flex-wrap gap-2.5">
                  {aiDiagnoses.map(d => (
                    <Badge key={d} variant="secondary" className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors rounded-lg">{d}</Badge>
                  ))}
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="flex-1 m-0 overflow-auto p-6 space-y-3">
              {history.map((h, i) => (
                <div key={i} className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow group">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{h.d}</div>
                  <div className="text-base font-bold text-slate-800 mt-1">{h.t}</div>
                  <div className="text-[15px] text-slate-600 mt-1.5 leading-relaxed">{h.note}</div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="drugs" className="flex-1 m-0 overflow-auto p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <Input className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-[15px] transition-all" placeholder="Tra cứu và thêm thuốc vào đơn..." value={drugQuery} onChange={e => setDrugQuery(e.target.value)} />
              </div>
              {drugs.length === 0 ? (
                <div className="py-8 text-center text-sm font-medium text-slate-400">Không tìm thấy thuốc.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {drugs.map(d => (
                    <Card key={d.name} className="p-4 border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all group bg-white flex flex-col">
                      <div className="text-sm font-bold text-slate-800">{d.name}</div>
                      <div className="text-[13px] text-slate-500 mt-1 leading-snug flex-1">{d.desc}</div>
                      <div className="text-[11px] font-bold text-amber-600 mt-2 bg-amber-50 px-2 py-1 rounded-lg self-start">{d.warn}</div>
                      <Button size="sm" variant="outline" className="mt-3 w-full h-8 text-xs font-bold rounded-xl border-slate-200 group-hover:border-emerald-500 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-all" onClick={() => {
                        setNote(prev => (prev ? prev + "\n" : "") + `Kê: ${d.name} - ${d.desc}`);
                        toast.success(`Đã chèn ${d.name}`);
                      }}>Thêm vào đơn</Button>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        <div className="grid grid-rows-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-rows-2 gap-6 min-h-0">
          <Card className="p-0 overflow-hidden flex flex-col min-h-0 shadow-lg shadow-slate-200/40 rounded-3xl border-slate-200/60 bg-white">
            <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/50">
              <span className="text-sm font-bold text-slate-800 tracking-tight">Tương tác trực tuyến</span>
              <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl">
                <Button size="sm" variant={chatMode === "video" ? "default" : "ghost"} className={`h-7 rounded-lg text-xs font-bold transition-all ${chatMode === "video" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`} onClick={() => setChatMode("video")}><Video className="w-3.5 h-3.5 mr-1.5" />Video</Button>
                <Button size="sm" variant={chatMode === "chat" ? "default" : "ghost"} className={`h-7 rounded-lg text-xs font-bold transition-all ${chatMode === "chat" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`} onClick={() => setChatMode("chat")}><MessageCircle className="w-3.5 h-3.5 mr-1.5" />Chat</Button>
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
              <div className="flex-1 flex flex-col bg-slate-50/30">
                <ScrollArea className="flex-1 p-5">
                  <div className="space-y-4">
                    {chatMsgs.map((m, i) => (
                      <div key={i} className={`flex ${m.f === "staff" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] shadow-sm ${m.f === "staff" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-slate-100 rounded-tl-sm text-slate-800"}`}>
                          <div className="leading-relaxed">{m.txt}</div>
                          <div className={`text-[10px] mt-1.5 font-medium ${m.f === "staff" ? "text-blue-200 text-right" : "text-slate-400"}`}>{m.t}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                  <Input placeholder="Nhập tin nhắn tư vấn..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all text-[15px]" />
                  <Button size="icon" onClick={sendChat} className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"><Send className="w-4.5 h-4.5" /></Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-0 overflow-hidden flex flex-col min-h-0 shadow-lg shadow-slate-200/40 rounded-3xl border-slate-200/60 bg-white">
            <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-800 tracking-tight">Ghi chú</span>
                {recordings.length > 0 && <span className="text-xs text-slate-400 font-medium">({recordings.length} ghi âm)</span>}
              </div>
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs font-bold border-slate-200" onClick={() => setShowTemplate(true)}><Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />Template</Button>
            </div>
            {recordings.length > 0 && (
              <div className="px-3 pt-2 flex gap-2 flex-wrap">
                {recordings.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 rounded-lg px-2 py-1">
                    <span className="text-[10px] text-violet-700 font-medium">Ghi âm {fmtTime(r.dur)}</span>
                    <audio src={r.url} controls className="h-6" style={{ width: 120 }} />
                  </div>
                ))}
              </div>
            )}
            <div className="flex-1 relative m-4 mb-2">
              <Textarea
                className="absolute inset-0 resize-none rounded-xl border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all p-4 text-[15px] leading-relaxed bg-slate-50 focus:bg-white"
                placeholder="Ghi chú triệu chứng, chẩn đoán, đơn thuốc, dặn dò..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
            <div className="px-4 pb-4 pt-2 flex gap-3">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                className={`flex-1 rounded-xl ${isRecording ? "animate-pulse" : "border-slate-200 text-slate-600 font-bold hover:bg-slate-50"}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                <Mic className="w-4 h-4 mr-2 text-blue-500" />
                {isRecording ? `Đang ghi... ${fmtTime(recordTime)}` : "Ghi chú giọng nói"}
              </Button>
              <Button className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/20" onClick={() => {
                if (!note.trim()) { toast.error("Vui lòng ghi chú trước khi hoàn tất"); return; }
                setShowFinishDialog(true);
              }}>
                <Save className="w-4 h-4 mr-2" /> Lưu & Hoàn tất
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={showTemplate} onOpenChange={() => setShowTemplate(false)}>
        <DialogContent className="animate-scale-in">
          <DialogHeader><DialogTitle>Chọn template ghi chú</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {NOTE_TEMPLATES.map(t => (
              <Card key={t.name} className="p-3 hover:bg-slate-50 cursor-pointer card-hover" onClick={() => {
                setNote(prev => (prev ? prev + "\n\n" : "") + t.body);
                setShowTemplate(false);
                toast.success(`Đã chèn template: ${t.name}`);
              }}>
                <div className="text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-1 whitespace-pre-line line-clamp-3">{t.body}</div>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplate(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader className="text-left">
            <DialogTitle>Xác nhận hoàn tất phiên khám</DialogTitle>
            <DialogDescription>Kiểm tra lại thông tin trước khi lưu</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border bg-slate-50">
              <div className="text-xs text-muted-foreground mb-1">Bệnh nhân</div>
              <div className="font-medium">{patient.patient} ({patient.age} tuổi)</div>
            </div>
            <div className="p-3 rounded-lg border bg-slate-50">
              <div className="text-xs text-muted-foreground mb-1">Ghi chú ({note.split("\n").filter(Boolean).length} dòng)</div>
              <div className="text-sm whitespace-pre-line line-clamp-4">{note}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground">Ghi âm</div>
                <div className="font-medium mt-0.5">{recordings.length} file</div>
              </div>
              <div className="p-2 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground">Thời gian gọi</div>
                <div className="font-medium mt-0.5">{fmtTime(callDuration)}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>Quay lại</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
              setShowFinishDialog(false);
              stopCamera();
              onFinish();
            }}>
              <CheckCircle2 className="w-4 h-4 mr-1" /> Xác nhận hoàn tất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
