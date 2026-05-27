import { useState, useEffect } from "react";
import { AppShell } from "../AppShell";
import { ChatView } from "../ChatView";
import { HeuristicView } from "./heuristic-view";
import { PainPointForm } from "./pain-point-form";
import { SUSView } from "./sus-view";
import {
  MonitorCheck,
  AlertTriangle,
  FileText,
  Bot,
  ScrollText,
  LayoutDashboard,
} from "lucide-react";

export function ExpertDashboard({
  onLogout,
  role,
}: {
  onLogout: () => void;
  role: string;
}) {
  const [view, setView] = useState("heuristics");

  useEffect(() => {
    const NAV_KEYS = new Set(["heuristics", "painpoints", "sus", "chat", "logs"]);
    const handleNav = (e: CustomEvent<string>) => {
      if (NAV_KEYS.has(e.detail)) setView(e.detail);
    };
    window.addEventListener("app:navigate", handleNav);
    return () => window.removeEventListener("app:navigate", handleNav);
  }, []);

  return (
    <AppShell
      title="Trung tâm Kiểm thử UI/UX"
      subtitle="Quản lý và đánh giá trải nghiệm người dùng"
      roleLabel="Chuyên gia"
      roleColor="pink"
      initials="CG"
      onLogout={onLogout}
      nav={[
        { key: "heuristics", label: "Đánh giá Heuristic", icon: MonitorCheck },
        { key: "painpoints", label: "Ghi nhận Pain Points", icon: AlertTriangle },
        { key: "sus", label: "Khảo sát SUS", icon: FileText },
        { key: "chat", label: "Chat AI", icon: Bot },
        { key: "logs", label: "User Flow Logs", icon: ScrollText },
      ]}
      active={view}
      onNav={setView}
    >
      <div className="p-8 max-w-6xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Bảng điều khiển Kiểm thử UI/UX
          </h1>
          <p className="text-slate-500">
            Khu vực dành cho Chuyên gia đánh giá tính khả dụng, trải nghiệm
            người dùng và tiêu chuẩn thiết kế.
          </p>
        </div>

        {view === "heuristics" && <HeuristicView />}
        {view === "painpoints" && <PainPointForm />}
        {view === "sus" && <SUSView />}
        {view === "chat" && <ChatView role={role} />}
        {view === "logs" && (
          <div className="text-center py-12 text-slate-400">
            <LayoutDashboard className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Module User Flow Logs đang được thu thập dữ liệu...</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
