import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Stethoscope, UserRound, ShieldCheck, MessagesSquare, HeartPulse } from "lucide-react";
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
  { key: "tuvan", label: "Tư vấn viên", desc: "Trả lời tin nhắn & Hỗ trợ", icon: MessagesSquare, colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { key: "bacsi", label: "Bác sĩ", desc: "Khám bệnh & Kê toa", icon: Stethoscope, colorClass: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { key: "quanly", label: "Quản lý", desc: "Vận hành hệ thống", icon: ShieldCheck, colorClass: "text-slate-600 bg-slate-50 border-slate-200" },
];

export function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [selected, setSelected] = useState<Role | null>(null);
  const [isManualLogin, setIsManualLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans selection:bg-blue-200">
      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">
        
        {/* Left Side: Branding */}
        <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="inline-flex flex-col max-w-fit">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl shrink-0">
                <HeartPulse className="w-12 h-12" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">MediCare AI</h1>
            </div>
            <p className="text-lg text-slate-500 font-bold tracking-[0.2em] uppercase text-center w-full">Hệ thống Y tế thông minh</p>
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
                        onClick={() => { setSelected(r.key); handleQuickLogin(r.key); }}
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
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-sm" 
                  onClick={handleFormLogin}
                >
                  Đăng nhập
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
          
          <div className="mt-8 text-center p-3 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
              Tài khoản mẫu: benhnhan / tuvan / bacsi / quanly
              <br/>Mật khẩu: 123456
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
