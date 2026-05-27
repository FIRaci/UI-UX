import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { FileText } from "lucide-react";
import { toast } from "sonner";

type RecordItem = { p: string; d: string; t: string; m: string };

type Props = {
  records: RecordItem[];
  setRecordView: (v: RecordItem | null) => void;
  setNewRecord: (v: boolean) => void;
};

function RecordList({ records, setRecordView }: { records: RecordItem[]; setRecordView: (v: RecordItem | null) => void }) {
  if (records.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">Chưa có hồ sơ hoặc đơn thuốc.</div>;
  }
  return records.map((r, i) => (
    <div key={i} className="p-3 border rounded-xl flex justify-between items-start hover:bg-slate-50 transition">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant={r.t.includes("Đơn thuốc") ? "default" : "secondary"} className="shrink-0">{r.t.includes("Đơn thuốc") ? "Đơn thuốc" : "Hồ sơ"}</Badge>
          <span className="font-medium truncate">{r.p}</span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">{r.d}</div>
        <div className="text-sm mt-1">{r.m}</div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Button size="sm" variant="outline" onClick={() => setRecordView(r)}>Xem</Button>
        <Button size="sm" variant="outline" onClick={() => toast.info("Tính năng gửi đang phát triển")}>Gửi</Button>
      </div>
    </div>
  ));
}

export function RecordsPanel({ records, setRecordView, setNewRecord }: Props) {
  return (
    <Card className="p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="tracking-tight">Hồ sơ và đơn thuốc</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Quản lý đơn thuốc và hồ sơ khám bệnh</p>
        </div>
        <Button onClick={() => setNewRecord(true)} className="bg-violet-600 hover:bg-violet-700">
          <FileText className="w-4 h-4 mr-1" /> Tạo mới
        </Button>
      </div>
      <Tabs defaultValue="all" className="mb-3">
        <TabsList>
          <TabsTrigger value="all">Tất cả ({records.length})</TabsTrigger>
          <TabsTrigger value="prescription">Đơn thuốc ({records.filter(r => r.t.includes("Đơn thuốc")).length})</TabsTrigger>
          <TabsTrigger value="record">Hồ sơ khám ({records.filter(r => r.t.includes("Hồ sơ")).length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-2 mt-3">
          <RecordList records={records} setRecordView={setRecordView} />
        </TabsContent>
        <TabsContent value="prescription" className="space-y-2 mt-3">
          {records.filter(r => r.t.includes("Đơn thuốc")).length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Chưa có đơn thuốc.</div>
          ) : (
            <RecordList records={records.filter(r => r.t.includes("Đơn thuốc"))} setRecordView={setRecordView} />
          )}
        </TabsContent>
        <TabsContent value="record" className="space-y-2 mt-3">
          {records.filter(r => r.t.includes("Hồ sơ")).length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Chưa có hồ sơ khám.</div>
          ) : (
            <RecordList records={records.filter(r => r.t.includes("Hồ sơ"))} setRecordView={setRecordView} />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
