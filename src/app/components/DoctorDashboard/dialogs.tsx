import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { FileText, Save } from "lucide-react";
import { toast } from "sonner";
import { type Triage } from "./constants";
import type { Appointment } from "../../store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type RecordItem = { p: string; d: string; t: string; m: string };
type Props = {
  patientFile: string | null;
  setPatientFile: (v: string | null) => void;
  appointments: Appointment[];
  recordView: RecordItem | null;
  setRecordView: (v: RecordItem | null) => void;
  apptDetail: any;
  setApptDetail: (v: any) => void;
  newRecord: boolean;
  setNewRecord: (v: boolean) => void;
  newRecordType: "prescription" | "record";
  setNewRecordType: (v: "prescription" | "record") => void;
  newRecordPatient: string;
  setNewRecordPatient: (v: string) => void;
  newRecordContent: string;
  setNewRecordContent: (v: string) => void;
  showRecordTemplate: boolean;
  setShowRecordTemplate: (v: boolean) => void;
  queue: Triage[];
  setConsultPatient: (v: Triage | null) => void;
  loadRecords: () => Promise<void>;
  NOTE_TEMPLATES: { name: string; body: string }[];
  ME_NAME: string;
};

export function Dialogs({
  patientFile, setPatientFile, appointments,
  recordView, setRecordView,
  apptDetail, setApptDetail,
  newRecord, setNewRecord, newRecordType, setNewRecordType,
  newRecordPatient, setNewRecordPatient,
  newRecordContent, setNewRecordContent,
  showRecordTemplate, setShowRecordTemplate,
  queue, setConsultPatient, loadRecords,
  NOTE_TEMPLATES, ME_NAME,
}: Props) {
  return (
    <>
      <Dialog open={!!patientFile} onOpenChange={() => setPatientFile(null)}>
        <DialogContent className="max-w-xl animate-scale-in">
          {patientFile && (() => {
            const visits = appointments.filter(a => a.patientName === patientFile);
            return (
              <>
                <DialogHeader className="text-left">
                  <DialogTitle>Hồ sơ bệnh án — {patientFile}</DialogTitle>
                  <DialogDescription>{visits.length} lượt khám trong hệ thống</DialogDescription>
                </DialogHeader>
                <section className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg border"><div className="text-xs text-muted-foreground">Nhóm máu</div><div className="mt-0.5">O+</div></div>
                  <div className="p-3 rounded-lg border"><div className="text-xs text-muted-foreground">Dị ứng</div><div className="mt-0.5">Penicillin</div></div>
                  <div className="p-3 rounded-lg border"><div className="text-xs text-muted-foreground">Bệnh nền</div><div className="mt-0.5">THA độ I</div></div>
                </section>
                <section>
                  <div className="text-sm tracking-tight mb-1.5">Lịch sử khám</div>
                  <div className="space-y-1.5 max-h-48 overflow-auto">
                    {visits.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Chưa có dữ liệu khám.</div>
                    ) : visits.map(v => (
                      <div key={v.id} className="p-2 rounded border text-sm flex justify-between">
                        <span>{v.date} • {v.time}</span>
                        <span className="text-muted-foreground">{v.doctorSpec} • {v.status}</span>
                      </div>
                    ))}
                  </div>
                </section>
                <DialogFooter>
                  <Button variant="outline" onClick={() => toast.info("Tính năng in PDF đang phát triển")}>In PDF</Button>
                  <Button onClick={() => setPatientFile(null)}>Đóng</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!recordView} onOpenChange={() => setRecordView(null)}>
        <DialogContent className="animate-scale-in">
          {recordView && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>{recordView.t}</DialogTitle>
                <DialogDescription>Bệnh nhân: {recordView.p} • {recordView.d}</DialogDescription>
              </DialogHeader>
              <section className="p-3 rounded-lg bg-slate-50 border">
                <div className="text-xs text-muted-foreground mb-1">Nội dung</div>
                <p className="text-sm text-slate-800">{recordView.m}</p>
              </section>
              <section>
                <div className="text-sm tracking-tight mb-1">Hướng dẫn</div>
                <ul className="text-sm text-slate-700 space-y-0.5">
                  <li>• Uống thuốc đúng liều, đúng giờ theo đơn.</li>
                  <li>• Theo dõi huyết áp 2 lần/ngày, ghi vào sổ.</li>
                  <li>• Tái khám sau 4 tuần hoặc khi có dấu hiệu bất thường.</li>
                </ul>
              </section>
              <DialogFooter>
                <Button variant="outline" onClick={() => toast.info("Tính năng gửi đơn đang phát triển")}>Gửi cho BN</Button>
                <Button onClick={() => setRecordView(null)}>Đóng</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!apptDetail} onOpenChange={() => setApptDetail(null)}>
        <DialogContent className="animate-scale-in">
          {apptDetail && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
                <DialogDescription>{apptDetail.patientName}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg border"><div className="text-xs text-muted-foreground">Ngày</div><div className="mt-0.5">{apptDetail.date}</div></div>
                <div className="p-3 rounded-lg border"><div className="text-xs text-muted-foreground">Giờ</div><div className="mt-0.5">{apptDetail.time}</div></div>
                <div className="p-3 rounded-lg border"><div className="text-xs text-muted-foreground">Chi nhánh</div><div className="mt-0.5">{apptDetail.clinic}</div></div>
                <div className="p-3 rounded-lg border"><div className="text-xs text-muted-foreground">Trạng thái</div><div className="mt-0.5">{apptDetail.status}</div></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { toast.info("Tính năng gọi nhắc đang phát triển"); }}>Gọi nhắc</Button>
                <Button onClick={() => {
                  const triage = queue.find(q => q.patient === apptDetail.patientName) ?? { id: -1, level: "Trung bình" as const, patient: apptDetail.patientName, age: 40, symptoms: apptDetail.doctorSpec, waited: "—", vitals: { bp: "120/80", hr: "75", temp: "36.7°C", spo2: "98%" } } as Triage;
                  setConsultPatient(triage);
                  setApptDetail(null);
                }}>Bắt đầu khám</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={newRecord} onOpenChange={(open) => {
        setNewRecord(open);
        if (!open) { setNewRecordPatient(""); setNewRecordContent(""); setNewRecordType("prescription"); }
      }}>
        <DialogContent className="max-w-2xl animate-scale-in">
          <DialogHeader className="text-left">
            <DialogTitle>Tạo {newRecordType === "prescription" ? "đơn thuốc" : "hồ sơ khám"} mới</DialogTitle>
            <DialogDescription>Nhập thông tin đầy đủ trước khi lưu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Loại</label>
              <Select value={newRecordType} onValueChange={(v: "prescription" | "record") => setNewRecordType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prescription">Đơn thuốc</SelectItem>
                  <SelectItem value="record">Hồ sơ khám</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Bệnh nhân</label>
              <Select value={newRecordPatient} onValueChange={setNewRecordPatient}>
                <SelectTrigger><SelectValue placeholder="Chọn bệnh nhân..." /></SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(appointments.map(a => a.patientName))).map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Nội dung</label>
                <Button size="sm" variant="outline" onClick={() => setShowRecordTemplate(true)}>
                  <FileText className="w-3.5 h-3.5 mr-1" /> Chọn template
                </Button>
              </div>
              <Textarea className="min-h-[200px] resize-none"
                placeholder={newRecordType === "prescription" ? "Nhập đơn thuốc: tên thuốc, liều lượng, cách dùng..." : "Nhập kết quả khám, chẩn đoán, khuyến nghị..."}
                value={newRecordContent} onChange={e => setNewRecordContent(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRecord(false)}>Hủy</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
              if (!newRecordPatient.trim()) { toast.error("Vui lòng chọn bệnh nhân"); return; }
              if (!newRecordContent.trim()) { toast.error("Vui lòng nhập nội dung"); return; }
              const today = new Date().toISOString().split('T')[0];
              const title = newRecordType === "prescription" ? "Đơn thuốc mới" : "Hồ sơ khám mới";
              const token = localStorage.getItem("token");
              const headers: Record<string, string> = { "Content-Type": "application/json" };
              if (token) headers["Authorization"] = `Bearer ${token}`;
              const savePromise = fetch(`${API_URL}/api/records`, {
                method: "POST", headers,
                body: JSON.stringify({ patientName: newRecordPatient, title, date: today, doctor: ME_NAME, note: newRecordContent, type: newRecordType === "prescription" ? "donthuoc" : "benhan" })
              }).then(async (res) => {
                if (res.status === 401) { localStorage.removeItem("token"); window.dispatchEvent(new CustomEvent("app:unauthorized")); throw new Error("Phiên đăng nhập hết hạn"); }
                if (res.ok) { loadRecords(); setNewRecord(false); setNewRecordPatient(""); setNewRecordContent(""); return res; }
                else { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || "Không thể lưu hồ sơ bệnh án"); }
              });
              toast.promise(savePromise, {
                loading: "Đang lưu hồ sơ bệnh án...",
                success: () => `Đã tạo thành công ${newRecordType === "prescription" ? "đơn thuốc" : "hồ sơ"} cho ${newRecordPatient}`,
                error: (err) => err.message || "Lỗi kết nối đến máy chủ"
              });
            }}>
              <Save className="w-4 h-4 mr-1" /> Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRecordTemplate} onOpenChange={() => setShowRecordTemplate(false)}>
        <DialogContent className="animate-scale-in">
          <DialogHeader><DialogTitle>Chọn template</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {NOTE_TEMPLATES.map(t => (
              <Card key={t.name} className="p-3 hover:bg-slate-50 cursor-pointer card-hover" onClick={() => {
                setNewRecordContent(prev => (prev ? prev + "\n\n" : "") + t.body);
                setShowRecordTemplate(false);
                toast.success(`Đã chèn template: ${t.name}`);
              }}>
                <div className="text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-1 whitespace-pre-line line-clamp-3">{t.body}</div>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordTemplate(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
