import { ReactNode, useState, useRef, useEffect, useCallback, type ComponentType } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { LogOut, HeartPulse, Bell, CheckCheck, CalendarClock, MessageSquare, RefreshCw, Trash2, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";


type NotifKind = "appointment" | "message" | "reminder" | "emergency";
type Notif = { id: number; kind: NotifKind; title: string; desc: string; body: string; time: string; read: boolean };

const KIND_META: Record<NotifKind, { icon: ComponentType<{ className?: string }>; bg: string; fg: string; label: string }> = {
  appointment: { icon: CalendarClock, bg: "bg-sky-100", fg: "text-sky-600", label: "Lịch hẹn" },
  message: { icon: MessageSquare, bg: "bg-emerald-100", fg: "text-emerald-600", label: "Tin nhắn" },
  reminder: { icon: RefreshCw, bg: "bg-amber-100", fg: "text-amber-600", label: "Nhắc nhở" },
  emergency: { icon: AlertTriangle, bg: "bg-rose-100", fg: "text-rose-600", label: "Nguy cấp" },
};

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

type ApiNotif = { id: string; target: string; title: string; content: string; time: string; status: string; createdAt: string };

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
  searchValue,
  onSearchChange,
  searchResults,
}: {
  title: string;
  subtitle: string;
  roleLabel: string;
  roleColor: string;
  initials: string;
  nav: { key: string; label: string; icon: ComponentType<{ className?: string }> }[];
  active: string;
  onNav: (key: string) => void;
  onLogout: () => void;
  children: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchResults?: ReactNode;
}) {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [notifError, setNotifError] = useState(false);
  const [openNotif, setOpenNotif] = useState<Notif | null>(null);
  const [showMobile, setShowMobile] = useState(false);
  const notifiedSearch = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastDeletedNotifs = useRef<Notif[] | null>(null);

  // Keyboard shortcut: Ctrl+K / ⌘K to focus search (Shneiderman #2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setNotifError(true); return; }
        const data: ApiNotif[] = await res.json();
        setNotifs(data.map((n, i) => {
          let kind: NotifKind = "message";
          const titleLower = n.title.toLowerCase();
          const contentLower = n.content.toLowerCase();

          if (
            titleLower.includes("nguy cấp") ||
            contentLower.includes("nguy cấp") ||
            titleLower.includes("khẩn cấp") ||
            contentLower.includes("khẩn cấp") ||
            titleLower.includes("cấp cứu") ||
            contentLower.includes("cấp cứu") ||
            titleLower.includes("nguy hiểm") ||
            contentLower.includes("nguy hiểm") ||
            titleLower.includes("emergency") ||
            contentLower.includes("emergency")
          ) {
            kind = "emergency";
          } else if (
            titleLower.includes("lịch khám") ||
            contentLower.includes("lịch khám") ||
            titleLower.includes("lịch hẹn") ||
            contentLower.includes("lịch hẹn") ||
            titleLower.includes("đặt lịch") ||
            contentLower.includes("đặt lịch") ||
            titleLower.includes("khám bệnh") ||
            contentLower.includes("khám bệnh") ||
            titleLower.includes("appointment") ||
            contentLower.includes("appointment") ||
            titleLower.includes("booking") ||
            contentLower.includes("booking")
          ) {
            kind = "appointment";
          } else if (
            titleLower.includes("nhắc nhở") ||
            contentLower.includes("nhắc nhở") ||
            titleLower.includes("uống thuốc") ||
            contentLower.includes("uống thuốc") ||
            titleLower.includes("tái khám") ||
            contentLower.includes("tái khám") ||
            titleLower.includes("reminder") ||
            contentLower.includes("reminder")
          ) {
            kind = "reminder";
          }

          return {
            id: i + 1,
            kind,
            title: n.title,
            desc: n.content.length > 80 ? n.content.substring(0, 80) + "..." : n.content,
            body: n.content,
            time: n.time || new Date(n.createdAt).toLocaleDateString("vi-VN"),
            read: false,
          };
        }));
      } catch {
        setNotifError(true);
      }
    };
    fetchNotifs();
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Mobile overlay */}
      {showMobile && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setShowMobile(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${showMobile ? "fixed inset-y-0 left-0 z-30" : "hidden lg:flex lg:sticky lg:top-0 lg:h-screen"} w-64 shrink-0 flex-col transition-all duration-300`} style={{
        background: "linear-gradient(180deg, #090E17 0%, #111827 100%)",
        color: "#fff",
        boxShadow: "4px 0 24px rgba(0, 0, 0, 0.1)",
      }}>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white" style={{
            boxShadow: "0 4px 12px rgba(59,130,246,0.4)"
          }}>
            <HeartPulse className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="tracking-tight leading-tight font-black text-white text-[17px]">MediCare AI</div>
            <div className="text-[10px] uppercase font-bold tracking-widest mt-0.5 text-blue-400">{roleLabel}</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 flex-1 space-y-1.5 overflow-auto custom-scrollbar">
          {nav.map(item => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { onNav(item.key); setShowMobile(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 text-left outline-none hover:translate-x-1 active:scale-95 ${isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                style={{
                  background: isActive ? "linear-gradient(135deg, #2563EB, #3B82F6)" : "transparent",
                  boxShadow: isActive ? "0 8px 16px -4px rgba(37,99,235,0.4)" : "none",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? "text-white drop-shadow-sm" : "text-slate-500 group-hover:text-slate-300"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout area */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => { onLogout(); setShowMobile(false); }}
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
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        {/* Premium Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20" style={{
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 4px 20px -10px rgba(0,0,0,0.05)"
        }}>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden size-8 rounded-xl inline-flex items-center justify-center hover:bg-slate-100 border border-slate-200 transition-all"
              onClick={() => setShowMobile(prev => !prev)}
              aria-label="Toggle menu"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {showMobile ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div>
              <h3 className="tracking-tight leading-tight font-extrabold text-slate-800 text-lg">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>
            </div>
          </div>

          {/* Search bar — visible on all devices (UIUX11 Visibility) */}
          <div className="flex flex-1 max-w-sm mx-4 md:mx-6 relative items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input
              ref={searchInputRef}
              placeholder="Tìm bệnh nhân, phác đồ..."
              className={`w-full h-9 pl-9 pr-12 border rounded-xl text-xs bg-slate-50 text-slate-700 outline-none transition-all ${searchValue ? 'border-blue-400 ring-2 ring-blue-100 bg-white' : 'border-slate-200'}`}
              value={onSearchChange ? (searchValue ?? "") : undefined}
              onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
              onFocus={() => {
                if (onSearchChange) return;
                if (notifiedSearch.current) return;
                notifiedSearch.current = true;
                toast.info("Chức năng tìm kiếm đang phát triển. Vui lòng sử dụng thanh điều hướng bên trái.");
              }}
            />
            {(!searchValue) && (
              <div className="absolute right-3 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] text-slate-400 font-medium select-none hidden md:block">
                ⌘K
              </div>
            )}
            {searchValue && onSearchChange && (
              <button
                className="absolute right-3 w-5 h-5 rounded-md bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 transition-colors z-10"
                onClick={() => onSearchChange("")}
              >
                ×
              </button>
            )}
            {/* Search Results Dropdown */}
            {searchValue && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200" style={{ maxHeight: '420px' }}>
                {searchResults}
              </div>
            )}
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger className="relative size-9 rounded-xl inline-flex items-center justify-center hover:bg-slate-100 transition-all outline-none border border-slate-200">
                <Bell className="w-4.5 h-4.5 text-slate-600" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-md">
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
                  {notifError ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-red-400" />
                      </div>
                      <p className="mt-2 text-sm text-red-500">Không thể tải thông báo</p>
                      <button className="mt-2 text-xs text-blue-600 hover:underline" onClick={() => { setNotifError(false); window.location.reload(); }}>Thử lại</button>
                    </div>
                  ) : notifs.length === 0 ? (
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
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.desc}</div>
                            <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded-md font-medium text-[9px] ${meta.bg} ${meta.fg}`}>{meta.label}</span>
                              <span>•</span>
                              <span>{n.time}</span>
                            </div>
                          </div>
                          {!n.read && (
                            <div className="flex items-center justify-center shrink-0 self-center pr-1">
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            </div>
                          )}
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
                      lastDeletedNotifs.current = [...notifs];
                      setNotifs([]);
                      toast.success("Đã xóa toàn bộ thông báo", {
                        action: {
                          label: "Hoàn tác",
                          onClick: () => {
                            if (lastDeletedNotifs.current) {
                              setNotifs(lastDeletedNotifs.current);
                              lastDeletedNotifs.current = null;
                              toast.success("Đã khôi phục thông báo");
                            }
                          },
                        },
                      });
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
        <main className="flex-1 overflow-auto p-6 animate-fade-in" style={{ backgroundColor: "#F0F4F8" }}>{children}</main>
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
                      const deletedNotif = openNotif;
                      setNotifs(prev => prev.filter(x => x.id !== openNotif!.id));
                      setOpenNotif(null);
                      toast.success("Đã xóa thông báo", {
                        action: {
                          label: "Hoàn tác",
                          onClick: () => {
                            if (deletedNotif) {
                              setNotifs(prev => [...prev, deletedNotif].sort((a, b) => a.id - b.id));
                              toast.success("Đã khôi phục thông báo");
                            }
                          },
                        },
                      });
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
