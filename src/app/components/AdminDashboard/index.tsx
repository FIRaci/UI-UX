import { useState } from "react";
import { AppShell } from "../AppShell";
import { ChatView } from "../ChatView";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { LayoutDashboard, Users, BarChart3, Calendar, Bell, Briefcase, Bot, Settings, HelpCircle, LogOut } from "lucide-react";
import { Overview } from "./overview";
import { Reports } from "./reports";
import { PatientSection } from "./patient-section";
import { ScheduleSection } from "./schedule-section";
import { NotificationsPanel } from "./notifications";
import { DoctorShifts } from "./doctor-shifts";

export function AdminDashboard({ onLogout, role }: { onLogout: () => void; role: string }) {
  const [active, setActive] = useState("overview");

  useAppNavigate(
    ["overview", "patients", "reports", "schedule", "chat", "notify", "doctors"],
    setActive,
    { search: "patients", appointments: "schedule" }
  );

  return (
    <AppShell
      title="Hệ thống quản lý phòng khám"
      subtitle="Chào mừng trở lại, Quản trị viên"
      roleLabel="Quản lý"
      roleColor="bg-blue-100 text-blue-700 border border-blue-200"
      initials="QT"
      profile={{ name: "Trần Văn An", email: "quanly@medicare.ai", phone: "0123 456 789", position: "Quản lý phòng khám" }}
      active={active}
      onNav={setActive}
      onLogout={onLogout}
      nav={[
        { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
        { key: "patients", label: "Bệnh nhân", icon: Users },
        { key: "reports", label: "Báo cáo", icon: BarChart3 },
        { key: "schedule", label: "Lịch khám", icon: Calendar },
        { key: "doctors", label: "Lịch làm việc", icon: Briefcase },
        { key: "notify", label: "Thông báo", icon: Bell },
        { key: "chat", label: "Chat AI", icon: Bot },
      ]}
    >
      {active === "overview" && <Overview />}
      {active === "patients" && <PatientSection />}
      {active === "reports" && <Reports />}
      {active === "schedule" && <ScheduleSection />}
      {active === "doctors" && <DoctorShifts />}
      {active === "notify" && <NotificationsPanel />}
      {active === "chat" && <ChatView role={role} />}
    </AppShell>
  );
}
