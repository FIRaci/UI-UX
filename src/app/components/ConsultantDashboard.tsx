import { useEffect, useState } from "react";
import { AppShell } from "./AppShell";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { LayoutDashboard, MessagesSquare, Plus, Send, Star, BookOpen, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useStore, store, formatRelative, type Thread } from "../store";

const ME = "Phạm Thanh Tâm";

const EXPERTS = [
  { id: 2, name: "BS. Nguyễn Văn An", spec: "Tim mạch", rating: 4.9, fee: "150.000đ/lượt", online: true },
  { id: 102, name: "CV. Đỗ Thanh Hằng", spec: "Tâm lý", rating: 4.8, fee: "120.000đ/lượt", online: true },
  { id: 103, name: "BS. Trần Thị Bình", spec: "Da liễu", rating: 4.8, fee: "130.000đ/lượt", online: false },
  { id: 104, name: "CV. Lý Mai Phương", spec: "Dinh dưỡng", rating: 4.7, fee: "100.000đ/lượt", online: true },
  { id: 105, name: "BS. Vũ Quốc Đạt", spec: "Cơ xương khớp", rating: 4.6, fee: "140.000đ/lượt", online: false },
  { id: 106, name: "CV. Phan Hoài Nam", spec: "Sức khỏe sinh sản", rating: 4.9, fee: "160.000đ/lượt", online: true },
];

const TOPICS = ["Tâm lý", "Dinh dưỡng", "Tim mạch", "Da liễu", "Cơ xương khớp", "Sức khỏe sinh sản"];

type Article = { t: string; c: string; d: string; author: string; date: string; cover: string; lead: string; sections: { h: string; p: string }[] };
const ARTICLES: Article[] = [
  {
    t: "Quản lý stress hiệu quả", c: "Tâm lý", d: "5 phút đọc",
    author: "CV. Đỗ Thanh Hằng", date: "02/05/2026",
    cover: "linear-gradient(135deg,#a78bfa,#60a5fa)",
    lead: "Stress là phản ứng bình thường của cơ thể trước áp lực, nhưng kéo dài có thể ảnh hưởng nghiêm trọng đến sức khỏe thể chất và tinh thần.",
    sections: [
      { h: "Nhận diện dấu hiệu", p: "Mất ngủ, khó tập trung, dễ cáu gắt, đau đầu hoặc đau cơ kéo dài đều là tín hiệu cảnh báo. Hãy ghi chú lại tần suất xuất hiện trong 1-2 tuần để có đánh giá chính xác." },
      { h: "Kỹ thuật thở 4-7-8", p: "Hít vào trong 4 giây, giữ hơi 7 giây, thở ra 8 giây. Lặp 4 chu kỳ mỗi sáng và tối giúp hệ thần kinh phó giao cảm hoạt động ổn định hơn." },
      { h: "Cân bằng công việc", p: "Áp dụng quy tắc 90/20: làm việc tập trung 90 phút rồi nghỉ 20 phút. Tránh kiểm tra email/điện thoại 1 giờ trước khi ngủ." },
    ],
  },
  {
    t: "Chế độ ăn cho người cao huyết áp", c: "Dinh dưỡng", d: "8 phút đọc",
    author: "CV. Lý Mai Phương", date: "28/04/2026",
    cover: "linear-gradient(135deg,#34d399,#10b981)",
    lead: "Chế độ ăn DASH được chứng minh giảm 8-14 mmHg huyết áp tâm thu nếu duy trì đều đặn ít nhất 8 tuần.",
    sections: [
      { h: "Nguyên tắc chung", p: "Giảm muối <1.500mg/ngày, tăng kali từ chuối, khoai lang, rau xanh đậm. Hạn chế đồ chiên rán, thực phẩm chế biến sẵn và rượu bia." },
      { h: "Thực đơn mẫu", p: "Sáng: yến mạch + chuối + sữa hạt. Trưa: cá hồi áp chảo + cơm lứt + rau luộc. Tối: ức gà + salad rau củ + 1 quả táo." },
      { h: "Lưu ý khi đi chợ", p: "Đọc nhãn dinh dưỡng, ưu tiên sản phẩm <140mg natri/khẩu phần. Mua thực phẩm tươi thay cho đồ đóng hộp khi có thể." },
    ],
  },
  {
    t: "Bài tập thư giãn trước khi ngủ", c: "Tâm lý", d: "3 phút đọc",
    author: "CV. Đỗ Thanh Hằng", date: "20/04/2026",
    cover: "linear-gradient(135deg,#f472b6,#a78bfa)",
    lead: "Một bài tập kéo giãn 5 phút trước khi ngủ giúp giảm 30% thời gian đi vào giấc ngủ sâu.",
    sections: [
      { h: "Tư thế em bé", p: "Quỳ gối, gập người về trước, hai tay duỗi thẳng. Giữ 60 giây, hít thở sâu bằng bụng." },
      { h: "Vặn cột sống nằm", p: "Nằm ngửa, co một gối kéo qua bên đối diện, đầu xoay ngược lại. Giữ mỗi bên 45 giây." },
      { h: "Quét cơ thể", p: "Nhắm mắt, di chuyển ý thức từ đỉnh đầu xuống chân, thả lỏng từng nhóm cơ. Thực hiện trong 3-5 phút." },
    ],
  },
  {
    t: "Hiểu về sức khỏe tim mạch", c: "Tim mạch", d: "10 phút đọc",
    author: "BS. Nguyễn Văn An", date: "15/04/2026",
    cover: "linear-gradient(135deg,#fb7185,#f97316)",
    lead: "Bệnh tim mạch là nguyên nhân tử vong hàng đầu tại Việt Nam, nhưng 80% trường hợp có thể phòng ngừa được.",
    sections: [
      { h: "Yếu tố nguy cơ", p: "Tăng huyết áp, rối loạn lipid máu, đái tháo đường, hút thuốc, ít vận động và béo phì là 6 yếu tố cần kiểm soát đầu tiên." },
      { h: "Tầm soát định kỳ", p: "Người >40 tuổi nên đo huyết áp 6 tháng/lần, xét nghiệm lipid máu hàng năm, ECG nếu có triệu chứng đau ngực hoặc khó thở." },
      { h: "Vận động thông minh", p: "150 phút cường độ vừa hoặc 75 phút cường độ cao mỗi tuần. Đi bộ nhanh, bơi, đạp xe đều phù hợp." },
    ],
  },
  {
    t: "Chăm sóc da theo mùa", c: "Da liễu", d: "6 phút đọc",
    author: "BS. Trần Thị Bình", date: "10/04/2026",
    cover: "linear-gradient(135deg,#fcd34d,#fb923c)",
    lead: "Da chúng ta phản ứng khác nhau với độ ẩm và nhiệt độ. Routine chăm sóc cần điều chỉnh theo mùa.",
    sections: [
      { h: "Mùa hè", p: "Sữa rửa mặt dịu nhẹ, kem chống nắng SPF 50+ thoa lại sau mỗi 2-3 giờ. Dưỡng ẩm gel nhẹ tránh bít tắc lỗ chân lông." },
      { h: "Mùa đông", p: "Chuyển sang cleanser dạng kem, dưỡng ẩm chứa ceramide và hyaluronic acid. Hạn chế tắm nước quá nóng." },
      { h: "Khi giao mùa", p: "Da dễ kích ứng nhất, ưu tiên sản phẩm tối giản 3 bước: rửa - dưỡng - chống nắng." },
    ],
  },
  {
    t: "Tư thế ngồi đúng cho dân văn phòng", c: "Cơ xương khớp", d: "4 phút đọc",
    author: "BS. Vũ Quốc Đạt", date: "05/04/2026",
    cover: "linear-gradient(135deg,#38bdf8,#6366f1)",
    lead: "Ngồi sai tư thế 8 tiếng/ngày làm tăng 40% nguy cơ thoái hóa cột sống cổ và lưng dưới.",
    sections: [
      { h: "Quy tắc 90 độ", p: "Khuỷu tay, hông và đầu gối đều tạo góc 90°. Hai chân đặt phẳng trên sàn hoặc kê bục thấp." },
      { h: "Vị trí màn hình", p: "Đỉnh màn hình ngang tầm mắt, cách mặt 50-70cm. Tránh nghiêng cổ xuống nhìn laptop liên tục." },
      { h: "Nghỉ ngắn 20-20-20", p: "Mỗi 20 phút nhìn vật cách 20 feet trong 20 giây. Đứng dậy vận động nhẹ mỗi giờ một lần." },
    ],
  },
];

export function ConsultantDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState("overview");
  const sessions = useStore(s =>
    s.threads.filter(t => t.userRole === "tuvan" && t.userName === ME).sort((a, b) => b.updatedAt - a.updatedAt)
  );

  const [activeChatId, setActiveChatId] = useState<number | null>(sessions[0]?.id ?? null);
  const activeChat = sessions.find(s => s.id === activeChatId) ?? sessions[0];

  useEffect(() => {
    if (!activeChatId && sessions[0]) setActiveChatId(sessions[0].id);
  }, [sessions, activeChatId]);

  const [input, setInput] = useState("");
  const [requesting, setRequesting] = useState<typeof EXPERTS[0] | null>(null);
  const [topicFilter, setTopicFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reqTopic, setReqTopic] = useState("Tâm lý");
  const [reqContent, setReqContent] = useState("");
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [profileExpert, setProfileExpert] = useState<typeof EXPERTS[0] | null>(null);

  const filtered = EXPERTS.filter(
    e =>
      (topicFilter === "all" || e.spec === topicFilter) &&
      (search === "" || e.name.toLowerCase().includes(search.toLowerCase()) || e.spec.toLowerCase().includes(search.toLowerCase()))
  );

  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;
    store.appendMessage(activeChat.id, { f: "user", txt: input, t: "vừa xong" });
    setInput("");
  };

  const submitRequest = () => {
    if (!requesting) return;
    if (!reqContent.trim()) {
      toast.error("Vui lòng mô tả vấn đề bạn cần tư vấn");
      return;
    }
    const id = store.addThread({
      staffId: requesting.id,
      staffName: requesting.name,
      staffSpec: requesting.spec,
      userRole: "tuvan",
      userName: ME,
      topic: reqTopic,
      status: "Chờ phản hồi",
      last: reqContent,
      msgs: [{ f: "user", txt: reqContent, t: "vừa xong" }],
    });
    toast.success(`Đã gửi yêu cầu tư vấn đến ${requesting.name}`);
    setRequesting(null);
    setReqContent("");
    setActiveChatId(id);
    setActive("chats");
  };

  return (
    <AppShell
      title="Trung tâm tư vấn"
      subtitle={`Chào ${ME} 👋`}
      roleLabel="Người cần tư vấn"
      roleColor="bg-emerald-100 text-emerald-700 border border-emerald-200"
      initials="PT"
      active={active}
      onNav={setActive}
      onLogout={onLogout}
      nav={[
        { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
        { key: "find", label: "Tìm chuyên gia", icon: Search },
        { key: "chats", label: "Cuộc tư vấn của tôi", icon: MessagesSquare },
        { key: "library", label: "Thư viện kiến thức", icon: BookOpen },
      ]}
    >
      {active === "overview" && (
        <div className="space-y-5">
          <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <div className="flex items-center gap-2 opacity-90"><Sparkles className="w-4 h-4" /> Hỗ trợ 24/7</div>
            <h2 className="mt-2 tracking-tight">Bạn cần tư vấn về điều gì hôm nay?</h2>
            <p className="opacity-90 mt-1">Kết nối nhanh với bác sĩ và chuyên gia tâm lý, dinh dưỡng, sức khỏe...</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => { setTopicFilter(t); setActive("find"); }}
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-sm transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { l: "Cuộc tư vấn đang mở", v: sessions.filter(s => s.status === "Đang diễn ra").length, c: "bg-emerald-50 text-emerald-700" },
              { l: "Chờ phản hồi", v: sessions.filter(s => s.status === "Chờ phản hồi").length, c: "bg-amber-50 text-amber-700" },
              { l: "Đã hoàn thành", v: sessions.filter(s => s.status === "Đã kết thúc").length, c: "bg-sky-50 text-sky-700" },
              { l: "Chuyên gia đã tư vấn", v: new Set(sessions.map(s => s.staffId)).size, c: "bg-violet-50 text-violet-700" },
            ].map((s, i) => (
              <Card key={i} className="p-4">
                <div className={`inline-flex px-2 py-0.5 rounded-md text-xs ${s.c}`}>{s.l}</div>
                <div className="mt-2 text-2xl tracking-tight">{s.v}</div>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="tracking-tight">Cuộc tư vấn gần đây</h4>
              <Button size="sm" variant="outline" onClick={() => setActive("chats")}>Xem tất cả</Button>
            </div>
            <div className="space-y-2">
              {sessions.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-xl">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback className="bg-emerald-100 text-emerald-700">{s.staffName.split(" ").pop()?.[0]}</AvatarFallback></Avatar>
                    <div>
                      <div>{s.staffName}</div>
                      <div className="text-sm text-muted-foreground">{s.topic} • {s.last}</div>
                    </div>
                  </div>
                  <Badge variant={s.status === "Đang diễn ra" ? "default" : s.status === "Chờ phản hồi" ? "secondary" : "outline"}>{s.status}</Badge>
                </div>
              ))}
              {sessions.length === 0 && <div className="text-center text-muted-foreground py-6">Chưa có cuộc tư vấn nào.</div>}
            </div>
          </Card>
        </div>
      )}

      {active === "find" && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Tìm theo tên chuyên gia, chuyên môn..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={topicFilter} onValueChange={setTopicFilter}>
                <SelectTrigger className="md:w-56"><SelectValue placeholder="Chủ đề" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chủ đề</SelectItem>
                  {TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {filtered.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">Không tìm thấy chuyên gia phù hợp.</Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map(e => (
                <Card key={e.id} className="p-4 hover:shadow-lg transition">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-14 h-14"><AvatarFallback className="bg-emerald-100 text-emerald-700">{e.name.split(" ").pop()?.[0]}</AvatarFallback></Avatar>
                      {e.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="tracking-tight">{e.name}</div>
                          <Badge variant="secondary" className="mt-0.5">{e.spec}</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-current" />{e.rating}</div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2 flex items-center gap-3">
                        <span className="text-emerald-600">{e.fee}</span>
                        <span className={e.online ? "text-emerald-600" : "text-muted-foreground"}>{e.online ? "● Đang online" : "○ Offline"}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => setProfileExpert(e)}>Xem hồ sơ</Button>
                        <Button size="sm" onClick={() => { setRequesting(e); setReqTopic(e.spec); }}>Gửi yêu cầu tư vấn</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {active === "chats" && (
        <Card className="p-0 overflow-hidden h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-[300px_1fr] h-full">
            <div className="border-r overflow-auto">
              <div className="p-3 border-b flex items-center justify-between">
                <span className="text-sm">Cuộc tư vấn ({sessions.length})</span>
                <Button size="sm" variant="outline" onClick={() => setActive("find")}><Plus className="w-3.5 h-3.5 mr-1" />Mới</Button>
              </div>
              {sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveChatId(s.id)}
                  className={`w-full p-3 flex items-start gap-3 border-b hover:bg-slate-50 text-left ${activeChat?.id === s.id ? "bg-emerald-50" : ""}`}
                >
                  <Avatar><AvatarFallback className="bg-emerald-100 text-emerald-700">{s.staffName.split(" ").pop()?.[0]}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="truncate">{s.staffName}</span>
                      <Badge variant="outline" className="text-[10px]">{s.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{s.topic} • {formatRelative(s.updatedAt)}</div>
                    <div className="text-sm text-muted-foreground truncate mt-0.5">{s.last}</div>
                  </div>
                </button>
              ))}
              {sessions.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">Chưa có cuộc tư vấn</div>}
            </div>
            <div className="flex flex-col">
              {activeChat ? (
                <>
                  <div className="border-b p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarFallback className="bg-emerald-100 text-emerald-700">{activeChat.staffName.split(" ").pop()?.[0]}</AvatarFallback></Avatar>
                      <div>
                        <div>{activeChat.staffName}</div>
                        <div className="text-xs text-muted-foreground">{activeChat.staffSpec} • {activeChat.status}</div>
                      </div>
                    </div>
                    {activeChat.status !== "Đã kết thúc" && (
                      <Button size="sm" variant="outline" onClick={() => {
                        store.setThreadStatus(activeChat.id, "Đã kết thúc");
                        toast.success("Đã kết thúc cuộc tư vấn");
                      }}>Kết thúc</Button>
                    )}
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                      {activeChat.msgs.map((m, i) => (
                        <div key={i} className={`flex ${m.f === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.f === "user" ? "bg-emerald-500 text-white rounded-br-sm" : "bg-slate-100 rounded-bl-sm"}`}>
                            {m.txt}
                            {m.t && <div className={`text-[10px] mt-0.5 ${m.f === "user" ? "text-white/70" : "text-muted-foreground"}`}>{m.t}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {activeChat.status !== "Đã kết thúc" ? (
                    <div className="p-3 border-t flex gap-2">
                      <Input placeholder="Nhập tin nhắn..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
                      <Button size="icon" onClick={sendMessage}><Send className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <div className="p-3 border-t text-center text-sm text-muted-foreground">Cuộc tư vấn đã kết thúc</div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">Chọn một cuộc tư vấn để bắt đầu</div>
              )}
            </div>
          </div>
        </Card>
      )}

      {active === "library" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ARTICLES.map((a, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-md transition cursor-pointer group" onClick={() => setReadingArticle(a)}>
              <div className="h-28 relative" style={{ background: a.cover }}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                <Badge variant="secondary" className="absolute top-3 left-3 bg-white/90 backdrop-blur">{a.c}</Badge>
              </div>
              <div className="p-4">
                <h4 className="tracking-tight">{a.t}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.lead}</p>
                <div className="text-xs text-muted-foreground mt-3 flex items-center justify-between">
                  <span>{a.author}</span>
                  <span>{a.d}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!readingArticle} onOpenChange={() => setReadingArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {readingArticle && (
            <>
              <div className="h-40 relative" style={{ background: readingArticle.cover }}>
                <Badge variant="secondary" className="absolute bottom-3 left-6 bg-white/90 backdrop-blur">{readingArticle.c}</Badge>
              </div>
              <div className="px-6 pb-6">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl tracking-tight">{readingArticle.t}</DialogTitle>
                  <DialogDescription>
                    {readingArticle.author} • {readingArticle.date} • {readingArticle.d}
                  </DialogDescription>
                </DialogHeader>
                <p className="mt-4 text-base leading-relaxed text-slate-700 italic border-l-4 border-sky-300 pl-3">
                  {readingArticle.lead}
                </p>
                <div className="mt-5 space-y-4">
                  {readingArticle.sections.map((s, idx) => (
                    <section key={idx}>
                      <h4 className="tracking-tight text-slate-900">{s.h}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700">{s.p}</p>
                    </section>
                  ))}
                </div>
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => { toast.success("Đã lưu vào mục yêu thích"); }}>Lưu bài viết</Button>
                  <Button onClick={() => setReadingArticle(null)}>Đóng</Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!requesting} onOpenChange={() => setRequesting(null)}>
        <DialogContent>
          {requesting && (
            <>
              <DialogHeader>
                <DialogTitle>Gửi yêu cầu tư vấn</DialogTitle>
                <DialogDescription>{requesting.name} • {requesting.spec}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Chủ đề</Label>
                  <Select value={reqTopic} onValueChange={setReqTopic}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Mô tả vấn đề</Label>
                  <Textarea rows={5} placeholder="Hãy mô tả chi tiết vấn đề bạn đang gặp phải..." value={reqContent} onChange={e => setReqContent(e.target.value)} />
                </div>
                <Card className="p-3 bg-emerald-50 border-emerald-200 text-sm">
                  Phí tư vấn: <b>{requesting.fee}</b>. Chuyên gia sẽ phản hồi trong 30 phút.
                </Card>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setRequesting(null); toast.info("Đã hủy yêu cầu"); }}>Hủy</Button>
                <Button onClick={submitRequest}>Gửi yêu cầu</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!profileExpert} onOpenChange={() => setProfileExpert(null)}>
        <DialogContent>
          {profileExpert && (
            <>
              <DialogHeader className="text-left">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12"><AvatarFallback className="bg-violet-100 text-violet-700">{profileExpert.name.split(" ").pop()?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <DialogTitle>{profileExpert.name}</DialogTitle>
                    <DialogDescription>{profileExpert.spec} • {profileExpert.online ? "Đang online" : "Offline"}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground">Đánh giá</div>
                  <div className="mt-1 tracking-tight flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{profileExpert.rating}/5.0</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground">Phí tư vấn</div>
                  <div className="mt-1 tracking-tight text-emerald-600">{profileExpert.fee}</div>
                </div>
              </div>
              <section>
                <div className="text-sm tracking-tight mb-1">Giới thiệu</div>
                <p className="text-sm text-slate-700">
                  Chuyên gia {profileExpert.spec.toLowerCase()} với hơn 10 năm kinh nghiệm tư vấn cho hàng nghìn khách hàng. Tốt nghiệp Đại học Y Hà Nội, từng tu nghiệp tại Singapore và đã công bố nhiều bài báo khoa học trong lĩnh vực.
                </p>
              </section>
              <section>
                <div className="text-sm tracking-tight mb-1">Lĩnh vực hỗ trợ</div>
                <div className="flex flex-wrap gap-1.5">
                  {[profileExpert.spec, "Tư vấn 1-1", "Lộ trình theo dõi", "Hỗ trợ khẩn cấp"].map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                </div>
              </section>
              <DialogFooter>
                <Button variant="outline" onClick={() => setProfileExpert(null)}>Đóng</Button>
                <Button onClick={() => { setRequesting(profileExpert); setReqTopic(profileExpert.spec); setProfileExpert(null); }}>Gửi yêu cầu tư vấn</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
