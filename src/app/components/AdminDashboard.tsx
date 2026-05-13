import { useState } from "react";
import { AppShell } from "./AppShell";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
<<<<<<< HEAD
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { LayoutDashboard, Users, BarChart3, Calendar, Bell, Briefcase, Search, Pencil, Plus, Trash2, FileDown, Send } from "lucide-react";
=======
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { LayoutDashboard, Users, BarChart3, Calendar, Bell, Briefcase, Search, Pencil, Plus, Trash2, FileDown, Send, CalendarClock, Star, Stethoscope, Wallet, Activity } from "lucide-react";
>>>>>>> 0adb142a (Update admin clinic management dashboard)
import { toast } from "sonner";
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { useStore, store, type Appointment } from "../store";

const REVENUE = [
  { m: "T1", v: 230 }, { m: "T2", v: 280 }, { m: "T3", v: 310 },
  { m: "T4", v: 340 }, { m: "T5", v: 290 }, { m: "T6", v: 380 },
];
<<<<<<< HEAD
=======
const COSTS = [
  { m: "T1", v: 150 }, { m: "T2", v: 170 }, { m: "T3", v: 160 },
  { m: "T4", v: 175 }, { m: "T5", v: 165 }, { m: "T6", v: 190 },
];
const ROI = [
  { m: "T1", v: 1.5 }, { m: "T2", v: 1.6 }, { m: "T3", v: 1.7 },
  { m: "T4", v: 1.8 }, { m: "T5", v: 1.6 }, { m: "T6", v: 2.0 },
];
>>>>>>> 0adb142a (Update admin clinic management dashboard)
const VISITS = [
  { d: "T2", v: 120 }, { d: "T3", v: 145 }, { d: "T4", v: 132 },
  { d: "T5", v: 168 }, { d: "T6", v: 190 }, { d: "T7", v: 110 }, { d: "CN", v: 80 },
];
const SPECS = [
  { name: "Tim mạch", value: 35 },
  { name: "Da liễu", value: 20 },
  { name: "Nhi", value: 18 },
  { name: "TMH", value: 15 },
  { name: "Khác", value: 12 },
];
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e"];

<<<<<<< HEAD
type Patient = { id: number; name: string; phone: string; gender: string; dob: string; address: string };
type Schedule = { id: number; doctor: string; date: string; time: string; clinic: string };
=======
type Patient = { id: number; name: string; phone: string; gender: string; dob: string; address: string; lastVisit: string; nextFollowup: string; status: "Ổn định" | "Theo dõi" | "Cần tái khám" };
type PatientRecord = { id: number; patientId: number; period: "week" | "month" | "quarter"; date: string; doctor: string; summary: string; nextAction: string };
type PatientFeedback = { id: number; patientId: number; date: string; rating: number; note: string };
type Reminder = { id: number; patientId: number; date: string; channel: "SMS" | "Zalo" | "Email"; note: string; status: "Chờ gửi" | "Đã gửi" | "Hoàn tất" };
>>>>>>> 0adb142a (Update admin clinic management dashboard)

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState("overview");

  // Flow 1: Patients
  const [patients, setPatients] = useState<Patient[]>([
<<<<<<< HEAD
    { id: 1, name: "Nguyễn Minh Khoa", phone: "0901234567", gender: "Nam", dob: "1992-04-15", address: "Q1, TP.HCM" },
    { id: 2, name: "Trần Thu Hà", phone: "0907654321", gender: "Nữ", dob: "1996-08-22", address: "Q3, TP.HCM" },
    { id: 3, name: "Lê Văn Tú", phone: "0912345678", gender: "Nam", dob: "1980-12-01", address: "Q.Tân Bình" },
    { id: 4, name: "Phạm Bích Ngọc", phone: "0987654321", gender: "Nữ", dob: "1975-06-10", address: "Q7, TP.HCM" },
  ]);
  const [pSearch, setPSearch] = useState("");
  const [editingP, setEditingP] = useState<Patient | null>(null);
=======
    { id: 1, name: "Nguyễn Minh Khoa", phone: "0901234567", gender: "Nam", dob: "1992-04-15", address: "Q1, TP.HCM", lastVisit: "2025-05-04", nextFollowup: "2025-05-20", status: "Theo dõi" },
    { id: 2, name: "Trần Thu Hà", phone: "0907654321", gender: "Nữ", dob: "1996-08-22", address: "Q3, TP.HCM", lastVisit: "2025-05-02", nextFollowup: "2025-06-01", status: "Ổn định" },
    { id: 3, name: "Lê Văn Tú", phone: "0912345678", gender: "Nam", dob: "1980-12-01", address: "Q.Tân Bình", lastVisit: "2025-04-26", nextFollowup: "2025-05-15", status: "Cần tái khám" },
    { id: 4, name: "Phạm Bích Ngọc", phone: "0987654321", gender: "Nữ", dob: "1975-06-10", address: "Q7, TP.HCM", lastVisit: "2025-05-01", nextFollowup: "2025-05-22", status: "Theo dõi" },
  ]);
  const [pSearch, setPSearch] = useState("");
  const [editingP, setEditingP] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(1);
  const [recordRange, setRecordRange] = useState<"week" | "month" | "quarter">("month");
  const [editingR, setEditingR] = useState<(Partial<Reminder> & { id: number; patientId: number }) | null>(null);

  const [records] = useState<PatientRecord[]>([
    { id: 1, patientId: 1, period: "week", date: "2025-05-04", doctor: "BS. Nguyễn Văn An", summary: "Đau ngực nhẹ, theo dõi huyết áp", nextAction: "Tái khám sau 2 tuần" },
    { id: 2, patientId: 1, period: "month", date: "2025-04-12", doctor: "BS. Nguyễn Văn An", summary: "Kiểm tra tim mạch định kỳ", nextAction: "Giữ chế độ ăn nhạt" },
    { id: 3, patientId: 2, period: "month", date: "2025-05-02", doctor: "BS. Trần Thị Bình", summary: "Viêm da dị ứng", nextAction: "Tái khám sau 1 tháng" },
    { id: 4, patientId: 3, period: "week", date: "2025-04-26", doctor: "BS. Lê Hoàng Cường", summary: "Tăng đường huyết", nextAction: "Theo dõi đường máu hàng ngày" },
    { id: 5, patientId: 4, period: "month", date: "2025-05-01", doctor: "BS. Trần Thị Bình", summary: "Khám da liễu", nextAction: "Dưỡng ẩm, tái khám sau 3 tuần" },
  ]);

  const [feedbacks] = useState<PatientFeedback[]>([
    { id: 1, patientId: 1, date: "2025-05-05", rating: 5, note: "Bác sĩ giải thích rõ ràng" },
    { id: 2, patientId: 2, date: "2025-05-02", rating: 4, note: "Thời gian chờ hợp lý" },
    { id: 3, patientId: 3, date: "2025-04-27", rating: 3, note: "Cần nhắc lịch rõ hơn" },
    { id: 4, patientId: 4, date: "2025-05-02", rating: 5, note: "Nhân viên hỗ trợ tốt" },
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: 1, patientId: 1, date: "2025-05-20", channel: "Zalo", note: "Nhắc tái khám tim mạch", status: "Chờ gửi" },
    { id: 2, patientId: 3, date: "2025-05-15", channel: "SMS", note: "Nhắc đo đường huyết", status: "Đã gửi" },
    { id: 3, patientId: 4, date: "2025-05-22", channel: "Email", note: "Tái khám da liễu", status: "Chờ gửi" },
  ]);
>>>>>>> 0adb142a (Update admin clinic management dashboard)

  const filteredP = patients.filter(p =>
    p.name.toLowerCase().includes(pSearch.toLowerCase()) ||
    p.phone.includes(pSearch)
  );

<<<<<<< HEAD
=======
  const selectedPatient = patients.find(p => p.id === selectedPatientId) ?? null;
  const filteredRecords = records.filter(r => (!selectedPatientId || r.patientId === selectedPatientId) && r.period === recordRange);
  const selectedFeedbacks = feedbacks.filter(f => (!selectedPatientId || f.patientId === selectedPatientId));
  const selectedReminders = reminders.filter(r => (!selectedPatientId || r.patientId === selectedPatientId));

>>>>>>> 0adb142a (Update admin clinic management dashboard)
  const savePatient = () => {
    if (!editingP) return;
    if (!editingP.name.trim() || !editingP.phone.trim()) {
      toast.error("Vui lòng nhập đầy đủ Họ tên và Số điện thoại");
      return;
    }
    if (!/^\d{9,11}$/.test(editingP.phone)) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }
    setPatients(prev => {
      const exists = prev.find(p => p.id === editingP.id);
      return exists ? prev.map(p => p.id === editingP.id ? editingP : p) : [{ ...editingP, id: Date.now() }, ...prev];
    });
    toast.success("Cập nhật thông tin thành công");
    setEditingP(null);
  };

  // Flow 3: Schedules - đồng bộ từ store appointments
  const allAppointments = useStore(s => s.appointments);
  const [editingS, setEditingS] = useState<(Partial<Appointment> & { id: number }) | null>(null);
  const [sBranch, setSBranch] = useState("all");

  const filteredSchedules = allAppointments.filter(a => sBranch === "all" || a.clinic === sBranch);

  const saveSchedule = () => {
    if (!editingS) return;
    if (!editingS.doctorName || !editingS.date || !editingS.time) {
      toast.error("Thông tin lịch chưa đầy đủ");
      return;
    }
    if (editingS.id === 0) {
      store.addAppointment({
        patientName: editingS.patientName || "—",
        doctorName: editingS.doctorName,
        doctorSpec: editingS.doctorSpec || "",
        date: editingS.date,
        time: editingS.time,
        clinic: editingS.clinic || "CN Q1",
        status: "Sắp tới",
      });
    } else {
      store.updateAppointment(editingS.id, editingS);
    }
    toast.success("Lưu lịch thành công");
    setEditingS(null);
  };

  // Flow 4: Notifications
  const [notif, setNotif] = useState({ target: "all", content: "", time: "" });

  // Flow 5: Doctor schedule
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
    if (shiftStart >= shiftEnd) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu");
      return;
    }
    const label = `${shiftDay} ${shiftStart.slice(0, 5)}-${shiftEnd.slice(0, 5)}`;
    if (shiftDoctor.shifts.includes(label)) {
      toast.error("Ca này đã tồn tại");
      return;
    }
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
      {active === "overview" && <Overview />}

      {/* Flow 1 */}
      {active === "patients" && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h4 className="tracking-tight">Quản lý hồ sơ bệnh nhân</h4>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9 w-64" placeholder="Tìm theo tên, SĐT..." value={pSearch} onChange={e => setPSearch(e.target.value)} />
              </div>
<<<<<<< HEAD
              <Button onClick={() => setEditingP({ id: 0, name: "", phone: "", gender: "Nam", dob: "", address: "" })}>
=======
              <Button onClick={() => setEditingP({ id: 0, name: "", phone: "", gender: "Nam", dob: "", address: "", lastVisit: "", nextFollowup: "", status: "Ổn định" })}>
>>>>>>> 0adb142a (Update admin clinic management dashboard)
                <Plus className="w-4 h-4 mr-1" /> Thêm
              </Button>
            </div>
          </div>
<<<<<<< HEAD
          {filteredP.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {patients.length === 0 ? "Danh sách bệnh nhân trống" : "Không tìm thấy bệnh nhân phù hợp"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredP.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="w-8 h-8"><AvatarFallback className="bg-rose-100 text-rose-700 text-xs">{p.name[0]}</AvatarFallback></Avatar>
                      {p.name}
                    </TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>{p.gender}</TableCell>
                    <TableCell>{p.dob}</TableCell>
                    <TableCell className="text-muted-foreground">{p.address}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setEditingP(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
=======
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {filteredP.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  {patients.length === 0 ? "Danh sách bệnh nhân trống" : "Không tìm thấy bệnh nhân phù hợp"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>SĐT</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày khám gần nhất</TableHead>
                      <TableHead>Tái khám</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredP.map(p => (
                      <TableRow key={p.id} className={p.id === selectedPatientId ? "bg-slate-50" : ""}>
                        <TableCell className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedPatientId(p.id)}>
                          <Avatar className="w-8 h-8"><AvatarFallback className="bg-rose-100 text-rose-700 text-xs">{p.name[0]}</AvatarFallback></Avatar>
                          {p.name}
                        </TableCell>
                        <TableCell>{p.phone}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "Ổn định" ? "secondary" : p.status === "Theo dõi" ? "default" : "outline"}>{p.status}</Badge>
                        </TableCell>
                        <TableCell>{p.lastVisit}</TableCell>
                        <TableCell>{p.nextFollowup}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingP(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="outline" onClick={() => setSelectedPatientId(p.id)}><Stethoscope className="w-3.5 h-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <h5 className="tracking-tight">Hồ sơ & nhắc tái khám</h5>
                  <Select value={recordRange} onValueChange={v => setRecordRange(v as "week" | "month" | "quarter")}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Tuần</SelectItem>
                      <SelectItem value="month">Tháng</SelectItem>
                      <SelectItem value="quarter">Quý</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!selectedPatient ? (
                  <div className="text-sm text-muted-foreground mt-3">Chọn bệnh nhân để xem chi tiết hồ sơ.</div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{selectedPatient.name}</div>
                        <div className="text-sm text-muted-foreground">{selectedPatient.phone} • {selectedPatient.gender}</div>
                      </div>
                      <Badge variant="secondary">{selectedPatient.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">Khám gần nhất: {selectedPatient.lastVisit} • Tái khám: {selectedPatient.nextFollowup}</div>
                    {filteredRecords.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Không có hồ sơ trong khoảng thời gian này.</div>
                    ) : (
                      <div className="space-y-2">
                        {filteredRecords.map(r => (
                          <div key={r.id} className="p-3 border rounded-lg">
                            <div className="text-sm font-medium">{r.date} • {r.doctor}</div>
                            <div className="text-sm text-muted-foreground">{r.summary}</div>
                            <div className="text-xs text-muted-foreground mt-1">Hướng dẫn: {r.nextAction}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <h5 className="tracking-tight">Phản hồi điều trị</h5>
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                {!selectedPatient ? (
                  <div className="text-sm text-muted-foreground mt-3">Chọn bệnh nhân để xem phản hồi.</div>
                ) : selectedFeedbacks.length === 0 ? (
                  <div className="text-sm text-muted-foreground mt-3">Chưa có phản hồi gần đây.</div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {selectedFeedbacks.map(f => (
                      <div key={f.id} className="p-3 border rounded-lg">
                        <div className="text-sm font-medium">{f.date}</div>
                        <div className="text-sm text-muted-foreground">{f.note}</div>
                        <div className="text-xs text-amber-600 mt-1">{f.rating} / 5 sao</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <h5 className="tracking-tight">Nhắc tái khám</h5>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (!selectedPatientId) {
                      toast.error("Vui lòng chọn bệnh nhân trước");
                      return;
                    }
                    setEditingR({ id: 0, patientId: selectedPatientId, date: "", channel: "SMS", note: "", status: "Chờ gửi" });
                  }}><CalendarClock className="w-3.5 h-3.5 mr-1" />Tạo</Button>
                </div>
                {!selectedPatient ? (
                  <div className="text-sm text-muted-foreground mt-3">Chọn bệnh nhân để xem nhắc tái khám.</div>
                ) : selectedReminders.length === 0 ? (
                  <div className="text-sm text-muted-foreground mt-3">Chưa có lịch nhắc.</div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {selectedReminders.map(r => (
                      <div key={r.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{r.date} • {r.channel}</div>
                          <Badge variant={r.status === "Hoàn tất" ? "secondary" : r.status === "Đã gửi" ? "default" : "outline"}>{r.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{r.note}</div>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setReminders(prev => prev.map(x => x.id === r.id ? { ...x, status: "Đã gửi" } : x))}>Đánh dấu đã gửi</Button>
                          <Button size="sm" variant="outline" onClick={() => setReminders(prev => prev.map(x => x.id === r.id ? { ...x, status: "Hoàn tất" } : x))}>Hoàn tất</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
>>>>>>> 0adb142a (Update admin clinic management dashboard)
        </Card>
      )}

      {/* Flow 2 */}
      {active === "reports" && <Reports />}

      {/* Flow 3 */}
      {active === "schedule" && (
<<<<<<< HEAD
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h4 className="tracking-tight">Lịch khám toàn hệ thống</h4>
            <div className="flex gap-2">
              <Select value={sBranch} onValueChange={setSBranch}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                  <SelectItem value="CN Q1">CN Q1</SelectItem>
                  <SelectItem value="CN Q3">CN Q3</SelectItem>
                  <SelectItem value="CN Tân Bình">CN Tân Bình</SelectItem>
                  <SelectItem value="CN Q7">CN Q7</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setEditingS({ id: 0, doctorName: "", patientName: "", date: "", time: "", clinic: "CN Q1", doctorSpec: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Tạo lịch
              </Button>
            </div>
          </div>
          {filteredSchedules.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Lịch trống. Bấm "Tạo lịch" để thêm mới.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSchedules.map(s => (
                <div key={s.id} className="p-3 border rounded-xl flex items-center justify-between">
                  <div>
                    <div>{s.doctorName} <span className="text-muted-foreground">→ {s.patientName}</span></div>
                    <div className="text-sm text-muted-foreground">{s.date} • {s.time} • {s.clinic} • {s.doctorSpec}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant={s.status === "Sắp tới" ? "secondary" : s.status === "Hoàn thành" ? "default" : "outline"}>{s.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => setEditingS(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="outline" className="text-rose-600" onClick={() => {
                      store.updateAppointment(s.id, { status: "Đã hủy" });
                      toast.success("Đã hủy lịch");
                    }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
=======
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <h4 className="tracking-tight">Lịch khám toàn hệ thống</h4>
              <div className="flex gap-2">
                <Select value={sBranch} onValueChange={setSBranch}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                    <SelectItem value="CN Q1">CN Q1</SelectItem>
                    <SelectItem value="CN Q3">CN Q3</SelectItem>
                    <SelectItem value="CN Tân Bình">CN Tân Bình</SelectItem>
                    <SelectItem value="CN Q7">CN Q7</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setEditingS({ id: 0, doctorName: "", patientName: "", date: "", time: "", clinic: "CN Q1", doctorSpec: "" })}>
                  <Plus className="w-4 h-4 mr-1" /> Tạo lịch
                </Button>
              </div>
            </div>
            {filteredSchedules.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Lịch trống. Bấm "Tạo lịch" để thêm mới.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSchedules.map(s => (
                  <div key={s.id} className="p-3 border rounded-xl flex items-center justify-between">
                    <div>
                      <div>{s.doctorName} <span className="text-muted-foreground">→ {s.patientName}</span></div>
                      <div className="text-sm text-muted-foreground">{s.date} • {s.time} • {s.clinic} • {s.doctorSpec}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant={s.status === "Sắp tới" ? "secondary" : s.status === "Hoàn thành" ? "default" : "outline"}>{s.status}</Badge>
                      <Button size="sm" variant="outline" onClick={() => setEditingS(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="outline" className="text-rose-600" onClick={() => {
                        store.updateAppointment(s.id, { status: "Đã hủy" });
                        toast.success("Đã hủy lịch");
                      }}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="w-4 h-4" />Chi phí vận hành tháng</div>
              <div className="mt-2 text-2xl tracking-tight text-rose-600">190M</div>
              <div className="text-sm text-muted-foreground">Tăng 6% so với tháng trước</div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Activity className="w-4 h-4" />ROI trung bình</div>
              <div className="mt-2 text-2xl tracking-tight text-emerald-600">2.0x</div>
              <div className="text-sm text-muted-foreground">Tập trung tối ưu chi phí nhân sự</div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" />Tỷ lệ phủ lịch</div>
              <div className="mt-2 text-2xl tracking-tight text-sky-600">92%</div>
              <div className="text-sm text-muted-foreground">Hủy lịch: 3.8% • Trễ: 2.1%</div>
            </Card>
          </div>
        </div>
>>>>>>> 0adb142a (Update admin clinic management dashboard)
      )}

      {/* Flow 4 */}
      {active === "notify" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h4 className="tracking-tight mb-3">Soạn thông báo</h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Đối tượng nhận</Label>
                <Select value={notif.target} onValueChange={v => setNotif({ ...notif, target: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toàn hệ thống</SelectItem>
                    <SelectItem value="patient">Bệnh nhân</SelectItem>
                    <SelectItem value="doctor">Bác sĩ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Nội dung</Label>
                <Textarea rows={5} placeholder="Nhập nội dung thông báo..." value={notif.content} onChange={e => setNotif({ ...notif, content: e.target.value })} />
              </div>
              <div className="space-y-1.5"><Label>Thời gian gửi</Label>
                <Input type="datetime-local" value={notif.time} onChange={e => setNotif({ ...notif, time: e.target.value })} />
              </div>
              <Button className="w-full" onClick={() => {
                if (!notif.content.trim() || !notif.time) {
                  toast.error("Vui lòng nhập đầy đủ nội dung và thời gian");
                  return;
                }
                toast.success("Đã gửi thông báo thành công!");
                setNotif({ target: "all", content: "", time: "" });
              }}><Send className="w-4 h-4 mr-2" />Gửi thông báo</Button>
            </div>
          </Card>
          <Card className="p-5">
            <h4 className="tracking-tight mb-3">Thông báo gần đây</h4>
            <div className="space-y-2">
              {[
                { t: "Nhắc lịch khám tuần", to: "Bệnh nhân", d: "06/05 08:00", st: "Đã gửi" },
                { t: "Cập nhật lịch làm việc", to: "Bác sĩ", d: "05/05 17:30", st: "Đã gửi" },
                { t: "Bảo trì hệ thống", to: "Toàn hệ thống", d: "04/05 22:00", st: "Đã gửi" },
              ].map((n, i) => (
                <div key={i} className="p-3 border rounded-xl">
                  <div className="flex justify-between"><span>{n.t}</span><Badge variant="secondary">{n.st}</Badge></div>
                  <div className="text-sm text-muted-foreground">Đối tượng: {n.to} • {n.d}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Flow 5 */}
      {active === "doctors" && (
        <Card className="p-5">
          <h4 className="tracking-tight mb-3">Lịch làm việc của bác sĩ</h4>
          <div className="space-y-3">
            {doctors.map(d => (
              <Card key={d.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback className="bg-rose-100 text-rose-700">{d.name.split(" ").pop()?.[0]}</AvatarFallback></Avatar>
                    <div>
                      <div>{d.name}</div>
                      <Badge variant="secondary" className="mt-1">{d.spec}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    setShiftDoctor(d);
                    setShiftDay("T2"); setShiftStart("08:00"); setShiftEnd("12:00");
                  }}><Plus className="w-3.5 h-3.5 mr-1" />Thêm ca</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {d.shifts.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-sm flex items-center gap-2">
                      {s}
                      <button className="text-rose-600 hover:text-rose-800" onClick={() => {
                        toast("Xác nhận xóa ca này?", {
                          description: `Ca: ${s}`,
                          action: {
                            label: "Xóa",
                            onClick: () => {
                              setDoctors(prev => prev.map(x => x.id === d.id ? { ...x, shifts: x.shifts.filter((_, idx) => idx !== i) } : x));
                              toast.success("Đã xóa ca");
                            },
                          },
                          cancel: { label: "Hủy", onClick: () => {} },
                        });
                      }}><Trash2 className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Edit patient dialog */}
      <Dialog open={!!editingP} onOpenChange={() => setEditingP(null)}>
        <DialogContent>
          {editingP && (
            <>
              <DialogHeader>
                <DialogTitle>{editingP.id ? "Cập nhật" : "Thêm"} bệnh nhân</DialogTitle>
                <DialogDescription>Thông tin hành chính bệnh nhân</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2"><Label>Họ tên</Label><Input value={editingP.name} onChange={e => setEditingP({ ...editingP, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Số điện thoại</Label><Input value={editingP.phone} onChange={e => setEditingP({ ...editingP, phone: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Giới tính</Label>
                  <Select value={editingP.gender} onValueChange={v => setEditingP({ ...editingP, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Ngày sinh</Label><Input type="date" value={editingP.dob} onChange={e => setEditingP({ ...editingP, dob: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Địa chỉ</Label><Input value={editingP.address} onChange={e => setEditingP({ ...editingP, address: e.target.value })} /></div>
<<<<<<< HEAD
=======
                <div className="space-y-1.5"><Label>Trạng thái</Label>
                  <Select value={editingP.status} onValueChange={v => setEditingP({ ...editingP, status: v as Patient["status"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ổn định">Ổn định</SelectItem>
                      <SelectItem value="Theo dõi">Theo dõi</SelectItem>
                      <SelectItem value="Cần tái khám">Cần tái khám</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Khám gần nhất</Label><Input type="date" value={editingP.lastVisit} onChange={e => setEditingP({ ...editingP, lastVisit: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Tái khám</Label><Input type="date" value={editingP.nextFollowup} onChange={e => setEditingP({ ...editingP, nextFollowup: e.target.value })} /></div>
>>>>>>> 0adb142a (Update admin clinic management dashboard)
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditingP(null); toast.info("Đã hủy thay đổi"); }}>Hủy</Button>
                <Button onClick={savePatient}>Lưu</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit schedule dialog */}
      <Dialog open={!!editingS} onOpenChange={() => setEditingS(null)}>
        <DialogContent>
          {editingS && (
            <>
              <DialogHeader><DialogTitle>{editingS.id ? "Sửa" : "Tạo"} lịch khám</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Bác sĩ</Label><Input value={editingS.doctorName ?? ""} onChange={e => setEditingS({ ...editingS, doctorName: e.target.value })} placeholder="VD: BS. Nguyễn Văn An" /></div>
                <div className="space-y-1.5"><Label>Bệnh nhân</Label><Input value={editingS.patientName ?? ""} onChange={e => setEditingS({ ...editingS, patientName: e.target.value })} placeholder="VD: Nguyễn Minh Khoa" /></div>
                <div className="space-y-1.5"><Label>Chuyên khoa</Label><Input value={editingS.doctorSpec ?? ""} onChange={e => setEditingS({ ...editingS, doctorSpec: e.target.value })} placeholder="VD: Tim mạch" /></div>
                <div className="space-y-1.5"><Label>Ngày</Label><Input type="date" value={editingS.date ?? ""} onChange={e => setEditingS({ ...editingS, date: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Giờ</Label><Input type="time" value={editingS.time ?? ""} onChange={e => setEditingS({ ...editingS, time: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Chi nhánh</Label>
                  <Select value={editingS.clinic ?? "CN Q1"} onValueChange={v => setEditingS({ ...editingS, clinic: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Button variant="outline" onClick={() => { setEditingS(null); toast.info("Đã hủy thao tác"); }}>Hủy</Button>
                <Button onClick={saveSchedule}>Lưu</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

<<<<<<< HEAD
=======
      <Dialog open={!!editingR} onOpenChange={() => setEditingR(null)}>
        <DialogContent>
          {editingR && (
            <>
              <DialogHeader>
                <DialogTitle>Tạo nhắc tái khám</DialogTitle>
                <DialogDescription>{patients.find(p => p.id === editingR.patientId)?.name}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Ngày nhắc</Label><Input type="date" value={editingR.date ?? ""} onChange={e => setEditingR({ ...editingR, date: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Kênh gửi</Label>
                  <Select value={editingR.channel ?? "SMS"} onValueChange={v => setEditingR({ ...editingR, channel: v as Reminder["channel"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="Zalo">Zalo</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 col-span-2"><Label>Nội dung nhắc</Label><Textarea rows={4} value={editingR.note ?? ""} onChange={e => setEditingR({ ...editingR, note: e.target.value })} placeholder="VD: Nhắc tái khám tim mạch sau 2 tuần" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingR(null)}>Hủy</Button>
                <Button onClick={() => {
                  if (!editingR.date || !editingR.note?.trim()) {
                    toast.error("Vui lòng nhập ngày nhắc và nội dung");
                    return;
                  }
                  if (editingR.id === 0) {
                    setReminders(prev => [{
                      id: Date.now(),
                      patientId: editingR.patientId,
                      date: editingR.date,
                      channel: editingR.channel ?? "SMS",
                      note: editingR.note ?? "",
                      status: "Chờ gửi",
                    }, ...prev]);
                  }
                  toast.success("Đã tạo nhắc tái khám");
                  setEditingR(null);
                }}>Lưu</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

>>>>>>> 0adb142a (Update admin clinic management dashboard)
      <Dialog open={!!shiftDoctor} onOpenChange={() => setShiftDoctor(null)}>
        <DialogContent>
          {shiftDoctor && (
            <>
              <DialogHeader>
                <DialogTitle>Thêm ca làm việc</DialogTitle>
                <DialogDescription>{shiftDoctor.name} • {shiftDoctor.spec}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Ngày</Label>
                  <Select value={shiftDay} onValueChange={setShiftDay}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Bắt đầu</Label>
                  <Input type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Kết thúc</Label>
                  <Input type="time" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShiftDoctor(null)}>Hủy</Button>
                <Button onClick={addShift}>Thêm ca</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Overview() {
  return (
    <div className="space-y-5">
<<<<<<< HEAD
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { l: "Doanh thu tháng", v: "380M", c: "text-emerald-600" },
          { l: "Lượt khám tuần", v: "945", c: "text-sky-600" },
          { l: "Bệnh nhân", v: "12,840", c: "text-violet-600" },
=======
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { l: "Doanh thu tháng", v: "380M", c: "text-emerald-600" },
          { l: "Chi phí vận hành", v: "190M", c: "text-rose-600" },
          { l: "ROI trung bình", v: "2.0x", c: "text-sky-600" },
          { l: "Lượt khám tuần", v: "945", c: "text-sky-600" },
          { l: "Tỷ lệ tái khám", v: "62%", c: "text-violet-600" },
>>>>>>> 0adb142a (Update admin clinic management dashboard)
          { l: "Bác sĩ", v: "32", c: "text-amber-600" },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="text-sm text-muted-foreground">{s.l}</div>
            <div className={`mt-1 text-2xl tracking-tight ${s.c}`}>{s.v}</div>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h4 className="tracking-tight">Doanh thu 6 tháng (triệu VNĐ)</h4>
          <div className="h-72 mt-3">
            <BarChartSimple data={REVENUE} labelKey="m" />
          </div>
        </Card>
        <Card className="p-5">
          <h4 className="tracking-tight">Theo chuyên khoa</h4>
          <div className="h-72 mt-3 flex items-center gap-4">
            <div className="w-40 h-40 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={SPECS} dataKey="value" nameKey="name" innerRadius={38} outerRadius={70} paddingAngle={2} stroke="white" strokeWidth={2}>
                    {SPECS.map((entry, i) => <Cell key={`cell-${entry.name}`} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-1.5">
              {(() => {
                const total = SPECS.reduce((s, x) => s + x.value, 0);
                return SPECS.map((s, i) => (
                  <li key={s.name} className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORS[i] }} />
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="tabular-nums text-muted-foreground">{Math.round((s.value / total) * 100)}%</span>
                  </li>
                ));
              })()}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

function niceTicks(max: number, count = 4): number[] {
  const raw = max / count;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * pow;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: count + 1 }, (_, i) => Math.round((top * i) / count));
}

function BarChartSimple({ data, labelKey }: { data: any[]; labelKey: string }) {
  const maxVal = Math.max(...data.map(d => d.v));
  const ticks = niceTicks(maxVal, 4);
  const top = ticks[ticks.length - 1];
  return (
    <div className="h-full w-full flex">
      <div className="flex flex-col justify-between py-2 pr-2 text-[11px] text-muted-foreground tabular-nums text-right">
        {[...ticks].reverse().map(t => <span key={t}>{t}</span>)}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          {ticks.map((t, idx) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-dashed border-slate-200"
              style={{ bottom: `${(idx / (ticks.length - 1)) * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-end gap-3 px-1">
            {data.map((d, i) => {
              const h = (d.v / top) * 100;
              return (
                <div key={`${d[labelKey]}-${i}`} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                  <div className="absolute -top-1 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    <div className="px-2 py-1 rounded-md bg-slate-900 text-white text-[11px] tabular-nums shadow-lg whitespace-nowrap">
                      {d.v}
                    </div>
                  </div>
                  <div
                    className="w-full max-w-12 rounded-t-md bg-gradient-to-t from-sky-600 to-sky-400 hover:from-sky-700 hover:to-sky-500 transition-all shadow-sm"
                    style={{ height: `${h}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-3 px-1 mt-1.5">
          {data.map((d, i) => (
            <span key={`${d[labelKey]}-${i}`} className="flex-1 text-center text-xs text-muted-foreground">{d[labelKey]}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LineChartSimple({ data, labelKey }: { data: any[]; labelKey: string }) {
  const maxVal = Math.max(...data.map(d => d.v));
  const minVal = Math.min(...data.map(d => d.v));
  const ticks = niceTicks(maxVal, 4);
  const top = ticks[ticks.length - 1];
  const W = 600, H = 220, padL = 8, padR = 8, padT = 12, padB = 8;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const step = innerW / Math.max(1, data.length - 1);
  const y = (v: number) => padT + (1 - v / top) * innerH;
  const points = data.map((d, i) => `${padL + i * step},${y(d.v)}`).join(" ");
  const area = `${padL},${padT + innerH} ${points} ${padL + (data.length - 1) * step},${padT + innerH}`;

  return (
    <div className="h-full w-full flex">
      <div className="flex flex-col justify-between py-1 pr-2 text-[11px] text-muted-foreground tabular-nums text-right">
        {[...ticks].reverse().map(t => <span key={t}>{t}</span>)}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((t, idx) => {
              const yy = padT + (1 - idx / (ticks.length - 1)) * innerH;
              return <line key={t} x1={padL} x2={padL + innerW} y1={yy} y2={yy} stroke="#e2e8f0" strokeDasharray="3 3" />;
            })}
            <polygon points={area} fill="url(#lineFill)" />
            <polyline fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points} />
            {data.map((d, i) => (
              <g key={`${d[labelKey]}-${i}`} className="group">
                <circle cx={padL + i * step} cy={y(d.v)} r="4" fill="white" stroke="#10b981" strokeWidth="2" />
                <circle cx={padL + i * step} cy={y(d.v)} r="10" fill="transparent" className="cursor-pointer">
                  <title>{`${d[labelKey]}: ${d.v}`}</title>
                </circle>
              </g>
            ))}
          </svg>
        </div>
        <div className="flex mt-1">
          {data.map((d, i) => (
            <span key={`${d[labelKey]}-${i}`} className="flex-1 text-center text-xs text-muted-foreground">{d[labelKey]}</span>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground mt-1 text-right">Min: {minVal} • Max: {maxVal}</div>
      </div>
    </div>
  );
}

function Reports() {
  const [type, setType] = useState("revenue");
  const [range, setRange] = useState("month");
  const [hasData, setHasData] = useState(true);

  return (
    <div className="space-y-4">
      <Card className="p-4 flex flex-wrap gap-3 items-end">
        <div className="space-y-1.5"><Label>Loại báo cáo</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Doanh thu</SelectItem>
              <SelectItem value="visits">Lượt khám</SelectItem>
<<<<<<< HEAD
=======
              <SelectItem value="costs">Chi phí</SelectItem>
              <SelectItem value="roi">ROI</SelectItem>
>>>>>>> 0adb142a (Update admin clinic management dashboard)
              <SelectItem value="doctors">Theo bác sĩ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Thời gian</Label>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => setHasData(v => !v)}>{hasData ? "Mô phỏng không có dữ liệu" : "Có dữ liệu"}</Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => toast.success("Xuất file PDF thành công")}><FileDown className="w-4 h-4 mr-1" />PDF</Button>
        <Button variant="outline" onClick={() => toast.success("Xuất file Excel thành công")}><FileDown className="w-4 h-4 mr-1" />Excel</Button>
      </Card>

      {!hasData ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Không có dữ liệu cho bộ lọc đã chọn.</p>
          <p className="text-sm text-muted-foreground mt-1">Hãy thử chọn khoảng thời gian khác.</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5">
<<<<<<< HEAD
            <h4 className="tracking-tight">{type === "revenue" ? "Doanh thu" : type === "visits" ? "Lượt khám" : "Theo bác sĩ"}</h4>
            <div className="h-72 mt-3">
              <LineChartSimple
                data={type === "visits" ? VISITS : REVENUE}
=======
            <h4 className="tracking-tight">
              {type === "revenue" ? "Doanh thu" : type === "visits" ? "Lượt khám" : type === "costs" ? "Chi phí" : type === "roi" ? "ROI" : "Theo bác sĩ"}
            </h4>
            <div className="h-72 mt-3">
              <LineChartSimple
                data={type === "visits" ? VISITS : type === "costs" ? COSTS : type === "roi" ? ROI : REVENUE}
>>>>>>> 0adb142a (Update admin clinic management dashboard)
                labelKey={type === "visits" ? "d" : "m"}
              />
            </div>
          </Card>
          <Card className="p-5">
            <h4 className="tracking-tight">Bảng thống kê</h4>
            <Table className="mt-3">
              <TableHeader><TableRow><TableHead>Mục</TableHead><TableHead>Giá trị</TableHead><TableHead>Thay đổi</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ["Doanh thu", "380.000.000đ", "+12%"],
<<<<<<< HEAD
                  ["Lượt khám", "945", "+8%"],
                  ["Bệnh nhân mới", "128", "+15%"],
                  ["Tỷ lệ tái khám", "62%", "+3%"],
=======
                  ["Chi phí", "190.000.000đ", "+6%"],
                  ["ROI", "2.0x", "+0.2x"],
                  ["Lượt khám", "945", "+8%"],
>>>>>>> 0adb142a (Update admin clinic management dashboard)
                ].map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                    <TableCell className="text-emerald-600">{r[2]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
