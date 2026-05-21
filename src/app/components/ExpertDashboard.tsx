import { useEffect, useState } from "react";
import {
  AlertCircle, BookOpen, Bot, LayoutDashboard
} from "lucide-react";
import { AppShell } from "./AppShell";
import { ExpertAnalyticsView } from "./ExpertAnalyticsView";
import { ExpertEmergencyView } from "./ExpertEmergencyView";
import { ExpertKnowledgeView } from "./ExpertKnowledgeView";
import { ExpertAIView } from "./ExpertAIView";

export function ExpertDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeView, setActiveView] = useState<"emergency" | "knowledge" | "aimgmt" | "analytics">("analytics");
  const [selectedPatient, setSelectedPatient] = useState("all");

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const raw = (e as CustomEvent<string>).detail;
      if (!raw) return;
      let view = raw;
      try { const p = JSON.parse(raw); if (p.view) view = p.view; } catch {}
      const validViews: Record<string, "emergency" | "knowledge" | "aimgmt" | "analytics"> = {
        analytics: "analytics", emergency: "emergency", knowledge: "knowledge",
        aimgmt: "aimgmt",
      };
      if (validViews[view]) setActiveView(validViews[view]);
    };
    window.addEventListener("app:navigate", handleNavigate);
    return () => window.removeEventListener("app:navigate", handleNavigate);
  }, []);

  const navItems = [
    { key: "analytics", label: "Phân tích lâm sàng", icon: LayoutDashboard },
    { key: "emergency", label: "Hội chẩn cấp cứu", icon: AlertCircle },
    { key: "knowledge", label: "So khớp phác đồ (SOP)", icon: BookOpen },
    { key: "aimgmt", label: "Quản lý kịch bản AI", icon: Bot },
  ];

  const getTitleInfo = () => {
    switch (activeView) {
      case "analytics":
        return {
          title: "Phân tích lâm sàng",
          subtitle: "Chào buổi sáng, Bs. Mitchell • Chăm sóc tích cực & ICU",
        };
      case "emergency":
        return {
          title: "Hội chẩn cấp cứu khẩn cấp",
          subtitle: "Phòng điều trị khẩn cấp PCI & Can thiệp mạch",
        };
      case "knowledge":
        return {
          title: "So khớp phác đồ (SOP)",
          subtitle: "Kiểm tra sự khác biệt với chuẩn phác đồ SOP Y văn của Bộ Y tế",
        };
      case "aimgmt":
        return {
          title: "Quản lý kịch bản AI",
          subtitle: "Cấu hình luồng tư vấn tự động cho Chatbot tư vấn",
        };
    }
  };

  const { title, subtitle } = getTitleInfo();

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      roleLabel="Chuyên gia"
      roleColor="bg-rose-100 text-rose-700 border border-rose-200"
      initials="SM"
      active={activeView}
      onNav={(key) => setActiveView(key as any)}
      onLogout={onLogout}
      nav={navItems}
    >
      <div style={{ height: "calc(100vh - 112px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeView === "analytics" && (
          <ExpertAnalyticsView onNavigate={(view, pName) => {
            if (pName) setSelectedPatient(pName);
            setActiveView(view);
          }} />
        )}

        {activeView === "emergency" && (
          <ExpertEmergencyView
            selectedPatientName={selectedPatient}
            onSelectPatientName={setSelectedPatient}
            onBack={() => setActiveView("analytics")}
          />
        )}

        {activeView === "knowledge" && (
          <ExpertKnowledgeView />
        )}

        {activeView === "aimgmt" && (
          <ExpertAIView />
        )}
      </div>
    </AppShell>
  );
}
