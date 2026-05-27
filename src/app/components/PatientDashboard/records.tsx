import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { ME } from "./constants";
import { toast } from "sonner";

export function Records() {
  const [tab, setTab] = useState("benhan");
  const [openItem, setOpenItem] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch("http://localhost:3000/api/records", { headers });
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.dispatchEvent(new CustomEvent("app:unauthorized"));
          return;
        }
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter((r: any) => r.patientName === ME);
          setRecords(filtered);
        }
      } catch (e) {
        console.error("Error loading records:", e);
      }
    };
    loadRecords();
  }, []);

  const items: any = {
    benhan: records.filter(r => r.type === "benhan"),
    ketqua: records.filter(r => r.type === "ketqua"),
    donthuoc: records.filter(r => r.type === "donthuoc"),
  };

  return (
    <Card className="p-0 overflow-hidden bg-white border border-slate-100 shadow-sm animate-fade-in" style={{ borderRadius: "20px" }}>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="border-b border-slate-100 px-5 pt-4 bg-slate-50/50">
          <TabsList className="bg-slate-100 rounded-xl p-1 h-10 border border-slate-200/50">
            <TabsTrigger value="benhan" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Bệnh án</TabsTrigger>
            <TabsTrigger value="ketqua" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Kết quả xét nghiệm</TabsTrigger>
            <TabsTrigger value="donthuoc" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Đơn thuốc</TabsTrigger>
          </TabsList>
        </div>
        {(["benhan", "ketqua", "donthuoc"] as const).map(k => (
          <TabsContent key={k} value={k} className="p-5 space-y-3.5 m-0 bg-white">
            {items[k].map((it: any) => (
              <div key={it.id} className="p-4.5 border border-slate-100 rounded-xl flex justify-between items-start hover:shadow-sm transition-all card-hover" style={{ borderRadius: "16px" }}>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{it.title}</div>
                  <div className="text-xs text-slate-400 mt-1 font-semibold">{it.date} • {it.doctor}</div>
                  <div className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 px-3 py-2 rounded-lg font-medium">{it.note}</div>
                </div>
                <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs px-3 border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 ml-3" onClick={() => setOpenItem(it)}>Xem chi tiết</Button>
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>
      <Dialog open={!!openItem} onOpenChange={() => setOpenItem(null)}>
        <DialogContent className="rounded-2xl animate-scale-in">
          {openItem && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle className="font-bold text-slate-800 text-lg">{openItem.title}</DialogTitle>
                <DialogDescription className="text-xs font-semibold">{openItem.date} • {openItem.doctor}</DialogDescription>
              </DialogHeader>
              <section className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Chẩn đoán từ Bác sĩ</div>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed">{openItem.note}</p>
              </section>
              <section className="space-y-1">
                <div className="text-xs font-bold text-slate-800 tracking-tight">Hướng dẫn & Lưu ý chăm sóc</div>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li className="flex items-center gap-1.5">• Dùng thuốc đúng liều lượng chỉ định, không tự ý tăng/giảm liều.</li>
                  <li className="flex items-center gap-1.5">• Duy trì uống đủ 2 - 2.5 lít nước mỗi ngày, nghỉ ngơi khoa học.</li>
                  <li className="flex items-center gap-1.5">• Tái khám đúng hẹn hoặc liên hệ hotline phòng khám ngay khi triệu chứng trở nặng.</li>
                </ul>
              </section>
              <DialogFooter className="gap-2.5">
                <Button variant="outline" className="rounded-xl text-xs h-9 border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => toast.info("Tính năng tải PDF đang phát triển")}>Tải PDF</Button>
                <Button onClick={() => setOpenItem(null)} className="rounded-xl text-xs h-9 bg-slate-900 hover:bg-slate-800">Đóng</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
