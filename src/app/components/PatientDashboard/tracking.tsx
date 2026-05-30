import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Activity, HeartPulse, Droplet, Scale, Timer, Beaker, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";

const metrics = [
  { label: "Huyết áp", value: "120/80", unit: "mmHg", icon: Activity, p: 75, c: "bg-sky-500", status: "Bình thường", sc: "text-emerald-600 bg-emerald-50 border-emerald-200", trend: "up", history: [118, 122, 119, 121, 120] },
  { label: "Nhịp tim", value: "72", unit: "bpm", icon: HeartPulse, p: 65, c: "bg-rose-500", status: "Tốt", sc: "text-emerald-600 bg-emerald-50 border-emerald-200", trend: "stable", history: [74, 71, 75, 70, 72] },
  { label: "Đường huyết", value: "5.4", unit: "mmol/L", icon: Droplet, p: 80, c: "bg-amber-500", status: "Chú ý", sc: "text-amber-600 bg-amber-50 border-amber-200", trend: "up", history: [5.1, 5.2, 5.0, 5.3, 5.4] },
  { label: "SpO2 (Oxy)", value: "98", unit: "%", icon: Zap, p: 98, c: "bg-blue-500", status: "Bình thường", sc: "text-emerald-600 bg-emerald-50 border-emerald-200", trend: "stable", history: [97, 98, 98, 99, 98] },
  { label: "Cholesterol", value: "4.8", unit: "mmol/L", icon: Beaker, p: 60, c: "bg-purple-500", status: "Tốt", sc: "text-emerald-600 bg-emerald-50 border-emerald-200", trend: "down", history: [5.2, 5.0, 4.9, 4.8, 4.8] },
  { label: "Chỉ số cơ thể (BMI)", value: "22.4", unit: "", icon: Scale, p: 70, c: "bg-emerald-500", status: "Cân đối", sc: "text-emerald-600 bg-emerald-50 border-emerald-200", trend: "stable", history: [22.6, 22.5, 22.5, 22.4, 22.4] },
];

export function Tracking({ onBook, skipConfirm, onSkip, onCancelSkip }: {
  onBook: () => void;
  skipConfirm: boolean;
  onSkip: () => void;
  onCancelSkip: () => void;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid md:grid-cols-3 gap-5">
        {/* Left Column: Metrics Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-full">
            <h4 className="font-bold text-slate-800 text-base tracking-tight mb-2">Chỉ số sinh tồn & xét nghiệm</h4>
            <p className="text-sm text-slate-500 mb-4">Theo dõi chi tiết các chỉ số sức khỏe quan trọng được cập nhật từ lần khám gần nhất.</p>
          </div>
          
          {metrics.map(m => (
            <Card key={m.label} className="p-4 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-teal-100" style={{ borderRadius: "20px" }}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl ${m.c.replace('bg-', 'bg-').replace('500', '100')} flex items-center justify-center`}>
                    <m.icon className={`w-4 h-4 ${m.c.replace('bg-', 'text-').replace('500', '600')}`} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{m.label}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.sc}`}>{m.status}</span>
              </div>
              
              <div className="flex items-end gap-2 mb-3">
                <span className="text-2xl font-black text-slate-800 leading-none tracking-tight">{m.value}</span>
                <span className="text-xs font-bold text-slate-400 mb-1">{m.unit}</span>
                <div className="ml-auto flex items-center gap-1">
                  {m.trend === 'up' && <TrendingUp className="w-3 h-3 text-rose-500" />}
                  {m.trend === 'down' && <TrendingDown className="w-3 h-3 text-emerald-500" />}
                  {m.trend === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
                </div>
              </div>
              
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${m.c} transition-all duration-1000 ease-out`} style={{ width: `${m.p}%` }} />
              </div>
              
              {/* Mini sparkline visualization */}
              <div className="mt-3 flex items-end gap-1 h-6">
                {m.history.map((h, i) => {
                  const min = Math.min(...m.history);
                  const max = Math.max(...m.history);
                  const range = max - min || 1;
                  const height = Math.max(20, ((h - min) / range) * 100);
                  return (
                    <div key={i} className="flex-1 bg-slate-100 rounded-t-sm hover:bg-slate-200 transition-colors relative group">
                      <div className={`absolute bottom-0 w-full rounded-t-sm ${i === m.history.length - 1 ? m.c : 'bg-slate-200 group-hover:bg-slate-300'}`} style={{ height: `${height}%` }} />
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        {/* Right Column: Reminders & History */}
        <div className="space-y-5">
          <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/50 border border-orange-100 shadow-sm relative overflow-hidden card-hover" style={{ borderRadius: "20px" }}>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Timer className="w-4 h-4 text-orange-600" />
              </div>
              <h4 className="font-bold text-orange-900 text-sm tracking-tight">Kế hoạch tái khám</h4>
            </div>
            
            <p className="text-xs text-orange-800 mt-2 font-medium leading-relaxed">Theo phác đồ điều trị, bạn cần tái khám tầm soát định kỳ sau 1 tháng.</p>
            
            <Card className="p-3 mt-3 bg-white border border-orange-100 shadow-sm" style={{ borderRadius: "14px" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Bác sĩ phụ trách</span>
                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Tim mạch</span>
              </div>
              <div className="text-sm font-bold text-slate-800">BS. Nguyễn Văn An</div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Khám gần nhất: 10/04/2026</div>
            </Card>
            
            {skipConfirm ? (
              <div className="mt-4 p-3.5 rounded-2xl bg-white border border-orange-200 shadow-sm">
                <p className="text-xs text-slate-700 font-semibold mb-3">Bạn có chắc chắn muốn bỏ qua nhắc nhở này?</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs border-orange-200 text-orange-700 hover:bg-orange-50" onClick={onCancelSkip}>Giữ lại</Button>
                  <Button size="sm" className="flex-1 rounded-xl text-xs bg-orange-600 hover:bg-orange-700 text-white" onClick={() => { onCancelSkip(); toast.info("Đã bỏ qua nhắc nhở"); }}>Bỏ qua</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                <Button onClick={onBook} className="w-full rounded-xl text-sm font-bold h-10 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition-all active:scale-95">Đặt lịch tái khám ngay</Button>
                <Button variant="ghost" className="w-full rounded-xl text-xs h-9 text-orange-700 hover:bg-orange-100/50" onClick={onSkip}>Bỏ qua nhắc nhở này</Button>
              </div>
            )}
          </Card>

          <Card className="p-5 bg-white/60 backdrop-blur-2xl border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 card-hover" style={{ borderRadius: "20px" }}>
            <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Lịch sử khám bệnh</h4>
            <div className="relative pl-5 space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 rounded-full">
              {[
                { d: "22/04/2026", t: "Khám tổng quát sức khỏe", n: "Sức khỏe lâm sàng hoàn toàn ổn định", doc: "BS. Trần Thị Bé" },
                { d: "10/02/2026", t: "Điều trị viêm họng cấp", n: "Điều trị bằng thuốc kháng sinh, bệnh nhân hồi phục", doc: "BS. Lê Hữu Lộc" },
                { d: "15/11/2025", t: "Tầm soát tim mạch", n: "Theo dõi nhịp tim và huyết áp định kỳ tại nhà", doc: "BS. Nguyễn Văn An" },
              ].map((e, i) => (
                <div key={i} className="relative animate-fade-in group">
                  <div className="absolute -left-[1.35rem] top-1.5 w-2.5 h-2.5 rounded-full bg-teal-400 ring-4 ring-teal-50 group-hover:scale-125 transition-transform" />
                  <div className="text-[10px] text-teal-600 font-black tracking-wide uppercase">{e.d}</div>
                  <div className="text-sm font-bold text-slate-800 mt-1 leading-snug">{e.t}</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{e.n}</div>
                  <div className="text-[10px] font-semibold text-slate-400 mt-1.5 flex items-center gap-1"><Activity className="w-3 h-3" /> {e.doc}</div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-5 rounded-xl text-xs font-semibold border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => window.location.href="/patient/records"}>Xem toàn bộ lịch sử</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
