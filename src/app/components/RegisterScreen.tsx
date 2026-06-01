import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { HeartPulse, UserRound, MessagesSquare, Loader2, Eye, EyeOff } from "lucide-react";

export type Role = "benhnhan" | "tuvan" | "bacsi" | "quanly" | "admin";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function RegisterScreen({ onNavigateLogin }: { onNavigateLogin: () => void }) {
  const [role, setRole] = useState<Role>("benhnhan");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [staffCode, setStaffCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !name.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          password, 
          name, 
          role
        })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        onNavigateLogin();
      } else {
        toast.error(data.error || "Lỗi đăng ký");
      }
    } catch (e) {
      toast.error("Lỗi kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans selection:bg-blue-200">
      <div className="w-full max-w-[450px]">
        
        {/* Top Branding */}
        <div className="flex flex-col items-center justify-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <HeartPulse className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">MediCare AI</h1>
          </div>
          <p className="text-xs text-slate-500 font-bold tracking-[0.2em] uppercase text-center w-full">Hệ thống Y tế thông minh</p>
        </div>

        {/* Register Box */}
        <Card className="p-8 shadow-2xl bg-white border border-slate-200 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="space-y-2 mb-5 text-center">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Đăng ký</h3>
          </div>

          <div className="space-y-4 mb-6">
            <Label className="text-xs font-bold text-slate-700">Bạn là ai?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole("benhnhan")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  role === "benhnhan" 
                    ? "border-blue-600 bg-blue-50 text-blue-700" 
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <UserRound className="w-6 h-6" />
                <span className="text-sm font-bold">Bệnh nhân</span>
              </button>
              <button
                onClick={() => setRole("tuvan")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  role === "tuvan" 
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700" 
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <MessagesSquare className="w-6 h-6" />
                <span className="text-sm font-bold">Người cần tư vấn</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-xs font-bold text-slate-700">Họ và tên</Label>
              <Input 
                id="fullname" 
                placeholder="Nhập họ và tên..." 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="h-12 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600" 
              />
            </div>
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
              <Label htmlFor="pwd" className="text-xs font-bold text-slate-700">Mật khẩu</Label>
              <div className="relative">
                <Input 
                  id="pwd" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="h-12 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600 pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button 
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-sm mt-4 disabled:opacity-70 disabled:cursor-not-allowed" 
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Đăng ký"}
            </Button>
            
            <div className="mt-6 text-center text-sm pt-2">
              <span className="text-slate-500">Đã có tài khoản? </span>
              <button 
                onClick={onNavigateLogin}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
