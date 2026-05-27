import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Send, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

type Notification = {
  id: string;
  target: string;
  title: string;
  content: string;
  time: string;
  status: string;
  createdAt: string;
};

const TARGET_LABELS: Record<string, string> = {
  all: "Toàn hệ thống",
  patient: "Bệnh nhân",
  doctor: "Bác sĩ",
};

function NotifSkeleton() {
  return (
    <div className="p-3 border rounded-xl animate-pulse space-y-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
  );
}

export function NotificationsPanel() {
  const [notif, setNotif] = useState({ target: "all", title: "", content: "", time: "" });
  const [sending, setSending] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifs(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleSend = async () => {
    if (!notif.title.trim() || !notif.content.trim() || !notif.time) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề, nội dung và thời gian");
      return;
    }
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notif),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gửi thất bại");
      }
      toast.success("Đã gửi thông báo thành công");
      setNotif({ target: "all", title: "", content: "", time: "" });
      fetchNotifs();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lỗi không xác định";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      toast.success("Đã xóa thông báo");
      fetchNotifs();
    } catch {
      toast.error("Xóa thông báo thất bại");
    }
  };

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
          <div className="space-y-1.5">
            <Label>Tiêu đề</Label>
            <Input placeholder="Nhập tiêu đề thông báo..." value={notif.title} onChange={e => setNotif({ ...notif, title: e.target.value })} />
          </div>
          <div className="space-y-1.5"><Label>Nội dung</Label>
            <Textarea rows={5} placeholder="Nhập nội dung thông báo..." value={notif.content} onChange={e => setNotif({ ...notif, content: e.target.value })} />
          </div>
          <div className="space-y-1.5"><Label>Thời gian gửi</Label>
            <Input type="datetime-local" value={notif.time} onChange={e => setNotif({ ...notif, time: e.target.value })} />
          </div>
          <Button className="w-full" onClick={handleSend} disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            {sending ? "Đang gửi..." : "Gửi thông báo"}
          </Button>
        </div>
      </Card>
      <Card className="p-5 card-hover">
        <h4 className="tracking-tight mb-3">Thông báo đã gửi</h4>
        <div className="space-y-2">
          {loading ? (
            <>
              <NotifSkeleton />
              <NotifSkeleton />
              <NotifSkeleton />
            </>
          ) : notifs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Chưa có thông báo nào</p>
          ) : (
            notifs.map((n) => (
              <div key={n.id} className="group p-3 border rounded-xl relative">
                <div className="flex justify-between items-start gap-2">
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-all mt-0.5"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="min-w-0 flex-1 order-first">
                    <span className="font-medium text-sm">{n.title}</span>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.content}</p>
                    <div className="text-xs text-muted-foreground mt-1.5">
                      {TARGET_LABELS[n.target] || n.target} • {n.time}
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{n.status === "sent" ? "Đã gửi" : n.status}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
