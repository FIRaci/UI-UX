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
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" />Quay lại</Button>
          <div className="h-6 w-px bg-slate-200" />
          <Avatar className="w-8 h-8"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs">{patient.patient[0]}</AvatarFallback></Avatar>
          <div className="min-w-0">
            <div className="text-sm truncate">{patient.patient} <span className="text-muted-foreground">({patient.age} tuổi)</span></div>
            <div className="text-xs text-muted-foreground truncate">Phiên tư vấn • {patient.symptoms}</div>
          </div>
          <LevelBadge level={patient.level} />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">HA {patient.vitals.bp}</Badge>
          <Badge variant="outline" className="text-xs">Mạch {patient.vitals.hr}</Badge>
          <Badge variant="outline" className="text-xs">{patient.vitals.temp}</Badge>
          <Button variant="outline" size="sm" onClick={onLogout}>Đăng xuất</Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 p-4 min-h-0 animate-fade-in">
        <Card className="p-0 overflow-hidden flex flex-col min-h-0 animate-slide-up">
          <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 min-h-0">
            <div className="border-b px-4 pt-3">
              <TabsList>
                <TabsTrigger value="ai"><Sparkles className="w-3.5 h-3.5 mr-1" />Tóm tắt AI</TabsTrigger>
                <TabsTrigger value="history"><History className="w-3.5 h-3.5 mr-1" />Lịch sử</TabsTrigger>
                <TabsTrigger value="drugs"><Pill className="w-3.5 h-3.5 mr-1" />Tra cứu thuốc</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="ai" className="flex-1 m-0 overflow-auto p-4 space-y-3">
              <Card className="p-4 bg-gradient-to-br from-violet-50 to-sky-50 border-violet-200">
                <div className="flex items-center gap-2 text-violet-700">
                  <Sparkles className="w-4 h-4" /> <span className="text-sm">AI sàng lọc & tóm tắt</span>
                </div>
                <div className="space-y-2 mt-3">
                  {aiSummary.map((line, i) => (
                    <label key={i} className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="mt-1" />
                      <span className="text-sm">{line}</span>
                    </label>
                  ))}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm">Đề xuất chẩn đoán phân biệt</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Cơn tăng huyết áp", "Đau đầu căng thẳng", "Rối loạn tiền đình"].map(d => (
                    <Badge key={d} variant="secondary">{d}</Badge>
                  ))}
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="flex-1 m-0 overflow-auto p-4 space-y-2">
              {history.map((h, i) => (
                <div key={i} className="p-3 border rounded-xl">
                  <div className="text-xs text-muted-foreground">{h.d}</div>
                  <div className="text-sm mt-0.5">{h.t}</div>
                  <div className="text-sm text-muted-foreground mt-1">{h.note}</div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="drugs" className="flex-1 m-0 overflow-auto p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Tra cứu thuốc..." value={drugQuery} onChange={e => setDrugQuery(e.target.value)} />
              </div>
              {drugs.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Không tìm thấy thuốc.</div>
              ) : drugs.map(d => (
                <Card key={d.name} className="p-3 card-hover">
                  <div className="text-sm">{d.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.desc}</div>
                  <div className="text-xs text-amber-700 mt-1">{d.warn}</div>
                  <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => {
                    setNote(prev => (prev ? prev + "\n" : "") + `Kê: ${d.name} - ${d.desc}`);
                    toast.success(`Đã thêm ${d.name} vào ghi chú`);
                  }}>Thêm vào đơn</Button>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </Card>

        <div className="grid grid-rows-[1fr_1fr] gap-4 min-h-0">
          <Card className="p-0 overflow-hidden flex flex-col min-h-0">
            <div className="border-b px-3 py-2 flex items-center justify-between">
              <span className="text-sm">Video call / Chat</span>
              <div className="flex gap-1">
                <Button size="sm" variant={chatMode === "video" ? "default" : "outline"} onClick={() => setChatMode("video")}><Video className="w-3.5 h-3.5 mr-1" />Video</Button>
                <Button size="sm" variant={chatMode === "chat" ? "default" : "outline"} onClick={() => setChatMode("chat")}><MessageCircle className="w-3.5 h-3.5 mr-1" />Chat</Button>
              </div>
            </div>
            {chatMode === "video" ? (
              <div className="flex-1 relative bg-slate-900 flex items-center justify-center">
                <div className="text-white/60 text-sm">Tính năng đang phát triển</div>
                <div className="absolute bottom-3 right-3 w-32 h-20 bg-slate-700 rounded-lg border-2 border-white/30 flex items-center justify-center text-white/60 text-xs">Bạn</div>
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full bg-white ${callOn ? "animate-pulse" : ""}`} />
                    {callOn ? "Đang gọi" : "Đã ngắt"}
                  </span>
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <Button size="icon" variant="secondary" onClick={() => toast.info("Tắt/bật mic")}><Mic className="w-4 h-4" /></Button>
                  <Button
                    size="icon"
                    className={callOn ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                    onClick={() => { setCallOn(!callOn); toast.info(callOn ? "Đã kết thúc cuộc gọi" : "Đã kết nối lại"); }}
                  >
                    {callOn ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-2">
                    {chatMsgs.map((m, i) => (
                      <div key={i} className={`flex ${m.f === "staff" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.f === "staff" ? "bg-violet-500 text-white" : "bg-slate-100"}`}>
                          {m.txt}
                          <div className={`text-[10px] mt-0.5 ${m.f === "staff" ? "text-white/70" : "text-muted-foreground"}`}>{m.t}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-2 border-t flex gap-2">
                  <Input placeholder="Nhập tin nhắn..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} />
                  <Button size="icon" onClick={sendChat}><Send className="w-4 h-4" /></Button>
                </div>
              </>
            )}
          </Card>

          <Card className="p-0 overflow-hidden flex flex-col min-h-0">
            <div className="border-b px-3 py-2 flex items-center justify-between">
              <span className="text-sm">Ghi chú</span>
              <Button size="sm" variant="outline" onClick={() => setShowTemplate(true)}><FileText className="w-3.5 h-3.5 mr-1" />Template</Button>
            </div>
            <Textarea
              className="flex-1 m-3 resize-none"
              placeholder="Ghi chú chẩn đoán, đơn thuốc, dặn dò..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className="px-3 pb-3 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => toast.info("Tính năng đang phát triển")}>
                <Mic className="w-4 h-4 mr-1" /> Ghi chu giong noi
              </Button>
              <Button className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={saveAndFinish}>
                <Save className="w-4 h-4 mr-1" /> Lưu & Hoàn tất
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
