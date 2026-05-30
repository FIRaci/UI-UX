import { Card } from "../ui/card";
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { BarChartSimple } from "./chart-components";
import { REVENUE, SPECS, COLORS } from "./types";

export function Overview() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { l: "Doanh thu tháng", v: "380M", c: "text-emerald-600 bg-emerald-50/50 border-emerald-100/50" },
          { l: "Lượt khám tuần", v: "945", c: "text-sky-600 bg-sky-50/50 border-sky-100/50" },
          { l: "Bệnh nhân mới", v: "12,840", c: "text-violet-600 bg-violet-50/50 border-violet-100/50" },
          { l: "Đội ngũ Bác sĩ", v: "32", c: "text-amber-600 bg-amber-50/50 border-amber-100/50" },
        ].map((s, i) => (
          <Card key={i} className="p-5 bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-slide-up group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300" style={{ borderRadius: "24px", animationDelay: `${0.05 + i * 0.05}s` }}>
            <div className="flex justify-between items-start mb-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.l}</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.c.split(" ")[1]} bg-opacity-50`}>
                <div className={`w-2 h-2 rounded-full ${s.c.split(" ")[0].replace("text-", "bg-")}`}></div>
              </div>
            </div>
            <div className={`text-4xl font-black tracking-tight ${s.c.split(" ")[0]} mb-2 group-hover:scale-105 transition-transform origin-left`}>{s.v}</div>
            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
              <span className={`inline-flex px-2 py-0.5 rounded-md font-bold ${s.c.split(" ").slice(1).join(" ")} border`}>+12.4%</span> 
              <span>so với tháng trước</span>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <Card className="p-6 lg:col-span-2 bg-white/90 backdrop-blur-xl border border-white shadow-[0_10px_40px_rgb(0,0,0,0.05)] transition-all duration-300" style={{ borderRadius: "28px" }}>
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-extrabold text-slate-800 text-base tracking-tight">Biểu đồ doanh thu 6 tháng qua (triệu VNĐ)</h4>
            <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">2026</div>
          </div>
          <div className="h-72">
            <BarChartSimple data={REVENUE} labelKey="m" />
          </div>
        </Card>
        <Card className="p-6 bg-white/90 backdrop-blur-xl border border-white shadow-[0_10px_40px_rgb(0,0,0,0.05)] transition-all duration-300" style={{ borderRadius: "28px" }}>
          <h4 className="font-extrabold text-slate-800 text-base tracking-tight mb-6">Cơ cấu bệnh nhân theo chuyên khoa</h4>
          <div className="h-72 flex flex-col justify-center gap-4">
            <div className="w-full h-44 flex justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                 <div className="text-2xl font-black text-slate-800">100%</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng quan</div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SPECS} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4} stroke="white" strokeWidth={3} cornerRadius={4}>
                    {SPECS.map((entry, i) => <Cell key={`cell-${entry.name}`} fill={COLORS[i]} className="hover:opacity-80 transition-opacity cursor-pointer" />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontWeight: "bold" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {(() => {
                const total = SPECS.reduce((s, x) => s + x.value, 0);
                return SPECS.map((s, i) => (
                  <li key={s.name} className="flex items-center gap-3 text-sm font-semibold text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: COLORS[i] }} />
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="tabular-nums text-slate-800 font-black">{Math.round((s.value / total) * 100)}%</span>
                  </li>
                ));
              })()}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
