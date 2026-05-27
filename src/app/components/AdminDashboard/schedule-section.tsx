import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore, store, type Appointment } from "../../store";

export function ScheduleSection() {
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

  return (
    <>
      <Card className="p-5 animate-fade-in">
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
                    toast("Xác nhận hủy lịch?", {
                      description: `Hủy lịch ${s.doctorName} - ${s.patientName}`,
                      action: { label: "Hủy lịch", onClick: () => {
                        store.updateAppointment(s.id, { status: "Đã hủy" });
                        toast.success("Đã hủy lịch");
                      }},
                      cancel: { label: "Giữ lại" },
                    });
                  }}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={!!editingS} onOpenChange={() => setEditingS(null)}>
        <DialogContent className="animate-scale-in">
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
    </>
  );
}
