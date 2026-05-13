import { useState } from "react";
import { AppShell } from "./AppShell";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { LayoutDashboard, BookOpen, Users2, Video, FileSearch, Mic, MicOff, PhoneOff, ScreenShare, MessageSquare, AlertCircle, TrendingUp, Clock, CheckCircle, AlertTriangle, Search, Bell, Filter, Eye, FileText, Activity, ArrowRight, Phone, Calendar, MapPin, ChevronRight } from "lucide-react";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

type ConsultRoom = { t: string; d: string; who: string; room: string };
type CaseFile = { id: string; n: string; c: string; p: string; age: number; gender: string; history: string; tests: string[]; suggestion: string };
type Research = { t: string; a: string; s: string; abstract: string; year: number; tags: string[] };

const UPCOMING: ConsultRoom[] = [
  { t: "Hội chẩn tim mạch ca BN-2031", d: "08/05 14:00", who: "BS. An, BS. Hà", room: "Phòng #101" },
  { t: "Hội chẩn thần kinh ca BN-2045", d: "09/05 09:30", who: "BS. Cường, BS. Mai", room: "Phòng #102" },
  { t: "Hội chẩn ung bướu BN-2102", d: "10/05 15:00", who: "BS. Đạt, BS. Tú", room: "Phòng #103" },
];

const CASES: CaseFile[] = [
  {
    id: "BN-2031", n: "Lê Hoàng Sơn", c: "Suy tim độ III, đái tháo đường type 2", p: "Cao",
    age: 64, gender: "Nam",
    history: "Tăng huyết áp 12 năm, đái tháo đường 8 năm, đặt stent mạch vành 2022.",
    tests: ["Echo: EF 32%", "ProBNP 4.500 pg/mL", "HbA1c 8.2%", "eGFR 48"],
    suggestion: "Tối ưu hóa GDMT (sacubitril/valsartan, beta-blocker, SGLT2i). Cân nhắc CRT-D.",
  },
  {
    id: "BN-2045", n: "Nguyễn Mỹ Lan", c: "Đột quỵ thiếu máu não cấp", p: "Rất cao",
    age: 58, gender: "Nữ",
    history: "Rung nhĩ chưa kháng đông. Khởi phát yếu nửa người trái 2 giờ trước.",
    tests: ["NIHSS 12", "CT không xuất huyết", "ASPECTS 8"],
    suggestion: "Tiêu sợi huyết alteplase + xem xét lấy huyết khối cơ học. Khởi đầu kháng đông sau 14 ngày.",
  },
  {
    id: "BN-2102", n: "Trần Quốc Bảo", c: "U lympho không Hodgkin", p: "Cao",
    age: 47, gender: "Nam",
    history: "Hạch cổ to 3 tháng, sốt về chiều, sút cân 6 kg.",
    tests: ["Sinh thiết: DLBCL", "PET-CT: giai đoạn IIIB", "LDH tăng"],
    suggestion: "Phác đồ R-CHOP 6 chu kỳ, đánh giá đáp ứng sau chu kỳ 3.",
  },
];

const RESEARCH: Research[] = [
  { t: "Hiệu quả điều trị tăng huyết áp ở người Việt", a: "GS. Hoàng Minh Tuấn", s: "Đang tiến hành", year: 2026, tags: ["Tim mạch", "Cộng đồng"], abstract: "Nghiên cứu đa trung tâm trên 2.400 bệnh nhân nhằm đánh giá hiệu quả phác đồ phối hợp ARB + CCB so với ACEi đơn trị trong 12 tháng." },
  { t: "Vai trò của AI trong chẩn đoán hình ảnh", a: "Nhóm AI Y học", s: "Đã công bố", year: 2025, tags: ["AI", "Chẩn đoán hình ảnh"], abstract: "Mô hình deep learning đạt AUC 0.94 trên dataset 18.000 phim X-quang ngực, tương đương bác sĩ X-quang có 5 năm kinh nghiệm." },
  { t: "Khảo sát COVID hậu nhiễm", a: "Khoa Hô hấp", s: "Phân tích", year: 2026, tags: ["Hô hấp", "Long COVID"], abstract: "Theo dõi 600 bệnh nhân hậu COVID 18 tháng, ghi nhận 22% còn triệu chứng mệt mỏi kéo dài và giảm chức năng phổi." },
  { t: "Dinh dưỡng và bệnh tim mạch", a: "Khoa Dinh dưỡng", s: "Đề xuất", year: 2026, tags: ["Dinh dưỡng", "Phòng ngừa"], abstract: "Đề xuất can thiệp DASH-Việt cho 1.500 đối tượng nguy cơ cao trong 24 tháng tại 3 thành phố lớn." },
];

const TEAM = [
  { n: "BS. Nguyễn Văn An", spec: "Tim mạch", years: 18, papers: 24 },
  { n: "BS. Trần Thị Bình", spec: "Da liễu", years: 12, papers: 9 },
  { n: "BS. Lê Hoàng Cường", spec: "Nhi khoa", years: 15, papers: 11 },
  { n: "BS. Phạm Mai Dung", spec: "Sản phụ khoa", years: 10, papers: 7 },
  { n: "BS. Vũ Quốc Đạt", spec: "Cơ xương khớp", years: 14, papers: 13 },
  { n: "BS. Đặng Thanh Hoa", spec: "Nội tổng quát", years: 9, papers: 5 },
];

export function ExpertDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState("overview");
  const [room, setRoom] = useState<ConsultRoom | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [caseFile, setCaseFile] = useState<CaseFile | null>(null);
  const [research, setResearch] = useState<Research | null>(null);
  const [member, setMember] = useState<typeof TEAM[number] | null>(null);
  const [opinion, setOpinion] = useState("");

  const joinRoom = (r: ConsultRoom) => {
    setRoom(r);
    setMicOn(true);
    toast.success(`Đã vào ${r.room}`);
  };

  return (
    <AppShell
      title="Trung tâm chuyên gia"
      subtitle="Chào GS. TS. Hoàng Minh Tuấn"
      roleLabel="Chuyên gia"
      roleColor="bg-amber-100 text-amber-700 border border-amber-200"
      initials="HT"
      active={active}
      onNav={setActive}
      onLogout={onLogout}
      nav={[
        { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
        { key: "consult", label: "Hội chẩn", icon: Video },
        { key: "cases", label: "Ca bệnh phức tạp", icon: FileSearch },
        { key: "research", label: "Nghiên cứu", icon: BookOpen },
        { key: "team", label: "Đội ngũ chuyên môn", icon: Users2 },
      ]}
    >
      {active === "overview" && (
        <div className="space-y-4">
          {/* Alert Banner - Critical Cases */}
          <div className="bg-red-50 border-l-4 border-l-red-500 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Cảnh báo khẩn cấp</h3>
                  <p className="text-sm text-red-700 mt-1">4 Ca bệnh đang cần xử lý ngay - James Harrington, Elena Vasquez, Robert Chen, Amara Okafor</p>
                </div>
              </div>
              <Badge className="bg-red-600">4 Chờ xử lý</Badge>
            </div>
          </div>

          {/* Success Banner - Stable Cases */}
          <div className="bg-green-50 border-l-4 border-l-green-500 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Hệ thống hoạt động bình thường</p>
                <p className="text-sm text-green-700">Tất cả ca bệnh trong tình trạng ổn định</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { l: "Hội chẩn tuần này", v: "7", icon: "📞" },
              { l: "Ca bệnh phức tạp", v: "23", icon: "🏥" },
              { l: "Đang tiến hành", v: "4", icon: "📊" },
              { l: "Đánh giá trung bình", v: "4.9", icon: "⭐" },
            ].map((s, i) => (
              <Card key={i} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">{s.l}</div>
                    <div className="mt-2 text-3xl font-bold">{s.v}</div>
                  </div>
                  <span className="text-2xl">{s.icon}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Upcoming Consultations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Hội chẩn sắp tới</h3>
              <Button size="sm" variant="ghost" className="text-blue-600">Xem tất cả <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
            <div className="space-y-2">
              {UPCOMING.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{c.t}</div>
                    <div className="text-xs text-muted-foreground mt-1"><Clock className="w-3 h-3 inline mr-1" />{c.d} • {c.who}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{c.room}</Badge>
                    <Button size="sm" onClick={() => joinRoom(c)}>Tham gia</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {active === "consult" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Phòng hội chẩn online</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Bộ lọc</Button>
              <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-2" />Toàn bộ</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => {
              const data: ConsultRoom = { t: `Hội chẩn ca BN-${2000 + i}`, d: "Hôm nay", who: "3-5 chuyên gia", room: `Phòng #${100 + i}` };
              return (
                <Card key={i} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => joinRoom(data)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className="bg-blue-100 text-blue-700" variant="secondary">{data.room}</Badge>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">● Đang hoạt động</span>
                  </div>
                  <h4 className="font-semibold text-sm leading-snug">{data.t}</h4>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Users2 className="w-3 h-3" />{data.who}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{data.d}</p>
                  <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">Tham gia phòng</Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {active === "cases" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Ca bệnh phức tạp</h2>
              <p className="text-sm text-muted-foreground mt-1">Theo dõi và quản lý các ca bệnh</p>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">+ Thêm ca</Button>
          </div>

          <div className="space-y-3">
            {CASES.map(c => (
              <div key={c.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCaseFile(c)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{c.n} <span className="text-muted-foreground text-sm font-normal">({c.id})</span></h4>
                    <p className="text-sm text-muted-foreground mt-1">{c.c}</p>
                  </div>
                  <Badge className={c.p === "Rất cao" ? "bg-red-600" : c.p === "Cao" ? "bg-orange-600" : "bg-yellow-600"}>{c.p}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t">
                  <span>👤 {c.gender} • {c.age} tuổi</span>
                  <span>📋 {c.tests.length} xét nghiệm</span>
                  <Button size="sm" variant="ghost" className="ml-auto">Xem chi tiết <ChevronRight className="w-3 h-3 ml-1" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === "research" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Nghiên cứu khoa học</h2>
            <p className="text-sm text-muted-foreground mt-1">Các dự án nghiên cứu đang tiến hành</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {RESEARCH.map((r, i) => (
              <Card key={i} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setResearch(r)}>
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-purple-100 text-purple-700" variant="secondary">{r.s}</Badge>
                  <span className="text-xs text-muted-foreground">{r.year}</span>
                </div>
                <h4 className="font-semibold text-sm leading-snug mt-2">{r.t}</h4>
                <p className="text-xs text-muted-foreground mt-2">{r.a}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {r.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                </div>
                <Button size="sm" variant="ghost" className="w-full mt-3 justify-center">Xem chi tiết <ChevronRight className="w-3 h-3 ml-1" /></Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {active === "team" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Đội ngũ chuyên môn</h2>
            <p className="text-sm text-muted-foreground mt-1">Các chuyên gia trong nhóm</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {TEAM.map((m, i) => (
              <Card key={i} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setMember(m)}>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10"><AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">{m.n.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{m.n}</h4>
                    <p className="text-xs text-blue-600">{m.spec}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground pt-3 border-t">
                  <div className="flex items-center gap-2"><Activity className="w-3 h-3" />{m.years} năm kinh nghiệm</div>
                  <div className="flex items-center gap-2"><FileText className="w-3 h-3" />{m.papers} bài báo khoa học</div>
                </div>
                <Button size="sm" variant="ghost" className="w-full mt-3">Liên hệ <ChevronRight className="w-3 h-3 ml-1" /></Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!room} onOpenChange={() => setRoom(null)}>
        <DialogContent className="max-w-3xl">
          {room && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>{room.t}</DialogTitle>
                <DialogDescription>{room.room} • {room.d} • {room.who}</DialogDescription>
              </DialogHeader>
              <div className="aspect-video rounded-lg bg-slate-900 relative flex items-center justify-center">
                <div className="text-white/60 text-sm">[Khung video hội chẩn]</div>
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                </div>
                <div className="absolute bottom-3 right-3 grid grid-cols-2 gap-1.5">
                  {room.who.split(",").map((p, idx) => (
                    <div key={idx} className="w-24 h-16 bg-slate-700 border border-white/20 rounded flex items-center justify-center text-white/70 text-[10px] px-1 text-center">{p.trim()}</div>
                  ))}
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <Button size="icon" variant="secondary" onClick={() => { setMicOn(v => !v); toast.info(micOn ? "Đã tắt mic" : "Đã bật mic"); }}>
                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="secondary" onClick={() => toast.info("Đã chia sẻ màn hình")}><ScreenShare className="w-4 h-4" /></Button>
                  <Button size="icon" className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => { setRoom(null); toast.success("Đã rời phòng hội chẩn"); }}>
                    <PhoneOff className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Textarea rows={2} placeholder="Gõ ý kiến hội chẩn..." value={opinion} onChange={e => setOpinion(e.target.value)} />
                <Button onClick={() => {
                  if (!opinion.trim()) { toast.error("Vui lòng nhập ý kiến"); return; }
                  toast.success("Đã gửi ý kiến đến nhóm hội chẩn");
                  setOpinion("");
                }}><MessageSquare className="w-4 h-4 mr-1" />Gửi</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!caseFile} onOpenChange={() => setCaseFile(null)}>
        <DialogContent className="max-w-xl">
          {caseFile && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>{caseFile.n} <span className="text-muted-foreground text-sm">({caseFile.id})</span></DialogTitle>
                <DialogDescription>{caseFile.gender} • {caseFile.age} tuổi • Mức độ: {caseFile.p}</DialogDescription>
              </DialogHeader>
              <section>
                <div className="text-sm tracking-tight mb-1">Chẩn đoán</div>
                <p className="text-sm text-slate-700">{caseFile.c}</p>
              </section>
              <section>
                <div className="text-sm tracking-tight mb-1">Tiền sử & diễn biến</div>
                <p className="text-sm text-slate-700">{caseFile.history}</p>
              </section>
              <section>
                <div className="text-sm tracking-tight mb-1">Kết quả cận lâm sàng</div>
                <ul className="text-sm text-slate-700 space-y-0.5">
                  {caseFile.tests.map(t => <li key={t}>• {t}</li>)}
                </ul>
              </section>
              <section className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-sm tracking-tight mb-1 text-amber-900">Đề xuất chuyên môn</div>
                <p className="text-sm text-amber-900">{caseFile.suggestion}</p>
              </section>
              <DialogFooter>
                <Button variant="outline" onClick={() => toast.success("Đã ghi chú vào ca bệnh")}>Ghi chú</Button>
                <Button onClick={() => { toast.success("Đã yêu cầu hội chẩn"); setCaseFile(null); }}>Yêu cầu hội chẩn</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!research} onOpenChange={() => setResearch(null)}>
        <DialogContent className="max-w-xl">
          {research && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>{research.t}</DialogTitle>
                <DialogDescription>{research.a} • {research.year}</DialogDescription>
              </DialogHeader>
              <div className="flex gap-1.5 flex-wrap">
                <Badge variant="secondary">{research.s}</Badge>
                {research.tags.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{research.abstract}</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => toast.success("Đã tải tài liệu PDF")}>Tải PDF</Button>
                <Button onClick={() => { toast.success("Đã tham gia nghiên cứu"); setResearch(null); }}>Tham gia</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!member} onOpenChange={() => setMember(null)}>
        <DialogContent>
          {member && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>{member.n}</DialogTitle>
                <DialogDescription>Chuyên khoa: {member.spec}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground">Kinh nghiệm</div>
                  <div className="mt-1 tracking-tight">{member.years} năm</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground">Bài báo</div>
                  <div className="mt-1 tracking-tight">{member.papers}</div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => toast.success(`Đã gửi tin nhắn đến ${member.n}`)}>Nhắn tin</Button>
                <Button onClick={() => { toast.success(`Đã mời ${member.n} vào hội chẩn`); setMember(null); }}>Mời hội chẩn</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
