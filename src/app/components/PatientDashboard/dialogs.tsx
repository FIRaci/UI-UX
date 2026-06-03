import { useState } from "react";
import { motion } from "motion/react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Star, MapPin, CheckCircle, Calendar, Clock, AlertTriangle, Stethoscope } from "lucide-react";
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
            <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-full text-lg h-12 font-bold text-slate-700 hover:bg-slate-100">Đóng</Button>
              <Button onClick={() => { onBook(doctor); onClose(); }} className="flex-1 rounded-full text-lg h-12 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all">Đặt lịch</Button>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm();
    }, 1000);
  };
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
            <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-4">
              <Button variant="outline" className="flex-1 rounded-full text-lg h-12 font-bold text-slate-700 hover:bg-slate-100 transition-all active:scale-95" onClick={() => { onCancel(); toast.info("Đã hủy đặt lịch"); }} disabled={isSubmitting}>Hủy</Button>
              <Button className="flex-1 rounded-full text-lg h-12 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95" onClick={handleConfirm} disabled={isSubmitting}>
                {isSubmitting ? <span className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin mx-auto"></span> : "Xác nhận đặt lịch"}
              </Button>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleUpdate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onUpdate();
    }, 1000);
  };
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
            <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-4">
              <Button variant="outline" className="flex-1 rounded-full text-lg h-12 font-bold text-slate-700 hover:bg-slate-100 transition-all active:scale-95" onClick={() => { onCancel(); toast.info("Đã hủy thay đổi"); }} disabled={isSubmitting}>Hủy</Button>
              <Button className="flex-1 rounded-full text-lg h-12 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95" onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? <span className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin mx-auto"></span> : "Xác nhận đổi lịch"}
              </Button>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSend = () => {
    if (!doctor || !content.trim()) return toast.error("Vui lòng chọn bác sĩ và nhập nội dung");
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSend();
    }, 1000);
  };
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
            <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-4">
              <Button variant="outline" className="flex-1 rounded-full text-lg h-12 font-bold text-slate-700 hover:bg-slate-100 transition-all active:scale-95" onClick={() => { onCancel(); toast.info("Đã hủy gửi tin nhắn"); }} disabled={isSubmitting}>Hủy</Button>
              <Button className="flex-1 rounded-full text-lg h-12 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95" onClick={handleSend} disabled={isSubmitting}>
                {isSubmitting ? <span className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin mx-auto"></span> : "Gửi tin nhắn"}
              </Button>
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
            <DialogFooter className="mt-4">
              <Button onClick={onClose} variant="outline" className="w-full rounded-full text-lg h-12 font-bold text-slate-700 hover:bg-slate-100 transition-all">Đóng</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AppointmentSuccessDialog({ doctor, date, time, clinic, onClose, onViewAppointments }: {
  doctor: Doctor | null;
  date: string;
  time: string;
  clinic: string;
  onClose: () => void;
  onViewAppointments: () => void;
}) {
  return (
    <Dialog open={!!doctor} onOpenChange={onClose}>
      <DialogContent className="animate-scale-in max-w-md">
        {doctor && (
          <>
            <div className="flex flex-col items-center text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </motion.div>
              <DialogTitle className="text-xl font-bold text-slate-800 mb-2">Đặt lịch thành công!</DialogTitle>
              <DialogDescription className="text-slate-500">
                Lịch hẹn của bạn đã được xác nhận
              </DialogDescription>
            </div>
            
            <Card className="p-4 bg-emerald-50 border-emerald-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white text-sky-700 flex items-center justify-center border border-sky-100 shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{doctor.name}</div>
                  <div className="text-sm text-slate-600">{doctor.spec}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">{date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">{time}</span>
                </div>
              </div>
              <div className="text-xs text-emerald-700 bg-white p-2 rounded-lg border border-emerald-100">
                <p className="font-semibold mb-1">📍 Địa chỉ: {clinic}</p>
                <p className="text-emerald-600">Hãy đến trước 15 phút để làm thủ tục</p>
              </div>
            </Card>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-4">
              <Button variant="outline" className="flex-1 rounded-full text-lg h-12 font-bold text-slate-700 hover:bg-slate-100 transition-all active:scale-95" onClick={onClose}>
                Đóng
              </Button>
              <Button className="flex-1 rounded-full text-lg h-12 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95" onClick={onViewAppointments}>
                Xem lịch hẹn
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CancelConfirmDialog({ appointment, isOpen, onClose, onConfirm }: {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm();
      setIsProcessing(false);
    }, 800);
  };

  return (
    <Dialog open={isOpen && !!appointment} onOpenChange={onClose}>
      <DialogContent className="animate-scale-in max-w-md">
        {appointment && (
          <>
            <div className="flex flex-col items-center text-center py-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4"
              >
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </motion.div>
              <DialogTitle className="text-xl font-bold text-slate-800 mb-2">Xác nhận hủy lịch</DialogTitle>
              <DialogDescription className="text-slate-500">
                Bạn có chắc chắn muốn hủy lịch hẹn này không?
              </DialogDescription>
            </div>
            
            <Card className="p-4 bg-red-50 border-red-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white text-sky-700 flex items-center justify-center border border-sky-100 shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{appointment.doctorName}</div>
                  <div className="text-sm text-slate-600">{appointment.doctorSpec}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span className="font-semibold">{appointment.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="font-semibold">{appointment.time}</span>
                </div>
              </div>
              <div className="text-xs text-red-700 bg-white p-2 rounded-lg border border-red-100">
                <p className="font-semibold">⚠️ Lưu ý:</p>
                <p className="text-red-600">Sau khi hủy, bạn sẽ cần đặt lại lịch nếu muốn khám với bác sĩ này.</p>
              </div>
            </Card>

            <DialogFooter className="flex flex-col gap-3 sm:flex-row mt-4">
              <Button variant="outline" className="flex-1 rounded-full text-lg h-12 font-bold text-slate-700 hover:bg-slate-100 transition-all active:scale-95" onClick={onClose} disabled={isProcessing}>
                Giữ lịch hẹn
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 rounded-full text-lg h-12 font-bold bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95" 
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin mx-auto"></span>
                ) : (
                  "Xác nhận hủy"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
