import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";

export function SUSView() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight">System Usability Scale (SUS)</h2>
        <p className="text-sm text-muted-foreground">Form đánh giá nhanh độ khả dụng của hệ thống (1-5 điểm).</p>
      </div>
      <Card className="p-6 card-hover">
        <p className="text-center text-muted-foreground mb-4">Tính năng đang được xây dựng dựa trên phản hồi của người dùng thực...</p>
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => {
            toast.info("Tính năng phân phối khảo sát đang phát triển", {
              description: "Dự kiến gửi đến 10 người dùng ngẫu nhiên qua email.",
              duration: 5000,
            });
          }}>Phân phối bài khảo sát</Button>
        </div>
      </Card>
    </div>
  );
}
