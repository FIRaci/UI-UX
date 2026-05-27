import { useState } from "react";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function NotificationsPanel() {
  const [notif, setNotif] = useState({ target: "all", content: "", time: "" });

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="p-5 animate-fade-in">
        <h4 className="tracking-tight mb-3">Soạn thông báo</h4>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Đối tượng nhận</Label>
            <Select value={notif.target} onValueChange={v => setNotif({ ...notif, target: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toàn hệ thống</SelectItem>
                <SelectItem value="patient">Bệnh nhân</SelectItem>
                <SelectItem value="doctor">Bác sĩ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Nội dung</Label>
            <Textarea rows={5} placeholder="Nhập nội dung thông báo..." value={notif.content} onChange={e => setNotif({ ...notif, content: e.target.value })} />
          </div>
          <div className="space-y-1.5"><Label>Thời gian gửi</Label>
            <Input type="datetime-local" value={notif.time} onChange={e => setNotif({ ...notif, time: e.target.value })} />
          </div>
          <Button className="w-full" onClick={() => {
            if (!notif.content.trim() || !notif.time) {
              toast.error("Vui lòng nhập đầy đủ nội dung và thời gian");
              return;
            }
            toast.info("Tính năng gửi thông báo đang phát triển");
            setNotif({ target: "all", content: "", time: "" });
          }}><Send className="w-4 h-4 mr-2" />Gửi thông báo</Button>
        </div>
      </Card>
      <Card className="p-5 card-hover">
        <h4 className="tracking-tight mb-3">Thông báo gần đây</h4>
        <div className="space-y-2">
          {[
            { t: "Nhắc lịch khám tuần", to: "Bệnh nhân", d: "06/05 08:00", st: "Đã gửi" },
            { t: "Cập nhật lịch làm việc", to: "Bác sĩ", d: "05/05 17:30", st: "Đã gửi" },
            { t: "Bảo trì hệ thống", to: "Toàn hệ thống", d: "04/05 22:00", st: "Đã gửi" },
          ].map((n, i) => (
            <div key={i} className="p-3 border rounded-xl">
              <div className="flex justify-between"><span>{n.t}</span><Badge variant="secondary">{n.st}</Badge></div>
              <div className="text-sm text-muted-foreground">Đối tượng: {n.to} • {n.d}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
