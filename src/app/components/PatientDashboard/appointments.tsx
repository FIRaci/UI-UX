import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Stethoscope, Clock, Pencil, X } from "lucide-react";
import type { Appointment } from "../../store";

export function Appointments({
  appointments,
  onCancel,
  onEdit,
  onClickDoctor,
}: {
  appointments: Appointment[];
  onCancel: (id: number) => void;
  onEdit: (a: Appointment) => void;
  onClickAppt?: (a: Appointment) => void;
  onClickDoctor?: (doctorName: string) => void;
  onBookNew?: () => void;
}) {
  return (
    <Card
      className="p-0 overflow-hidden bg-transparent/60 backdrop-blur-2xl border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-emerald-500/10 animate-fade-in"
      style={{ borderRadius: "20px" }}
    >
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="border-b border-slate-100 px-5 pt-4 bg-transparent">
          <TabsList className="bg-transparent/40 backdrop-blur-md rounded-xl p-1 h-10 border border-slate-200/50">
            <TabsTrigger
              value="upcoming"
              className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-transparent data-[state=active]:text-slate-800 data-[state=active]:shadow-sm"
            >
              Sắp tới
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-transparent data-[state=active]:text-slate-800 data-[state=active]:shadow-sm"
            >
              Đã khám
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-transparent data-[state=active]:text-slate-800 data-[state=active]:shadow-sm"
            >
              Đã hủy
            </TabsTrigger>
          </TabsList>
        </div>
        {(["Sắp tới", "Hoàn thành", "Đã hủy"] as const).map((s, i) => (
          <TabsContent
            key={s}
            value={["upcoming", "past", "cancelled"][i]}
            className="p-5 space-y-3.5 m-0 bg-transparent backdrop-blur-xl"
          >
            {appointments.filter((a) => a.status === s).length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8 text-slate-300" />
                </div>
                <div className="text-slate-500 font-medium mb-4">Không có lịch hẹn ở trạng thái này.</div>
                {onBookNew && (
                  <Button onClick={onBookNew} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold shadow-sm transition-all active:scale-95 px-6">
                    Tìm bác sĩ & Đặt lịch mới
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {appointments
                  .filter((a) => a.status === s)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-4.5 border border-white/50 bg-transparent/60 backdrop-blur-md rounded-xl hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all hover:-translate-y-0.5"
                      style={{ borderRadius: "16px" }}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <div
                            className={`font-bold text-sm ${onClickDoctor ? "text-sky-700 hover:text-sky-800 cursor-pointer underline decoration-sky-300 underline-offset-2 transition-all" : "text-slate-800"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onClickDoctor?.(a.doctorName);
                            }}
                          >
                            {a.doctorName}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                              {a.doctorSpec}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />{" "}
                              {a.date} • {a.time}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-medium text-slate-600">
                              {a.clinic}
                            </span>
                          </div>
                          {s === "Sắp tới" && (
                            <div className="mt-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-transparent text-slate-400 text-[10px] font-medium border border-slate-200">
                                Sẵn sàng Check-in
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {s === "Hoàn thành" && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 mb-1">
                            Đã hoàn thành
                          </span>
                        )}
                        {s === "Đã hủy" && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 mb-1">
                            Đã hủy
                          </span>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 rounded-lg text-xs px-3 font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
                            onClick={(e) => { e.stopPropagation(); onClickAppt?.(a); }}
                          >
                            Chi tiết
                          </Button>
                          {s === "Sắp tới" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 rounded-lg text-xs px-3 font-semibold bg-slate-100 border-transparent text-slate-800 hover:bg-slate-200 active:scale-95 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(a);
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                Sửa
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 rounded-lg text-xs px-3 font-bold bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 active:scale-95 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCancel(a.id);
                                }}
                              >
                                <X className="w-3.5 h-3.5 mr-1" />
                                Hủy
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
