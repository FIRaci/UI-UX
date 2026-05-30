import { useEffect, useState } from "react";
import { AppShell } from "./AppShell";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { LayoutDashboard, Users, BarChart3, Calendar, Bell, Briefcase, Search, Pencil, Plus, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { useStore, store, type Appointment } from "../store";
import { AdminDashboardOverview } from "./AdminDashboardOverview";
import { AdminDashboardReports } from "./AdminDashboardReports";

type Patient = { id: number; name: string; phone: string; gender: string; dob: string; address: string };

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const raw = (e as CustomEvent<string>).detail;
      if (!raw) return;
      let view = raw;
      try { const p = JSON.parse(raw); if (p.view) view = p.view; } catch {}
      const map: Record<string, string> = {
        search: "patients", appointments: "schedule", overview: "overview",
        patients: "patients", reports: "reports", schedule: "schedule",
        notify: "notify", doctors: "doctors",
      };
      if (map[view]) setActive(map[view]);
    };
    window.addEventListener("app:navigate", handleNavigate);
    return () => window.removeEventListener("app:navigate", handleNavigate);
  }, []);

  const [patients, setPatients] = useState<Patient[]>([
    { id: 1, name: "Nguyễn Minh Khoa", phone: "0901234567", gender: "Nam", dob: "1992-04-15", address: "Q1, TP.HCM" },
    { id: 2, name: "Trần Thu Hà", phone: "0907654321", gender: "Nữ", dob: "1996-08-22", address: "Q3, TP.HCM" },
    { id: 3, name: "Lê Văn Tú", phone: "0912345678", gender: "Nam", dob: "1980-12-01", address: "Q.Tân Bình" },
    { id: 4, name: "Phạm Bích Ngọc", phone: "0987654321", gender: "Nữ", dob: "1975-06-10", address: "Q7, TP.HCM" },
  ]);
  const [pSearch, setPSearch] = useState("");
  const [editingP, setEditingP] = useState<Patient | null>(null);

  const filteredP = patients.filter(p =>
    p.name.toLowerCase().includes(pSearch.toLowerCase()) || p.phone.includes(pSearch)
  );

  const savePatient = () => {
    if (!editingP) return;
    if (!editingP.name.trim() || !editingP.phone.trim()) { toast.error("Vui lòng nhập đầy đủ Họ tên và Số điện thoại"); return; }
    if (!/^\d{9,11}$/.test(editingP.phone)) { toast.error("Số điện thoại không hợp lệ"); return; }
    setPatients(prev => {
      const exists = prev.find(p => p.id === editingP.id);
      return exists ? prev.map(p => p.id === editingP.id ? editingP : p) : [{ ...editingP, id: Date.now() }, ...prev];
    });
    toast.success("Cập nhật thông tin thành công");
    setEditingP(null);
  };

  const allAppointments = useStore(s => s.appointments);
  const [editingS, setEditingS] = useState<(Partial<Appointment> & { id: number }) | null>(null);
  const [sBranch, setSBranch] = useState("all");
  const filteredSchedules = allAppointments.filter(a => sBranch === "all" || a.clinic === sBranch);

  const saveSchedule = () => {
    if (!editingS) return;
    if (!editingS.doctorName || !editingS.date || !editingS.time) { toast.error("Thông tin lịch chưa đầy đủ"); return; }
    if (editingS.id === 0) {
      store.addAppointment({
        patientName: editingS.patientName || "—", doctorName: editingS.doctorName,
        doctorSpec: editingS.doctorSpec || "", date: editingS.date, time: editingS.time,
        clinic: editingS.clinic || "CN Q1", status: "Sắp tới",
      });
    } else {
      store.updateAppointment(editingS.id, editingS);
    }
    toast.success("Lưu lịch thành công");
    setEditingS(null);
  };

  const [notif, setNotif] = useState({ target: "all", content: "", time: "" });

  const [doctors, setDoctors] = useState([
    { id: 1, name: "BS. Nguyễn Văn An", spec: "Tim mạch", shifts: ["T2 8-12", "T4 14-18"] },
    { id: 2, name: "BS. Trần Thị Bình", spec: "Da liễu", shifts: ["T3 9-12", "T5 13-17"] },
    { id: 3, name: "BS. Lê Hoàng Cường", spec: "Nhi khoa", shifts: ["T2-T6 8-17"] },
  ]);
  const [shiftDoctor, setShiftDoctor] = useState<typeof doctors[number] | null>(null);
  const [shiftDay, setShiftDay] = useState("T2");
  const [shiftStart, setShiftStart] = useState("08:00");
  const [shiftEnd, setShiftEnd] = useState("12:00");

  const addShift = () => {
    if (!shiftDoctor) return;
    if (shiftStart >= shiftEnd) { toast.error("Giờ kết thúc phải sau giờ bắt đầu"); return; }
    const label = `${shiftDay} ${shiftStart.slice(0, 5)}-${shiftEnd.slice(0, 5)}`;
    if (shiftDoctor.shifts.includes(label)) { toast.error("Ca này đã tồn tại"); return; }
    setDoctors(prev => prev.map(x => x.id === shiftDoctor.id ? { ...x, shifts: [...x.shifts, label] } : x));
    toast.success(`Đã thêm ca ${label}`);
    setShiftDoctor(null);
  };

  return (
    <AppShell
      title="Bảng quản trị phòng khám"
      subtitle="Chào quản trị viên Vũ Hồng Mai"
      roleLabel="Quản lý"
      roleColor="bg-rose-100 text-rose-700 border border-rose-200"
      initials="HM"
      active={active}
      onNav={setActive}
      onLogout={onLogout}
      nav={[
        { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
        { key: "patients", label: "Quản lý bệnh nhân", icon: Users },
        { key: "reports", label: "Báo cáo & thống kê", icon: BarChart3 },
        { key: "schedule", label: "Lịch khám hệ thống", icon: Calendar },
        { key: "notify", label: "Thông báo", icon: Bell },
        { key: "doctors", label: "Lịch làm việc BS", icon: Briefcase },
      ]}
    >
      {active === "overview" && <AdminDashboardOverview />}

      {active === "patients" && (
        <Card className="p-5 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "16px" }}>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h4 className="text-sm font-semibold text-slate-800 tracking-tight">Quản lý hồ sơ bệnh nhân</h4>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-9 w-56 h-9 text-xs rounded-xl" placeholder="Tìm theo tên, SĐT..." value={pSearch} onChange={e => setPSearch(e.target.value)} />
              </div>
              <Button size="sm" className="h-9 text-xs rounded-xl" onClick={() => setEditingP({ id: 0, name: "", phone: "", gender: "Nam", dob: "", address: "" })}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Thêm
              </Button>
            </div>
          </div>
          {filteredP.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center"><Users className="w-5 h-5 text-slate-400" /></div>
              <p className="mt-2 text-sm text-slate-500 font-medium">{patients.length === 0 ? "Danh sách bệnh nhân trống" : "Không tìm thấy bệnh nhân phù hợp"}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-500">Họ tên</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">SĐT</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Giới tính</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Ngày sinh</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Địa chỉ</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredP.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-rose-100 text-rose-700 text-xs font-semibold">{p.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-700">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{p.phone}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px] font-medium">{p.gender}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-600">{p.dob}</TableCell>
                    <TableCell className="text-sm text-slate-400">{p.address}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="h-8 w-8 rounded-xl" onClick={() => setEditingP(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {active === "reports" && <AdminDashboardReports />}

      {active === "schedule" && (
        <Card className="p-5 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "16px" }}>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h4 className="text-sm font-semibold text-slate-800 tracking-tight">Lịch khám toàn hệ thống</h4>
            <div className="flex gap-2">
              <Select value={sBranch} onValueChange={setSBranch}>
                <SelectTrigger className="w-36 h-9 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="CN Q1">CN Q1</SelectItem>
                  <SelectItem value="CN Q3">CN Q3</SelectItem>
                  <SelectItem value="CN Tân Bình">CN Tân Bình</SelectItem>
                  <SelectItem value="CN Q7">CN Q7</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="h-9 text-xs rounded-xl" onClick={() => setEditingS({ id: 0, doctorName: "", patientName: "", date: "", time: "", clinic: "CN Q1", doctorSpec: "" })}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Tạo lịch
              </Button>
            </div>
          </div>
          {filteredSchedules.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center"><Calendar className="w-5 h-5 text-slate-400" /></div>
              <p className="mt-2 text-sm text-slate-500 font-medium">Chưa có lịch khám nào</p>
              <p className="text-xs text-slate-400 mt-0.5">Bấm "Tạo lịch" để thêm mới</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSchedules.map(s => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {s.doctorName} <span className="text-slate-400 font-normal">→ {s.patientName}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.date} • {s.time} • {s.clinic}{s.doctorSpec ? ` • ${s.doctorSpec}` : ""}</div>
                  </div>
                  <div className="flex gap-2 items-center shrink-0">
                    <Badge variant={s.status === "Sắp tới" ? "secondary" : s.status === "Hoàn thành" ? "default" : "outline"} className="text-[10px] font-medium">
                      {s.status}
                    </Badge>
                    <Button size="sm" variant="outline" className="h-8 w-8 rounded-xl" onClick={() => setEditingS(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 rounded-xl text-rose-600 hover:text-rose-700" onClick={() => {
                      store.updateAppointment(s.id, { status: "Đã hủy" });
                      toast.success("Đã hủy lịch");
                    }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {active === "notify" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "16px" }}>
            <h4 className="text-sm font-semibold text-slate-800 tracking-tight mb-4">Soạn thông báo</h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500">Đối tượng nhận</Label>
                <Select value={notif.target} onValueChange={v => setNotif({ ...notif, target: v })}>
                  <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toàn hệ thống</SelectItem>
                    <SelectItem value="patient">Bệnh nhân</SelectItem>
                    <SelectItem value="doctor">Bác sĩ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500">Nội dung</Label>
                <Textarea rows={5} placeholder="Nhập nội dung thông báo..." className="rounded-xl text-sm" value={notif.content} onChange={e => setNotif({ ...notif, content: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500">Thời gian gửi</Label>
                <Input type="datetime-local" className="h-9 text-xs rounded-xl" value={notif.time} onChange={e => setNotif({ ...notif, time: e.target.value })} />
              </div>
              <Button className="w-full h-9 text-xs rounded-xl" onClick={() => {
                if (!notif.content.trim() || !notif.time) { toast.error("Vui lòng nhập đầy đủ nội dung và thời gian"); return; }
                toast.success("Đã gửi thông báo thành công!");
                setNotif({ target: "all", content: "", time: "" });
              }}><Send className="w-3.5 h-3.5 mr-1.5" />Gửi thông báo</Button>
            </div>
          </Card>
          <Card className="p-5 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "16px" }}>
            <h4 className="text-sm font-semibold text-slate-800 tracking-tight mb-4">Thông báo gần đây</h4>
            {[
              { t: "Nhắc lịch khám tuần", to: "Bệnh nhân", d: "06/05 08:00", st: "Đã gửi" },
              { t: "Cập nhật lịch làm việc", to: "Bác sĩ", d: "05/05 17:30", st: "Đã gửi" },
              { t: "Bảo trì hệ thống", to: "Toàn hệ thống", d: "04/05 22:00", st: "Đã gửi" },
            ].map((n, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-2 last:mb-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{n.t}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Đối tượng: {n.to} • {n.d}</div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-medium shrink-0">{n.st}</Badge>
              </div>
            ))}
          </Card>
        </div>
      )}

      {active === "doctors" && (
        <Card className="p-5 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "16px" }}>
          <h4 className="text-sm font-semibold text-slate-800 tracking-tight mb-4">Lịch làm việc của bác sĩ</h4>
          <div className="space-y-3">
            {doctors.map(d => (
              <Card key={d.id} className="p-4 border border-slate-100 bg-white" style={{ borderRadius: "14px" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-rose-100 text-rose-700 text-xs font-semibold">{d.name.split(" ").pop()?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{d.name}</div>
                      <Badge variant="secondary" className="mt-1 text-[10px] font-medium">{d.spec}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 text-xs rounded-xl shrink-0" onClick={() => {
                    setShiftDoctor(d);
                    setShiftDay("T2"); setShiftStart("08:00"); setShiftEnd("12:00");
                  }}><Plus className="w-3 h-3 mr-1" />Thêm ca</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {d.shifts.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium">
                      {s}
                      <button className="text-rose-500 hover:text-rose-700 ml-0.5" onClick={() => {
                        toast("Xác nhận xóa ca này?", {
                          description: `Ca: ${s}`,
                          action: { label: "Xóa", onClick: () => {
                            setDoctors(prev => prev.map(x => x.id === d.id ? { ...x, shifts: x.shifts.filter((_, idx) => idx !== i) } : x));
                            toast.success("Đã xóa ca");
                          }},
                          cancel: { label: "Hủy", onClick: () => {} },
                        });
                      }}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={!!editingP} onOpenChange={() => setEditingP(null)}>
        <DialogContent>
          {editingP && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">{editingP.id ? "Cập nhật" : "Thêm"} bệnh nhân</DialogTitle>
                <DialogDescription>Thông tin hành chính bệnh nhân</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2"><Label className="text-xs font-semibold text-slate-500">Họ tên</Label><Input className="h-9 text-sm rounded-xl" value={editingP.name} onChange={e => setEditingP({ ...editingP, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Số điện thoại</Label><Input className="h-9 text-sm rounded-xl" value={editingP.phone} onChange={e => setEditingP({ ...editingP, phone: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Giới tính</Label>
                  <Select value={editingP.gender} onValueChange={v => setEditingP({ ...editingP, gender: v })}>
                    <SelectTrigger className="h-9 text-sm rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Ngày sinh</Label><Input type="date" className="h-9 text-sm rounded-xl" value={editingP.dob} onChange={e => setEditingP({ ...editingP, dob: e.target.value })} /></div>
                <div className="space-y-1.5 col-span-2"><Label className="text-xs font-semibold text-slate-500">Địa chỉ</Label><Input className="h-9 text-sm rounded-xl" value={editingP.address} onChange={e => setEditingP({ ...editingP, address: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl text-xs h-9" onClick={() => { setEditingP(null); toast.info("Đã hủy thay đổi"); }}>Hủy</Button>
                <Button className="rounded-xl text-xs h-9" onClick={savePatient}>Lưu</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingS} onOpenChange={() => setEditingS(null)}>
        <DialogContent>
          {editingS && (
            <>
              <DialogHeader><DialogTitle className="text-base">{editingS.id ? "Sửa" : "Tạo"} lịch khám</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Bác sĩ</Label><Input className="h-9 text-sm rounded-xl" value={editingS.doctorName ?? ""} onChange={e => setEditingS({ ...editingS, doctorName: e.target.value })} placeholder="VD: BS. Nguyễn Văn An" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Bệnh nhân</Label><Input className="h-9 text-sm rounded-xl" value={editingS.patientName ?? ""} onChange={e => setEditingS({ ...editingS, patientName: e.target.value })} placeholder="VD: Nguyễn Minh Khoa" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Chuyên khoa</Label><Input className="h-9 text-sm rounded-xl" value={editingS.doctorSpec ?? ""} onChange={e => setEditingS({ ...editingS, doctorSpec: e.target.value })} placeholder="VD: Tim mạch" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Ngày</Label><Input type="date" className="h-9 text-sm rounded-xl" value={editingS.date ?? ""} onChange={e => setEditingS({ ...editingS, date: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Giờ</Label><Input type="time" className="h-9 text-sm rounded-xl" value={editingS.time ?? ""} onChange={e => setEditingS({ ...editingS, time: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-500">Chi nhánh</Label>
                  <Select value={editingS.clinic ?? "CN Q1"} onValueChange={v => setEditingS({ ...editingS, clinic: v })}>
                    <SelectTrigger className="h-9 text-sm rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CN Q1">CN Q1</SelectItem>
                      <SelectItem value="CN Q3">CN Q3</SelectItem>
                      <SelectItem value="CN Tân Bình">CN Tân Bình</SelectItem>
                      <SelectItem value="CN Q7">CN Q7</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl text-xs h-9" onClick={() => { setEditingS(null); toast.info("Đã hủy thao tác"); }}>Hủy</Button>
                <Button className="rounded-xl text-xs h-9" onClick={saveSchedule}>Lưu</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!shiftDoctor} onOpenChange={() => setShiftDoctor(null)}>
        <DialogContent>
          {shiftDoctor && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">Thêm ca làm việc</DialogTitle>
                <DialogDescription>{shiftDoctor.name} • {shiftDoctor.spec}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500">Ngày</Label>
                  <Select value={shiftDay} onValueChange={setShiftDay}>
                    <SelectTrigger className="h-9 text-sm rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500">Bắt đầu</Label>
                  <Input type="time" className="h-9 text-sm rounded-xl" value={shiftStart} onChange={e => setShiftStart(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500">Kết thúc</Label>
                  <Input type="time" className="h-9 text-sm rounded-xl" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl text-xs h-9" onClick={() => setShiftDoctor(null)}>Hủy</Button>
                <Button className="rounded-xl text-xs h-9" onClick={addShift}>Thêm ca</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
