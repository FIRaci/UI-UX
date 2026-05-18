import { useState, useEffect } from "react";
import {
  ArrowLeft, Activity, Users, ShieldAlert,
  Mic, Send, RotateCw, ZoomIn, ZoomOut, Scissors, Edit3, Settings, Play, CheckCircle2,
} from "lucide-react";
import { C, Card, Badge, Btn } from "./ExpertDashboardShared";
import { toast } from "sonner";

export function ExpertEmergencyView({ onBack }: { onBack: () => void }) {
  const [viewMode, setViewMode] = useState<"axial" | "sagittal" | "coronal" | "3d">("3d");
  const [zoom, setZoom] = useState(1.5);
  const [rotate, setRotate] = useState(30);
  const [isMicActive, setIsMicActive] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [isInterventionActive, setIsInterventionActive] = useState(false);
  
  // Heart rate animation
  const [currentHr, setCurrentHr] = useState(112);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHr(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next > 125 ? 120 : next < 105 ? 110 : next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    toast.success(`Đã nhận lệnh AI: "${cmd}"`);
    if (cmd.toLowerCase().includes("zoom")) {
      setZoom(prev => Math.min(prev + 0.3, 3));
    } else if (cmd.toLowerCase().includes("xoay") || cmd.toLowerCase().includes("rotate")) {
      setRotate(prev => (prev + 45) % 360);
    } else if (cmd.toLowerCase().includes("đánh dấu") || cmd.toLowerCase().includes("mark")) {
      toast.info("Đã khoanh vùng tổn thương mạch vành");
    }
    setCommandInput("");
  };

  const handleMicToggle = () => {
    if (!isMicActive) {
      setIsMicActive(true);
      toast.info("Đang lắng nghe khẩu lệnh của chuyên gia...");
      setTimeout(() => {
        setIsMicActive(false);
        const cmds = ["Xoay mô hình sang trái", "Phóng to vùng hẹp động mạch", "Đánh dấu vị trí tắc nghẽn"];
        const randomCmd = cmds[Math.floor(Math.random() * cmds.length)];
        setCommandInput(randomCmd);
        toast.success(`Khẩu lệnh nhận diện: "${randomCmd}"`);
      }, 3000);
    } else {
      setIsMicActive(false);
    }
  };

  const approvePlan = () => {
    toast.success("PHÊ DUYỆT PHÁC ĐỒ THÀNH CÔNG!", {
      description: "Hệ thống đã đồng bộ kế hoạch can thiệp STEMI khẩn cấp xuống phòng thông tim (Cathlab).",
      duration: 5000,
    });
  };

  const triggerIntervention = () => {
    setIsInterventionActive(true);
    toast.error("BÁO ĐỘNG ĐỎ: ĐÃ KÍCH HOẠT QUY TRÌNH CAN THIỆP KHẨN CẤP!", {
      description: "Đội ngũ can thiệp mạch vành Cathlab đã được điều động ngay lập tức.",
      duration: 7000,
    });
  };

  // Generate Heart Rate ECG path
  const ecgPath = "M0,25 L15,25 L25,25 L30,10 L35,40 L40,25 L45,25 L55,25 L65,15 L70,30 L75,25 L90,25 L105,25 L115,25 L120,5 L125,45 L130,25 L135,25 L145,25 L155,15 L160,30 L165,25 L180,25 L195,25 L205,25 L210,12 L215,38 L220,25 L225,25 L235,25 L245,15 L250,30 L255,25 L270,25 L285,25 L295,25 L300,8 L305,42 L310,25 L315,25 L325,25 L335,15 L340,30 L345,25 L360,25";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
      {/* Red Pulse Alert Overlay if Intervention Active */}
      {isInterventionActive && (
        <div style={{
          position: "absolute", inset: 0, border: "4px solid #EF4444", borderRadius: 12,
          pointerEvents: "none", animation: "pulse 1.5s infinite", zIndex: 99
        }} />
      )}
      
      {/* Top Patient Header */}
      <div style={{
        padding: "12px 20px", backgroundColor: C.bgCard, borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Btn variant="secondary" onClick={onBack} style={{ padding: "6px 8px" }}><ArrowLeft size={16} /> Quay lại</Btn>
          <div style={{ width: 1, height: 24, backgroundColor: C.border }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: C.font, fontSize: 16, fontWeight: 700, color: C.text1 }}>James Harrington</span>
              <Badge variant="critical" style={{ animation: "pulse 2s infinite" }}>NGUY KỊCH</Badge>
              <Badge variant="teal">NMCT cấp — STEMI</Badge>
            </div>
            <div style={{ fontFamily: C.font, fontSize: 11, color: C.text3, marginTop: 2 }}>ID: PT-84920 • Tuổi: 62 • Giới tính: Nam • Phòng: Cấp cứu P.3</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Countdown Hour */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 8, backgroundColor: C.criticalLight, border: `1px solid ${C.criticalBorder}` }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.critical, display: "inline-block" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: C.mono, fontSize: 13, fontWeight: 700, color: C.criticalDark, letterSpacing: 0.5 }}>00 : 47 : 33</div>
              <div style={{ fontSize: 8, color: C.critical, fontWeight: 600, textTransform: "uppercase" }}>GIỜ VÀNG LÂM SÀNG</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, backgroundColor: C.successLight, border: `1px solid ${C.successBorder}` }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: C.success, display: "inline-block", animation: "pulse 1s infinite" }} />
            <span style={{ fontFamily: C.font, fontSize: 11, fontWeight: 700, color: C.successDark }}>HỘI CHẨN VIDEO TRỰC TUYẾN</span>
          </div>

          <button style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backgroundColor: "#fff" }}>
            <Settings size={16} color={C.text2} />
          </button>
        </div>
      </div>

      {/* Main Split Content */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, padding: 16, minHeight: 0, overflow: "hidden" }}>
        
        {/* Left Side: Medical Viewer and Command Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
          <Card className="hover-lift" style={{ flex: 1, position: "relative", backgroundColor: "#090E17", borderColor: "#1E293B", overflow: "hidden", transition: "all 0.25s" }}>
            
            {/* View Mode Selectors */}
            <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 4, zIndex: 10, backgroundColor: "rgba(15, 23, 42, 0.75)", padding: 3, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(4px)" }}>
              {(["axial", "sagittal", "coronal", "3d"] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{
                  padding: "5px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                  fontFamily: C.font, cursor: "pointer", border: "none", textTransform: "uppercase",
                  backgroundColor: viewMode === mode ? C.primary : "transparent",
                  color: viewMode === mode ? "#fff" : "rgba(255,255,255,0.6)",
                  transition: "all 0.15s"
                }}>
                  {mode === "3d" ? "3D Model" : mode}
                </button>
              ))}
            </div>

            {/* View Settings Overlay */}
            <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 4, zIndex: 10, textAlign: "right" }}>
              <span style={{ fontSize: 9, fontFamily: C.mono, color: "rgba(255,255,255,0.4)" }}>SLICE: 84 / 120</span>
              <span style={{ fontSize: 9, fontFamily: C.mono, color: "rgba(255,255,255,0.4)" }}>WINDOW: Angio W:1500 L:450</span>
              <span style={{ fontSize: 9, fontFamily: C.mono, color: "rgba(255,255,255,0.4)" }}>ZOOM: {zoom.toFixed(1)}x</span>
            </div>

            {/* Main Medical Image Viewport */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              
              {/* SVG 3D Model representing Heart & Blocked Coronary Artery */}
              <svg viewBox="0 0 400 300" width="90%" height="90%" style={{
                transform: `rotate(${rotate}deg) scale(${zoom})`,
                transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.2))"
              }}>
                {/* Outlined heart muscle */}
                <path d="M200,60 C130,30 80,100 80,160 C80,230 150,270 200,280 C250,270 320,230 320,160 C320,100 270,30 200,60 Z"
                  fill="none" stroke="rgba(239, 68, 68, 0.2)" strokeWidth={3} strokeDasharray="3 3" />
                
                <path d="M200,70 C145,45 95,110 95,160 C95,220 160,255 200,265 C240,255 305,220 305,160 C305,110 255,45 200,70 Z"
                  fill="rgba(239, 68, 68, 0.05)" stroke="rgba(239, 68, 68, 0.4)" strokeWidth={1.5} />
                
                {/* Main Aorta structure */}
                <path d="M190,40 L190,90 M210,40 L210,90" stroke="rgba(59, 130, 246, 0.7)" strokeWidth={12} strokeLinecap="round" />
                <path d="M185,50 C185,25 215,25 215,50" fill="none" stroke="rgba(59, 130, 246, 0.7)" strokeWidth={12} />
                
                {/* Coronary Arteries */}
                {/* Left Coronary Artery branch */}
                <path d="M205,90 Q225,120 240,160 T270,220" fill="none" stroke="#EF4444" strokeWidth={5} strokeLinecap="round" />
                
                {/* Right Coronary Artery branch with Blockage (STEMI) */}
                <path d="M195,90 Q170,120 155,150 T130,225" fill="none" stroke="#EF4444" strokeWidth={5} strokeLinecap="round" />
                
                {/* Blockage Point: bright yellow/black narrowing */}
                <circle cx={163} cy={135} r={7} fill="#F59E0B" />
                <circle cx={163} cy={135} r={3} fill="#000" />
                
                {/* Glow alert for STEMI stenosis */}
                <circle cx={163} cy={135} r={16} fill="none" stroke="#EF4444" strokeWidth={1.5}>
                  <animate attributeName="r" values="8;20;8" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
                </circle>

                {/* Callout Indicator text */}
                <g transform="translate(40, 120)">
                  <rect width={105} height={26} rx={5} fill="rgba(15, 23, 42, 0.85)" stroke="#EF4444" strokeWidth={1} />
                  <text x={8} y={17} fontSize={8} fill="#fff" fontFamily={C.font} fontWeight={700}>TẮC ĐỘNG MẠCH VÀNH</text>
                  <line x1={105} y1={13} x2={120} y2={15} stroke="#EF4444" strokeWidth={1} />
                </g>
              </svg>
            </div>

            {/* Interactive Adjustment Buttons */}
            <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 10, backgroundColor: "rgba(15, 23, 42, 0.8)", padding: 4, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(4px)" }}>
              <Btn variant="ghost" size="sm" onClick={() => setRotate(r => (r - 45) % 360)} style={{ color: "#fff", padding: "4px 8px" }}>
                <RotateCw size={12} style={{ transform: "scaleX(-1)" }} /> Rot L
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => setRotate(r => (r + 45) % 360)} style={{ color: "#fff", padding: "4px 8px" }}>
                <RotateCw size={12} /> Rot R
              </Btn>
              <div style={{ width: 1, height: 16, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center" }} />
              <Btn variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(z + 0.2, 3))} style={{ color: "#fff", padding: "4px 8px" }}>
                <ZoomIn size={12} /> Zoom+
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(z - 0.2, 0.8))} style={{ color: "#fff", padding: "4px 8px" }}>
                <ZoomOut size={12} /> Zoom-
              </Btn>
              <div style={{ width: 1, height: 16, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center" }} />
              <Btn variant="ghost" size="sm" onClick={() => toast.info("Đã mở lát cắt động động mạch vành")} style={{ color: "#fff", padding: "4px 8px" }}>
                <Scissors size={12} /> X-Sect
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => toast.success("Kích hoạt chế độ đo đạc và đánh dấu thương tổn")} style={{ color: "#fff", padding: "4px 8px" }}>
                <Edit3 size={12} /> Annot
              </Btn>
            </div>
          </Card>

          {/* Voice Command Input Panel */}
          <Card className="hover-lift" style={{ padding: 12, backgroundColor: "#0F172A", borderColor: "#1E293B", transition: "all 0.25s" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={handleMicToggle}
                className={isMicActive ? "pulse-red-glow-btn" : "pulse-blue-glow-btn"}
                style={{
                  width: 40, height: 40, borderRadius: 10, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: isMicActive ? C.critical : "rgba(59, 130, 246, 0.15)",
                  color: isMicActive ? "#fff" : C.primary,
                  transition: "all 0.2s"
                }}
              >
                <Mic size={18} />
              </button>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  type="text"
                  placeholder="Nói hoặc nhập khẩu lệnh AI... (e.g. 'Phóng to vùng hẹp', 'Xoay trái 45 độ')"
                  value={commandInput}
                  onChange={e => setCommandInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCommand(commandInput)}
                  style={{
                    width: "100%", height: 38, paddingLeft: 12, paddingRight: 40,
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                    fontSize: 12, fontFamily: C.font, color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.04)", outline: "none",
                  }}
                />
                <button
                  onClick={() => handleCommand(commandInput)}
                  style={{
                    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", display: "flex",
                    color: C.primary
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
            
            {/* Command Suggestions */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: C.font }}>Gợi ý nhanh:</span>
              {[
                { label: "Phóng to", cmd: "Zoom in" },
                { label: "Xoay trái", cmd: "Rotate left 45 degrees" },
                { label: "Đánh dấu tổn thương", cmd: "Mark clinical stenosis region" },
              ].map(sug => (
                <button key={sug.label} onClick={() => setCommandInput(sug.cmd)} style={{
                  padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 500,
                  fontFamily: C.font, cursor: "pointer", border: "none",
                  backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)",
                  transition: "background 0.15s"
                }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"}>
                  {sug.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: EMR Details, Team, Vitals and Action Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", overflowY: "auto" }}>
          
          {/* Patient Vitals and ECG */}
          <Card className="hover-lift" style={{ padding: 14, transition: "all 0.25s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 10 }}>
              <Activity size={14} color={C.critical} />
              <span style={{ fontFamily: C.font, fontSize: 12, fontWeight: 700, color: C.text1 }}>Sinh hiệu & Chỉ số sinh học</span>
            </div>
            
            {/* Vitals Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div style={{ padding: 8, borderRadius: 8, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.text3, fontFamily: C.font }}>Tần số tim (HR)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.critical, fontFamily: C.mono, display: "flex", alignItems: "baseline", gap: 3, marginTop: 2 }}>
                  {currentHr} <span style={{ fontSize: 10, fontWeight: 500, color: C.text2 }}>bpm</span>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.critical, display: "inline-block", animation: "pulse 0.6s infinite", marginLeft: 4 }} />
                </div>
              </div>
              
              <div style={{ padding: 8, borderRadius: 8, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.text3, fontFamily: C.font }}>Huyết áp (BP)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text1, fontFamily: C.mono, marginTop: 2 }}>
                  160/100 <span style={{ fontSize: 10, fontWeight: 500, color: C.text2 }}>mmHg</span>
                </div>
              </div>

              <div style={{ padding: 8, borderRadius: 8, backgroundColor: C.warningLight, border: `1px solid ${C.warningBorder}` }}>
                <div style={{ fontSize: 9, color: C.warningDark, fontFamily: C.font }}>Độ bão hòa Oxy (SpO2)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.warningDark, fontFamily: C.mono, marginTop: 2 }}>
                  94% <span style={{ fontSize: 9, fontWeight: 600, color: C.warningDark }}>Cần thở oxy</span>
                </div>
              </div>

              <div style={{ padding: 8, borderRadius: 8, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.text3, fontFamily: C.font }}>Điểm hôn mê (GCS)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text1, fontFamily: C.mono, marginTop: 2 }}>
                  14 <span style={{ fontSize: 10, fontWeight: 500, color: C.text2 }}>/ 15</span>
                </div>
              </div>
            </div>

            {/* ECG Heart Rate Line Chart */}
            <div style={{ padding: "8px 6px", borderRadius: 8, backgroundColor: "#090E17", border: "1px solid #1E293B", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, padding: "0 4px" }}>
                <span style={{ fontSize: 8, fontFamily: C.mono, color: C.success }}>EKG - LEAD II</span>
                <span style={{ fontSize: 8, fontFamily: C.mono, color: "rgba(255,255,255,0.4)" }}>25 mm/s · 10 mm/mV</span>
              </div>
              <svg viewBox="0 0 360 50" width="100%" height={32} style={{ display: "block" }}>
                <path d={ecgPath} fill="none" stroke="#10B981" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Card>

          {/* Consultation Team */}
          <Card className="hover-lift" style={{ padding: 14, transition: "all 0.25s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8 }}>
              <Users size={14} color={C.primary} />
              <span style={{ fontFamily: C.font, fontSize: 12, fontWeight: 700, color: C.text1 }}>Đoàn hội chẩn từ xa</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { name: "BS. Nguyễn Văn An", role: "Trưởng ca can thiệp", status: "Live", bg: C.successLight, text: C.successDark, border: C.successBorder },
                { name: "Bs. S. Mitchell", role: "Chuyên gia Hồi sức tích cực", status: "Live", bg: C.successLight, text: C.successDark, border: C.successBorder },
                { name: "CV. Đỗ Thanh Hằng", role: "Điều phối hỗ trợ", status: "Live", bg: C.successLight, text: C.successDark, border: C.successBorder },
              ].map(member => (
                <div key={member.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", borderRadius: 8, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text1 }}>{member.name}</div>
                    <div style={{ fontSize: 9, color: C.text3 }}>{member.role}</div>
                  </div>
                  <span style={{
                    fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    backgroundColor: member.bg, color: member.text, border: `1px solid ${member.border}`
                  }}>{member.status}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Proposed Treatment Plan */}
          <Card className="hover-lift" style={{ padding: 14, transition: "all 0.25s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8 }}>
              <ShieldAlert size={14} color={C.warningDark} />
              <span style={{ fontFamily: C.font, fontSize: 12, fontWeight: 700, color: C.text1 }}>Đề xuất phác đồ can thiệp nhanh</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {[
                { step: "1", title: "Heparin bolus 5.000 IU", desc: "Chống đông máu tức thì trong STEMI", dose: "5.000 IU (Bolus tĩnh mạch)" },
                { step: "2", title: "Ticagrelor 180mg", desc: "Liều tải kháng tiểu cầu kép khẩn cấp", dose: "180mg (Uống ngay)" },
                { step: "3", title: "Chuẩn bị can thiệp mạch vành (PCI)", desc: "Thông tim khẩn cấp giải áp động mạch vành", dose: "Dưới 90 phút" },
              ].map(plan => (
                <div key={plan.step} style={{ display: "flex", gap: 8, padding: "8px 10px", borderRadius: 8, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", backgroundColor: C.primaryLight,
                    color: C.primary, fontSize: 10, fontWeight: 700, display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1
                  }}>{plan.step}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.text1 }}>{plan.title}</div>
                    <div style={{ fontSize: 9, color: C.text3, marginTop: 2 }}>{plan.desc}</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: C.primary, marginTop: 1 }}>{plan.dose}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn onClick={approvePlan} style={{ height: 38, justifyContent: "center", fontWeight: 700, fontSize: 12, boxShadow: "0 4px 10px rgba(59, 130, 246, 0.25)" }}>
                <CheckCircle2 size={15} /> PHÊ DUYỆT PHÁC ĐỒ
              </Btn>
              
              <button
                onClick={triggerIntervention}
                className="btn-glow-danger pulse-red-glow-btn"
                style={{
                  height: 38, borderRadius: 8, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontFamily: C.font, fontWeight: 700, fontSize: 12,
                  color: "#fff",
                  transition: "all 0.2s"
                }}
              >
                <Play size={14} fill="#fff" /> BÁO ĐỘNG ĐỎ PCI KHẨN CẤP
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
