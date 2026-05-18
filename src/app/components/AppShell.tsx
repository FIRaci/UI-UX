import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { LogOut, HeartPulse, Bell, CheckCheck, CalendarClock, MessageSquare, RefreshCw, Trash2, Search } from "lucide-react";
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
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col" style={{
        background: "linear-gradient(180deg, #0C1A35 0%, #0F2244 100%)",
        color: "#fff",
        boxShadow: "4px 0 24px rgba(15, 34, 68, 0.15)",
        zIndex: 10,
      }}>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white" style={{
            boxShadow: "0 4px 12px rgba(59,130,246,0.4)"
          }}>
            <HeartPulse className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="tracking-tight leading-tight font-bold text-white text-base">MediCare AI</div>
            <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{roleLabel}</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 flex-1 space-y-1.5 overflow-auto">
          {nav.map(item => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNav(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all text-left outline-none ${
                  isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                style={{
                  background: isActive ? "linear-gradient(135deg, #3B82F6, #2563EB)" : "transparent",
                  boxShadow: isActive ? "0 4px 12px rgba(59,130,246,0.3)" : "none",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout area */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.color = "#FEF2F2";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.75)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Premium Header */}
        <header className="h-16 bg-white flex items-center justify-between px-6" style={{
          borderBottom: "1px solid #E2E8F0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
        }}>
          <div>
            <h3 className="tracking-tight leading-tight font-bold text-slate-800 text-base">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>

          {/* Middle Mock Search bar */}
          <div className="hidden md:flex flex-1 max-w-sm mx-6 relative items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              readOnly
              placeholder="Tìm bệnh nhân, phác đồ, chẩn đoán..."
              className="w-full h-9 pl-9 pr-12 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 outline-none transition-all"
            />
            <div className="absolute right-3 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] text-slate-400 font-medium select-none">
              ⌘K
            </div>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger className="relative size-9 rounded-xl inline-flex items-center justify-center hover:bg-slate-100 transition-all outline-none border border-slate-200">
                <Bell className="w-4.5 h-4.5 text-slate-600" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center" style={{
                    boxShadow: "0 2px 4px rgba(239,68,68,0.4)"
                  }}>
                    {unread}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 border border-slate-200 shadow-xl rounded-2xl overflow-hidden mt-1">
                <div className="p-3 bg-slate-50 border-b flex items-center justify-between">
                  <span className="tracking-tight font-semibold text-slate-700 text-sm">Thông báo</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/50"
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
                          className={`w-full text-left p-3 border-b hover:bg-slate-50/80 transition flex items-start gap-3 ${!n.read ? "bg-blue-50/20" : ""}`}
                        >
                          <div className={`w-9 h-9 rounded-xl ${meta.bg} ${meta.fg} flex items-center justify-center shrink-0`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700 truncate">{n.title}</span>
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 animate-pulse" />}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.desc}</div>
                            <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded-md font-medium text-[9px] ${meta.bg} ${meta.fg}`}>{meta.label}</span>
                              <span>•</span>
                              <span>{n.time}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="p-2 border-t bg-slate-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100"
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

            {/* Custom Premium Role Badge */}
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide border transition-all" style={{
              backgroundColor: roleLabel === "Bác sĩ" ? "#F5F3FF" : roleLabel === "Quản lý" ? "#FFF1F2" : roleLabel === "Chuyên gia" ? "#FDF2F8" : "#ECFDF5",
              color: roleLabel === "Bác sĩ" ? "#6D28D9" : roleLabel === "Quản lý" ? "#E11D48" : roleLabel === "Chuyên gia" ? "#DB2777" : "#047857",
              borderColor: roleLabel === "Bác sĩ" ? "#DDD6FE" : roleLabel === "Quản lý" ? "#FECDD3" : roleLabel === "Chuyên gia" ? "#FBCFE8" : "#A7F3D0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
            }}>
              {roleLabel}
            </span>

            {/* Premium Avatar block */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 text-white flex items-center justify-center font-bold text-xs tracking-wide shadow-sm border border-slate-200">
              {initials}
            </div>
          </div>
        </header>

        {/* Upgrade Content Container to elegant Slate Page Background */}
        <main className="flex-1 overflow-auto p-6" style={{ backgroundColor: "#F0F4F8" }}>{children}</main>
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
