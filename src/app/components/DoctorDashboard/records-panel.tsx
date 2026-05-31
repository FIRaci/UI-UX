import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { FileText, Plus, Search, FileSymlink, Send, FileClock } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../ui/input";

type RecordItem = { p: string; d: string; t: string; m: string };

type Props = {
  records: RecordItem[];
  setRecordView: (v: RecordItem | null) => void;
  setNewRecord: (v: boolean) => void;
  searchQuery?: string;
};

function RecordList({ records, setRecordView }: { records: RecordItem[]; setRecordView: (v: RecordItem | null) => void }) {
  if (records.length === 0) {
    return (
      <div className="py-16 text-center bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200 mt-4">
        <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <FileClock className="w-6 h-6 text-slate-300" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 mb-1">Chưa có dữ liệu</h3>
        <p className="text-xs font-medium text-slate-500">Danh sách hồ sơ hoặc đơn thuốc trống.</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-3 mt-4">
      {records.map((r, i) => {
        const isPrescription = r.t.includes("Đơn thuốc");
        return (
          <div key={i} className="group p-5 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:shadow-md hover:border-violet-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isPrescription ? "bg-emerald-50 text-emerald-600" : "bg-violet-50 text-violet-600"}`}>
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge 
                    className={`shrink-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border-0 ${
                      isPrescription ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"
                    }`}
                  >
                    {isPrescription ? "Đơn thuốc" : "Hồ sơ"}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400">{r.d}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm truncate">{r.p}</h4>
                <p className="text-xs font-medium text-slate-500 mt-1 truncate max-w-lg">{r.m}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 sm:self-center ml-16 sm:ml-0">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-9 px-4 rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setRecordView(r)}
              >
                <Search className="w-3.5 h-3.5 mr-1.5" /> Xem chi tiết
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-9 px-4 rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => toast.info("Đang gửi qua Zalo/Email cho bệnh nhân...")}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" /> Gửi
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RecordsPanel({ records, setRecordView, setNewRecord, searchQuery = "" }: Props) {
  const filteredRecords = records.filter(r => 
    r.p.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.m.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Card className="p-0 overflow-hidden bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] animate-fade-in">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
                <FileSymlink className="w-4 h-4" />
              </div>
              Hồ sơ & Đơn thuốc
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1.5 ml-10">Quản lý và tra cứu bệnh án y khoa, đơn thuốc điện tử.</p>
          </div>
          <Button 
            onClick={() => setNewRecord(true)} 
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-6 shadow-md shadow-violet-600/20 font-bold ml-10 md:ml-0"
          >
            <Plus className="w-5 h-5 mr-1.5" /> Tạo hồ sơ mới
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="h-12 p-1 bg-slate-100 rounded-2xl inline-flex w-full sm:w-auto">
            <TabsTrigger value="all" className="rounded-xl px-6 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm">
              Tất cả ({filteredRecords.length})
            </TabsTrigger>
            <TabsTrigger value="prescription" className="rounded-xl px-6 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
              Đơn thuốc ({filteredRecords.filter(r => r.t.includes("Đơn thuốc")).length})
            </TabsTrigger>
            <TabsTrigger value="record" className="rounded-xl px-6 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm">
              Hồ sơ khám ({filteredRecords.filter(r => r.t.includes("Hồ sơ")).length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="focus-visible:outline-none">
            <RecordList records={filteredRecords} setRecordView={setRecordView} />
          </TabsContent>
          <TabsContent value="prescription" className="focus-visible:outline-none">
            <RecordList records={filteredRecords.filter(r => r.t.includes("Đơn thuốc"))} setRecordView={setRecordView} />
          </TabsContent>
          <TabsContent value="record" className="focus-visible:outline-none">
            <RecordList records={filteredRecords.filter(r => r.t.includes("Hồ sơ"))} setRecordView={setRecordView} />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
