import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { RevenueAreaChart } from "./AdminDashboardCharts";
import { Landmark, Stethoscope, UserPlus, UsersRound } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";

const STATS = [
  {
    label: "Doanh thu tháng", value: "380M", trend: "+12.4%",
    icon: Landmark, bg: "bg-emerald-50",
    iconColor: "text-emerald-600", trendColor: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Lượt khám tuần", value: "945", trend: "+8.2%",
    icon: Stethoscope, bg: "bg-blue-50",
    iconColor: "text-blue-600", trendColor: "text-blue-600 bg-blue-50",
  },
  {
    label: "Bệnh nhân mới", value: "12,840", trend: "+15.3%",
    icon: UserPlus, bg: "bg-violet-50",
    iconColor: "text-violet-600", trendColor: "text-violet-600 bg-violet-50",
  },
  {
    label: "Đội ngũ Bác sĩ", value: "32", trend: "+4.1%",
    icon: UsersRound, bg: "bg-amber-50",
    iconColor: "text-amber-600", trendColor: "text-amber-600 bg-amber-50",
  },
];

const REVENUE = [
  { m: "T1", v: 230 }, { m: "T2", v: 280 }, { m: "T3", v: 310 },
  { m: "T4", v: 340 }, { m: "T5", v: 290 }, { m: "T6", v: 380 },
];

const SPECS = [
  { name: "Tim mạch", value: 35, color: "#2563EB" },
  { name: "Da liễu", value: 20, color: "#10B981" },
  { name: "Nhi", value: 18, color: "#F59E0B" },
  { name: "TMH", value: 15, color: "#8B5CF6" },
  { name: "Khác", value: 12, color: "#F43F5E" },
];

const RECENT = [
  { time: "09:00", doctor: "BS. Nguyễn Văn An", spec: "Tim mạch", patient: "Trần Văn Minh", status: "Đang khám" },
  { time: "09:30", doctor: "BS. Trần Thị Bình", spec: "Da liễu", patient: "Lê Thị Hoa", status: "Chờ" },
  { time: "10:00", doctor: "BS. Lê Hoàng Cường", spec: "Nhi khoa", patient: "Nguyễn Minh Anh", status: "Sắp tới" },
  { time: "10:30", doctor: "BS. Phạm Thị Lan", spec: "TMH", patient: "Hoàng Văn Tùng", status: "Sắp tới" },
  { time: "11:00", doctor: "BS. Nguyễn Văn An", spec: "Tim mạch", patient: "Phạm Thị Ngọc", status: "Sắp tới" },
];

const STATUS_STYLES: Record<string, string> = {
  "Đang khám": "bg-blue-100 text-blue-700 border-blue-200",
  "Chờ": "bg-amber-100 text-amber-700 border-amber-200",
  "Sắp tới": "bg-slate-100 text-slate-600 border-slate-200",
};

export function AdminDashboardOverview() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="p-4 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "16px" }}>
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <Badge variant="outline" className={`text-[10px] font-bold border-0 ${s.trendColor}`}>
                  {s.trend}
                </Badge>
              </div>
              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-400 tracking-wide">{s.label}</div>
                <div className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1">{s.value}</div>
              </div>
              <div className="mt-1.5 text-[10px] text-slate-400 font-medium">so với tháng trước</div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "20px" }}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-800 text-sm tracking-tight">Biểu đồ doanh thu 6 tháng qua</h4>
            <Badge variant="secondary" className="text-[10px] font-medium">triệu VNĐ</Badge>
          </div>
          <div className="h-64">
            <RevenueAreaChart data={REVENUE} />
          </div>
        </Card>

        <Card className="p-5 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "20px" }}>
          <h4 className="font-semibold text-slate-800 text-sm tracking-tight mb-4">Cơ cấu bệnh nhân theo chuyên khoa</h4>
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SPECS} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={3} stroke="white" strokeWidth={2}>
                    {SPECS.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2">
              {SPECS.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="flex-1 text-slate-600 font-medium">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color }} />
                    </div>
                    <span className="text-slate-800 font-bold tabular-nums w-8 text-right">{s.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "20px" }}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800 text-sm tracking-tight">Lịch khám hôm nay</h4>
          <Badge variant="outline" className="text-[10px] font-medium text-blue-600 border-blue-200 bg-blue-50">5 lịch hẹn</Badge>
        </div>
        <div className="space-y-2">
          {RECENT.map((r, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-sm font-bold text-slate-700 tabular-nums w-12 text-center">{r.time}</div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{r.doctor}</div>
                <div className="text-xs text-slate-400">{r.spec} — {r.patient}</div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLES[r.status] || ""}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
