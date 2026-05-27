import { useState } from "react";
import { AppShell } from "../AppShell";
import { ChatView } from "../ChatView";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { LayoutDashboard, Users, BarChart3, Calendar, Bell, Briefcase, Bot } from "lucide-react";
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
      title="Bảng quản trị phòng khám"
      subtitle="Chào quản trị viên Vũ Hồng Mai"
      roleLabel="Quản lý"
      roleColor="bg-rose-100 text-rose-700 border border-rose-200"
      initials="HM"
      active={active}
      onNav={setActive}
      onLogout={onLogout}
      nav={[
        { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
        { key: "patients", label: "Quản lý bệnh nhân", icon: Users },
        { key: "reports", label: "Báo cáo & thống kê", icon: BarChart3 },
        { key: "schedule", label: "Lịch khám hệ thống", icon: Calendar },
        { key: "chat", label: "Chat AI", icon: Bot },
        { key: "notify", label: "Thông báo", icon: Bell },
        { key: "doctors", label: "Lịch làm việc BS", icon: Briefcase },
      ]}
    >
      {active === "chat" && <ChatView role={role} />}
      {active === "overview" && <Overview />}
      {active === "patients" && <PatientSection />}
      {active === "reports" && <Reports />}
      {active === "schedule" && <ScheduleSection />}
      {active === "notify" && <NotificationsPanel />}
      {active === "doctors" && <DoctorShifts />}
    </AppShell>
  );
}
