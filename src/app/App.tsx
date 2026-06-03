import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { LoginScreen, type Role } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { SEO } from "./components/SEO";

const PatientDashboard = lazy(() => import("./components/PatientDashboard").then(m => ({ default: m.PatientDashboard })));
const DoctorDashboard = lazy(() => import("./components/DoctorDashboard").then(m => ({ default: m.DoctorDashboard })));
const ConsultantDashboard = lazy(() => import("./components/ConsultantDashboard").then(m => ({ default: m.ConsultantDashboard })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const SystemAdminDashboard = lazy(() => import("./components/SystemAdminDashboard").then(m => ({ default: m.SystemAdminDashboard })));

const ROLE_SEO: Record<string, { title: string; description: string }> = {
  benhnhan: {
    title: "Bệnh nhân — Đặt lịch & theo dõi sức khỏe | MediCare AI",
    description: "Đặt lịch khám, tra cứu hồ sơ, nhắc tái khám và tư vấn AI 24/7 dành cho bệnh nhân.",
  },
  bacsi: {
    title: "Bác sĩ — Quản lý ca khám & hội chẩn AI | MediCare AI",
    description: "Hệ thống hỗ trợ bác sĩ phân loại ca chờ, hội chẩn online và ghi chú lâm sàng có AI gợi ý.",
  },
  tuvan: {
    title: "Tư vấn viên — Kết nối bệnh nhân & chuyên gia | MediCare AI",
    description: "Cổng tư vấn online, tìm chuyên gia phù hợp và quản lý phiên trao đổi với bệnh nhân.",
  },
  quanly: {
    title: "Quản trị — Vận hành phòng khám thông minh | MediCare AI",
    description: "Bảng điều khiển dành cho quản lý: doanh thu, lịch hệ thống, nhân sự và thông báo toàn hệ thống.",
  },
  admin: {
    title: "System Admin — Quản lý tài khoản | MediCare AI",
    description: "Quản trị viên hệ thống quản lý tài khoản người dùng và bảo mật.",
  },
};

export default function App() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(() => {
    // Try to get role from token if it exists (very simple check for this demo)
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role as Role;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setRole(null);
    navigate("/login");
  };

  const handleLogin = (newRole: Role) => {
    setRole(newRole);
    navigate(
      newRole === "benhnhan" ? "/patient" :
      newRole === "bacsi" ? "/doctor" :
      newRole === "tuvan" ? "/consultant" :
      newRole === "admin" ? "/system-admin" :
      "/admin"
    );
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    };
    window.addEventListener("app:unauthorized", handleUnauthorized);
    
    // Ping backend to wake up Render free tier on initial load
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    fetch(`${API_URL}/`).catch(() => {});
    
    // Ping AI service to wake it up
    const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8000";
    fetch(`${AI_URL}/`).catch(() => {});
    
    return () => window.removeEventListener("app:unauthorized", handleUnauthorized);
  }, []);

  return (
    <div className="size-full min-h-screen bg-slate-50">
      <SEO {...(role ? ROLE_SEO[role] : {})} />
      <Suspense fallback={<div className="size-full flex items-center justify-center text-slate-400 text-sm h-screen">Đang tải...</div>}>
        <Routes>
          {!role ? (
            <>
              <Route path="/login" element={<LoginScreen onLogin={handleLogin} onNavigateRegister={() => navigate("/register")} />} />
              <Route path="/register" element={<RegisterScreen onNavigateLogin={() => navigate("/login")} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              {role === "benhnhan" && <Route path="/patient/*" element={<PatientDashboard onLogout={handleLogout} role={role} />} />}
              {role === "bacsi" && <Route path="/doctor/*" element={<DoctorDashboard onLogout={handleLogout} role={role} />} />}
              {role === "tuvan" && <Route path="/consultant/*" element={<ConsultantDashboard onLogout={handleLogout} role={role} />} />}
              {role === "quanly" && <Route path="/admin/*" element={<AdminDashboard onLogout={handleLogout} role={role} />} />}
              {role === "admin" && <Route path="/system-admin/*" element={<SystemAdminDashboard onLogout={handleLogout} role={role} />} />}
              <Route path="*" element={<Navigate to={`/${role === 'benhnhan' ? 'patient' : role === 'bacsi' ? 'doctor' : role === 'tuvan' ? 'consultant' : role === 'admin' ? 'system-admin' : 'admin'}`} replace />} />
            </>
          )}
        </Routes>
      </Suspense>
      <Toaster position="top-right" richColors />
    </div>
  );
}
