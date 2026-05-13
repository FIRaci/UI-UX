import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Stethoscope, UserRound, GraduationCap, MessagesSquare, ShieldCheck, HeartPulse } from "lucide-react";

export type Role = "benhnhan" | "tuvan" | "bacsi" | "chuyengia" | "quanly";

const ROLES: {
  key: Role;
  label: string;
  desc: string;
  icon: any;
  color: string;
}[] = [
  { key: "benhnhan", label: "Người cần khám bệnh", desc: "Đặt lịch khám, xem hồ sơ sức khỏe", icon: UserRound, color: "from-sky-500 to-blue-600" },
  { key: "tuvan", label: "Người cần tư vấn", desc: "Trao đổi nhanh với chuyên gia", icon: MessagesSquare, color: "from-emerald-500 to-teal-600" },
  { key: "bacsi", label: "Bác sĩ", desc: "Quản lý lịch khám và bệnh nhân", icon: Stethoscope, color: "from-indigo-500 to-violet-600" },
  { key: "chuyengia", label: "Chuyên gia", desc: "Tư vấn chuyên sâu, hội chẩn", icon: GraduationCap, color: "from-amber-500 to-orange-600" },
  { key: "quanly", label: "Quản lý phòng khám", desc: "Vận hành, báo cáo, thống kê", icon: ShieldCheck, color: "from-rose-500 to-pink-600" },
];

export function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [selected, setSelected] = useState<Role | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleQuickLogin = (role: Role) => {
    onLogin(role);
    toast.success(`Đăng nhập với vai trò: ${ROLES.find(r => r.key === role)?.label}`);
  };

  const handleFormLogin = () => {
    const match = ROLES.find(r => r.key === username.trim().toLowerCase());
    if (match && password === "123456") {
      onLogin(match.key);
      toast.success(`Chào mừng ${match.label}!`);
    } else {
      toast.error("Sai tài khoản hoặc mật khẩu. Tài khoản: benhnhan / tuvan / bacsi / chuyengia / quanly. Mật khẩu: 123456");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
        {/* Left: branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl tracking-tight">MediCare AI</div>
              <div className="text-sm text-muted-foreground">Hệ thống y tế thông minh có chatbot</div>
            </div>
          </div>
          <h1 className="tracking-tight">
            Chăm sóc sức khỏe <span className="bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">thông minh hơn</span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Đặt lịch khám online, tư vấn cùng bác sĩ và chuyên gia, quản lý hồ sơ sức khỏe, hỗ trợ chẩn đoán bằng AI Chatbot 24/7.
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-lg">
            <Card className="p-4">
              <div className="text-sky-600">+200</div>
              <div className="text-xs text-muted-foreground">Bác sĩ</div>
            </Card>
            <Card className="p-4">
              <div className="text-emerald-600">+50K</div>
              <div className="text-xs text-muted-foreground">Lượt khám</div>
            </Card>
            <Card className="p-4">
              <div className="text-amber-600">4.9★</div>
              <div className="text-xs text-muted-foreground">Đánh giá</div>
            </Card>
          </div>
        </div>

        {/* Right: login */}
        <Card className="p-6 shadow-xl">
          <div className="space-y-1 mb-4">
            <h3 className="tracking-tight">Đăng nhập</h3>
            <p className="text-sm text-muted-foreground">Chọn nhanh vai trò để vào hệ thống, hoặc nhập tài khoản.</p>
          </div>

          <div className="grid grid-cols-1 gap-2 mb-5">
            {ROLES.map(r => {
              const Icon = r.icon;
              const active = selected === r.key;
              return (
                <button
                  key={r.key}
                  onMouseEnter={() => setSelected(r.key)}
                  onClick={() => handleQuickLogin(r.key)}
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
            <div className="space-y-1.5">
              <Label htmlFor="user">Tên đăng nhập</Label>
              <Input id="user" placeholder="benhnhan / bacsi / quanly..." value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd">Mật khẩu</Label>
              <Input id="pwd" type="password" placeholder="123456" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleFormLogin}>Đăng nhập</Button>
            <p className="text-xs text-muted-foreground text-center">
              Tài khoản test: <b>benhnhan</b>, <b>tuvan</b>, <b>bacsi</b>, <b>chuyengia</b>, <b>quanly</b> — mật khẩu <b>123456</b>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
