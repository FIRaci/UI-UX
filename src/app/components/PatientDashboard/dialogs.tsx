import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Star, MapPin } from "lucide-react";
import { toast } from "sonner";
import { type Doctor } from "./constants";
import type { Appointment } from "../../store";

export function DoctorDetailDialog({ doctor, onClose, onBook }: {
  doctor: Doctor | null;
  onClose: () => void;
  onBook: (d: Doctor) => void;
}) {
  return (
    <Dialog open={!!doctor} onOpenChange={onClose}>
      <DialogContent className="animate-scale-in">
        {doctor && (
          <>
            <DialogHeader>
              <DialogTitle>{doctor.name}</DialogTitle>
              <DialogDescription>Chi tiết bác sĩ</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16"><AvatarFallback className="bg-sky-100 text-sky-700">{doctor.name.split(" ").pop()?.[0]}</AvatarFallback></Avatar>
                <div>
                  <Badge variant="secondary">{doctor.spec}</Badge>
                  <div className="flex items-center gap-1 mt-1 text-amber-500"><Star className="w-4 h-4 fill-current" /> {doctor.rating}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {doctor.clinic}</div>
                </div>
              </div>
              <Card className="p-3 bg-slate-50">
                <div className="text-sm">Phí khám: <b className="text-emerald-600">{doctor.fee}</b></div>
                <div className="text-sm text-muted-foreground mt-1">Bác sĩ với hơn 10 năm kinh nghiệm. Tốt nghiệp ĐH Y Hà Nội, từng tu nghiệp tại Singapore.</div>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Đóng</Button>
              <Button onClick={() => { onBook(doctor); onClose(); }}>Đặt lịch</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function BookingDialog({ doctor, bookDate, onBookDateChange, bookTime, onBookTimeChange, onConfirm, onCancel }: {
  doctor: Doctor | null;
  bookDate: string;
  onBookDateChange: (d: string) => void;
  bookTime: string;
  onBookTimeChange: (t: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={!!doctor} onOpenChange={onCancel}>
      <DialogContent className="animate-scale-in">
        {doctor && (
          <>
            <DialogHeader>
              <DialogTitle>Đặt lịch khám</DialogTitle>
              <DialogDescription>{doctor.name} • {doctor.spec}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Ngày khám</Label>
                <Input type="date" min={new Date().toISOString().slice(0, 10)} value={bookDate} onChange={e => onBookDateChange(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Giờ khám</Label>
                <div className="grid grid-cols-4 gap-2">
                  {doctor.avail.map(t => (
                    <button
                      key={t}
                      onClick={() => onBookTimeChange(t)}
                      className={`py-2 rounded-lg border text-sm transition ${bookTime === t ? "bg-sky-500 text-white border-sky-500" : "hover:border-sky-400"}`}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <Card className="p-3 bg-emerald-50 border-emerald-200 text-sm">
                Phí khám: <b>{doctor.fee}</b> • Phòng khám: {doctor.clinic}
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { onCancel(); toast.info("Đã hủy đặt lịch"); }}>Hủy</Button>
              <Button onClick={onConfirm}>Xác nhận đặt lịch</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function EditAppointmentDialog({ editing, onEditingChange, editingOriginal, onUpdate, onCancel, appointments, doctors }: {
  editing: Appointment | null;
  onEditingChange: (a: Appointment) => void;
  editingOriginal: Appointment | null;
  onUpdate: () => void;
  onCancel: () => void;
  appointments: Appointment[];
  doctors: Doctor[];
}) {
  return (
    <Dialog open={!!editing} onOpenChange={() => { onCancel(); }}>
      <DialogContent className="animate-scale-in">
        {editing && (
          <>
            <DialogHeader><DialogTitle>Chỉnh sửa lịch hẹn</DialogTitle></DialogHeader>
            {editingOriginal && (
              <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700 font-medium">
                Lịch hẹn cũ: {editingOriginal.time} ngày {editingOriginal.date}
              </div>
            )}
            {(() => {
              const doc = doctors.find(d => d.name === editing.doctorName);
              return (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Ngày mới</Label>
                    <Input type="date" min={new Date().toISOString().slice(0, 10)} value={editing.date} onChange={e => onEditingChange({ ...editing, date: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Giờ mới — Lịch BS {editing.doctorName.replace("BS. ", "")}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {(doc?.avail ?? ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"]).map(t => (
                        <button
                          key={t}
                          onClick={() => onEditingChange({ ...editing, time: t })}
                          className={`py-2 rounded-lg border text-sm transition ${editing.time === t ? "bg-sky-500 text-white border-sky-500" : "hover:border-sky-400"}`}
                        >{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
            <DialogFooter>
              <Button variant="outline" onClick={() => { onCancel(); toast.info("Đã hủy thay đổi"); }}>Hủy</Button>
              <Button onClick={onUpdate}>Xác nhận đổi lịch</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function NewMessageDialog({ doctor, onDoctorChange, content, onContentChange, doctors, onSend, onCancel }: {
  doctor: Doctor | null;
  onDoctorChange: (d: Doctor | null) => void;
  content: string;
  onContentChange: (c: string) => void;
  doctors: Doctor[];
  onSend: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={!!doctor} onOpenChange={() => onCancel()}>
      <DialogContent className="animate-scale-in">
        {doctor && (
          <>
            <DialogHeader><DialogTitle>Nhắn tin cho bác sĩ</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Bác sĩ</Label>
                <Select value={String(doctor.id)} onValueChange={v => onDoctorChange(doctors.find(d => String(d.id) === v) ?? null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {doctors.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name} • {d.spec}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nội dung</Label>
                <Textarea rows={4} placeholder="Nhập câu hỏi cho bác sĩ..." value={content} onChange={e => onContentChange(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { onCancel(); toast.info("Đã hủy gửi tin nhắn"); }}>Hủy</Button>
              <Button onClick={onSend}>Gửi</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AppointmentDetailDialog({ appt, onClose }: {
  appt: Appointment | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!appt} onOpenChange={onClose}>
      <DialogContent className="animate-scale-in">
        {appt && (
          <>
            <DialogHeader>
              <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
              <DialogDescription>Bệnh nhân: {appt.patientName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shrink-0"><Stethoscope className="w-6 h-6" /></div>
                <div>
                  <div className="font-bold text-slate-800">{appt.doctorName}</div>
                  <div className="text-sm text-slate-500">{appt.doctorSpec}</div>
                </div>
              </div>
              <Card className="p-4 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-sm text-slate-500">Trạng thái</span>
                  <Badge variant={appt.status === "Sắp tới" ? "default" : appt.status === "Hoàn thành" ? "secondary" : "destructive"}>{appt.status}</Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-sm text-slate-500">Thời gian</span>
                  <span className="text-sm font-semibold text-slate-800">{appt.time} • {appt.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Cơ sở y tế</span>
                  <span className="text-sm font-semibold text-slate-800">{appt.clinic}</span>
                </div>
              </Card>
              <div className="text-sm text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <p className="font-semibold text-emerald-800 mb-1">Lưu ý trước khi khám:</p>
                <ul className="list-disc pl-5 space-y-1 text-emerald-700/80">
                  <li>Vui lòng đến trước 15 phút để làm thủ tục.</li>
                  <li>Mang theo CCCD/CMND và thẻ BHYT (nếu có).</li>
                  <li>Nhịn ăn sáng nếu có yêu cầu xét nghiệm máu.</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={onClose} className="w-full">Đóng</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
