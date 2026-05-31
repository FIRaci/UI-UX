import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "sonner";
import { Stethoscope, UserRound, ShieldCheck, MessagesSquare, HeartPulse, Lock, Loader2 } from "lucide-react";
import { fetchAllData } from "../store";

export type Role = "benhnhan" | "tuvan" | "bacsi" | "quanly";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ROLES: {
  key: Role;
  label: string;
  desc: string;
  icon: any;
  colorClass: string;
}[] = [
  { key: "benhnhan", label: "Bệnh nhân", desc: "Xem hồ sơ & Đặt lịch khám", icon: UserRound, colorClass: "text-blue-600 bg-blue-50 border-blue-200" },
  { key: "tuvan", label: "Người cần tư vấn", desc: "Trả lời tin nhắn & Hỗ trợ", icon: MessagesSquare, colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { key: "bacsi", label: "Bác sĩ", desc: "Khám bệnh & Kê toa", icon: Stethoscope, colorClass: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { key: "quanly", label: "Quản lý", desc: "Vận hành hệ thống", icon: ShieldCheck, colorClass: "text-rose-600 bg-rose-50 border-rose-200" },
];

const MANAGER_ACCOUNT = { username: "quanli", password: "test123@" };

export function LoginScreen({ onLogin, onNavigateRegister }: { onLogin: (role: Role) => void, onNavigateRegister?: () => void }) {
  const [selected, setSelected] = useState<Role | null>(null);
  const [isManualLogin, setIsManualLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showManagerLogin, setShowManagerLogin] = useState(false);
  const [managerUser, setManagerUser] = useState("");
  const [managerPass, setManagerPass] = useState("");
  const [managerLoading, setManagerLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = async (role: Role) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: role, password: "123456" })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        fetchAllData();
      }
    } catch (e) {
      console.warn("Could not retrieve dev token:", e);
      toast.warning("Không thể kết nối máy chủ — đang dùng chế độ demo");
    }
    onLogin(role);
    toast.success(`Đăng nhập với vai trò: ${ROLES.find(r => r.key === role)?.label}`);
  };

  const handleFormLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          fetchAllData();
        }
        toast.success(`Chào mừng ${data.user?.name || data.user?.username || 'bạn'}!`);
        onLogin((data.user?.role as Role) || "benhnhan");
      } else {
        toast.error(data.error || "Lỗi đăng nhập");
      }
    } catch (e) {
      toast.error("Lỗi kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans selection:bg-blue-200">
      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">
        
        {/* Left Side: Branding */}
        <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">MediCare AI</div>
              <div className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Hệ thống Y tế thông minh</div>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
            Chăm sóc sức khỏe <br />
            <span className="text-blue-600">thông minh hơn</span>
          </h1>
          <p className="text-slate-600 max-w-md text-base leading-relaxed">
            Hệ sinh thái y tế số tích hợp AI hỗ trợ đặt lịch khám, tư vấn từ xa, và quản lý hồ sơ chuyên nghiệp. Đảm bảo an toàn, bảo mật và thân thiện.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md pt-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-slate-900 mb-1">+200</div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Bác sĩ chuyên khoa</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-slate-900 mb-1">+50K</div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Lượt khám mỗi năm</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-slate-900 mb-1">4.9/5</div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Mức độ hài lòng</div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Box */}
        <Card className="p-8 sm:p-10 shadow-xl bg-white border border-slate-200 rounded-3xl animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="space-y-2 mb-8">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập hệ thống</h3>
            <p className="text-sm text-slate-500">Truy cập bằng tài khoản hoặc chọn nhanh vai trò để trải nghiệm.</p>
          </div>

          {!isManualLogin ? (
            <>
              {/* Quick Login View */}
              <div className="space-y-4">
                <button
                  onClick={() => { setSelected("benhnhan"); handleQuickLogin("benhnhan"); }}
                  className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100/50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <UserRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-blue-900">Tôi là Bệnh nhân</h4>
                    <p className="text-xs text-blue-700/80 mt-0.5">Vào khám, xem hồ sơ, chat với bác sĩ AI</p>
                  </div>
                </button>
                
                {onNavigateRegister && (
                  <div className="text-center text-sm">
                    <span className="text-slate-500">Chưa có tài khoản? </span>
                    <button 
                      onClick={onNavigateRegister}
                      className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                )}

                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative flex justify-center"><span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase">Hoặc vai trò khác</span></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ROLES.filter(r => r.key !== "benhnhan").map(r => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.key}
                        onClick={() => {
                          setSelected(r.key);
                          if (r.key === "quanly") {
                            setShowManagerLogin(true);
                          } else {
                            handleQuickLogin(r.key);
                          }
                        }}
                        className={`group flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${r.colorClass} hover:opacity-80`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <div className="text-xs font-bold leading-tight">{r.label}</div>
                      </button>
                    );
                  })}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4 h-12 rounded-xl text-slate-600 font-semibold"
                  onClick={() => setIsManualLogin(true)}
                >
                  Đăng nhập bằng mật khẩu
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Manual Login View */}
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <Label htmlFor="user" className="text-xs font-bold text-slate-700">Tên đăng nhập</Label>
                  <Input 
                    id="user" 
                    placeholder="Nhập tài khoản..." 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    className="h-12 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="pwd" className="text-xs font-bold text-slate-700">Mật khẩu</Label>
                  </div>
                  <Input 
                    id="pwd" 
                    type="password" 
                    placeholder="••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="h-12 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600" 
                  />
                </div>
                <Button 
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-sm disabled:opacity-70 disabled:cursor-not-allowed" 
                  onClick={handleFormLogin}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Đăng nhập"}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-slate-500 text-sm hover:text-slate-800"
                  onClick={() => setIsManualLogin(false)}
                >
                  Quay lại chọn vai trò nhanh
                </Button>
              </div>
            </>
          )}
          

        </Card>

        {/* Manager Login Dialog */}
        <Dialog open={showManagerLogin} onOpenChange={() => { setShowManagerLogin(false); setManagerUser(""); setManagerPass(""); }}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg">Đăng nhập Quản lý</DialogTitle>
                  <DialogDescription>Phòng khám MediCare</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Tên đăng nhập</Label>
                <Input
                  placeholder="Nhập tài khoản quản lý..."
                  value={managerUser}
                  onChange={e => setManagerUser(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-rose-600"
                  onKeyDown={e => e.key === "Enter" && document.getElementById("manager-pass")?.focus()}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Mật khẩu</Label>
                <Input
                  id="manager-pass"
                  type="password"
                  placeholder="••••••"
                  value={managerPass}
                  onChange={e => setManagerPass(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-rose-600"
                  onKeyDown={e => { if (e.key === "Enter") { (e.target as HTMLElement).blur(); document.getElementById("manager-login-btn")?.click(); } }}
                />
              </div>
              <Button
                id="manager-login-btn"
                className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
                disabled={managerLoading}
                onClick={async () => {
                  if (!managerUser.trim() || !managerPass.trim()) {
                    toast.error("Vui lòng nhập đầy đủ thông tin");
                    return;
                  }
                  setManagerLoading(true);
                  // Try backend first, fallback to local auth
                  try {
                    const res = await fetch(`${API_URL}/api/auth/login`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ username: managerUser, password: managerPass })
                    });
                    const data = await res.json();
                    if (data.success && data.token) {
                      localStorage.setItem("token", data.token);
                      fetchAllData();
                    }
                  } catch {
                    // Backend offline
                  }
                  await new Promise(r => setTimeout(r, 400));
                  setManagerLoading(false);

                  if (managerUser === MANAGER_ACCOUNT.username && managerPass === MANAGER_ACCOUNT.password) {
                    toast.success("Chào mừng Quản lý phòng khám!");
                    setShowManagerLogin(false);
                    setManagerUser("");
                    setManagerPass("");
                    onLogin("quanly");
                  } else {
                    toast.error("Sai tài khoản hoặc mật khẩu quản lý");
                  }
                }}
              >
                {managerLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                {managerLoading ? "Đang kiểm tra..." : "Đăng nhập"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
