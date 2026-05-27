import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Stethoscope, UserRound, GraduationCap, MessagesSquare, ShieldCheck, HeartPulse, MonitorCheck } from "lucide-react";

export type Role = "benhnhan" | "tuvan" | "bacsi" | "chuyengia" | "quanly";

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
  { key: "chuyengia", label: "Chuyên gia UI/UX", desc: "Đánh giá Heuristic, UX Audit", icon: MonitorCheck, color: "from-amber-500 to-orange-600" },
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100 via-white to-emerald-50">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
        {/* Left: branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-sky-500/20">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-bold font-heading tracking-tight">MediCare AI</div>
              <div className="text-sm text-muted-foreground">Hệ thống y tế thông minh có chatbot</div>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold font-heading tracking-tight leading-tight">
            Chăm sóc sức khỏe <br />
            <span className="bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">thông minh hơn</span>
          </h1>
          <p className="text-muted-foreground max-w-lg text-lg">
            Đặt lịch khám online, tư vấn cùng bác sĩ và chuyên gia, quản lý hồ sơ sức khỏe, hỗ trợ chẩn đoán bằng AI Chatbot 24/7.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg pt-4">
            <Card className="p-4 bg-white/60 backdrop-blur-md border-white/40 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="text-xl font-bold text-sky-600 font-heading">+200</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bác sĩ</div>
            </Card>
            <Card className="p-4 bg-white/60 backdrop-blur-md border-white/40 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="text-xl font-bold text-emerald-600 font-heading">+50K</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lượt khám</div>
            </Card>
            <Card className="p-4 bg-white/60 backdrop-blur-md border-white/40 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="text-xl font-bold text-amber-600 font-heading">4.9</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Đánh giá</div>
            </Card>
          </div>
        </div>

        {/* Right: login */}
        <Card className="p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white/70 backdrop-blur-2xl border-white/60 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
          <div className="space-y-1 mb-6 relative z-10">
            <h3 className="text-3xl font-bold font-heading tracking-tight">{isRegister ? "Đăng ký tài khoản" : "Đăng nhập"}</h3>
            <p className="text-sm text-muted-foreground">Chọn nhanh vai trò để vào hệ thống, hoặc nhập tài khoản.</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 mb-6 relative z-10">
            {ROLES.map(r => {
              const Icon = r.icon;
              const active = selected === r.key;
              return (
                  <button
                    key={r.key}
                    onClick={() => { setSelected(r.key); handleQuickLogin(r.key); }}
                    className={`group flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${active ? "border-sky-400 bg-sky-50/50" : "border-slate-200 bg-white"}`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} text-white flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{r.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{r.desc}</div>
                  </div>
                  <code className="text-[10px] text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">{r.key}</code>
                </button>
              );
            })}
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Hoặc</span>
            </div>
          </div>

          <div className="space-y-3">
            {isRegister && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" placeholder="Nguyễn Văn A" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            {isRegister && selected && selected !== "benhnhan" && (
              <div className="space-y-1.5 animate-fade-in">
                <Label htmlFor="staffCode">Mã xác thực nhân viên</Label>
                <Input id="staffCode" type="password" placeholder="Nhập mã nhân viên..." value={staffCode} onChange={e => setStaffCode(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="user">Tên đăng nhập</Label>
              <Input id="user" placeholder="benhnhan / bacsi / quanly..." value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd">Mật khẩu</Label>
              <Input id="pwd" type="password" placeholder="123456" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white" onClick={handleFormLogin}>
              {isRegister ? "Đăng ký" : "Đăng nhập"}
            </Button>
            
            <div className="text-center text-sm">
                <button type="button" onClick={() => { setIsRegister(!isRegister); setUsername(""); setPassword(""); setName(""); setStaffCode(""); }} className="text-sky-600 hover:underline">
                    {isRegister ? "Đã có tài khoản? Đăng nhập ngay" : "Chưa có tài khoản? Đăng ký ngay"}
                </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              * Khi đăng ký, vai trò sẽ được gắn theo ô bạn chọn ở trên.<br/>
              Tài khoản test: <b>benhnhan</b>, <b>tuvan</b>, <b>bacsi</b>, <b>chuyengia</b>, <b>quanly</b> — mật khẩu <b>123456</b>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
