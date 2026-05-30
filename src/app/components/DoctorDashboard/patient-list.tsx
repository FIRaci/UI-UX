import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { toast } from "sonner";
import { type Triage } from "./constants";
import type { Appointment } from "../../store";

type Props = {
  appointments: Appointment[];
  setPatientFile: (v: string | null) => void;
  queue: Triage[];
  setConsultPatient: (v: Triage | null) => void;
};

export function PatientList({ appointments, setPatientFile, queue, setConsultPatient }: Props) {
  return (
    <Card className="p-5 animate-fade-in">
      <h4 className="tracking-tight mb-3">Bệnh nhân của tôi</h4>
      <div className="grid md:grid-cols-2 gap-3">
        {Array.from(new Set(appointments.map(a => a.patientName))).map(name => {
          const last = appointments.find(a => a.patientName === name);
          return (
            <Card key={name} className="p-4 card-hover">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12"><AvatarFallback className="bg-violet-100 text-violet-700">{name[0]}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div>{name}</div>
                  <div className="text-sm text-muted-foreground">Lần gần nhất: {last?.date} • {last?.time}</div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => setPatientFile(name)}>Hồ sơ</Button>
                    <Button size="sm" onClick={() => {
                      const triage = queue.find(q => q.patient === name) ?? { id: -1, level: "Trung bình", patient: name, age: 40, symptoms: "Tái khám định kỳ", waited: "—", vitals: { bp: "120/80", hr: "75", temp: "36.7", spo2: "98" } } as Triage;
                      setConsultPatient(triage);
                      toast.success(`Đã mở phiên hội chẩn với ${name}`);
                    }}>Hội chẩn</Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {appointments.length === 0 && <div className="text-muted-foreground col-span-full text-center py-6">Chưa có bệnh nhân.</div>}
      </div>
    </Card>
  );
}
