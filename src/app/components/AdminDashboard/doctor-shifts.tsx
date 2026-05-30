import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Plus, Trash2, Clock, Calendar, Stethoscope } from "lucide-react";
import { toast } from "sonner";

type Doctor = { id: number; name: string; spec: string; shifts: string[] };

const SPEC_COLORS: Record<string, string> = {
  "Tim mạch": "blue",
  "Da liễu": "pink",
  "Nhi khoa": "amber",
  "Thần kinh": "violet",
  "Mắt": "emerald",
  "Tai Mũi Họng": "sky",
};

export function DoctorShifts() {
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: 1, name: "BS. Nguyễn Văn An", spec: "Tim mạch", shifts: ["T2 8-12", "T4 14-18"] },
    { id: 2, name: "BS. Trần Thị Bình", spec: "Da liễu", shifts: ["T3 9-12", "T5 13-17"] },
    { id: 3, name: "BS. Lê Hoàng Cường", spec: "Nhi khoa", shifts: ["T2-T6 8-17"] },
    { id: 4, name: "BS. Phạm Thị Mai", spec: "Thần kinh", shifts: ["T2 14-18", "T6 8-12"] },
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

  const totalShifts = doctors.reduce((acc, d) => acc + d.shifts.length, 0);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Lịch làm việc bác sĩ</h2>
            <p className="text-sm text-slate-500 mt-1">Quản lý ca làm việc của đội ngũ bác sĩ</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Tổng bác sĩ", value: doctors.length, icon: Stethoscope, color: "blue" },
            { label: "Tổng ca làm việc", value: totalShifts, icon: Clock, color: "emerald" },
            { label: "Chuyên khoa", value: new Set(doctors.map(d => d.spec)).size, icon: Calendar, color: "violet" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-4 bg-white border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map(d => {
            const specColor = SPEC_COLORS[d.spec] || "slate";
            return (
              <Card key={d.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-all group" style={{ borderRadius: "16px" }}>
                <div className="p-6">
                  {/* Doctor Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                        <AvatarFallback className={`bg-gradient-to-br from-${specColor}-100 to-${specColor}-200 text-${specColor}-700 font-bold text-lg`}>
                          {d.name.split(" ").pop()?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{d.name}</h4>
                        <Badge variant="secondary" className={`mt-1.5 bg-${specColor}-50 text-${specColor}-700 font-medium`}>
                          {d.spec}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => {
                        setShiftDoctor(d);
                        setShiftDay("T2");
                        setShiftStart("08:00");
                        setShiftEnd("12:00");
                      }}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Shifts */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Ca làm việc ({d.shifts.length})</span>
                    </div>
                    {d.shifts.length === 0 ? (
                      <div className="py-4 text-center text-sm text-slate-400 bg-slate-50 rounded-xl">
                        Chưa có ca làm việc
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {d.shifts.map((s, i) => (
                          <div
                            key={i}
                            className="group/shift inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700 hover:border-slate-200 hover:bg-white transition-all"
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {s}
                            <button
                              className="ml-1 text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors opacity-0 group-hover/shift:opacity-100"
                              onClick={() => {
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
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={!!shiftDoctor} onOpenChange={() => setShiftDoctor(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {shiftDoctor && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Thêm ca làm việc</DialogTitle>
                <DialogDescription>{shiftDoctor.name} • {shiftDoctor.spec}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ngày</Label>
                  <Select value={shiftDay} onValueChange={setShiftDay}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bắt đầu</Label>
                  <Input type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Kết thúc</Label>
                  <Input type="time" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} className="h-10" />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShiftDoctor(null)}>
                  Hủy
                </Button>
                <Button onClick={addShift} className="bg-blue-600 hover:bg-blue-700">
                  Thêm ca
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
