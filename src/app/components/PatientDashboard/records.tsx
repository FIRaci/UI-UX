import { useEffect, useState, useRef, useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { ME } from "./constants";
import { toast } from "sonner";
import { FileText, Download, Activity, Heart, Thermometer, User, Hash, Stethoscope, Droplet, HeartPulse, Pill, RefreshCw } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function Records() {
  const [tab, setTab] = useState("benhan");
  const [openItem, setOpenItem] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/records`, { headers });
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.dispatchEvent(new CustomEvent("app:unauthorized"));
        return;
      }
      if (res.ok) {
        const data = await res.json();
        let filtered = data.filter((r: any) => r.patientName === ME);
        if (!filtered.some((r: any) => r.type === "donthuoc")) {
          filtered.push({
            id: "mock_donthuoc_1",
            patientName: ME,
            title: "Đơn thuốc Điều trị Cảm cúm",
            date: "2026-05-29",
            doctor: "BS. Nguyễn Văn An",
            note: "Nhiễm siêu vi nhẹ. Uống thuốc theo toa và tái khám nếu sốt cao.",
            type: "donthuoc"
          });
        }
        filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(filtered);
      }
    } catch (e) {
      console.error("Error loading records:", e);
      setError("Không thể tải dữ liệu hồ sơ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const items: any = {
    benhan: records.filter(r => r.type === "benhan"),
    ketqua: records.filter(r => r.type === "ketqua"),
    donthuoc: records.filter(r => r.type === "donthuoc"),
  };

  return (
    <Card className="p-0 overflow-hidden bg-transparent/60 backdrop-blur-2xl border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-emerald-500/10 animate-fade-in" style={{ borderRadius: "20px" }}>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="border-b border-slate-100 px-5 pt-4 bg-transparent">
          <TabsList className="bg-transparent/40 backdrop-blur-md rounded-xl p-1 h-10 border border-slate-200/50">
            <TabsTrigger value="benhan" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-transparent data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Bệnh án</TabsTrigger>
            <TabsTrigger value="ketqua" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-transparent data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Kết quả xét nghiệm</TabsTrigger>
            <TabsTrigger value="donthuoc" className="rounded-lg text-xs font-bold px-4 py-1.5 data-[state=active]:bg-transparent data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">Đơn thuốc</TabsTrigger>
          </TabsList>
        </div>
        {(["benhan", "ketqua", "donthuoc"] as const).map(k => (
          <TabsContent key={k} value={k} className="p-5 space-y-3.5 m-0 bg-transparent backdrop-blur-xl">
            {loading ? (
              <>
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 border border-slate-100 rounded-xl flex items-start gap-4" style={{ borderRadius: "16px" }}>
                    <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-3/5" />
                      <Skeleton className="h-3 w-2/5" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-50 text-red-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="text-slate-500 text-sm font-medium mb-4">{error}</div>
                <Button size="sm" className="rounded-xl" onClick={loadRecords}>
                  <RefreshCw className="w-4 h-4 mr-1.5" /> Thử lại
                </Button>
              </div>
            ) : (
              items[k].map((it: any) => (
                <div key={it.id} className="p-4.5 border border-slate-100 rounded-xl flex justify-between items-start hover:shadow-md transition-all bg-white/40 hover:bg-white/80 cursor-pointer group" style={{ borderRadius: "16px" }} onClick={() => setOpenItem(it)}>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100 group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">{it.title}</div>
                      <div className="text-xs text-slate-400 mt-1 font-semibold">{it.date} • {it.doctor}</div>
                      <div className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50/80 px-3 py-2 rounded-lg font-medium border border-slate-100/50">{it.note}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs px-3 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 shrink-0 ml-3 active:scale-95 transition-all">Chi tiết</Button>
                </div>
              ))
            )}
            {!loading && !error && items[k].length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="text-slate-500 text-sm font-medium">Chưa có dữ liệu {k === "benhan" ? "bệnh án" : k === "ketqua" ? "xét nghiệm" : "đơn thuốc"}</div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Medical Report Dialog */}
      <Dialog open={!!openItem} onOpenChange={() => { if (!isDownloading) setOpenItem(null); }}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl animate-scale-in p-0 bg-slate-50 border-none shadow-2xl" onPointerDownOutside={(e) => { if (isDownloading) e.preventDefault(); }}>
          {openItem && (
              <div className="flex flex-col max-h-[85vh] overflow-hidden">
                <DialogTitle className="sr-only">Phiếu khám bệnh - {openItem.title}</DialogTitle>
                <DialogDescription className="sr-only">Chi tiết phiếu khám bệnh của {ME}</DialogDescription>
                <div ref={pdfRef} className="flex flex-col flex-1 min-h-0">
                {/* Hospital Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
                <HeartPulse className="w-24 h-24 text-white/10 absolute -right-4 -bottom-4 transform rotate-12" />
                <h3 className="font-black text-xl tracking-tight uppercase relative z-10 drop-shadow-md">Phòng khám Đa khoa MediCare</h3>
                <p className="text-[11px] font-medium text-emerald-100 mt-1.5 relative z-10 tracking-wide">123 Đường Y Tế, Quận 1, TP.HCM • Hotline: 1900 1234</p>
              </div>

              <div className="flex-1 p-6 overflow-y-auto min-h-0">
                {/* Patient Info */}
                <div className="flex items-start justify-between mb-6 pb-5 border-b border-slate-200 border-dashed">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md inline-block mb-3">{openItem.title}</h4>
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="flex items-center gap-2 text-xs text-slate-600 font-bold"><User className="w-4 h-4 text-emerald-500" /> Bệnh nhân: <span className="text-slate-800">{ME}</span></span>
                      <span className="flex items-center gap-2 text-xs text-slate-600 font-bold"><Hash className="w-4 h-4 text-emerald-500" /> Mã số: <span className="text-slate-800">BN-2024-00123</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Ngày khám</span>
                    <span className="block text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{openItem.date}</span>
                    <span className="block text-[10px] text-slate-500 font-bold mt-2">09:30 AM</span>
                  </div>
                </div>

                {/* Vitals */}
                {openItem.type !== "donthuoc" && (
                  <div className="mb-6">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Chỉ số sinh tồn</h5>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                        <Activity className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Huyết áp</div>
                        <div className="text-sm font-black text-slate-800 mt-0.5">120/80</div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                        <Heart className="w-5 h-5 text-red-500 mx-auto mb-1.5 animate-pulse" />
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Nhịp tim</div>
                        <div className="text-sm font-black text-slate-800 mt-0.5">75 bpm</div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                        <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Nhiệt độ</div>
                        <div className="text-sm font-black text-slate-800 mt-0.5">36.8°C</div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                        <Droplet className="w-5 h-5 text-cyan-500 mx-auto mb-1.5" />
                        <div className="text-[10px] text-slate-500 font-bold uppercase">SpO2</div>
                        <div className="text-sm font-black text-slate-800 mt-0.5">98%</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Diagnostic Section */}
                <div className="space-y-4">
                  {openItem.type === "benhan" && (
                    <section className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>
                      <div className="flex items-center gap-2 mb-2">
                        <Stethoscope className="w-4 h-4 text-amber-500" />
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Triệu chứng lâm sàng</h5>
                      </div>
                      <p className="text-sm text-slate-600 font-medium pl-6 leading-relaxed">Người bệnh có biểu hiện mệt mỏi, đi kèm các triệu chứng liên quan. Cần theo dõi thêm diễn biến trong 3 ngày tới.</p>
                    </section>
                  )}

                  <section className={`p-4 rounded-2xl ${openItem.type === "ketqua" ? "bg-amber-50/50 border-amber-100" : "bg-blue-50/50 border-blue-100"} relative overflow-hidden`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${openItem.type === "ketqua" ? "bg-amber-500" : "bg-blue-500"}`}></div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className={`w-4 h-4 ${openItem.type === "ketqua" ? "text-amber-600" : "text-blue-600"}`} />
                      <h5 className={`text-xs font-bold uppercase tracking-widest ${openItem.type === "ketqua" ? "text-amber-900" : "text-blue-900"}`}>{openItem.type === "ketqua" ? "Kết luận Xét nghiệm" : "Chẩn đoán (Kết luận)"}</h5>
                    </div>
                    <p className={`text-sm font-bold pl-6 leading-relaxed ${openItem.type === "ketqua" ? "text-amber-800" : "text-blue-800"}`}>{openItem.note}</p>
                  </section>

                  {openItem.type === "ketqua" && (
                    <section className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-400"></div>
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Chi tiết chỉ số máu</h5>
                      </div>
                      <div className="pl-6 space-y-2">
                        <div className="flex justify-between items-center text-xs font-medium border-b border-slate-100 pb-2"><span className="text-slate-500">Hồng cầu (RBC)</span><span className="font-bold text-slate-800">4.5 T/L</span></div>
                        <div className="flex justify-between items-center text-xs font-medium border-b border-slate-100 pb-2"><span className="text-slate-500">Bạch cầu (WBC)</span><span className="font-bold text-slate-800">7.2 G/L</span></div>
                        <div className="flex justify-between items-center text-xs font-medium"><span className="text-slate-500">Men gan (AST/ALT)</span><span className="font-bold text-rose-600">85 U/L <span className="text-[9px] bg-rose-100 text-rose-600 px-1 rounded ml-1">Cao</span></span></div>
                      </div>
                    </section>
                  )}

                  {(openItem.type === "donthuoc" || openItem.type === "benhan") && (
                    <section className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                      <div className="flex items-center gap-2 mb-2">
                        {openItem.type === "donthuoc" ? <Pill className="w-4 h-4 text-emerald-600" /> : <Activity className="w-4 h-4 text-emerald-600" />}
                        <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-widest">{openItem.type === "donthuoc" ? "Đơn thuốc được kê" : "Hướng dẫn chăm sóc"}</h5>
                      </div>
                      {openItem.type === "donthuoc" ? (
                        <div className="pl-6 space-y-3 mt-3">
                          <div className="bg-white p-3 rounded-xl border border-emerald-100/50 flex justify-between items-center shadow-sm">
                            <div><div className="text-sm font-bold text-slate-800">Paracetamol 500mg</div><div className="text-xs text-slate-500 mt-0.5">Ngày 2 lần, mỗi lần 1 viên sau ăn</div></div>
                            <div className="text-xs font-black text-emerald-600 bg-emerald-100/50 px-3 py-1.5 rounded-lg border border-emerald-200">10 Viên</div>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-emerald-100/50 flex justify-between items-center shadow-sm">
                            <div><div className="text-sm font-bold text-slate-800">Vitamin C 1000mg</div><div className="text-xs text-slate-500 mt-0.5">Sáng 1 viên sủi hòa tan nước</div></div>
                            <div className="text-xs font-black text-emerald-600 bg-emerald-100/50 px-3 py-1.5 rounded-lg border border-emerald-200">1 Tuýp</div>
                          </div>
                        </div>
                      ) : (
                        <ul className="text-xs font-semibold text-emerald-800 pl-6 space-y-1.5 list-disc list-outside ml-2 mt-2">
                          <li>Dùng thuốc đúng liều lượng chỉ định, không tự ý tăng/giảm liều.</li>
                          <li>Duy trì uống đủ 2 - 2.5 lít nước mỗi ngày, nghỉ ngơi khoa học.</li>
                          <li>Tái khám đúng hẹn hoặc liên hệ hotline phòng khám ngay khi triệu chứng trở nặng.</li>
                        </ul>
                      )}
                    </section>
                  )}
                </div>

                {/* Signature */}
                <div className="mt-10 pt-6 border-t border-slate-200 border-dashed flex justify-end">
                  <div className="text-center">
                    <p className="text-[11px] text-slate-500 font-bold mb-2 uppercase tracking-widest">TP.HCM, {openItem.date}</p>
                    <p className="text-xs font-bold text-slate-800 mb-6">Bác sĩ chuyên khoa</p>
                    {/* Signature mock */}
                    <div className="font-serif italic text-4xl text-slate-700 opacity-80 mb-3 transform -rotate-6 select-none">{openItem.doctor.split(' ').pop()}</div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">{openItem.doctor}</p>
                  </div>
                </div>
              </div>
              </div>
              
              {/* Footer Actions */}
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                <Button variant="ghost" className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl px-6" onClick={() => { if (!isDownloading) setOpenItem(null); }}>Đóng</Button>
                <Button disabled={isDownloading} className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 px-6 h-10 disabled:opacity-60" onClick={async () => {
                  if (!pdfRef.current) return;
                  setIsDownloading(true);
                  try {
                    const scrollEl = pdfRef.current.querySelector('.overflow-y-auto') as HTMLElement | null;
                    const parentEl = pdfRef.current.parentElement as HTMLElement | null;
                    if (scrollEl) {
                      scrollEl.style.overflow = 'visible';
                      scrollEl.style.maxHeight = 'none';
                      scrollEl.style.flex = 'none';
                    }
                    if (parentEl) {
                      parentEl.style.maxHeight = 'none';
                      parentEl.style.overflow = 'visible';
                    }
                    await new Promise(r => setTimeout(r, 150));
                    const canvas = await html2canvas(pdfRef.current, {
                      scale: 2,
                      useCORS: true,
                      allowTaint: false,
                      logging: false,
                      backgroundColor: '#ffffff',
                    });
                    if (scrollEl) {
                      scrollEl.style.overflow = '';
                      scrollEl.style.maxHeight = '';
                      scrollEl.style.flex = '';
                    }
                    if (parentEl) {
                      parentEl.style.maxHeight = '';
                      parentEl.style.overflow = '';
                    }
                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF("p", "mm", "a4");
                    const pdfWidth = 190;
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    const pageHeight = 297;
                    const margin = 10;
                    let position = margin;
                    let remaining = pdfHeight;
                    let page = 1;

                    while (remaining > 0) {
                      if (page > 1) pdf.addPage();
                      const usable = pageHeight - margin * 2;
                      pdf.addImage(imgData, "PNG", margin, position, pdfWidth, pdfHeight);
                      position -= usable;
                      remaining -= usable;
                      page++;
                    }

                    const filename = `Phieu_Kham_${openItem.title.replace(/[/\\?%*:|"<>]/g, "_")}.pdf`;
                    pdf.save(filename);
                    toast.success("Tải PDF thành công");
                  } catch (e) {
                    console.error("PDF error:", e);
                    toast.error("Lỗi tạo PDF, vui lòng thử lại");
                  } finally {
                    setIsDownloading(false);
                  }
                }}>
                  {isDownloading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isDownloading ? "Đang tạo PDF..." : "Tải Phiếu Khám (PDF)"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
