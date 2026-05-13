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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Lịch hẹn sắp tới" value={appts.filter((a: Appointment) => a.status === "Sắp tới").length.toString()} color="bg-sky-50 text-sky-700" />
        <StatCard label="Đã khám" value={appts.filter((a: Appointment) => a.status === "Hoàn thành").length.toString()} color="bg-emerald-50 text-emerald-700" />
        <StatCard label="Tin nhắn" value={threads.length.toString()} color="bg-violet-50 text-violet-700" />
        <StatCard label="Điểm sức khỏe" value="86/100" color="bg-amber-50 text-amber-700" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
          <div className="text-sm opacity-90">Lịch khám sắp tới</div>
          {upcoming ? (
            <>
              <h2 className="mt-1 tracking-tight">{upcoming.doctorName}</h2>
              <p className="opacity-90 mt-1">{upcoming.doctorSpec} • {upcoming.date} lúc {upcoming.time}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" onClick={() => onJump("appointments")}>Xem chi tiết</Button>
                <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" onClick={() => onJump("messages")}>Nhắn bác sĩ</Button>
              </div>
            </>
          ) : <p className="mt-2 opacity-90">Bạn không có lịch nào sắp tới.</p>}
        </Card>
        <Card className="p-5">
          <h4 className="tracking-tight">Hành động nhanh</h4>
          <div className="mt-3 grid gap-2">
            <Button variant="outline" onClick={() => onJump("search")}><Search className="w-4 h-4 mr-2" /> Tìm bác sĩ</Button>
            <Button variant="outline" onClick={() => onJump("messages")}><MessagesSquare className="w-4 h-4 mr-2" /> Tin nhắn bác sĩ</Button>
            <Button variant="outline" onClick={() => onJump("records")}><FileHeart className="w-4 h-4 mr-2" /> Xem hồ sơ</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="p-4">
      <div className={`inline-flex px-2 py-0.5 rounded-md text-xs ${color}`}>{label}</div>
      <div className="mt-2 tracking-tight text-2xl">{value}</div>
    </Card>
  );
}

function SearchSection({ search, setSearch, specFilter, setSpecFilter, doctors, onPick, onBook }: any) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm theo tên bác sĩ, triệu chứng..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
          </div>
          <Select value={specFilter} onValueChange={setSpecFilter}>
            <SelectTrigger className="md:w-56"><SelectValue placeholder="Chuyên khoa" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
              {SPECIALTIES.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {doctors.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">Không tìm thấy bác sĩ phù hợp.</p>
          <p className="text-sm text-muted-foreground mt-1">Hãy thử từ khóa khác hoặc bỏ bộ lọc.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {doctors.map((d: any) => (
            <Card key={d.id} className="p-4 hover:shadow-lg transition">
              <div className="flex items-start gap-3">
                <Avatar className="w-14 h-14"><AvatarFallback className="bg-sky-100 text-sky-700">{d.name.split(" ").pop()[0]}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="tracking-tight">{d.name}</div>
                      <Badge variant="secondary" className="mt-0.5">{d.spec}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-current" />{d.rating}</div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {d.clinic}</span>
                    <span className="text-emerald-600">{d.fee}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => onPick(d)}>Xem chi tiết</Button>
                    <Button size="sm" onClick={() => onBook(d)}>Đặt lịch</Button>
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
    <Card className="p-0 overflow-hidden">
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="border-b px-4 pt-4">
          <TabsList>
            <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
            <TabsTrigger value="past">Đã khám</TabsTrigger>
            <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
          </TabsList>
        </div>
        {(["Sắp tới", "Hoàn thành", "Đã hủy"] as const).map((s, i) => (
          <TabsContent key={s} value={["upcoming", "past", "cancelled"][i]} className="p-4 space-y-3 m-0">
            {appointments.filter((a: Appointment) => a.status === s).length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">Không có lịch hẹn.</div>
            ) : appointments.filter((a: Appointment) => a.status === s).map((a: Appointment) => (
              <div key={a.id} className="flex items-center justify-between p-4 border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center"><Stethoscope className="w-5 h-5" /></div>
                  <div>
                    <div>{a.doctorName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3">
                      <span>{a.doctorSpec}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {a.date} • {a.time}</span>
                      <span>{a.clinic}</span>
                    </div>
                  </div>
                </div>
                {s === "Sắp tới" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(a)}><Pencil className="w-3.5 h-3.5 mr-1" />Sửa</Button>
                    <Button size="sm" variant="outline" className="text-rose-600" onClick={() => onCancel(a.id)}><X className="w-3.5 h-3.5 mr-1" />Hủy</Button>
                  </div>
                )}
                {s === "Hoàn thành" && <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">Hoàn thành</Badge>}
                {s === "Đã hủy" && <Badge variant="secondary">Đã hủy</Badge>}
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
    <Card className="p-0 overflow-hidden">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="border-b px-4 pt-4">
          <TabsList>
            <TabsTrigger value="benhan">Bệnh án</TabsTrigger>
            <TabsTrigger value="ketqua">Kết quả xét nghiệm</TabsTrigger>
            <TabsTrigger value="donthuoc">Đơn thuốc</TabsTrigger>
          </TabsList>
        </div>
        {(["benhan", "ketqua", "donthuoc"] as const).map(k => (
          <TabsContent key={k} value={k} className="p-4 space-y-3 m-0">
            {items[k].map((it: any) => (
              <div key={it.id} className="p-4 border rounded-xl flex justify-between items-start">
                <div>
                  <div>{it.title}</div>
                  <div className="text-sm text-muted-foreground">{it.date} • {it.doctor}</div>
                  <div className="text-sm mt-1.5">{it.note}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setOpenItem(it)}>Xem</Button>
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>
      <Dialog open={!!openItem} onOpenChange={() => setOpenItem(null)}>
        <DialogContent>
          {openItem && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>{openItem.title}</DialogTitle>
                <DialogDescription>{openItem.date} • {openItem.doctor}</DialogDescription>
              </DialogHeader>
              <section className="p-3 rounded-lg bg-slate-50 border">
                <div className="text-xs text-muted-foreground mb-1">Ghi chú của bác sĩ</div>
                <p className="text-sm text-slate-800">{openItem.note}</p>
              </section>
              <section>
                <div className="text-sm tracking-tight mb-1">Hướng dẫn chăm sóc</div>
                <ul className="text-sm text-slate-700 space-y-0.5">
                  <li>• Dùng thuốc đúng liều, không tự ý ngưng.</li>
                  <li>• Uống đủ 2 lít nước/ngày, nghỉ ngơi hợp lý.</li>
                  <li>• Tái khám hoặc liên hệ bác sĩ nếu triệu chứng nặng hơn.</li>
                </ul>
              </section>
              <DialogFooter>
                <Button variant="outline" onClick={() => toast.success("Đã tải PDF")}>Tải PDF</Button>
                <Button onClick={() => setOpenItem(null)}>Đóng</Button>
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
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="p-5">
        <h4 className="tracking-tight">Chỉ số sức khỏe</h4>
        <div className="space-y-4 mt-3">
          {[
            { label: "Huyết áp", value: "120/80 mmHg", p: 75 },
            { label: "Nhịp tim", value: "72 bpm", p: 65 },
            { label: "Đường huyết", value: "5.4 mmol/L", p: 80 },
            { label: "BMI", value: "22.4", p: 70 },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-sm">
                <span>{m.label}</span>
                <span className="text-muted-foreground">{m.value}</span>
              </div>
              <Progress value={m.p} className="mt-1" />
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <h4 className="tracking-tight">Nhắc lịch tái khám</h4>
        <p className="text-sm text-muted-foreground mt-1">Bác sĩ Nguyễn Văn An đề nghị tái khám sau 1 tháng.</p>
        <Card className="p-3 mt-3 bg-white">
          <div className="text-sm">Bác sĩ điều trị: <b>BS. Nguyễn Văn An</b></div>
          <div className="text-sm text-muted-foreground">Chuyên khoa Tim mạch • Lần khám gần nhất: 2026-04-10</div>
        </Card>
        <div className="flex gap-2 mt-3">
          <Button onClick={onBook}>Đặt lịch tái khám</Button>
          <Button variant="outline" onClick={() => toast.info("Đã bỏ qua nhắc nhở")}>Bỏ qua</Button>
        </div>
      </Card>
      <Card className="p-5 md:col-span-2">
        <h4 className="tracking-tight">Lịch sử điều trị</h4>
        <div className="mt-3 relative pl-6 space-y-4 before:absolute before:left-2 before:top-1 before:bottom-1 before:w-0.5 before:bg-slate-200">
          {[
            { d: "2026-04-22", t: "Khám tổng quát", n: "Sức khỏe ổn định" },
            { d: "2026-02-10", t: "Viêm họng cấp", n: "Đã điều trị, hồi phục" },
            { d: "2025-11-15", t: "Khám tim mạch", n: "Theo dõi định kỳ" },
          ].map((e, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.4rem] top-1 w-3 h-3 rounded-full bg-sky-500 ring-4 ring-sky-100" />
              <div className="text-sm text-muted-foreground">{e.d}</div>
              <div>{e.t}</div>
              <div className="text-sm text-muted-foreground">{e.n}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
