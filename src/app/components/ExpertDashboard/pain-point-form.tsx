import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Bug, Loader2 } from "lucide-react";

interface PainPoint {
  id: number;
  category: string;
  description: string;
  evaluation: string;
  createdAt: string;
}

const CATEGORIES = [
  "Bệnh nhân - Khó đặt lịch",
  "Bác sĩ - Mất thời gian tìm hồ sơ",
  "Quản lý - Biểu đồ khó hiểu",
  "Tư vấn - Khó điều hướng chat",
];

const CATEGORY_BORDER: Record<string, string> = {
  "Quản lý": "border-l-rose-500",
  "Bệnh nhân": "border-l-amber-500",
  "Bác sĩ": "border-l-blue-500",
  "Tư vấn": "border-l-violet-500",
};

function getBorderColor(category: string): string {
  for (const [key, cls] of Object.entries(CATEGORY_BORDER)) {
    if (category.includes(key)) return cls;
  }
  return "border-l-slate-500";
}

export function PainPointForm() {
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [evaluation, setEvaluation] = useState("");

  const loadPainPoints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:3000/api/painpoints", { headers });
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.dispatchEvent(new CustomEvent("app:unauthorized"));
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPainPoints(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPainPoints();
  }, []);

  const handleSave = async () => {
    if (!description.trim()) {
      toast.error("Vui lòng mô tả lỗi hoặc khó khăn!");
      return;
    }
    if (!evaluation.trim()) {
      toast.error("Vui lòng ghi nhận đề xuất cải thiện!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:3000/api/painpoints", {
        method: "POST",
        headers,
        body: JSON.stringify({ description, category, evaluation }),
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.dispatchEvent(new CustomEvent("app:unauthorized"));
        return;
      }
      if (res.ok) {
        toast.success("Đã ghi nhận Pain Point!");
        setDescription("");
        setEvaluation("");
        loadPainPoints();
      } else {
        toast.error("Lỗi khi ghi nhận Pain Point");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối server");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Ghi nhận Pain Points</h2>
        <p className="text-sm text-muted-foreground">Theo dõi và phân tích các điểm khó khăn của người dùng thực tế.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 shadow-sm border-slate-200 hover:shadow-md transition-all hover:-translate-y-1 card-hover">
          <h3 className="font-semibold flex items-center gap-2"><Bug className="w-5 h-5 text-rose-500" /> Báo cáo lỗi UI/UX mới</h3>
          <div className="space-y-3">
            <Input 
              placeholder="Mô tả lỗi hoặc khó khăn của người dùng..." 
              className="transition-shadow focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <textarea 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
              placeholder="Đề xuất cải thiện (Ví dụ: Thêm bộ lọc, làm nổi bật nút Call-to-action)..."
              value={evaluation}
              onChange={(e) => setEvaluation(e.target.value)}
            />
            <Button 
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm hover:shadow-md active:scale-95 transition-all" 
              onClick={handleSave}
            >
              Lưu báo cáo
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700">Pain Points gần đây</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {painPoints.map((pp) => (
              <Card key={pp.id} className={`p-4 border-l-4 ${getBorderColor(pp.category)} shadow-sm hover:shadow-md transition-all hover:-translate-x-1 cursor-default card-hover`}>
                <div className="font-semibold text-[10px] text-indigo-600 mb-0.5">{pp.category}</div>
                <div className="font-medium text-sm text-slate-800">{pp.description}</div>
                <div className="text-xs text-muted-foreground mt-1">Đánh giá: {pp.evaluation}</div>
                <div className="text-[10px] text-slate-400 mt-1.5">{new Date(pp.createdAt).toLocaleString("vi-VN")}</div>
              </Card>
            ))}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Đang tải...</span>
              </div>
            )}
            {!loading && painPoints.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có Pain Point nào được ghi nhận.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
