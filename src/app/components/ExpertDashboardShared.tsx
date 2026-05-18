import React from "react";
import { Link, useLocation } from "react-router";
import {
  AlertTriangle, BookOpen, Bot, LayoutDashboard,
  Settings, LogOut, Bell, ChevronDown,
} from "lucide-react";

// ── Design Tokens ────────────────────────────────────────────
export const C = {
  sidebar:        "#0C1A35",
  sidebarItem:    "rgba(255,255,255,0.07)",
  sidebarActive:  "#3B82F6",
  sidebarText:    "rgba(255,255,255,0.55)",
  sidebarTextAct: "#FFFFFF",
  sidebarBorder:  "rgba(255,255,255,0.08)",

  primary:       "#3B82F6",
  primaryDark:   "#2563EB",
  primaryLight:  "#EFF6FF",
  primaryBorder: "#BFDBFE",

  teal:           "#0891B2",
  tealLight:      "#E0F2FE",

  critical:       "#EF4444",
  criticalDark:   "#DC2626",
  criticalLight:  "#FEF2F2",
  criticalBorder: "#FECACA",

  warning:        "#F59E0B",
  warningLight:   "#FFFBEB",
  warningBorder:  "#FDE68A",
  warningDark:    "#D97706",

  success:        "#22C55E",
  successDark:    "#16A34A",
  successLight:   "#F0FDF4",
  successBorder:  "#86EFAC",

  bgPage:      "#F0F4F8",
  bgCard:      "#FFFFFF",
  bgNav:       "#FFFFFF",
  bgMuted:     "#F8FAFC",
  bgSection:   "#F1F5F9",

  text1:  "#0F172A",
  text2:  "#475569",
  text3:  "#94A3B8",
  text4:  "#CBD5E1",

  border:     "#E2E8F0",
  borderDark: "#CBD5E1",

  shadowCard:   "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
  shadowHover:  "0 4px 16px rgba(0,0,0,0.10)",
  shadowInset:  "inset 0 1px 2px rgba(0,0,0,0.06)",
  font:         "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono:         "'JetBrains Mono', 'Fira Mono', monospace",
};

// ── Shared Sidebar ───────────────────────────────────────────
const NAV = [
  { label: "Cấp cứu",  desc: "EMR",  Icon: AlertTriangle,   path: "/emergency",   badge: 4 },
  { label: "Tri thức",  desc: "KB",   Icon: BookOpen,        path: "/sop-approval", badge: null },
  { label: "Quản lý AI", desc: "AI",  Icon: Bot,             path: "/ai-scenarios", badge: null },
  { label: "Phân tích", desc: "DASH", Icon: LayoutDashboard, path: "/",             badge: null },
];

export function SharedSidebar() {
  const { pathname } = useLocation();

  return (
    <div style={{
      width: 72, height: "100vh", flexShrink: 0,
      background: `linear-gradient(180deg, ${C.sidebar} 0%, #0F2244 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "14px 0 12px",
    }}>
      <GlobalStyle />
      {/* Logo */}
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: "linear-gradient(135deg, #3B82F6, #2563EB)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20, boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 18, color: "#fff", fontWeight: 800, fontFamily: C.font, lineHeight: 1 }}>✚</span>
      </div>

      {/* Nav items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", padding: "0 8px" }}>
        {NAV.map(({ label, Icon, path, badge }) => {
          const active = pathname === path;
          return (
            <div key={path} style={{ position: "relative" }}>
              <Link to={path} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 4, padding: "8px 4px", borderRadius: 10, cursor: "pointer",
                  backgroundColor: active ? C.sidebarActive : "transparent",
                  transition: "background 0.15s",
                }}>
                  <Icon
                    size={18}
                    color={active ? "#fff" : C.sidebarText}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span style={{
                    fontFamily: C.font, fontSize: 9, fontWeight: active ? 600 : 400,
                    color: active ? "#fff" : C.sidebarText, letterSpacing: "0.02em",
                    lineHeight: 1,
                  }}>
                    {label}
                  </span>
                </div>
              </Link>
              {badge !== null && badge !== undefined && (
                <div style={{
                  position: "absolute", top: 4, right: 4,
                  width: 16, height: 16, borderRadius: "50%",
                  backgroundColor: C.critical, border: "1.5px solid #0C1A35",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, fontWeight: 700, color: "#fff", fontFamily: C.font,
                }}>
                  {badge}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ width: "60%", height: 1, backgroundColor: C.sidebarBorder, marginBottom: 8 }} />

      {/* Bottom icons */}
      {[Settings, LogOut].map((Icon, i) => (
        <div key={i} style={{
          width: 36, height: 36, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", marginBottom: 4,
        }}>
          <Icon size={16} color={C.sidebarText} />
        </div>
      ))}

      {/* User avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: "linear-gradient(135deg, #64748B, #475569)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: C.font,
        marginTop: 6, flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.15)",
      }}>
        SM
      </div>
    </div>
  );
}

// ── Common Components ────────────────────────────────────────

export function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{
      backgroundColor: C.bgCard, borderRadius: 14,
      boxShadow: C.shadowCard, border: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", height: "100%",
      overflow: "hidden", ...style,
    }}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = "default", style }: {
  children: React.ReactNode;
  variant?: "default"|"critical"|"high"|"success"|"warning"|"blue"|"teal"|"outline";
  style?: React.CSSProperties;
}) {
  const variants = {
    default:  { bg: C.bgSection,    color: C.text2,        border: C.border },
    critical: { bg: C.criticalLight, color: C.criticalDark, border: C.criticalBorder },
    high:     { bg: C.warningLight,  color: C.warningDark,  border: C.warningBorder },
    success:  { bg: C.successLight,  color: C.successDark,  border: C.successBorder },
    warning:  { bg: C.warningLight,  color: C.warningDark,  border: C.warningBorder },
    blue:     { bg: C.primaryLight,  color: C.primaryDark,  border: C.primaryBorder },
    teal:     { bg: C.tealLight,     color: C.teal,         border: "#A5F3FC" },
    outline:  { bg: "transparent",   color: C.text2,        border: C.borderDark },
  };
  const v = variants[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
      fontFamily: C.font, backgroundColor: v.bg, color: v.color,
      border: `1px solid ${v.border}`, whiteSpace: "nowrap", ...style,
    }}>
      {children}
    </span>
  );
}

export function Btn({ children, variant = "primary", size = "md", onClick, style }: {
  children: React.ReactNode;
  variant?: "primary"|"secondary"|"danger"|"success"|"ghost"|"outline";
  size?: "sm"|"md"|"lg";
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const classNames = {
    primary: "btn-glow-primary",
    secondary: "btn-glow-secondary",
    danger: "btn-glow-danger",
    success: "btn-glow-success",
    ghost: "",
    outline: "btn-glow-outline",
  };
  
  const variants = {
    primary:   { bg: C.primary,    color: "#fff",    border: C.primary,    hover: C.primaryDark },
    secondary: { bg: C.bgSection,  color: C.text2,   border: C.border,     hover: C.border },
    danger:    { bg: C.critical,   color: "#fff",    border: C.critical,   hover: C.criticalDark },
    success:   { bg: C.successDark, color: "#fff",   border: C.successDark, hover: "#15803D" },
    ghost:     { bg: "transparent", color: C.text2,  border: "transparent", hover: C.bgSection },
    outline:   { bg: "transparent", color: C.primary, border: C.primary,   hover: C.primaryLight },
  };
  const sizes = {
    sm: { padding: "4px 10px", fontSize: 11 },
    md: { padding: "6px 14px", fontSize: 12 },
    lg: { padding: "10px 20px", fontSize: 13 },
  };
  const v = variants[variant];
  const s = sizes[size];
  return (
    <button onClick={onClick} className={classNames[variant]} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: s.padding, borderRadius: 8, fontSize: s.fontSize,
      fontWeight: 600, fontFamily: C.font, backgroundColor: v.bg,
      color: v.color, border: `1px solid ${v.border}`,
      cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", whiteSpace: "nowrap",
      outline: "none", ...style,
    }}>
      {children}
    </button>
  );
}

export function SearchInput({ placeholder }: { placeholder?: string }) {
  return (
    <div style={{
      flex: 1, maxWidth: 500, position: "relative", display: "flex", alignItems: "center",
    }}>
      <div style={{
        position: "absolute", left: 12, color: C.text3, display: "flex", pointerEvents: "none",
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <input
        readOnly
        placeholder={placeholder || "Search patients, protocols, diagnoses..."}
        style={{
          width: "100%", height: 36, paddingLeft: 36, paddingRight: 12,
          border: `1.5px solid ${C.border}`, borderRadius: 10,
          fontSize: 13, fontFamily: C.font, color: C.text2,
          backgroundColor: C.bgMuted, outline: "none",
          transition: "border 0.15s",
        }}
      />
      <div style={{
        position: "absolute", right: 10,
        background: C.bgSection, border: `1px solid ${C.border}`,
        borderRadius: 5, padding: "2px 6px",
        fontSize: 10, color: C.text3, fontFamily: C.font, fontWeight: 500,
      }}>⌘K</div>
    </div>
  );
}

export function TopNav({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      height: 60, backgroundColor: C.bgNav, borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", padding: "0 20px", gap: 14,
      flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...style,
    }}>
      {children}
    </div>
  );
}

export function GlobalStyle() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes pulse-glow-red {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
        70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }
      @keyframes pulse-glow-blue {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
      @keyframes pulse-glow-green {
        0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
        70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
        100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
      }
      @keyframes pulse-border-red {
        0%, 100% { border-color: rgba(239, 68, 68, 0.8); box-shadow: 0 0 8px rgba(239, 68, 68, 0.3); }
        50% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 0px rgba(239, 68, 68, 0); }
      }
      @keyframes heart-beat-pulse {
        0% { transform: scale(1); }
        14% { transform: scale(1.08); }
        28% { transform: scale(1); }
        42% { transform: scale(1.08); }
        70% { transform: scale(1); }
      }
      
      .hover-lift {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .hover-lift:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 12px 24px rgba(12, 26, 53, 0.08) !important;
      }
      
      .btn-glow-primary {
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%) !important;
        border: none !important;
        box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3) !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .btn-glow-primary:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45) !important;
        filter: brightness(1.05) !important;
      }
      .btn-glow-primary:active {
        transform: translateY(1px) !important;
      }
      
      .btn-glow-danger {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%) !important;
        border: none !important;
        box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35) !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .btn-glow-danger:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5) !important;
        filter: brightness(1.05) !important;
      }
      .btn-glow-danger:active {
        transform: translateY(1px) !important;
      }

      .btn-glow-success {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
        border: none !important;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3) !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .btn-glow-success:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45) !important;
        filter: brightness(1.05) !important;
      }
      .btn-glow-success:active {
        transform: translateY(1px) !important;
      }

      .btn-glow-outline {
        border: 1.5px solid #3B82F6 !important;
        color: #3B82F6 !important;
        background: transparent !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .btn-glow-outline:hover {
        transform: translateY(-2px) !important;
        background: rgba(59, 130, 246, 0.06) !important;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
      }
      .btn-glow-outline:active {
        transform: translateY(1px) !important;
      }

      .btn-glow-secondary {
        border: 1.5px solid #E2E8F0 !important;
        color: #475569 !important;
        background: #F8FAFC !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .btn-glow-secondary:hover {
        transform: translateY(-2px) !important;
        background: #F1F5F9 !important;
        box-shadow: 0 4px 12px rgba(148, 163, 184, 0.12) !important;
      }
      .btn-glow-secondary:active {
        transform: translateY(1px) !important;
      }

      .glass-panel {
        background: rgba(255, 255, 255, 0.85) !important;
        backdrop-filter: blur(8px) !important;
        border: 1px solid rgba(255, 255, 255, 0.5) !important;
      }

      .smooth-glow-alert {
        animation: pulse-border-red 2s infinite !important;
      }

      .heart-beat-effect {
        animation: heart-beat-pulse 1.2s infinite ease-in-out !important;
      }

      .interactive-node {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .interactive-node:hover {
        transform: translateY(-2.5px) scale(1.025) !important;
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2) !important;
        border-color: #3B82F6 !important;
      }

      .pulse-red-glow-btn {
        animation: pulse-glow-red 2s infinite !important;
      }
      .pulse-blue-glow-btn {
        animation: pulse-glow-blue 2.5s infinite !important;
      }
      .pulse-green-glow-btn {
        animation: pulse-glow-green 2s infinite !important;
      }
    ` }} />
  );
}