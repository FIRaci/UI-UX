import { useState } from "react";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { LineChartSimple } from "./chart-components";
import { REVENUE, VISITS } from "./types";

export function Reports() {
  const [type, setType] = useState("revenue");
  const [range, setRange] = useState("month");
  const [hasData, setHasData] = useState(true);

  return (
    <div className="space-y-4">
      <Card className="p-4 flex flex-wrap gap-3 items-end animate-fade-in">
        <div className="space-y-1.5"><Label>Loại báo cáo</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Doanh thu</SelectItem>
              <SelectItem value="visits">Lượt khám</SelectItem>
              <SelectItem value="doctors">Theo bác sĩ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Thời gian</Label>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => setHasData(v => !v)}>{hasData ? "Mô phỏng không có dữ liệu" : "Có dữ liệu"}</Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => toast.info("Tính năng xuất PDF đang phát triển")}><FileDown className="w-4 h-4 mr-1" />PDF</Button>
        <Button variant="outline" onClick={() => toast.info("Tính năng xuất Excel đang phát triển")}><FileDown className="w-4 h-4 mr-1" />Excel</Button>
      </Card>

      {!hasData ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Không có dữ liệu cho bộ lọc đã chọn.</p>
          <p className="text-sm text-muted-foreground mt-1">Hãy thử chọn khoảng thời gian khác.</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5 card-hover">
            <h4 className="tracking-tight">{type === "revenue" ? "Doanh thu" : type === "visits" ? "Lượt khám" : "Theo bác sĩ"}</h4>
            <div className="h-72 mt-3">
              <LineChartSimple
                data={type === "visits" ? VISITS : REVENUE}
                labelKey={type === "visits" ? "d" : "m"}
              />
            </div>
          </Card>
          <Card className="p-5 card-hover">
            <h4 className="tracking-tight">Bảng thống kê</h4>
            <Table className="mt-3">
              <TableHeader><TableRow><TableHead>Mục</TableHead><TableHead>Giá trị</TableHead><TableHead>Thay đổi</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ["Doanh thu", "380.000.000đ", "+12%"],
                  ["Lượt khám", "945", "+8%"],
                  ["Bệnh nhân mới", "128", "+15%"],
                  ["Tỷ lệ tái khám", "62%", "+3%"],
                ].map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                    <TableCell className="text-emerald-600">{r[2]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
