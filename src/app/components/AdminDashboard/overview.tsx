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
          <Card key={i} className="p-4 bg-white border border-slate-100 shadow-sm animate-slide-up card-hover" style={{ borderRadius: "16px", animationDelay: `${0.05 + i * 0.05}s` }}>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.l}</div>
            <div className={`mt-2.5 text-3xl font-extrabold tracking-tight ${s.c.split(" ")[0]}`}>{s.v}</div>
            <div className="mt-2 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <span className={`inline-flex px-1.5 py-0.5 rounded font-bold ${s.c.split(" ").slice(1).join(" ")} border`}>+12.4%</span> so với tháng trước
            </div>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2 bg-white border border-slate-100 shadow-sm card-hover" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Biểu đồ doanh thu 6 tháng qua (triệu VNĐ)</h4>
          <div className="h-72">
            <BarChartSimple data={REVENUE} labelKey="m" />
          </div>
        </Card>
        <Card className="p-5 bg-white border border-slate-100 shadow-sm card-hover" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Cơ cấu bệnh nhân theo chuyên khoa</h4>
          <div className="h-72 flex flex-col justify-center gap-4">
            <div className="w-full h-40 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SPECS} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={3} stroke="white" strokeWidth={2}>
                    {SPECS.map((entry, i) => <Cell key={`cell-${entry.name}`} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid grid-cols-2 gap-2 mt-2">
              {(() => {
                const total = SPECS.reduce((s, x) => s + x.value, 0);
                return SPECS.map((s, i) => (
                  <li key={s.name} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="tabular-nums text-slate-800 font-bold">{Math.round((s.value / total) * 100)}%</span>
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
