import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";

const metrics = [
  { label: "Huyết áp", value: "120/80 mmHg", p: 75, c: "bg-sky-500", status: "Bình thường", sc: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { label: "Nhịp tim", value: "72 bpm", p: 65, c: "bg-rose-500", status: "Bình thường", sc: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { label: "Đường huyết", value: "5.4 mmol/L", p: 80, c: "bg-amber-500", status: "Bình thường", sc: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { label: "Chỉ số cơ thể (BMI)", value: "22.4", p: 70, c: "bg-emerald-500", status: "Bình thường", sc: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

export function Tracking({ onBook, skipConfirm, onSkip, onCancelSkip }: {
  onBook: () => void;
  skipConfirm: boolean;
  onSkip: () => void;
  onCancelSkip: () => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
      <Card className="p-5 bg-white border border-slate-100 shadow-sm animate-slide-up card-hover" style={{ borderRadius: "20px" }}>
        <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Theo dõi sinh hiệu lâm sàng</h4>
        <div className="space-y-4">
          {metrics.map(m => (
            <div key={m.label} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-600">{m.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.sc}`}>{m.status}</span>
                  <span className="text-slate-800 font-bold">{m.value}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${m.c} transition-all duration-700`} style={{ width: `${m.p}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5 bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-orange-100 shadow-sm relative overflow-hidden animate-slide-up card-hover" style={{ borderRadius: "20px" }}>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-orange-200/10 rounded-full blur-2xl pointer-events-none" />
        <h4 className="font-bold text-orange-800 text-sm tracking-tight">Nhắc lịch tái khám định kỳ</h4>
        <p className="text-xs text-orange-700 mt-1 font-medium leading-relaxed">BS. Nguyễn Văn An đề nghị thực hiện tái khám tầm soát định kỳ sau 1 tháng.</p>
        <Card className="p-3.5 mt-3.5 bg-white/80 border border-orange-100/50" style={{ borderRadius: "12px" }}>
          <div className="text-xs font-bold text-slate-700">Bác sĩ phụ trách: <b>BS. Nguyễn Văn An</b></div>
          <div className="text-[11px] text-slate-400 mt-1 font-semibold">Chuyên khoa Tim mạch • Khám gần nhất: 2026-04-10</div>
        </Card>
        {skipConfirm ? (
          <div className="mt-4 p-3 rounded-xl bg-orange-100 border border-orange-200">
            <p className="text-xs text-orange-800 font-semibold mb-2">Ban chac chan muon bo qua nhac nho tai kham nay?</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-lg text-xs border-orange-300 text-orange-700" onClick={onCancelSkip}>Giữ lại</Button>
              <Button size="sm" className="rounded-lg text-xs bg-orange-600 hover:bg-orange-700 text-white" onClick={() => { onCancelSkip(); toast.info("Đã bỏ qua nhắc nhở"); }}>Xác nhận bỏ qua</Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2.5 mt-4">
            <Button onClick={onBook} className="rounded-xl text-xs h-9 bg-orange-600 hover:bg-orange-700 text-white shadow-sm shrink-0">Đặt lịch tái khám</Button>
            <Button variant="outline" className="rounded-xl text-xs h-9 border-orange-200 bg-transparent text-orange-700 hover:bg-orange-50/50" onClick={onSkip}>Bỏ qua</Button>
          </div>
        )}
      </Card>
      <Card className="p-5 md:col-span-2 bg-white border border-slate-100 shadow-sm card-hover" style={{ borderRadius: "20px" }}>
        <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Lịch sử quá trình khám & điều trị</h4>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-1 before:bottom-1 before:w-0.5 before:bg-slate-100">
          {[
            { d: "2026-04-22", t: "Khám tổng quát sức khỏe", n: "Sức khỏe lâm sàng hoàn toàn ổn định" },
            { d: "2026-02-10", t: "Điều trị viêm họng cấp", n: "Điều trị bằng thuốc kháng sinh, bệnh nhân hồi phục hoàn toàn" },
            { d: "2025-11-15", t: "Tầm soát tim mạch chuyên khoa", n: "Theo dõi nhịp tim và huyết áp định kỳ tại nhà" },
          ].map((e, i) => (
            <div key={i} className="relative animate-fade-in">
              <div className="absolute -left-[1.38rem] top-1.5 w-2 h-2 rounded-full bg-sky-500 ring-4 ring-sky-100" />
              <div className="text-[10px] text-slate-400 font-bold">{e.d}</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{e.t}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">{e.n}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
