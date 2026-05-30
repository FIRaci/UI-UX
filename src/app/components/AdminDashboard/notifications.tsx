import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Send, Trash2, Loader2, Bell, Users, User, Stethoscope, Clock, CheckCircle2 } from "lucide-react";
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

const TARGET_CONFIG: Record<string, { label: string; icon: typeof Bell; color: string }> = {
  all: { label: "Toàn hệ thống", icon: Users, color: "blue" },
  patient: { label: "Bệnh nhân", icon: User, color: "emerald" },
  doctor: { label: "Bác sĩ", icon: Stethoscope, color: "violet" },
};

function NotifSkeleton() {
  return (
    <div className="p-4 border border-slate-100 rounded-xl animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
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

  const sentCount = notifs.filter(n => n.status === "sent").length;
  const targetConfig = TARGET_CONFIG[notif.target] || TARGET_CONFIG.all;
  const TargetIcon = targetConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Thông báo</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý và gửi thông báo đến người dùng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng thông báo", value: notifs.length, icon: Bell, color: "blue" },
          { label: "Đã gửi", value: sentCount, icon: CheckCircle2, color: "emerald" },
          { label: "Đang chờ", value: notifs.length - sentCount, icon: Clock, color: "amber" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-4 bg-white border-0 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Compose */}
        <Card className="bg-white border-0 shadow-sm" style={{ borderRadius: "16px" }}>
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Soạn thông báo</h3>
            <p className="text-sm text-slate-500 mt-1">Tạo và gửi thông báo mới</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Đối tượng nhận</Label>
              <Select value={notif.target} onValueChange={v => setNotif({ ...notif, target: v })}>
                <SelectTrigger className="h-10 bg-slate-50 border-slate-200">
                  <TargetIcon className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toàn hệ thống</SelectItem>
                  <SelectItem value="patient">Bệnh nhân</SelectItem>
                  <SelectItem value="doctor">Bác sĩ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tiêu đề</Label>
              <Input
                placeholder="Nhập tiêu đề thông báo..."
                value={notif.title}
                onChange={e => setNotif({ ...notif, title: e.target.value })}
                className="h-10 bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nội dung</Label>
              <Textarea
                rows={4}
                placeholder="Nhập nội dung thông báo..."
                value={notif.content}
                onChange={e => setNotif({ ...notif, content: e.target.value })}
                className="bg-slate-50 border-slate-200 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Thời gian gửi</Label>
              <Input
                type="datetime-local"
                value={notif.time}
                onChange={e => setNotif({ ...notif, time: e.target.value })}
                className="h-10 bg-slate-50 border-slate-200"
              />
            </div>
            <Button
              className="w-full h-10 bg-blue-600 hover:bg-blue-700"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {sending ? "Đang gửi..." : "Gửi thông báo"}
            </Button>
          </div>
        </Card>

        {/* Sent List */}
        <Card className="bg-white border-0 shadow-sm" style={{ borderRadius: "16px" }}>
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Thông báo đã gửi</h3>
                <p className="text-sm text-slate-500 mt-1">{notifs.length} thông báo</p>
              </div>
            </div>
          </div>
          <div className="p-4 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="space-y-3">
                <NotifSkeleton />
                <NotifSkeleton />
                <NotifSkeleton />
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">Chưa có thông báo nào</p>
                <p className="text-xs text-slate-400 mt-1">Thông báo sẽ xuất hiện ở đây sau khi gửi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifs.map((n) => {
                  const tConfig = TARGET_CONFIG[n.target] || TARGET_CONFIG.all;
                  const TIcon = tConfig.icon;
                  return (
                    <div key={n.id} className="group p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-${tConfig.color}-50 flex items-center justify-center shrink-0`}>
                          <TIcon className={`w-5 h-5 text-${tConfig.color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900 truncate">{n.title}</span>
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs shrink-0">
                              {n.status === "sent" ? "Đã gửi" : n.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-2">{n.content}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span>{tConfig.label}</span>
                            <span>•</span>
                            <span>{n.time}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
