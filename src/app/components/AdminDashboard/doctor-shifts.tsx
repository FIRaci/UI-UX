import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Doctor = { id: number; name: string; spec: string; shifts: string[] };

export function DoctorShifts() {
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: 1, name: "BS. Nguyễn Văn An", spec: "Tim mạch", shifts: ["T2 8-12", "T4 14-18"] },
    { id: 2, name: "BS. Trần Thị Bình", spec: "Da liễu", shifts: ["T3 9-12", "T5 13-17"] },
    { id: 3, name: "BS. Lê Hoàng Cường", spec: "Nhi khoa", shifts: ["T2-T6 8-17"] },
  ]);
  const [shiftDoctor, setShiftDoctor] = useState<Doctor | null>(null);
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
    <>
      <Card className="p-6 bg-white/90 backdrop-blur-xl border border-white shadow-[0_10px_40px_rgb(0,0,0,0.05)] transition-all duration-300 animate-slide-up" style={{ borderRadius: "28px" }}>
        <h4 className="text-xl font-extrabold tracking-tight text-slate-800 mb-6">Lịch làm việc của bác sĩ</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map(d => (
            <Card key={d.id} className="p-5 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group" style={{ borderRadius: "20px" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 shadow-sm border border-slate-100 group-hover:scale-105 transition-transform"><AvatarFallback className="bg-gradient-to-br from-indigo-100 to-blue-50 text-blue-700 font-bold">{d.name.split(" ").pop()?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <div className="font-extrabold text-slate-800 text-[15px] leading-tight">{d.name}</div>
                    <Badge variant="secondary" className="mt-1.5 bg-blue-50 text-blue-700 border-none hover:bg-blue-100">{d.spec}</Badge>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => {
                  setShiftDoctor(d);
                  setShiftDay("T2"); setShiftStart("08:00"); setShiftEnd("12:00");
                }}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {d.shifts.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[13px] font-semibold text-slate-600 flex items-center gap-2 shadow-sm hover:border-slate-200 transition-colors">
                    {s}
                    <button className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors" onClick={() => {
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

      <Dialog open={!!shiftDoctor} onOpenChange={() => setShiftDoctor(null)}>
        <DialogContent className="animate-scale-in">
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
    </>
  );
}
