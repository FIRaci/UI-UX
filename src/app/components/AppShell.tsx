import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { LogOut, HeartPulse, Bell, CheckCheck, CalendarClock, MessageSquare, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

type NotifKind = "appointment" | "message" | "reminder";
type Notif = { id: number; kind: NotifKind; title: string; desc: string; body: string; time: string; read: boolean };

const KIND_META: Record<NotifKind, { icon: any; bg: string; fg: string; label: string }> = {
  appointment: { icon: CalendarClock, bg: "bg-sky-100", fg: "text-sky-600", label: "Lịch hẹn" },
  message: { icon: MessageSquare, bg: "bg-emerald-100", fg: "text-emerald-600", label: "Tin nhắn" },
  reminder: { icon: RefreshCw, bg: "bg-amber-100", fg: "text-amber-600", label: "Nhắc nhở" },
};

export function AppShell({
  title,
  subtitle,
  roleLabel,
  roleColor,
  initials,
  nav,
  active,
  onNav,
  onLogout,
  children,
}: {
  title: string;
  subtitle: string;
  roleLabel: string;
  roleColor: string;
  initials: string;
  nav: { key: string; label: string; icon: any }[];
  active: string;
  onNav: (key: string) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [notifs, setNotifs] = useState<Notif[]>([
    {
      id: 1, kind: "appointment", title: "Lịch khám sắp tới",
      desc: "Bạn có lịch khám lúc 09:00 ngày mai",
      body: "Bác sĩ Nguyễn Văn An (Tim mạch) sẽ khám cho bạn vào 09:00 ngày 08/05/2026 tại phòng 204, CN Quận 1. Vui lòng đến sớm 15 phút để hoàn tất thủ tục, mang theo CMND/CCCD và sổ khám bệnh cũ (nếu có). Nhịn ăn ít nhất 8 tiếng nếu được chỉ định xét nghiệm máu.",
      time: "5 phút trước", read: false,
    },
    {
      id: 2, kind: "message", title: "Tin nhắn mới từ bác sĩ",
      desc: "BS. Trần Thị Bình đã phản hồi câu hỏi của bạn",
      body: "BS. Trần Thị Bình: \"Theo mô tả của bạn, đây là phản ứng dị ứng nhẹ. Hãy ngừng sản phẩm mỹ phẩm mới sử dụng trong 3-5 ngày, chườm lạnh nếu ngứa nhiều và uống nhiều nước. Nếu lan rộng hoặc phù nề, vui lòng đến phòng khám ngay.\"",
      time: "1 giờ trước", read: false,
    },
    {
      id: 3, kind: "reminder", title: "Nhắc tái khám định kỳ",
      desc: "Đã đến hạn tái khám tim mạch 6 tháng",
      body: "Theo lịch theo dõi của bác sĩ, bạn cần tái khám tim mạch 6 tháng/lần để đánh giá hiệu quả điều trị tăng huyết áp. Đặt lịch ngay trong mục Lịch khám hoặc liên hệ tổng đài 1900-0000 để được hỗ trợ.",
      time: "Hôm qua", read: true,
    },
  ]);
  const [openNotif, setOpenNotif] = useState<Notif | null>(null);
  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r flex flex-col">
        <div className="p-5 border-b flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="tracking-tight leading-tight">MediCare AI</div>
            <div className="text-[11px] text-muted-foreground">{roleLabel}</div>
          </div>
        </div>
        <nav className="p-2 flex-1 space-y-0.5 overflow-auto">
          {nav.map(item => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNav(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <Button variant="outline" size="sm" className="w-full" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6">
          <div>
            <h3 className="tracking-tight leading-tight">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger className="relative size-9 rounded-md inline-flex items-center justify-center hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="tracking-tight">Thông báo</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
                      toast.success("Đã đánh dấu tất cả là đã đọc");
                    }}
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-1" /> Đọc tất cả
                  </Button>
                </div>
                <div className="max-h-96 overflow-auto">
                  {notifs.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Không có thông báo mới</p>
                    </div>
                  ) : (
                    notifs.map(n => {
                      const meta = KIND_META[n.kind];
                      const Icon = meta.icon;
                      return (
                        <button
                          key={n.id}
                          onClick={() => {
                            setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                            setOpenNotif(n);
                          }}
                          className={`w-full text-left p-3 border-b hover:bg-slate-50 transition flex items-start gap-3 ${!n.read ? "bg-sky-50/40" : ""}`}
                        >
                          <div className={`w-9 h-9 rounded-xl ${meta.bg} ${meta.fg} flex items-center justify-center shrink-0`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm tracking-tight truncate">{n.title}</span>
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.desc}</div>
                            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded ${meta.bg} ${meta.fg}`}>{meta.label}</span>
                              <span>•</span>
                              <span>{n.time}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setNotifs([]);
                      toast.success("Đã xóa toàn bộ thông báo");
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Xóa tất cả
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Badge className={roleColor}>{roleLabel}</Badge>
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-slate-900 text-white">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      <Dialog open={!!openNotif} onOpenChange={() => setOpenNotif(null)}>
        <DialogContent className="max-w-md">
          {openNotif && (() => {
            const meta = KIND_META[openNotif.kind];
            const Icon = meta.icon;
            return (
              <>
                <DialogHeader className="text-left">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.fg} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle>{openNotif.title}</DialogTitle>
                      <DialogDescription>{meta.label} • {openNotif.time}</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <p className="text-sm leading-relaxed text-slate-700">{openNotif.body}</p>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNotifs(prev => prev.filter(x => x.id !== openNotif.id));
                      setOpenNotif(null);
                      toast.success("Đã xóa thông báo");
                    }}
                  >
                    Xóa
                  </Button>
                  <Button onClick={() => setOpenNotif(null)}>Đã hiểu</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
