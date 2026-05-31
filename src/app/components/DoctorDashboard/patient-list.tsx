import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { toast } from "sonner";
import { type Triage } from "./constants";
import type { Appointment } from "../../store";
import { Users, FileText, Stethoscope, Search, Calendar, ChevronRight } from "lucide-react";
import { Badge } from "../ui/badge";

type Props = {
  appointments: Appointment[];
  setPatientFile: (v: string | null) => void;
  queue: Triage[];
  setConsultPatient: (v: Triage | null) => void;
  searchQuery?: string;
};

export function PatientList({ appointments, setPatientFile, queue, setConsultPatient, searchQuery = "" }: Props) {
  const uniquePatients = Array.from(new Set(appointments.map(a => a.patientName)))
    .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Card className="p-0 overflow-hidden bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] animate-fade-in">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-violet-50/50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
                <Users className="w-4 h-4" />
              </div>
              Danh sách bệnh nhân
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1.5 ml-10">Quản lý hồ sơ những bệnh nhân bạn đang theo dõi điều trị.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 bg-slate-50/30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {uniquePatients.map(name => {
            const last = appointments.find(a => a.patientName === name);
            const inQueue = queue.find(q => q.patient === name);
            
            return (
              <div key={name} className="group bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold text-lg">
                        {name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {inQueue ? (
                      <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 shadow-sm px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">Đang đợi khám</Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">Đã khám</Badge>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-base mb-1 truncate">{name}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    Lần khám cuối: <span className="text-slate-700">{last?.date}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-50">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 h-9 rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-colors" 
                    onClick={() => setPatientFile(name)}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> Hồ sơ
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 h-9 rounded-xl text-xs font-bold bg-slate-900 hover:bg-violet-600 text-white shadow-md transition-colors" 
                    onClick={() => {
                      const triage = queue.find(q => q.patient === name) ?? { id: -1, level: "Trung bình", patient: name, age: 40, symptoms: "Tái khám định kỳ", waited: "—", vitals: { bp: "120/80", hr: "75", temp: "36.7", spo2: "98" } } as Triage;
                      setConsultPatient(triage);
                      toast.success(`Đã mở phiên hội chẩn với ${name}`);
                    }}
                  >
                    <Stethoscope className="w-3.5 h-3.5 mr-1.5" /> Hội chẩn
                  </Button>
                </div>
              </div>
            );
          })}
          
          {appointments.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-[24px] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">Chưa có dữ liệu bệnh nhân</h3>
              <p className="text-xs font-medium text-slate-500">Danh sách bệnh nhân của bạn hiện đang trống.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
