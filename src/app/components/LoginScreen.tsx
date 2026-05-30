import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Stethoscope, UserRound, GraduationCap, MessagesSquare, ShieldCheck, HeartPulse, MonitorCheck } from "lucide-react";
import { fetchAllData } from "../../store";

export type Role = "benhnhan" | "tuvan" | "bacsi" | "quanly";

const ROLES: {
  key: Role;
  label: string;
  desc: string;
  icon: any;
  color: string;
}[] = [
  { key: "benhnhan", label: "Người cần khám bệnh", desc: "Đặt lịch khám, xem hồ sơ sức khỏe", icon: UserRound, color: "from-sky-500 to-blue-600" },
  { key: "tuvan", label: "Người cần tư vấn", desc: "Trao đổi nhanh với chuyên gia y tế", icon: MessagesSquare, color: "from-emerald-500 to-teal-600" },
  { key: "bacsi", label: "Bác sĩ", desc: "Quản lý lịch khám và bệnh nhân", icon: Stethoscope, color: "from-indigo-500 to-violet-600" },
  { key: "quanly", label: "Quản lý phòng khám", desc: "Vận hành, báo cáo, thống kê", icon: ShieldCheck, color: "from-rose-500 to-pink-600" },
];

export function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [selected, setSelected] = useState<Role | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [staffCode, setStaffCode] = useState("");

  const handleQuickLogin = async (role: Role) => {
    if (isRegister) {
      setSelected(role);
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
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
      if (isRegister) {
        if (!selected) {
            toast.error("Vui lòng chọn vai trò để đăng ký");
            return;
        }
        const res = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role: selected, name, staffCode })
        });
        const data = await res.json();
        if (data.success) {
          try {
            const loginRes = await fetch("http://localhost:3000/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, password })
            });
            const loginData = await loginRes.json();
            if (loginData.success && loginData.token) {
              localStorage.setItem("token", loginData.token);
            }
          } catch (e) {
            console.warn("Silent login failed after register:", e);
          }
          toast.success("Đăng ký thành công! Đang tự động đăng nhập...");
          onLogin(selected);
        } else {
          toast.error(data.error || "Lỗi đăng ký");
        }
      } else {
        const res = await fetch("http://localhost:3000/api/auth/login", {
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
      }
    } catch (e) {
      toast.error("Lỗi kết nối đến máy chủ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-sky-50 font-sans selection:bg-sky-200">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_1fr] gap-10 xl:gap-16 items-center">
        {/* Left: branding */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 ring-1 ring-white/50">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-800">MediCare AI</div>
              <div className="text-sm text-sky-600 font-semibold tracking-wide uppercase mt-0.5">Hệ thống Y tế thông minh</div>
            </div>
          </div>
          <h1 className="text-[3.5rem] font-extrabold tracking-tight leading-[1.1] text-slate-900">
            Chăm sóc sức khỏe <br />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">thông minh hơn</span>
          </h1>
          <p className="text-slate-500 max-w-lg text-lg leading-relaxed">
            Đặt lịch khám online, tư vấn cùng bác sĩ chuyên khoa, quản lý hồ sơ sức khỏe và trải nghiệm AI Chatbot chẩn đoán 24/7.
          </p>
          <div className="grid grid-cols-3 gap-5 max-w-lg pt-2">
            <Card className="p-5 bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all hover:-translate-y-1.5 rounded-2xl group">
              <div className="text-2xl font-black text-blue-600 mb-1 group-hover:scale-105 transition-transform">+200</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bác sĩ</div>
            </Card>
            <Card className="p-5 bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all hover:-translate-y-1.5 rounded-2xl group">
              <div className="text-2xl font-black text-emerald-600 mb-1 group-hover:scale-105 transition-transform">+50K</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lượt khám</div>
            </Card>
            <Card className="p-5 bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all hover:-translate-y-1.5 rounded-2xl group">
              <div className="text-2xl font-black text-amber-500 mb-1 group-hover:scale-105 transition-transform">4.9</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Đánh giá</div>
            </Card>
          </div>
        </div>

        {/* Right: login */}
        <Card className="p-8 sm:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>
          <div className="space-y-2 mb-8 relative z-10 text-center">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-800">{isRegister ? "Tạo tài khoản" : "Đăng nhập"}</h3>
            <p className="text-sm text-slate-500 font-medium">Chọn nhanh vai trò để trải nghiệm ngay lập tức.</p>
          </div>

            {/* Massive Patient Login Button */}
            <button
              onClick={() => { setSelected("benhnhan"); handleQuickLogin("benhnhan"); }}
              className="w-full group relative flex flex-col items-center justify-center gap-3 p-6 mb-6 rounded-3xl border-2 border-sky-500/30 bg-gradient-to-b from-sky-50 to-blue-50/50 hover:from-sky-100 hover:to-blue-100 shadow-[0_8px_24px_rgba(56,189,248,0.15)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(56,189,248,0.25)] hover:-translate-y-1 outline-none"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UserRound className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h4 className="text-xl font-black text-slate-800 tracking-tight mb-1">Tôi là Bệnh nhân</h4>
                <p className="text-sm text-slate-500 font-medium">Bấm vào đây để khám bệnh, đặt lịch & chat AI ngay!</p>
              </div>
            </button>

            {/* Staff Roles */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <div className="h-px bg-slate-200 flex-1"></div>
                Dành cho nhân viên y tế
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.filter(r => r.key !== "benhnhan").map(r => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.key}
                      onClick={() => { setSelected(r.key); handleQuickLogin(r.key); }}
                      className="group flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-100 bg-white/90 hover:bg-slate-50 hover:border-slate-300 transition-all text-center outline-none"
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${r.color} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 leading-tight">{r.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-sky-600 font-bold hover:underline"
            >
              Bạn muốn nhập tên tài khoản / mật khẩu?
            </button>
          </div>

          {isRegister && (
            <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label htmlFor="user" className="text-xs font-bold text-slate-600 uppercase">Tên đăng nhập</Label>
                <Input id="user" placeholder="Nhập tài khoản..." value={username} onChange={e => setUsername(e.target.value)} className="h-10 rounded-xl text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pwd" className="text-xs font-bold text-slate-600 uppercase">Mật khẩu</Label>
                <Input id="pwd" type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} className="h-10 rounded-xl text-sm" />
              </div>
              <Button className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold" onClick={handleFormLogin}>
                Đăng nhập hệ thống
              </Button>
            </div>
          )}
          
          <p className="text-[10px] text-slate-400 text-center leading-relaxed mt-6">
            Mật khẩu mặc định cho các role test (benhnhan, tuvan, bacsi, quanly) là <b>123456</b>.
          </p>
        </Card>
      </div>
    </div>
  );
}
