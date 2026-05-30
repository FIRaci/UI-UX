import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ReportsLineChart, VisitsBarChart } from "./AdminDashboardCharts";
import { FileDown, BarChart3, TrendingUp, Users, Activity } from "lucide-react";
import { toast } from "sonner";

const REVENUE_REPORT = [
  { m: "T1", v: 230, label: "Tháng 1" },
  { m: "T2", v: 280, label: "Tháng 2" },
  { m: "T3", v: 310, label: "Tháng 3" },
  { m: "T4", v: 340, label: "Tháng 4" },
  { m: "T5", v: 290, label: "Tháng 5" },
  { m: "T6", v: 380, label: "Tháng 6" },
];

const VISITS_REPORT = [
  { d: "T2", v: 120 }, { d: "T3", v: 145 }, { d: "T4", v: 132 },
  { d: "T5", v: 168 }, { d: "T6", v: 190 }, { d: "T7", v: 110 }, { d: "CN", v: 80 },
];

const METRICS = [
  { label: "Doanh thu", value: "380.000.000đ", change: "+12%", icon: TrendingUp, color: "text-emerald-600" },
  { label: "Lượt khám", value: "945", change: "+8%", icon: Activity, color: "text-blue-600" },
  { label: "Bệnh nhân mới", value: "128", change: "+15%", icon: Users, color: "text-violet-600" },
  { label: "Tỷ lệ tái khám", value: "62%", change: "+3%", icon: BarChart3, color: "text-amber-600" },
];

export function AdminDashboardReports() {
  const [type, setType] = useState("revenue");
  const [range, setRange] = useState("month");
  const [hasData, setHasData] = useState(true);

  return (
    <div className="space-y-4">
      <Card className="p-4 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "16px" }}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 tracking-wide">Loại báo cáo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Doanh thu</SelectItem>
                <SelectItem value="visits">Lượt khám</SelectItem>
                <SelectItem value="doctors">Theo bác sĩ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 tracking-wide">Thời gian</Label>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
                <SelectItem value="quarter">Quý này</SelectItem>
                <SelectItem value="year">Năm nay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${hasData ? "bg-emerald-500" : "bg-slate-300"}`} />
            {hasData ? "Đã đồng bộ" : "Chưa có dữ liệu"}
          </div>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => toast.success("Xuất PDF thành công")}>
            <FileDown className="w-3.5 h-3.5 mr-1" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => toast.success("Xuất Excel thành công")}>
            <FileDown className="w-3.5 h-3.5 mr-1" /> Excel
          </Button>
          <Button variant="ghost" size="sm" className="h-9 text-xs text-slate-400" onClick={() => setHasData(v => !v)}>
            {hasData ? "Mô phỏng: Tắt" : "Mô phỏng: Bật"}
          </Button>
        </div>
      </Card>

      {!hasData ? (
        <Card className="p-16 text-center border border-slate-100 shadow-sm" style={{ borderRadius: "20px" }}>
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-slate-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">Không có dữ liệu cho bộ lọc đã chọn</p>
          <p className="text-xs text-slate-400 mt-1">Hãy thử chọn khoảng thời gian hoặc loại báo cáo khác</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {METRICS.map((m, i) => {
              const Icon = m.icon;
              return (
                <Card key={i} className="p-3.5 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "12px" }}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${m.color}`} />
                    <span className="text-[10px] font-semibold text-slate-400 tracking-wide">{m.label}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-slate-800">{m.value}</span>
                    <Badge variant="outline" className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border-0 px-1.5">{m.change}</Badge>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "20px" }}>
              <h4 className="text-sm font-semibold text-slate-800 tracking-tight mb-4">
                {type === "revenue" ? "Doanh thu" : type === "visits" ? "Lượt khám" : "Theo bác sĩ"}
              </h4>
              <div className="h-72">
                {type === "visits" ? (
                  <VisitsBarChart data={VISITS_REPORT} />
                ) : (
                  <ReportsLineChart data={REVENUE_REPORT} labelKey={type === "doctors" ? "m" : "m"} />
                )}
              </div>
            </Card>

            <Card className="p-5 border border-slate-100 shadow-sm bg-white" style={{ borderRadius: "20px" }}>
              <h4 className="text-sm font-semibold text-slate-800 tracking-tight mb-4">Bảng thống kê</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-slate-500">Mục</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">Giá trị</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 text-right">Thay đổi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Doanh thu", "380.000.000đ", "+12%"],
                    ["Lượt khám", "945", "+8%"],
                    ["Bệnh nhân mới", "128", "+15%"],
                    ["Tỷ lệ tái khám", "62%", "+3%"],
                  ].map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium text-slate-700">{r[0]}</TableCell>
                      <TableCell className="text-sm text-slate-600">{r[1]}</TableCell>
                      <TableCell className="text-sm text-emerald-600 font-semibold text-right">{r[2]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
