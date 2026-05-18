import { lazy, Suspense, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { LoginScreen, type Role } from "./components/LoginScreen";
import { Chatbot } from "./components/Chatbot";
import { SEO } from "./components/SEO";

const PatientDashboard = lazy(() => import("./components/PatientDashboard").then(m => ({ default: m.PatientDashboard })));
const DoctorDashboard = lazy(() => import("./components/DoctorDashboard").then(m => ({ default: m.DoctorDashboard })));
const ExpertDashboard = lazy(() => import("./components/ExpertDashboard").then(m => ({ default: m.ExpertDashboard })));
const ConsultantDashboard = lazy(() => import("./components/ConsultantDashboard").then(m => ({ default: m.ConsultantDashboard })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then(m => ({ default: m.AdminDashboard })));

const ROLE_SEO: Record<string, { title: string; description: string }> = {
  benhnhan: {
    title: "Bệnh nhân — Đặt lịch & theo dõi sức khỏe | MediCare AI",
    description: "Đặt lịch khám, tra cứu hồ sơ, nhắc tái khám và tư vấn AI 24/7 dành cho bệnh nhân.",
  },
  bacsi: {
    title: "Bác sĩ — Quản lý ca khám & hội chẩn AI | MediCare AI",
    description: "Hệ thống hỗ trợ bác sĩ phân loại ca chờ, hội chẩn online và ghi chú lâm sàng có AI gợi ý.",
  },
  chuyengia: {
    title: "Chuyên gia — Hội chẩn & Nghiên cứu y khoa | MediCare AI",
    description: "Trung tâm hội chẩn chuyên gia, ca bệnh phức tạp và nghiên cứu y khoa ứng dụng AI.",
  },
  tuvan: {
    title: "Tư vấn viên — Kết nối bệnh nhân & chuyên gia | MediCare AI",
    description: "Cổng tư vấn online, tìm chuyên gia phù hợp và quản lý phiên trao đổi với bệnh nhân.",
  },
  quanly: {
    title: "Quản trị — Vận hành phòng khám thông minh | MediCare AI",
    description: "Bảng điều khiển dành cho quản lý: doanh thu, lịch hệ thống, nhân sự và thông báo toàn hệ thống.",
  },
};

export default function App() {
  const [role, setRole] = useState<Role | null>(null);

  const handleLogout = () => setRole(null);

  return (
    <div className="size-full min-h-screen bg-slate-50">
      <SEO {...(role ? ROLE_SEO[role] : {})} />
      {!role && <LoginScreen onLogin={setRole} />}
      <Suspense fallback={<div className="size-full flex items-center justify-center text-slate-400 text-sm">Đang tải...</div>}>
        {role === "benhnhan" && <PatientDashboard onLogout={handleLogout} />}
        {role === "bacsi" && <DoctorDashboard onLogout={handleLogout} />}
        {role === "chuyengia" && <ExpertDashboard onLogout={handleLogout} />}
        {role === "tuvan" && <ConsultantDashboard onLogout={handleLogout} />}
        {role === "quanly" && <AdminDashboard onLogout={handleLogout} />}
      </Suspense>
      {role && <Chatbot role={role} />}
      <Toaster position="top-right" richColors />
    </div>
  );
}
