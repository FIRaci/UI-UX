import { useState } from "react";
import {
  AlertCircle, BookOpen, Bot, BarChart2,
  FileText, ArrowUpRight, TrendingUp, TrendingDown,
  Clock, Flag, ExternalLink,
} from "lucide-react";
import { C, Card, Badge, Btn } from "./ExpertDashboardShared";

// ── Dữ liệu biểu đồ theo kỳ ──────────────────────────────────
const chartDataByPeriod = [
  // 1T
  [
    { week: "T1", recovery: 81, discharge: 70 },
    { week: "T2", recovery: 85, discharge: 74 },
    { week: "T3", recovery: 84, discharge: 73 },
    { week: "T4", recovery: 88, discharge: 79 },
  ],
  // 3T
  [
    { week: "Th1", recovery: 68, discharge: 52 },
    { week: "Th2", recovery: 72, discharge: 58 },
    { week: "Th3", recovery: 69, discharge: 55 },
    { week: "Th4", recovery: 78, discharge: 63 },
    { week: "Th5", recovery: 82, discharge: 70 },
    { week: "Th6", recovery: 79, discharge: 67 },
    { week: "Th7", recovery: 85, discharge: 74 },
    { week: "Th8", recovery: 88, discharge: 79 },
  ],
  // 6T
  [
    { week: "T1",  recovery: 58, discharge: 42 },
    { week: "T2",  recovery: 62, discharge: 46 },
    { week: "T3",  recovery: 65, discharge: 50 },
    { week: "T4",  recovery: 63, discharge: 48 },
    { week: "T5",  recovery: 68, discharge: 52 },
    { week: "T6",  recovery: 72, discharge: 58 },
    { week: "T7",  recovery: 69, discharge: 55 },
    { week: "T8",  recovery: 75, discharge: 61 },
    { week: "T9",  recovery: 79, discharge: 64 },
    { week: "T10", recovery: 82, discharge: 68 },
    { week: "T11", recovery: 85, discharge: 74 },
    { week: "T12", recovery: 88, discharge: 79 },
  ],
];

const emergencyRows = [
  { name: "James Harrington", tag: "NGUY KỊCH" as const, detail: "NMCT cấp — STEMI · ICU Phòng 3",        time: "2 phút" },
  { name: "Elena Vasquez",    tag: "NGUY KỊCH" as const, detail: "Sốc nhiễm khuẩn · Cấp cứu P.6",         time: "8 phút" },
  { name: "Robert Chen",      tag: "CAO"       as const, detail: "Suy hô hấp cấp · CCU",                   time: "15 phút" },
  { name: "Amara Okafor",     tag: "CAO"       as const, detail: "Cơn tăng huyết áp · Khoa 4B",            time: "22 phút" },
];

const knowledgeByTab = [
  [
    { name: "Phác đồ xử trí Nhiễm khuẩn huyết",    tag: "ICU",       updated: "T1/2024",  starred: true  },
    { name: "Phác đồ ACLS ngừng tim",               tag: "Tim mạch",  updated: "T3/2024",  starred: true  },
    { name: "Hướng dẫn cai máy thở",                tag: "ICU",       updated: "T12/2023", starred: false },
    { name: "Kiểm soát đau sau phẫu thuật",         tag: "Phẫu thuật",updated: "T2/2024",  starred: false },
    { name: "Dự phòng huyết khối tĩnh mạch sâu",   tag: "Phẫu thuật",updated: "T11/2023", starred: false },
  ],
  [
    { name: "Norepinephrine TM — liều & theo dõi",  tag: "ICU",       updated: "T1/2024",  starred: true  },
    { name: "Piperacillin-Tazobactam 4,5g TM",      tag: "Kháng sinh",updated: "T3/2024",  starred: true  },
    { name: "Heparin bolus 5.000 IU — STEMI",       tag: "Tim mạch",  updated: "T2/2024",  starred: true  },
    { name: "Ticagrelor 180mg liều tải",             tag: "Tim mạch",  updated: "T1/2024",  starred: false },
    { name: "Vancomycin TM — hướng dẫn liều",       tag: "Kháng sinh",updated: "T11/2023", starred: false },
  ],
  [
    { name: "Bộ Sepsis: Lactate, BC, CRP, PCT",     tag: "Xét nghiệm",updated: "T2/2024",  starred: true  },
    { name: "Bộ Troponin I/T — nhồi máu cơ tim",   tag: "Tim mạch",  updated: "T3/2024",  starred: true  },
    { name: "Khí máu động mạch (ABG) — giải đọc",  tag: "Hô hấp",    updated: "T1/2024",  starred: false },
    { name: "Bộ đông cầm máu toàn diện (PT/APTT)", tag: "Huyết học", updated: "T12/2023", starred: false },
    { name: "Cấy máu + kháng sinh đồ",              tag: "Vi sinh",   updated: "T2/2024",  starred: true  },
  ],
  [
    { name: "Hướng dẫn xử trí STEMI 2024",          tag: "Tim mạch",  updated: "T1/2024",  starred: true  },
    { name: "Surviving Sepsis Campaign 2023",        tag: "ICU",       updated: "T3/2024",  starred: true  },
    { name: "ACLS Guidelines 2023",                  tag: "Cấp cứu",   updated: "T1/2024",  starred: true  },
    { name: "Hướng dẫn an thần — giảm đau ICU",    tag: "ICU",       updated: "T12/2023", starred: false },
    { name: "Thông khí nhân tạo ARDS — giao thức", tag: "Hô hấp",    updated: "T2/2024",  starred: false },
  ],
];

const kpis = [
  { label: "Tỷ lệ hồi phục TB",     value: "79.4%", delta: "+5.2%", up: true  },
  { label: "Tỷ lệ tái nhập viện",   value: "10.9%", delta: "−3.1%", up: false },
  { label: "Nằm viện TB",           value: "4.8 ngày", delta: "−0.6", up: false },
  { label: "BN đang điều trị",      value: "247",   delta: "+12",    up: true  },
];

const flaggedItems = [
  { sev: "CAO",   text: "Khuyến cáo tương tác thuốc mâu thuẫn",              time: "12 phút" },
  { sev: "CAO",   text: "Gợi ý liều lượng bất thường — ca nhi khoa",          time: "34 phút" },
  { sev: "TB",    text: "Phản hồi phân loại chưa đầy đủ — thiếu sinh hiệu",  time: "1 giờ" },
  { sev: "THẤP",  text: "Phản hồi lạc chủ đề câu hỏi lâm sàng",             time: "2 giờ" },
];

function MiniLineChart({ data }: { data: any[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const VW = 560, VH = 148;
  const PAD = { l: 28, r: 14, t: 8, b: 22 };
  const PW = VW - PAD.l - PAD.r;
  const PH = VH - PAD.t - PAD.b;
  const MIN = 40, MAX = 100;
  const n = data.length;
  const sx = (i: number) => PAD.l + (n > 1 ? (i / (n - 1)) * PW : PW / 2);
  const sy = (v: number) => PAD.t + PH - ((v - MIN) / (MAX - MIN)) * PH;
  const pathOf = (key: "recovery" | "discharge") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i).toFixed(1)},${sy(d[key]).toFixed(1)}`).join(" ");
  const yTicks = [40, 55, 70, 85, 100];

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height={VH} style={{ display: "block" }} onMouseLeave={() => setHovered(null)}>
      {yTicks.map(v => (
        <line key={`g${v}`} x1={PAD.l} y1={sy(v)} x2={VW - PAD.r} y2={sy(v)} stroke="#E2E8F0" strokeWidth={0.8} />
      ))}
      {yTicks.map(v => (
        <text key={`yl${v}`} x={PAD.l - 4} y={sy(v) + 3.5} textAnchor="end" fontSize={9} fill="#94A3B8" fontFamily="Inter,sans-serif">{v}</text>
      ))}
      {data.map((d, i) => {
        if (n > 8 && i % 2 !== 0) return null;
        return (
          <text key={`xl${i}`} x={sx(i)} y={VH - 4} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="Inter,sans-serif">{d.week}</text>
        );
      })}
      <path d={pathOf("discharge")} fill="none" stroke={C.teal} strokeWidth={2} strokeDasharray="5 3" strokeLinejoin="round" strokeLinecap="round" />
      <path d={pathOf("recovery")} fill="none" stroke={C.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <line x1={VW - 128} y1={10} x2={VW - 116} y2={10} stroke={C.primary} strokeWidth={2.5} />
      <text x={VW - 112} y={14} fontSize={9} fill="#475569" fontFamily="Inter,sans-serif">Hồi phục</text>
      <line x1={VW - 62} y1={10} x2={VW - 50} y2={10} stroke={C.teal} strokeWidth={2} strokeDasharray="4 2" />
      <text x={VW - 46} y={14} fontSize={9} fill="#475569" fontFamily="Inter,sans-serif">Xuất viện</text>
      {data.map((d, i) => (
        <g key={`ha${i}`} onMouseEnter={() => setHovered(i)}>
          <rect x={sx(i) - PW / n / 2} y={PAD.t} width={PW / n} height={PH} fill="transparent" />
          {hovered === i && (
            <>
              <line x1={sx(i)} y1={PAD.t} x2={sx(i)} y2={PAD.t + PH} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="3 2" />
              <circle cx={sx(i)} cy={sy(d.recovery)} r={4} fill={C.primary} stroke="white" strokeWidth={1.5} />
              <circle cx={sx(i)} cy={sy(d.discharge)} r={3.5} fill={C.teal} stroke="white" strokeWidth={1.5} />
              <g transform={`translate(${Math.min(sx(i) + 8, VW - 96)},${Math.max(sy(d.recovery) - 42, PAD.t)})`}>
                <rect width={88} height={46} rx={5} fill="#0F172A" opacity={0.88} />
                <text x={7} y={13} fontSize={9} fill="#94A3B8" fontFamily="Inter,sans-serif">{d.week}</text>
                <circle cx={7} cy={24} r={3} fill={C.primary} />
                <text x={13} y={27} fontSize={9} fill="white" fontFamily="Inter,sans-serif">Hồi phục: {d.recovery}%</text>
                <circle cx={7} cy={36} r={3} fill={C.teal} />
                <text x={13} y={39} fontSize={9} fill="white" fontFamily="Inter,sans-serif">Xuất viện: {d.discharge}%</text>
              </g>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

export function ExpertAnalyticsView({ onNavigate }: { onNavigate: (view: "emergency" | "knowledge" | "aimgmt") => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState(0);
  const kbTabs = ["Gần đây", "Thuốc", "Xét nghiệm", "Hướng dẫn"];
  const kbItems = knowledgeByTab[activeTab];

  const sevColor = { CAO: C.critical, TB: C.warning, THẤP: C.text3 } as Record<string, string>;
  const sevBg    = { CAO: C.criticalLight, TB: C.warningLight, THẤP: C.bgSection } as Record<string, string>;
  const sevBorder = { CAO: C.criticalBorder, TB: C.warningBorder, THẤP: C.border } as Record<string, string>;

  return (
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 16, padding: 0, minHeight: 0, overflow: "hidden" }}>
      {/* 1. Emergency Card */}
      <Card style={{ transition: "all 0.25s" }} className="hover-lift">
        <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: C.criticalLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertCircle size={16} color={C.critical} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: C.font, fontSize: 13, fontWeight: 700, color: C.text1 }}>Cảnh báo khẩn cấp</div>
              <div style={{ fontFamily: C.font, fontSize: 11, color: C.text3 }}>Các ca bệnh đang cần xử lý khẩn cấp</div>
            </div>
          </div>
          <Badge variant="critical" style={{ animation: "pulse 1.5s infinite" }}>4 Chờ xử lý</Badge>
        </div>
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {emergencyRows.map((r, i) => {
            const isJames = r.name === "James Harrington";
            return (
              <div key={r.name} className={isJames ? "smooth-glow-alert" : ""} style={{
                padding: "11px 16px",
                borderBottom: i < emergencyRows.length - 1 ? `1px solid ${C.border}` : "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: isJames ? "rgba(239, 68, 68, 0.02)" : "transparent",
                transition: "all 0.25s"
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: r.tag === "NGUY KỊCH" ? C.critical : C.warning, flexShrink: 0, animation: r.tag === "NGUY KỊCH" ? "pulse 1s infinite" : "none" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                    <span style={{ fontFamily: C.font, fontSize: 13, fontWeight: 700, color: C.text1 }}>{r.name}</span>
                    <Badge variant={r.tag === "NGUY KỊCH" ? "critical" : "high"} style={{ fontSize: 10 }}>{r.tag}</Badge>
                  </div>
                  <div style={{ fontFamily: C.font, fontSize: 11, color: C.text2 }}>{r.detail}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Clock size={11} color={C.text3} />
                    <span style={{ fontFamily: C.font, fontSize: 11, color: C.text3 }}>{r.time}</span>
                  </div>
                  <Btn variant={isJames ? "primary" : "outline"} size="sm" onClick={() => onNavigate("emergency")}>
                    Hội chẩn {isJames && "ngay"}
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "9px 16px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: C.bgMuted, flexShrink: 0 }}>
          <span style={{ fontFamily: C.font, fontSize: 11, color: C.text3 }}>Vừa cập nhật</span>
          <button onClick={() => onNavigate("emergency")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <span style={{ fontFamily: C.font, fontSize: 11, fontWeight: 500, color: C.primary }}>Xem tất cả ca bệnh</span>
            <ArrowUpRight size={12} color={C.primary} />
          </button>
        </div>
      </Card>

      {/* 2. Knowledge Card */}
      <Card style={{ transition: "all 0.25s" }} className="hover-lift">
        <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={16} color={C.primary} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: C.font, fontSize: 13, fontWeight: 700, color: C.text1 }}>Tra cứu nhanh Tri thức</div>
              <div style={{ fontFamily: C.font, fontSize: 11, color: C.text3 }}>142 tài liệu có sẵn</div>
            </div>
          </div>
          <Btn variant="outline" size="sm" onClick={() => onNavigate("knowledge")}>Duyệt thư viện</Btn>
        </div>
        <div style={{ display: "flex", padding: "0 16px", borderBottom: `1px solid ${C.border}`, gap: 0, flexShrink: 0 }}>
          {kbTabs.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)} style={{
              padding: "9px 11px", fontSize: 11, fontWeight: 600,
              fontFamily: C.font, cursor: "pointer", background: "none", border: "none",
              borderBottom: activeTab === i ? `2.5px solid ${C.primary}` : "2.5px solid transparent",
              color: activeTab === i ? C.primary : C.text3,
              transition: "all 0.2s ease", whiteSpace: "nowrap",
            }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {kbItems.map((p, i) => (
            <div key={p.name} style={{ padding: "10px 16px", borderBottom: i < kbItems.length - 1 ? `1px solid ${C.border}` : "none", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: C.bgSection, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileText size={16} color={C.text2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: C.font, fontSize: 12, fontWeight: 600, color: C.text1, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Badge variant="blue" style={{ fontSize: 10 }}>{p.tag}</Badge>
                  <span style={{ fontFamily: C.font, fontSize: 10, color: C.text3 }}>Cập nhật {p.updated}</span>
                  {p.starred && <span style={{ color: "#F59E0B", fontSize: 12 }}>★</span>}
                </div>
              </div>
              <ExternalLink size={13} color={C.text3} style={{ flexShrink: 0, cursor: "pointer" }} onClick={() => onNavigate("knowledge")} />
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Analytics Card */}
      <Card style={{ transition: "all 0.25s" }} className="hover-lift">
        <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart2 size={16} color="#7C3AED" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: C.font, fontSize: 13, fontWeight: 700, color: C.text1 }}>Phân tích lâm sàng</div>
              <div style={{ fontFamily: C.font, fontSize: 11, color: C.text3 }}>Tỷ lệ hồi phục & xuất viện bệnh nhân</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["1T", "3T", "6T"].map((p, i) => (
              <button key={p} onClick={() => setPeriod(i)} style={{
                padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                fontFamily: C.font, cursor: "pointer", border: "none",
                backgroundColor: period === i ? C.primary : C.bgSection,
                color: period === i ? "#fff" : C.text2,
                transition: "all 0.2s ease"
              }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {kpis.map(({ label, value, delta, up }, i) => (
            <div key={label} style={{ padding: "10px 14px", borderRight: i < 3 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontFamily: C.font, fontSize: 10, color: C.text3, marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: C.font, fontSize: 18, fontWeight: 700, color: C.text1, lineHeight: 1.1, marginBottom: 3 }}>{value}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {up ? <TrendingUp size={11} color={C.successDark} /> : <TrendingDown size={11} color={C.critical} />}
                <span style={{ fontFamily: C.font, fontSize: 10, fontWeight: 600, color: up ? C.successDark : C.critical }}>{delta}</span>
                <span style={{ fontFamily: C.font, fontSize: 10, color: C.text3 }}>so với trước</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 8px 4px", flexShrink: 0 }}>
          <MiniLineChart data={chartDataByPeriod[period]} />
        </div>
      </Card>

      {/* 4. AI Chatbot Card */}
      <Card style={{ transition: "all 0.25s" }} className="hover-lift">
        <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={16} color="#10B981" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: C.font, fontSize: 13, fontWeight: 700, color: C.text1 }}>Trạng thái Chatbot AI</div>
              <div style={{ fontFamily: C.font, fontSize: 11, color: C.text3 }}>MedAssist GPT-4o · v3.2.1</div>
            </div>
          </div>
          <Badge variant="success">Trực tuyến</Badge>
        </div>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ fontFamily: C.font, fontSize: 10, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Hiệu suất — 24 giờ qua</div>
          {[
            { label: "Độ chính xác phản hồi", pct: 94, val: "94%",  color: C.primary },
            { label: "Thời gian phản hồi TB", pct: 26, val: "1,3 giây", color: C.teal },
            { label: "Tỷ lệ chuyển cấp",     pct: 9,  val: "9%",   color: C.warning },
          ].map(({ label, pct, val, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: C.font, fontSize: 11, color: C.text2, width: 140, flexShrink: 0 }}>{label}</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: C.bgSection, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, backgroundColor: color }} />
              </div>
              <span style={{ fontFamily: C.font, fontSize: 11, fontWeight: 600, color: C.text1, width: 55, textAlign: "right" }}>{val}</span>
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 8 }}>
            {[{ label: "Phiên", val: "1.284" }, { label: "Đã xử lý", val: "1.173" }, { label: "Chuyển cấp", val: "111" }].map(({ label, val }) => (
              <div key={label} style={{ textAlign: "center", padding: "8px", borderRadius: 8, backgroundColor: C.bgSection, border: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: C.font, fontSize: 16, fontWeight: 700, color: C.text1 }}>{val}</div>
                <div style={{ fontFamily: C.font, fontSize: 10, color: C.text3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "8px 16px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Flag size={12} color={C.warning} />
            <span style={{ fontFamily: C.font, fontSize: 10, fontWeight: 600, color: C.text2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Gắn cờ cần xem xét</span>
          </div>
          <Badge variant="warning" style={{ fontSize: 10 }}>4 ca chờ</Badge>
        </div>
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {flaggedItems.map((f) => (
            <div key={f.text} style={{ padding: "8px 16px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: "2px 7px", borderRadius: 5, backgroundColor: sevBg[f.sev] || C.bgSection, border: `1px solid ${sevBorder[f.sev] || C.border}`, flexShrink: 0 }}>
                <span style={{ fontFamily: C.font, fontSize: 10, fontWeight: 700, color: sevColor[f.sev] || C.text3 }}>{f.sev}</span>
              </div>
              <span style={{ fontFamily: C.font, fontSize: 11, color: C.text2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.text}</span>
              <span style={{ fontFamily: C.font, fontSize: 10, color: C.text3, flexShrink: 0 }}>{f.time}</span>
              <Btn variant="ghost" size="sm" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => onNavigate("aimgmt")}>Xem xét</Btn>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
