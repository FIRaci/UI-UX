import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { HEURISTICS } from "./constants";

export function HeuristicView() {
  const [heuristicsScore, setHeuristicsScore] = useState<Record<number, "pass" | "fail" | "pending">>({});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Đánh giá Heuristic (Nielsen)</h2>
          <p className="text-sm text-muted-foreground">Đánh giá giao diện MediCare AI theo 10 nguyên tắc UI/UX cơ bản.</p>
        </div>
        <Button onClick={() => {
          toast.info("Tính năng xuất báo cáo đang phát triển", {
            description: `Dữ liệu đánh giá: ${Object.keys(heuristicsScore).length}/10 nguyên tắc.`,
            duration: 4000,
          });
        }}>
          Xuất Báo cáo
        </Button>
      </div>
      <Card className="p-0 overflow-hidden border-slate-200 shadow-sm card-hover">
        <div className="divide-y divide-slate-100">
          {HEURISTICS.map((h, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <span className="text-sm font-medium">{h}</span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={heuristicsScore[i] === "pass" ? "default" : "outline"}
                  className={heuristicsScore[i] === "pass" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  onClick={() => setHeuristicsScore({ ...heuristicsScore, [i]: "pass" })}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Đạt
                </Button>
                <Button 
                  size="sm" 
                  variant={heuristicsScore[i] === "fail" ? "destructive" : "outline"}
                  onClick={() => setHeuristicsScore({ ...heuristicsScore, [i]: "fail" })}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Có lỗi
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
