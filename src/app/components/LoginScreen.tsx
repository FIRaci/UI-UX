import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { HeartPulse, Loader2 } from "lucide-react";
import { fetchAllData } from "../store";

export type Role = "benhnhan" | "tuvan" | "bacsi" | "quanly";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function LoginScreen({ onLogin, onNavigateRegister }: { onLogin: (role: Role) => void, onNavigateRegister?: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      <div className="w-full max-w-[420px]">
        
        {/* Top Branding */}
        <div className="flex flex-col items-center justify-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl mb-4">
            <HeartPulse className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">MediCare AI</h1>
          <p className="text-xs text-slate-500 font-bold tracking-[0.2em] uppercase text-center w-full">Hệ thống Y tế thông minh</p>
        </div>

        {/* Login Box */}
        <Card className="p-8 shadow-2xl bg-white border border-slate-200 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2 mb-8 text-center">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập</h3>
          </div>

          <div className="space-y-5">
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
                onKeyDown={e => {
                  if (e.key === "Enter") handleFormLogin();
                }}
              />
            </div>
            <Button 
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed" 
              onClick={handleFormLogin}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Đăng nhập"}
            </Button>
            
            {onNavigateRegister && (
              <div className="mt-6 text-center text-sm pt-2">
                <span className="text-slate-500">Chưa có tài khoản? </span>
                <button 
                  onClick={onNavigateRegister}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                >
                  Đăng ký ngay
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
