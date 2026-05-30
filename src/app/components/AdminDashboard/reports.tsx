import { useState } from "react";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FileDown, TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from "lucide-react";
import { toast } from "sonner";
import { LineChartSimple } from "./chart-components";
import { REVENUE, VISITS } from "./types";

const REPORT_TYPES = [
  { value: "revenue", label: "Doanh thu", icon: BarChart3 },
  { value: "visits", label: "Lượt khám", icon: Activity },
  { value: "doctors", label: "Theo bác sĩ", icon: PieChart },
];

const SUMMARY_STATS = [
  { label: "Doanh thu", value: "380.000.000đ", change: "+12%", trend: "up" as const, color: "emerald" },
  { label: "Lượt khám", value: "945", change: "+8%", trend: "up" as const, color: "blue" },
  { label: "Bệnh nhân mới", value: "128", change: "+15%", trend: "up" as const, color: "violet" },
  { label: "Tỷ lệ tái khám", value: "62%", change: "+3%", trend: "up" as const, color: "amber" },
];

export function Reports() {
  const [type, setType] = useState("revenue");
  const [range, setRange] = useState("month");
  const [hasData, setHasData] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Báo cáo & thống kê</h2>
          <p className="text-sm text-slate-500 mt-1">Phân tích hiệu suất hoạt động phòng khám</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={() => toast.info("Tính năng xuất PDF đang phát triển")}>
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={() => toast.info("Tính năng xuất Excel đang phát triển")}>
            <FileDown className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_STATS.map((stat, i) => (
          <Card key={i} className="p-4 bg-white border-0 shadow-sm" style={{ borderRadius: "12px" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">{stat.label}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-${stat.color}-50 text-${stat.color}-700`}>
                {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900">{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {REPORT_TYPES.map(r => {
              const Icon = r.icon;
              return (
                <Button
                  key={r.value}
                  variant={type === r.value ? "default" : "outline"}
                  size="sm"
                  className={`h-9 ${type === r.value ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  onClick={() => setType(r.value)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {r.label}
                </Button>
              );
            })}
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500"
            onClick={() => setHasData(v => !v)}
          >
            {hasData ? "Mô phỏng trống" : "Có dữ liệu"}
          </Button>
        </div>
      </Card>

      {/* Content */}
      {!hasData ? (
        <Card className="p-16 text-center bg-white border-0 shadow-sm" style={{ borderRadius: "16px" }}>
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Không có dữ liệu</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Không tìm thấy dữ liệu cho bộ lọc đã chọn. Hãy thử chọn khoảng thời gian hoặc loại báo cáo khác.
          </p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2 bg-white border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">
                {type === "revenue" ? "Doanh thu" : type === "visits" ? "Lượt khám" : "Theo bác sĩ"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">Biểu đồ xu hướng</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <LineChartSimple
                  data={type === "visits" ? VISITS : REVENUE}
                  labelKey={type === "visits" ? "d" : "m"}
                />
              </div>
            </div>
          </Card>

          {/* Summary Table */}
          <Card className="bg-white border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Tổng quan</h3>
              <p className="text-sm text-slate-500 mt-1">Thống kê chi tiết</p>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100">
                    <TableHead className="font-semibold text-slate-600 text-xs">Chỉ số</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs text-right">Giá trị</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs text-right">Thay đổi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SUMMARY_STATS.map((stat, i) => (
                    <TableRow key={i} className="border-b border-slate-50">
                      <TableCell className="font-medium text-slate-700 py-3">{stat.label}</TableCell>
                      <TableCell className="text-right font-semibold text-slate-900 py-3">{stat.value}</TableCell>
                      <TableCell className="text-right py-3">
                        <Badge
                          variant="secondary"
                          className={`bg-${stat.color}-50 text-${stat.color}-700 font-medium`}
                        >
                          {stat.change}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
