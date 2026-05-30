import { Card } from "../ui/card";
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { BarChartSimple } from "./chart-components";
import { REVENUE, SPECS, COLORS } from "./types";
import { TrendingUp, Users, Activity, Stethoscope, ArrowUpRight, ArrowDownRight } from "lucide-react";

const STATS = [
  { label: "Doanh thu tháng", value: "380M", change: "+12.4%", trend: "up" as const, icon: TrendingUp, color: "emerald" },
  { label: "Lượt khám tuần", value: "945", change: "+8.2%", trend: "up" as const, icon: Activity, color: "sky" },
  { label: "Bệnh nhân mới", value: "12,840", change: "+15.3%", trend: "up" as const, icon: Users, color: "violet" },
  { label: "Đội ngũ Bác sĩ", value: "32", change: "+2", trend: "up" as const, icon: Stethoscope, color: "amber" },
];

const WEEKLY_VISITS = [
  { day: "T2", visits: 145, appointments: 132 },
  { day: "T3", visits: 168, appointments: 155 },
  { day: "T4", visits: 152, appointments: 148 },
  { day: "T5", visits: 189, appointments: 176 },
  { day: "T6", visits: 175, appointments: 162 },
  { day: "T7", visits: 134, appointments: 128 },
  { day: "CN", visits: 82, appointments: 78 },
];

export function Overview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              className="relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group"
              style={{ borderRadius: "16px" }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-700`}>
                    {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600 opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 bg-white border-0 shadow-sm" style={{ borderRadius: "16px" }}>
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Doanh thu 6 tháng</h3>
                <p className="text-sm text-slate-500 mt-1">Tổng quan doanh thu phòng khám</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-600">Doanh thu</span>
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-72">
              <BarChartSimple data={REVENUE} labelKey="m" />
            </div>
          </div>
        </Card>

        {/* Specialty Distribution */}
        <Card className="bg-white border-0 shadow-sm" style={{ borderRadius: "16px" }}>
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Chuyên khoa</h3>
            <p className="text-sm text-slate-500 mt-1">Phân bố bệnh nhân</p>
          </div>
          <div className="p-6">
            <div className="h-48 flex justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <div className="text-2xl font-bold text-slate-900">100%</div>
                <div className="text-xs text-slate-500">Tổng quan</div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SPECS}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    stroke="white"
                    strokeWidth={3}
                    cornerRadius={4}
                  >
                    {SPECS.map((entry, i) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[i]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      fontWeight: 500,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 space-y-2">
              {(() => {
                const total = SPECS.reduce((s, x) => s + x.value, 0);
                return SPECS.map((s, i) => (
                  <li key={s.name} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                    <span className="flex-1 text-slate-600">{s.name}</span>
                    <span className="font-semibold text-slate-900">{Math.round((s.value / total) * 100)}%</span>
                  </li>
                ));
              })()}
            </ul>
          </div>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card className="bg-white border-0 shadow-sm" style={{ borderRadius: "16px" }}>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Hoạt động tuần này</h3>
              <p className="text-sm text-slate-500 mt-1">Lượt khám và lịch hẹn theo ngày</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600">Khám</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Lịch hẹn</span>
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_VISITS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisits)" />
                <Area type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAppointments)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Bệnh nhân chờ", desc: "8 bệnh nhân đang chờ khám", color: "blue", action: "Xem danh sách" },
          { title: "Lịch hôm nay", desc: "24 lịch hẹn • 3 ca trực", color: "emerald", action: "Xem lịch" },
          { title: "Thông báo mới", desc: "5 thông báo chưa đọc", color: "amber", action: "Xem ngay" },
        ].map((item, i) => (
          <Card key={i} className="p-5 bg-white border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group" style={{ borderRadius: "16px" }}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
              </div>
              <span className={`w-8 h-8 rounded-lg bg-${item.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <ArrowUpRight className={`w-4 h-4 text-${item.color}-600`} />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
