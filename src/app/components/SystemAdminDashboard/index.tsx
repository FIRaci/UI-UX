import { useState } from "react";
import { AppShell } from "../AppShell";
import { Users } from "lucide-react";
import { AccountsManager } from "../AdminDashboard/accounts";

export function SystemAdminDashboard({ onLogout, role }: { onLogout: () => void; role: string }) {
  const [active, setActive] = useState("accounts");

  return (
    <AppShell
      title="Hệ thống Quản trị Tài khoản"
      subtitle="Dành cho Quản trị viên Hệ thống (System Admin)"
      roleLabel="Quản trị"
      roleColor="bg-slate-800 text-white border border-slate-700"
      initials="AD"
      profile={{ name: "System Admin", email: "admin@medicare.ai", phone: "N/A", position: "Quản trị viên Hệ thống" }}
      active={active}
      onNav={setActive}
      onLogout={onLogout}
      nav={[
        { key: "accounts", label: "Quản lý Tài khoản", icon: Users },
      ]}
    >
      {active === "accounts" && <AccountsManager />}
    </AppShell>
  );
}
