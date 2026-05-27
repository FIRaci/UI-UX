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
import { DOCTORS, type Doctor } from "./constants";
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

export function EditAppointmentDialog({ editing, onEditingChange, editingOriginal, onUpdate, onCancel, appointments }: {
  editing: Appointment | null;
  onEditingChange: (a: Appointment) => void;
  editingOriginal: Appointment | null;
  onUpdate: () => void;
  onCancel: () => void;
  appointments: Appointment[];
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
              const doc = DOCTORS.find(d => d.name === editing.doctorName);
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
