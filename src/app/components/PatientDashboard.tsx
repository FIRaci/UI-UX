import { useEffect, useState } from "react";
import { AppShell } from "./AppShell";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import {
  LayoutDashboard, Search, CalendarDays, FileHeart, Activity,
  Star, MapPin, Stethoscope, Clock, X, Pencil, MessagesSquare, Send, Plus
} from "lucide-react";
import { toast } from "sonner";
import { useStore, store, formatRelative, type Appointment } from "../store";

const ME = "Nguyễn Minh Khoa";

const DOCTORS = [
  { id: 2, name: "BS. Nguyễn Văn An", spec: "Tim mạch", rating: 4.9, fee: "300.000đ", clinic: "CN Q1", avail: ["08:00", "09:00", "10:30", "14:00"] },
  { id: 103, name: "BS. Trần Thị Bình", spec: "Da liễu", rating: 4.8, fee: "250.000đ", clinic: "CN Q3", avail: ["09:30", "11:00", "15:00"] },
  { id: 203, name: "BS. Lê Hoàng Cường", spec: "Nhi khoa", rating: 4.7, fee: "280.000đ", clinic: "CN Tân Bình", avail: ["08:30", "10:00", "13:30", "16:00"] },
  { id: 204, name: "BS. Phạm Mai Dung", spec: "Tai mũi họng", rating: 4.9, fee: "320.000đ", clinic: "CN Q1", avail: ["09:00", "11:30", "14:30"] },
  { id: 105, name: "BS. Vũ Quốc Đạt", spec: "Cơ xương khớp", rating: 4.6, fee: "350.000đ", clinic: "CN Q7", avail: ["08:00", "10:30", "15:30"] },
];

const SPECIALTIES = ["Tim mạch", "Da liễu", "Nhi khoa", "Tai mũi họng", "Cơ xương khớp", "Nội tổng quát"];

export function PatientDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState("overview");
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [bookDate, setBookDate] = useState("2026-05-12");
  const [bookTime, setBookTime] = useState("");
  const [editing, setEditing] = useState<Appointment | null>(null);

  const appointments = useStore(s => s.appointments.filter(a => a.patientName === ME));
  const myThreads = useStore(s =>
    s.threads.filter(t => t.userRole === "benhnhan" && t.userName === ME).sort((a, b) => b.updatedAt - a.updatedAt)
  );

  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [newMsgDoctor, setNewMsgDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [newMsgContent, setNewMsgContent] = useState("");

  useEffect(() => {
    if (!activeThreadId && myThreads[0]) setActiveThreadId(myThreads[0].id);
  }, [myThreads, activeThreadId]);
  const activeThread = myThreads.find(t => t.id === activeThreadId) ?? null;

  const filtered = DOCTORS.filter(d =>
    (specFilter === "all" || d.spec === specFilter) &&
    (search === "" || d.name.toLowerCase().includes(search.toLowerCase()) || d.spec.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBook = () => {
    if (!bookingDoctor || !bookTime || !bookDate) {
      toast.error("Vui lòng chọn ngày và giờ khám");
      return;
    }
    const slot = new Date(`${bookDate}T${bookTime}:00`);
    if (isNaN(slot.getTime()) || slot.getTime() < Date.now()) {
      toast.error("Không thể đặt lịch trong quá khứ");
      return;
    }
    const hours = slot.getHours();
    if (hours < 7 || hours >= 20) {
      toast.error("Phòng khám chỉ nhận lịch từ 07:00 đến 20:00");
      return;
    }
    if (appointments.some(a => a.date === bookDate && a.time === bookTime && a.status === "Sắp tới")) {
      toast.error("Bạn đã có lịch trùng giờ. Vui lòng chọn thời gian khác.");
      return;
    }
    store.addAppointment({
      patientName: ME,
      doctorName: bookingDoctor.name,
      doctorSpec: bookingDoctor.spec,
      date: bookDate,
      time: bookTime,
      clinic: bookingDoctor.clinic,
      status: "Sắp tới",
    });
    toast.success("Đặt lịch thành công! Bác sĩ và phòng khám đã được cập nhật.");
    setBookingDoctor(null);
    setBookTime("");
  };

  const cancelAppt = (id: number) => {
    const a = appointments.find(x => x.id === id);
    if (!a) return;
    if (a.status !== "Sắp tới") {
      toast.error("Chỉ có thể hủy lịch còn hiệu lực");
      return;
    }
    const apptTime = new Date(`${a.date}T${a.time}:00`).getTime();
    if (apptTime - Date.now() < 2 * 60 * 60 * 1000) {
      toast.error("Vui lòng hủy lịch trước thời điểm khám ít nhất 2 giờ");
      return;
    }
    toast("Xác nhận hủy lịch?", {
      description: `${a.doctorName} • ${a.date} ${a.time}`,
      action: {
        label: "Hủy lịch",
        onClick: () => {
          store.updateAppointment(id, { status: "Đã hủy" });
          toast.success("Đã hủy lịch hẹn");
        },
      },
      cancel: { label: "Đóng", onClick: () => {} },
    });
  };

  const updateAppt = () => {
    if (!editing) return;
    const slot = new Date(`${editing.date}T${editing.time}:00`);
    if (isNaN(slot.getTime()) || slot.getTime() < Date.now()) {
      toast.error("Thời gian mới phải ở tương lai");
      return;
    }
    const h = slot.getHours();
    if (h < 7 || h >= 20) {
      toast.error("Khung giờ làm việc 07:00 – 20:00");
      return;
    }
    if (appointments.some(a => a.id !== editing.id && a.date === editing.date && a.time === editing.time && a.status === "Sắp tới")) {
      toast.error("Khung giờ đã có lịch khác");
      return;
    }
    store.updateAppointment(editing.id, { date: editing.date, time: editing.time });
    toast.success("Cập nhật lịch thành công");
    setEditing(null);
  };

  const sendReply = () => {
    if (!reply.trim() || !activeThread) return;
    store.appendMessage(activeThread.id, { f: "user", txt: reply, t: "vừa xong" });
    setReply("");
  };

  const submitNewMsg = () => {
    if (!newMsgDoctor) return;
    if (!newMsgContent.trim()) {
      toast.error("Vui lòng nhập nội dung tin nhắn");
      return;
    }
    const id = store.addThread({
      staffId: newMsgDoctor.id,
      staffName: newMsgDoctor.name,
      staffSpec: newMsgDoctor.spec,
      userRole: "benhnhan",
      userName: ME,
      topic: "Hỏi bác sĩ",
      status: "Chờ phản hồi",
      last: newMsgContent,
      msgs: [{ f: "user", txt: newMsgContent, t: "vừa xong" }],
    });
    setActiveThreadId(id);
    setNewMsgDoctor(null);
    setNewMsgContent("");
    toast.success(`Đã gửi tin nhắn đến ${newMsgDoctor.name}`);
  };

  return (
    <AppShell
      title="Bảng điều khiển"
      subtitle={`Xin chào, ${ME} 👋`}
      roleLabel="Bệnh nhân"
      roleColor="bg-sky-100 text-sky-700 border border-sky-200"
      initials="MK"
      active={active}
      onNav={setActive}
      onLogout={onLogout}
      nav={[
        { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
        { key: "search", label: "Tìm bác sĩ", icon: Search },
        { key: "appointments", label: "Lịch hẹn của tôi", icon: CalendarDays },
        { key: "messages", label: "Tin nhắn bác sĩ", icon: MessagesSquare },
        { key: "records", label: "Hồ sơ sức khỏe", icon: FileHeart },
        { key: "tracking", label: "Theo dõi sức khỏe", icon: Activity },
      ]}
    >
      {active === "overview" && <Overview onJump={setActive} appts={appointments} threads={myThreads} />}
      {active === "search" && (
        <SearchSection
          search={search} setSearch={setSearch}
          specFilter={specFilter} setSpecFilter={setSpecFilter}
          doctors={filtered}
          onPick={setSelectedDoctor}
          onBook={setBookingDoctor}
        />
      )}
      {active === "appointments" && (
        <Appointments
          appointments={appointments}
          onCancel={cancelAppt}
          onEdit={setEditing}
        />
      )}
      {active === "messages" && (
        <Card className="p-0 overflow-hidden h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-[300px_1fr] h-full">
            <div className="border-r overflow-auto">
              <div className="p-3 border-b flex items-center justify-between">
                <span className="text-sm">Hội thoại ({myThreads.length})</span>
                <Button size="sm" variant="outline" onClick={() => setNewMsgDoctor(DOCTORS[0])}><Plus className="w-3.5 h-3.5 mr-1" />Mới</Button>
              </div>
              {myThreads.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`w-full p-3 flex items-start gap-3 border-b hover:bg-slate-50 text-left ${activeThread?.id === t.id ? "bg-sky-50" : ""}`}
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
              {myThreads.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">Chưa có hội thoại</div>}
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
                      {activeThread.msgs.map((m, i) => (
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
                      <Input placeholder="Nhập tin nhắn..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === "Enter" && sendReply()} />
                      <Button size="icon" onClick={sendReply}><Send className="w-4 h-4" /></Button>
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
      )}
      {active === "records" && <Records />}
      {active === "tracking" && <Tracking onBook={() => {
        setActive("search");
        toast.info("Đã tự điền thông tin bác sĩ tái khám");
      }} />}

      <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
        <DialogContent>
          {selectedDoctor && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDoctor.name}</DialogTitle>
                <DialogDescription>Chi tiết bác sĩ</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-16 h-16"><AvatarFallback className="bg-sky-100 text-sky-700">{selectedDoctor.name.split(" ").pop()?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <Badge variant="secondary">{selectedDoctor.spec}</Badge>
                    <div className="flex items-center gap-1 mt-1 text-amber-500"><Star className="w-4 h-4 fill-current" /> {selectedDoctor.rating}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {selectedDoctor.clinic}</div>
                  </div>
                </div>
                <Card className="p-3 bg-slate-50">
                  <div className="text-sm">Phí khám: <b className="text-emerald-600">{selectedDoctor.fee}</b></div>
                  <div className="text-sm text-muted-foreground mt-1">Bác sĩ với hơn 10 năm kinh nghiệm. Tốt nghiệp ĐH Y Hà Nội, từng tu nghiệp tại Singapore.</div>
                </Card>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedDoctor(null)}>Đóng</Button>
                <Button onClick={() => { setBookingDoctor(selectedDoctor); setSelectedDoctor(null); }}>Đặt lịch</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!bookingDoctor} onOpenChange={() => setBookingDoctor(null)}>
        <DialogContent>
          {bookingDoctor && (
            <>
              <DialogHeader>
                <DialogTitle>Đặt lịch khám</DialogTitle>
                <DialogDescription>{bookingDoctor.name} • {bookingDoctor.spec}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Ngày khám</Label>
                  <Input type="date" min={new Date().toISOString().slice(0, 10)} value={bookDate} onChange={e => setBookDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Giờ khám</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {bookingDoctor.avail.map(t => (
                      <button
                        key={t}
                        onClick={() => setBookTime(t)}
                        className={`py-2 rounded-lg border text-sm transition ${bookTime === t ? "bg-sky-500 text-white border-sky-500" : "hover:border-sky-400"}`}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <Card className="p-3 bg-emerald-50 border-emerald-200 text-sm">
                  Phí khám: <b>{bookingDoctor.fee}</b> • Phòng khám: {bookingDoctor.clinic}
                </Card>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setBookingDoctor(null); toast.info("Đã hủy đặt lịch"); }}>Hủy</Button>
                <Button onClick={handleBook}>Xác nhận đặt lịch</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          {editing && (
            <>
              <DialogHeader><DialogTitle>Chỉnh sửa lịch hẹn</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Ngày</Label>
                  <Input type="date" min={new Date().toISOString().slice(0, 10)} value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Giờ</Label>
                  <Input type="time" value={editing.time} onChange={e => setEditing({ ...editing, time: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditing(null); toast.info("Đã hủy thay đổi"); }}>Hủy</Button>
                <Button onClick={updateAppt}>Lưu</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!newMsgDoctor} onOpenChange={() => setNewMsgDoctor(null)}>
        <DialogContent>
          {newMsgDoctor && (
            <>
              <DialogHeader><DialogTitle>Nhắn tin cho bác sĩ</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Bác sĩ</Label>
                  <Select value={String(newMsgDoctor.id)} onValueChange={v => setNewMsgDoctor(DOCTORS.find(d => String(d.id) === v) ?? null)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOCTORS.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name} • {d.spec}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Nội dung</Label>
                  <Textarea rows={4} placeholder="Nhập câu hỏi cho bác sĩ..." value={newMsgContent} onChange={e => setNewMsgContent(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setNewMsgDoctor(null); toast.info("Đã hủy gửi tin nhắn"); }}>Hủy</Button>
                <Button onClick={submitNewMsg}>Gửi</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Overview({ onJump, appts, threads }: any) {
  const upcoming = appts.find((a: Appointment) => a.status === "Sắp tới");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
        <StatCard label="Lịch hẹn sắp tới" value={appts.filter((a: Appointment) => a.status === "Sắp tới").length.toString()} color="bg-sky-50 text-sky-700 border-sky-100" />
        <StatCard label="Đã khám" value={appts.filter((a: Appointment) => a.status === "Hoàn thành").length.toString()} color="bg-emerald-50 text-emerald-700 border-emerald-100" />
        <StatCard label="Tin nhắn" value={threads.length.toString()} color="bg-violet-50 text-violet-700 border-violet-100" />
        <StatCard label="Điểm sức khỏe" value="86/100" color="bg-amber-50 text-amber-700 border-amber-100" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-2 bg-gradient-to-br from-sky-600 via-sky-700 to-emerald-700 text-white shadow-md relative overflow-hidden animate-fade-in" style={{ borderRadius: "20px" }}>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs font-semibold opacity-90 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Lịch hẹn khám gần nhất</div>
          {upcoming ? (
            <>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">{upcoming.doctorName}</h2>
              <p className="opacity-95 mt-1 text-sm font-medium">{upcoming.doctorSpec} • {upcoming.date} lúc {upcoming.time} • {upcoming.clinic}</p>
              <div className="mt-5 flex gap-2.5">
                <Button variant="secondary" className="rounded-xl text-xs px-4" onClick={() => onJump("appointments")}>Xem chi tiết</Button>
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl text-xs px-4" onClick={() => onJump("messages")}>Nhắn tin bác sĩ</Button>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <p className="opacity-90 text-sm">Bạn không có lịch hẹn khám nào sắp tới.</p>
              <Button variant="secondary" className="rounded-xl text-xs px-4 mt-3" onClick={() => onJump("search")}>Đặt lịch ngay</Button>
            </div>
          )}
        </Card>
        <Card className="p-5 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Hành động nhanh</h4>
          <div className="grid gap-2.5">
            <Button variant="outline" className="rounded-xl justify-start text-xs border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => onJump("search")}><Search className="w-4 h-4 mr-2.5 text-slate-400" /> Tìm bác sĩ chuyên khoa</Button>
            <Button variant="outline" className="rounded-xl justify-start text-xs border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => onJump("messages")}><MessagesSquare className="w-4 h-4 mr-2.5 text-slate-400" /> Hỏi đáp bác sĩ trực tuyến</Button>
            <Button variant="outline" className="rounded-xl justify-start text-xs border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => onJump("records")}><FileHeart className="w-4 h-4 mr-2.5 text-slate-400" /> Tra cứu hồ sơ bệnh án</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="p-4 bg-white border border-slate-100 shadow-sm animate-fade-in" style={{ borderRadius: "16px" }}>
      <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>{label}</div>
      <div className="mt-3 text-3xl font-bold text-slate-800 tracking-tight">{value}</div>
    </Card>
  );
}

function SearchSection({ search, setSearch, specFilter, setSpecFilter, doctors, onPick, onBook }: any) {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "16px" }}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:ring-1 focus:ring-sky-500" placeholder="Tìm theo tên bác sĩ, chuyên khoa..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
          </div>
          <Select value={specFilter} onValueChange={setSpecFilter}>
            <SelectTrigger className="md:w-56 h-10 rounded-xl border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium"><SelectValue placeholder="Chuyên khoa" /></SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-lg">
              <SelectItem value="all" className="text-xs">Tất cả chuyên khoa</SelectItem>
              {SPECIALTIES.map((s: string) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {doctors.length === 0 ? (
        <Card className="p-10 text-center bg-white border-slate-100" style={{ borderRadius: "16px" }}>
          <p className="text-slate-400 font-medium">Không tìm thấy bác sĩ phù hợp.</p>
          <p className="text-xs text-slate-400 mt-1">Hãy thử tìm với từ khóa khác hoặc xóa bộ lọc.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {doctors.map((d: any) => (
            <Card key={d.id} className="p-5 hover:shadow-md transition-all duration-300 bg-white border border-slate-100 hover:border-sky-100" style={{ borderRadius: "16px" }}>
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14 border border-slate-100 shadow-sm"><AvatarFallback className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-bold text-lg">{d.name.split(" ").pop()[0]}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-800 text-base tracking-tight">{d.name}</div>
                      <span className="inline-flex px-2 py-0.5 mt-1 rounded-md bg-sky-50 text-sky-700 text-[10px] font-semibold tracking-wide border border-sky-100">{d.spec}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100"><Star className="w-3.5 h-3.5 fill-current" />{d.rating}</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-3 flex items-center gap-3.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {d.clinic}</span>
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{d.fee}</span>
                  </div>
                  <div className="flex gap-2.5 mt-4">
                    <Button size="sm" variant="outline" className="rounded-xl flex-1 text-xs" onClick={() => onPick(d)}>Chi tiết</Button>
                    <Button size="sm" className="rounded-xl flex-1 text-xs bg-slate-900 hover:bg-slate-800" onClick={() => onBook(d)}>Đặt lịch</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Appointments({ appointments, onCancel, onEdit }: any) {
  return (
    <Card className="p-0 overflow-hidden bg-white border border-slate-100 shadow-sm animate-fade-in" style={{ borderRadius: "20px" }}>
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="border-b border-slate-100 px-5 pt-4 bg-slate-50/50">
          <TabsList className="bg-slate-100 rounded-xl p-1 h-10 border border-slate-200/50">
            <TabsTrigger value="upcoming" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Sắp tới</TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Đã khám</TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Đã hủy</TabsTrigger>
          </TabsList>
        </div>
        {(["Sắp tới", "Hoàn thành", "Đã hủy"] as const).map((s, i) => (
          <TabsContent key={s} value={["upcoming", "past", "cancelled"][i]} className="p-5 space-y-3.5 m-0 bg-white">
            {appointments.filter((a: Appointment) => a.status === s).length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">Không có lịch hẹn ở trạng thái này.</div>
            ) : appointments.filter((a: Appointment) => a.status === s).map((a: Appointment) => (
              <div key={a.id} className="flex items-center justify-between p-4.5 border border-slate-100 rounded-xl hover:shadow-sm transition-all" style={{ borderRadius: "16px" }}>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shrink-0"><Stethoscope className="w-5 h-5" /></div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{a.doctorName}</div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">{a.doctorSpec}</span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 font-medium text-slate-600"><Clock className="w-3.5 h-3.5 text-slate-400" /> {a.date} • {a.time}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium text-slate-600">{a.clinic}</span>
                    </div>
                  </div>
                </div>
                {s === "Sắp tới" && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs px-3 border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => onEdit(a)}><Pencil className="w-3.5 h-3.5 mr-1 text-slate-400" />Sửa</Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs px-3 text-rose-600 border-rose-100 hover:bg-rose-50/50" onClick={() => onCancel(a.id)}><X className="w-3.5 h-3.5 mr-1" />Hủy</Button>
                  </div>
                )}
                {s === "Hoàn thành" && <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 shrink-0">Đã hoàn thành</span>}
                {s === "Đã hủy" && <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 shrink-0">Đã hủy</span>}
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}

function Records() {
  const [tab, setTab] = useState("benhan");
  const [openItem, setOpenItem] = useState<any | null>(null);
  const items: any = {
    benhan: [
      { id: 1, title: "Khám tổng quát định kỳ", date: "2026-04-22", doctor: "BS. Phạm Mai Dung", note: "Sức khỏe tổng thể tốt, huyết áp ổn định." },
      { id: 2, title: "Viêm họng cấp", date: "2026-02-10", doctor: "BS. Lê Hoàng Cường", note: "Kê đơn thuốc kháng sinh 7 ngày." },
    ],
    ketqua: [
      { id: 1, title: "Xét nghiệm máu", date: "2026-04-22", doctor: "Lab Trung tâm", note: "Trong giới hạn bình thường." },
      { id: 2, title: "Siêu âm bụng", date: "2026-04-22", doctor: "Lab Trung tâm", note: "Không phát hiện bất thường." },
    ],
    donthuoc: [
      { id: 1, title: "Đơn thuốc viêm họng", date: "2026-02-10", doctor: "BS. Lê Hoàng Cường", note: "Amoxicillin 500mg • Paracetamol 500mg • Vitamin C" },
    ],
  };

  return (
    <Card className="p-0 overflow-hidden bg-white border border-slate-100 shadow-sm animate-fade-in" style={{ borderRadius: "20px" }}>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="border-b border-slate-100 px-5 pt-4 bg-slate-50/50">
          <TabsList className="bg-slate-100 rounded-xl p-1 h-10 border border-slate-200/50">
            <TabsTrigger value="benhan" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Bệnh án</TabsTrigger>
            <TabsTrigger value="ketqua" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Kết quả xét nghiệm</TabsTrigger>
            <TabsTrigger value="donthuoc" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Đơn thuốc</TabsTrigger>
          </TabsList>
        </div>
        {(["benhan", "ketqua", "donthuoc"] as const).map(k => (
          <TabsContent key={k} value={k} className="p-5 space-y-3.5 m-0 bg-white">
            {items[k].map((it: any) => (
              <div key={it.id} className="p-4.5 border border-slate-100 rounded-xl flex justify-between items-start hover:shadow-sm transition-all" style={{ borderRadius: "16px" }}>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{it.title}</div>
                  <div className="text-xs text-slate-400 mt-1 font-semibold">{it.date} • {it.doctor}</div>
                  <div className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 px-3 py-2 rounded-lg font-medium">{it.note}</div>
                </div>
                <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs px-3 border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 ml-3" onClick={() => setOpenItem(it)}>Xem chi tiết</Button>
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>
      <Dialog open={!!openItem} onOpenChange={() => setOpenItem(null)}>
        <DialogContent className="rounded-2xl">
          {openItem && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle className="font-bold text-slate-800 text-lg">{openItem.title}</DialogTitle>
                <DialogDescription className="text-xs font-semibold">{openItem.date} • {openItem.doctor}</DialogDescription>
              </DialogHeader>
              <section className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Chẩn đoán từ Bác sĩ</div>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed">{openItem.note}</p>
              </section>
              <section className="space-y-1">
                <div className="text-xs font-bold text-slate-800 tracking-tight">Hướng dẫn & Lưu ý chăm sóc</div>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li className="flex items-center gap-1.5">• Dùng thuốc đúng liều lượng chỉ định, không tự ý tăng/giảm liều.</li>
                  <li className="flex items-center gap-1.5">• Duy trì uống đủ 2 - 2.5 lít nước mỗi ngày, nghỉ ngơi khoa học.</li>
                  <li className="flex items-center gap-1.5">• Tái khám đúng hẹn hoặc liên hệ hotline phòng khám ngay khi triệu chứng trở nặng.</li>
                </ul>
              </section>
              <DialogFooter className="gap-2.5">
                <Button variant="outline" className="rounded-xl text-xs h-9 border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => toast.success("Đã tải tệp PDF thành công")}>Tải PDF</Button>
                <Button onClick={() => setOpenItem(null)} className="rounded-xl text-xs h-9 bg-slate-900 hover:bg-slate-800">Đóng</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Tracking({ onBook }: { onBook: () => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
      <Card className="p-5 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
        <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Theo dõi sinh hiệu lâm sàng</h4>
        <div className="space-y-4">
          {[
            { label: "Huyết áp", value: "120/80 mmHg", p: 75, c: "bg-sky-500" },
            { label: "Nhịp tim", value: "72 bpm", p: 65, c: "bg-rose-500" },
            { label: "Đường huyết", value: "5.4 mmol/L", p: 80, c: "bg-amber-500" },
            { label: "Chỉ số cơ thể (BMI)", value: "22.4", p: 70, c: "bg-emerald-500" },
          ].map(m => (
            <div key={m.label} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">{m.label}</span>
                <span className="text-slate-800 font-bold">{m.value}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${m.c}`} style={{ width: `${m.p}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5 bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-orange-100 shadow-sm relative overflow-hidden" style={{ borderRadius: "20px" }}>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-orange-200/10 rounded-full blur-2xl pointer-events-none" />
        <h4 className="font-bold text-orange-800 text-sm tracking-tight">Nhắc lịch tái khám định kỳ</h4>
        <p className="text-xs text-orange-700 mt-1 font-medium leading-relaxed">BS. Nguyễn Văn An đề nghị thực hiện tái khám tầm soát định kỳ sau 1 tháng.</p>
        <Card className="p-3.5 mt-3.5 bg-white/80 border border-orange-100/50" style={{ borderRadius: "12px" }}>
          <div className="text-xs font-bold text-slate-700">Bác sĩ phụ trách: <b>BS. Nguyễn Văn An</b></div>
          <div className="text-[11px] text-slate-400 mt-1 font-semibold">Chuyên khoa Tim mạch • Khám gần nhất: 2026-04-10</div>
        </Card>
        <div className="flex gap-2.5 mt-4">
          <Button onClick={onBook} className="rounded-xl text-xs h-9 bg-orange-600 hover:bg-orange-700 text-white shadow-sm shrink-0">Đặt lịch tái khám</Button>
          <Button variant="outline" className="rounded-xl text-xs h-9 border-orange-200 bg-transparent text-orange-700 hover:bg-orange-50/50" onClick={() => toast.info("Đã tạm hoãn nhắc nhở")}>Bỏ qua</Button>
        </div>
      </Card>
      <Card className="p-5 md:col-span-2 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
        <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Lịch sử quá trình khám & điều trị</h4>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-1 before:bottom-1 before:w-0.5 before:bg-slate-100">
          {[
            { d: "2026-04-22", t: "Khám tổng quát sức khỏe", n: "Sức khỏe lâm sàng hoàn toàn ổn định" },
            { d: "2026-02-10", t: "Điều trị viêm họng cấp", n: "Điều trị bằng thuốc kháng sinh, bệnh nhân hồi phục hoàn toàn" },
            { d: "2025-11-15", t: "Tầm soát tim mạch chuyên khoa", n: "Theo dõi nhịp tim và huyết áp định kỳ tại nhà" },
          ].map((e, i) => (
            <div key={i} className="relative animate-fade-in">
              <div className="absolute -left-[1.38rem] top-1.5 w-2 h-2 rounded-full bg-sky-500 ring-4 ring-sky-100" />
              <div className="text-[10px] text-slate-400 font-bold">{e.d}</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{e.t}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">{e.n}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
