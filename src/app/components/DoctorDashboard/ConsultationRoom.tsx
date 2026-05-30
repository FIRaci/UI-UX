import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import {
  ArrowLeft, Sparkles, History, Pill, Search, Video, MessageCircle,
  Mic, Save, Phone, PhoneOff, Send, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { LevelBadge } from "./LevelBadge";
import { NOTE_TEMPLATES } from "./constants";
import type { Triage } from "./constants";

export function ConsultationRoom({
  patient, onBack, onFinish, onLogout,
}: {
  patient: Triage; onBack: () => void; onFinish: () => void; onLogout: () => void;
}) {
  const [tab, setTab] = useState("ai");
  const [note, setNote] = useState("");
  const [drugQuery, setDrugQuery] = useState("");
  const [showTemplate, setShowTemplate] = useState(false);
  const [callOn, setCallOn] = useState(true);
  const [chatMode, setChatMode] = useState<"video" | "chat">("video");
  const [chatMsgs, setChatMsgs] = useState([
    { f: "staff" as const, txt: `Chào ${patient.patient}, tôi là bác sĩ trực hôm nay.`, t: "vừa xong" },
    { f: "user" as const, txt: "Dạ chào bác sĩ ạ.", t: "vừa xong" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const aiSummary = [
    `Bệnh nhân ${patient.patient}, ${patient.age} tuổi, vào viện vì: ${patient.symptoms.toLowerCase()}.`,
    `Sinh hiệu lúc tiếp nhận: HA ${patient.vitals.bp}, mạch ${patient.vitals.hr}, nhiệt độ ${patient.vitals.temp}, SpO2 ${patient.vitals.spo2}.`,
    `Tiền sử: tăng huyết áp 5 năm, đang dùng Amlodipine 5mg/ngày.`,
    `Khuyến nghị AI: ưu tiên đo ECG, xét nghiệm Troponin nếu nghi ngờ tim mạch.`,
  ];

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

  const saveAndFinish = () => {
    if (!note.trim()) {
      toast.error("Vui lòng ghi chú trước khi hoàn tất");
      return;
    }
    onFinish();
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
        {/* Left Column: Context (AI, History, Drugs) */}
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
                <div className="flex items-center gap-2 text-violet-800 font-extrabold mb-4">
                  <Sparkles className="w-5 h-5" /> <span>AI Sàng lọc & Tóm tắt</span>
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
                  {["Cơn tăng huyết áp", "Đau đầu căng thẳng", "Rối loạn tiền đình"].map(d => (
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

        {/* Right Column: Interaction & Notes */}
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
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 z-10 pointer-events-none"></div>
                <div className="text-white/40 text-sm font-medium">Camera đang tắt</div>
                
                <div className="absolute bottom-4 right-4 w-36 h-48 bg-slate-800 rounded-2xl border-2 border-white/20 flex items-center justify-center text-white/50 text-xs shadow-2xl z-20 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-700/50 backdrop-blur-sm"></div>
                  <span className="relative z-10 font-medium">Bác sĩ (Bạn)</span>
                </div>
                
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-rose-500/90 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                    <span className={`w-2 h-2 rounded-full bg-white ${callOn ? "animate-pulse" : ""}`} />
                    {callOn ? "Đang gọi 02:45" : "Đã ngắt kết nối"}
                  </span>
                </div>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                  <Button size="icon" variant="secondary" className="w-12 h-12 rounded-full shadow-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md" onClick={() => toast.info("Đã tắt mic")}><Mic className="w-5 h-5" /></Button>
                  <Button
                    size="icon"
                    className={`w-14 h-14 rounded-full shadow-lg text-white border-0 transition-transform active:scale-90 ${callOn ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"}`}
                    onClick={() => { setCallOn(!callOn); toast.info(callOn ? "Đã kết thúc cuộc gọi" : "Đã kết nối lại"); }}
                  >
                    {callOn ? <PhoneOff className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                  </Button>
                  <Button size="icon" variant="secondary" className="w-12 h-12 rounded-full shadow-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md hidden sm:flex" onClick={() => toast.info("Mở rộng")}><Search className="w-5 h-5" /></Button>
                </div>
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
                <span className="text-sm font-bold text-slate-800 tracking-tight">Clinic Notes (Ghi chú Y khoa)</span>
              </div>
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs font-bold border-slate-200" onClick={() => setShowTemplate(true)}><Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />Chèn Template</Button>
            </div>
            <div className="flex-1 relative m-4 mb-2">
              <Textarea
                className="absolute inset-0 resize-none rounded-xl border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all p-4 text-[15px] leading-relaxed bg-slate-50 focus:bg-white"
                placeholder="Ghi chú triệu chứng, chẩn đoán, đơn thuốc, dặn dò..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
            <div className="px-4 pb-4 pt-2 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50" onClick={() => toast.info("Ghi âm AI đang phát triển")}>
                <Mic className="w-4 h-4 mr-2 text-blue-500" /> Nhập bằng giọng nói
              </Button>
              <Button className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/20" onClick={saveAndFinish}>
                <Save className="w-4 h-4 mr-2" /> Lưu & Hoàn tất khám
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
    </div>
  );
}
