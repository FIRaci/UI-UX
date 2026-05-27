import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { CalendarCheck } from "lucide-react";
import type { DoctorRec } from "./constants";
import { DOCTORS } from "./constants";

interface AppointmentBookingProps {
  selectedDoctor: DoctorRec | null;
  selectedSlot: string;
  appointmentNotes: string;
  onDoctorChange: (d: DoctorRec | null) => void;
  onSlotChange: (s: string) => void;
  onNotesChange: (s: string) => void;
  onBook: () => void;
}

export function AppointmentBooking({
  selectedDoctor, selectedSlot, appointmentNotes,
  onDoctorChange, onSlotChange, onNotesChange, onBook,
}: AppointmentBookingProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6 border border-slate-100 shadow-sm animate-fade-in card-hover" style={{ borderRadius: "16px" }}>
        <h3 className="tracking-tight font-bold text-slate-800 mb-4">Đặt lịch khám</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Chọn bác sĩ</label>
            <Select value={selectedDoctor?.id.toString() || ""} onValueChange={v => onDoctorChange(DOCTORS.find(d => d.id === Number(v)) || null)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Chọn bác sĩ..." /></SelectTrigger>
              <SelectContent>
                {DOCTORS.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name} - {d.specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDoctor && (
            <>
              <Card className="p-3 bg-emerald-50 border-emerald-200" style={{ borderRadius: "12px" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{selectedDoctor.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedDoctor.specialty}</div>
                  </div>
                  <Badge variant="outline">{selectedDoctor.nextSlot}</Badge>
                </div>
              </Card>

              <div>
                <label className="text-sm font-medium block mb-2">Chọn khung giờ</label>
                <div className="grid grid-cols-3 gap-2">
                  {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map(slot => (
                    <button
                      key={slot}
                      onClick={() => onSlotChange(slot)}
                      className={`p-2 rounded-xl border text-sm font-medium transition ${
                        selectedSlot === slot
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Tóm tắt triệu chứng</label>
                <Textarea
                  rows={4}
                  placeholder="Mô tả ngắn gọn triệu chứng để bác sĩ chuẩn bị..."
                  value={appointmentNotes}
                  onChange={e => onNotesChange(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </>
          )}

          <Button
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            onClick={onBook}
            disabled={!selectedDoctor || !selectedSlot}
          >
            <CalendarCheck className="w-4 h-4 mr-2" /> Xác nhận đặt lịch
          </Button>
        </div>
      </Card>
    </div>
  );
}
