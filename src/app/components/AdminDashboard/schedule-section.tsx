import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Plus, Pencil, Trash2, Calendar, Clock, MapPin, User, Stethoscope, Filter } from "lucide-react";
import { toast } from "sonner";
import { useStore, store, type Appointment } from "../../store";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  "Sắp tới": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  "Hoàn thành": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Đã hủy": { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  "Đang diễn ra": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

export function ScheduleSection() {
  const allAppointments = useStore(s => s.appointments);
  const [editingS, setEditingS] = useState<(Partial<Appointment> & { id: number }) | null>(null);
  const [sBranch, setSBranch] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSchedules = allAppointments.filter(a => {
    const matchesBranch = sBranch === "all" || a.clinic === sBranch;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesBranch && matchesStatus;
  });

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

  const upcomingCount = allAppointments.filter(a => a.status === "Sắp tới").length;
  const completedCount = allAppointments.filter(a => a.status === "Hoàn thành").length;
  const cancelledCount = allAppointments.filter(a => a.status === "Đã hủy").length;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Lịch khám hệ thống</h2>
            <p className="text-sm text-slate-500 mt-1">Quản lý lịch hẹn khám bệnh toàn hệ thống</p>
          </div>
          <Button onClick={() => setEditingS({ id: 0, doctorName: "", patientName: "", date: "", time: "", clinic: "CN Q1", doctorSpec: "" })} className="h-9 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Tạo lịch mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Sắp tới", value: upcomingCount, color: "blue" },
            { label: "Hoàn thành", value: completedCount, color: "emerald" },
            { label: "Đã hủy", value: cancelledCount, color: "slate" },
          ].map((stat, i) => (
            <Card key={i} className="p-4 bg-white border-0 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full bg-${stat.color}-500`} />
                <span className="text-sm text-slate-500">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white border-0 shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Bộ lọc:</span>
            </div>
            <Select value={sBranch} onValueChange={setSBranch}>
              <SelectTrigger className="w-[160px] h-9 bg-slate-50 border-slate-200">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                <SelectItem value="CN Q1">CN Q1</SelectItem>
                <SelectItem value="CN Q3">CN Q3</SelectItem>
                <SelectItem value="CN Tân Bình">CN Tân Bình</SelectItem>
                <SelectItem value="CN Q7">CN Q7</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 bg-slate-50 border-slate-200">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Sắp tới">Sắp tới</SelectItem>
                <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                <SelectItem value="Đã hủy">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <span className="text-sm text-slate-500">
              <span className="font-medium text-slate-900">{filteredSchedules.length}</span> lịch hẹn
            </span>
          </div>
        </Card>

        {/* Schedule List */}
        {filteredSchedules.length === 0 ? (
          <Card className="p-16 text-center bg-white border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Không có lịch hẹn</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Không tìm thấy lịch hẹn phù hợp với bộ lọc. Hãy tạo lịch mới hoặc thay đổi bộ lọc.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredSchedules.map(s => {
              const statusConfig = STATUS_CONFIG[s.status] || STATUS_CONFIG["Sắp tới"];
              return (
                <Card key={s.id} className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-all group" style={{ borderRadius: "12px" }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Time Block */}
                      <div className="w-16 h-16 rounded-xl bg-blue-50 flex flex-col items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-blue-600 mb-0.5" />
                        <span className="text-xs font-bold text-blue-700">{s.date.split("-")[2]}/{s.date.split("-")[1]}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 truncate">{s.doctorName}</span>
                          {s.doctorSpec && (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs font-medium shrink-0">
                              {s.doctorSpec}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {s.patientName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {s.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {s.clinic}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={`${statusConfig.bg} ${statusConfig.text} font-medium`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                        {s.status}
                      </Badge>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => setEditingS(s)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            toast("Xác nhận hủy lịch?", {
                              description: `Hủy lịch ${s.doctorName} - ${s.patientName}`,
                              action: {
                                label: "Hủy lịch",
                                onClick: () => {
                                  store.updateAppointment(s.id, { status: "Đã hủy" });
                                  toast.success("Đã hủy lịch");
                                },
                              },
                              cancel: { label: "Giữ lại" },
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={!!editingS} onOpenChange={() => setEditingS(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {editingS && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{editingS.id ? "Cập nhật" : "Tạo"} lịch khám</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bác sĩ</Label>
                  <Input
                    value={editingS.doctorName ?? ""}
                    onChange={e => setEditingS({ ...editingS, doctorName: e.target.value })}
                    placeholder="VD: BS. Nguyễn Văn An"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bệnh nhân</Label>
                  <Input
                    value={editingS.patientName ?? ""}
                    onChange={e => setEditingS({ ...editingS, patientName: e.target.value })}
                    placeholder="VD: Nguyễn Minh Khoa"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Chuyên khoa</Label>
                  <Input
                    value={editingS.doctorSpec ?? ""}
                    onChange={e => setEditingS({ ...editingS, doctorSpec: e.target.value })}
                    placeholder="VD: Tim mạch"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Chi nhánh</Label>
                  <Select value={editingS.clinic ?? "CN Q1"} onValueChange={v => setEditingS({ ...editingS, clinic: v })}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CN Q1">CN Q1</SelectItem>
                      <SelectItem value="CN Q3">CN Q3</SelectItem>
                      <SelectItem value="CN Tân Bình">CN Tân Bình</SelectItem>
                      <SelectItem value="CN Q7">CN Q7</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ngày</Label>
                  <Input type="date" value={editingS.date ?? ""} onChange={e => setEditingS({ ...editingS, date: e.target.value })} className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Giờ</Label>
                  <Input type="time" value={editingS.time ?? ""} onChange={e => setEditingS({ ...editingS, time: e.target.value })} className="h-10" />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setEditingS(null)}>
                  Hủy
                </Button>
                <Button onClick={saveSchedule} className="bg-blue-600 hover:bg-blue-700">
                  Lưu lịch
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
