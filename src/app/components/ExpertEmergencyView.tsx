import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Activity, Users, ShieldAlert,
  Mic, Send, RotateCw, RotateCcw, ZoomIn, ZoomOut, Scissors, Edit3, Settings, Play, CheckCircle2,
  Clock, ArrowRight
} from "lucide-react";
import { C, Card, Badge, Btn } from "./ExpertDashboardShared";
import { toast } from "sonner";

const PATIENTS: Record<string, {
  name: string;
  age: number;
  gender: string;
  id: string;
  room: string;
  tag: "NGUY KỊCH" | "CAO";
  diagnosis: string;
  countdown: string;
  vitals: {
    hr: number;
    bp: string;
    spo2: number;
    rr: number;
  };
  ekgWave: string;
  team: { role: string; name: string; status: string }[];
  pacsStenosis: Record<string, { title: string; desc: string; sx: number; sy: number }>;
  audioLog: { speaker: string; text: string; time: string }[];
  treatmentPlan: { step: string; title: string; desc: string; dose: string; details?: string }[];
}> = {
  "James Harrington": {
    name: "James Harrington",
    age: 62,
    gender: "Nam",
    id: "PT-84920",
    room: "Cấp cứu P.3",
    tag: "NGUY KỊCH",
    diagnosis: "NMCT cấp — STEMI",
    countdown: "00 : 47 : 33",
    vitals: { hr: 112, bp: "85/50", spo2: 89, rr: 24 },
    ekgWave: "M0,25 L15,25 L25,25 L30,10 L35,40 L40,25 L45,25 L55,25 L65,15 L70,30 L75,25 L90,25 L105,25 L115,25 L120,5 L125,45 L130,25 L135,25 L145,25 L155,15 L160,30 L165,25 L180,25 L195,25 L205,25 L210,12 L215,38 L220,25 L225,25 L235,25 L245,15 L250,30 L255,25 L270,25 L285,25 L295,25 L300,8 L305,42 L310,25 L315,25 L325,25 L335,15 L340,30 L345,25 L360,25",
    team: [
      { role: "Bs. Chính", name: "Bs. Nguyễn Tiến Dũng", status: "Cathlab Sẵn sàng" },
      { role: "Điều dưỡng", name: "ĐD. Phạm Thị Thủy", status: "ICU On-call" },
      { role: "Can thiệp", name: "Dr. Jonathan Vance", status: "Cathlab Sẵn sàng" }
    ],
    pacsStenosis: {
      axial: { title: "LAD STENOSIS: 92%", desc: "LAD coronary narrowing", sx: -22, sy: -22 },
      sagittal: { title: "RCA STENOSIS: 85%", desc: "RCA blockage region", sx: -30, sy: 6 },
      coronal: { title: "LCX STENOSIS: 90%", desc: "Circumflex stenosis area", sx: -18, sy: 14 }
    },
    audioLog: [
      { speaker: "AI Assist", text: "Phát hiện nhịp nhanh thất kịch phát và ST chênh lên V1-V4.", time: "10:14" },
      { speaker: "Bs. Dũng", text: "Bệnh nhân bắt đầu thở oxy mask 6L/phút. Đã bolus Heparin 5000 UI.", time: "10:15" },
      { speaker: "Dr. Vance", text: "Chuẩn bị Cathlab phòng 2. Sẵn sàng thông tim can thiệp dưới 90 phút.", time: "10:16" }
    ],
    treatmentPlan: [
      { step: "1", title: "Heparin bolus 5.000 IU", desc: "Chống đông máu tức thì trong STEMI", dose: "5.000 IU (Bolus tĩnh mạch)", details: "Đường dùng: Tĩnh mạch chậm • Chống chỉ định: Nghi ngờ xuất huyết nội sọ, xuất huyết tiêu hóa tiến triển • Theo dõi: APTT, tiểu cầu tránh HIT." },
      { step: "2", title: "Ticagrelor 180mg", desc: "Liều tải kháng tiểu cầu kép khẩn cấp", dose: "180mg (Uống ngay)", details: "Đường dùng: Uống trực tiếp (nghiền nát nếu khó nuốt) • Kết hợp: Aspirin 81-325mg • Lưu ý: Có thể gây khó thở thoáng qua." },
      { step: "3", title: "Chuẩn bị can thiệp mạch vành (PCI)", desc: "Thông tim khẩn cấp giải áp động mạch vành", dose: "Dưới 90 phút", details: "Thời gian cửa-bóng < 90 phút • Chuẩn bị vùng bẹn/cổ tay quay • Sẵn sàng máy khử rung tim bên giường bệnh phòng ngừa loạn nhịp tái tưới máu." }
    ]
  },
  "Elena Vasquez": {
    name: "Elena Vasquez",
    age: 45,
    gender: "Nữ",
    id: "PT-77291",
    room: "Cấp cứu P.6",
    tag: "NGUY KỊCH",
    diagnosis: "Sốc nhiễm khuẩn (Septic Shock)",
    countdown: "00 : 12 : 05",
    vitals: { hr: 124, bp: "75/40", spo2: 91, rr: 28 },
    ekgWave: "M0,25 L10,25 L15,10 L20,40 L25,25 L35,25 L40,12 L45,38 L50,25 L60,25 L65,8 L70,42 L75,25 L85,25 L90,15 L95,30 L100,25 L110,25 L115,10 L120,40 L125,25 L135,25 L140,12 L145,38 L150,25 L160,25 L165,8 L170,42 L175,25 L185,25 L190,15 L195,30 L200,25 L210,25 L215,10 L220,40 L225,25 L235,25 L240,12 L245,38 L250,25 L260,25 L265,8 L270,42 L275,25 L285,25 L290,15 L295,30 L300,25 L310,25 L315,10 L320,40 L325,25 L335,25 L340,12 L345,38 L350,25 L360,25",
    team: [
      { role: "Bs. Chính", name: "Bs. Trần Quang Huy", status: "ICU Sẵn sàng" },
      { role: "Điều dưỡng", name: "ĐD. Lê Văn Nam", status: "ICU Đang túc trực" },
      { role: "Hồi sức", name: "Dr. Sarah Jenkins", status: "On-call" }
    ],
    pacsStenosis: {
      axial: { title: "SEPSIS SOURCE", desc: "Pulmonary infiltration left lung", sx: 45, sy: 8 },
      sagittal: { title: "INFILTRATION", desc: "Severe pleural effusion", sx: 0, sy: 0 },
      coronal: { title: "LUNG CONSOLIDATION", desc: "Left lower lobe pneumonia", sx: 50, sy: 0 }
    },
    audioLog: [
      { speaker: "AI Assist", text: "Cảnh báo qSOFA = 3 điểm. Khuyến nghị cấy máu ngay và bolus dịch truyền tĩnh mạch.", time: "10:08" },
      { speaker: "Bs. Huy", text: "Đã lấy máu 2 mẫu cấy khuẩn. Bắt đầu truyền Levophed duy trì HA tâm thu > 90.", time: "10:10" }
    ],
    treatmentPlan: [
      { step: "1", title: "Cấy máu & Kháng sinh phổ rộng", desc: "Truyền kháng sinh IV hoạt phổ rộng khẩn", dose: "Trong 60 phút đầu", details: "Mẫu cấy: 2 vị trí khác nhau trước liều kháng sinh • Kháng sinh: Carbapenem hoặc Piperacillin/Tazobactam IV khẩn." },
      { step: "2", title: "Bolus dịch truyền tĩnh mạch", desc: "Truyền 30 ml/kg dung dịch tinh thể đẳng trương", dose: "Dưới 3 giờ", details: "Dịch truyền: Lactated Ringer hoặc NaCl 0.9% truyền nhanh • Mục tiêu: Đạt áp lực tĩnh mạch trung tâm CVP hoặc cải thiện tưới máu." },
      { step: "3", title: "Bắt đầu vận mạch Levophed", desc: "Duy trì HA trung bình (MAP) >= 65 mmHg", dose: "Theo dõi liên tục", details: "Đường dùng: Catheter tĩnh mạch trung tâm • Tốc độ: Khởi đầu 0.05 mcg/kg/phút chỉnh liều mỗi 5 phút • Giám sát biến chứng loạn nhịp." }
    ]
  },
  "Robert Chen": {
    name: "Robert Chen",
    age: 71,
    gender: "Nam",
    id: "PT-90124",
    room: "Hồi sức CCU",
    tag: "CAO",
    diagnosis: "Suy hô hấp cấp (ARDS)",
    countdown: "01 : 15 : 20",
    vitals: { hr: 98, bp: "115/70", spo2: 84, rr: 26 },
    ekgWave: "M0,25 L20,25 L25,12 L30,38 L35,25 L50,25 L55,5 L60,45 L65,25 L80,25 L85,15 L90,30 L95,25 L110,25 L115,12 L120,38 L125,25 L140,25 L145,5 L150,45 L155,25 L170,25 L175,15 L180,30 L185,25 L200,25 L205,12 L210,38 L215,25 L230,25 L235,5 L240,45 L245,25 L260,25 L265,15 L270,30 L275,25 L290,25 L295,12 L300,38 L305,25 L320,25 L325,5 L330,45 L335,25 L350,25 L355,15 L360,25",
    team: [
      { role: "Bs. Chính", name: "Bs. Hoàng Kim Chi", status: "Hô hấp Sẵn sàng" },
      { role: "Hỗ trợ", name: "Bs. Vũ Minh Đức", status: "Nội trú CCU" }
    ],
    pacsStenosis: {
      axial: { title: "ARDS SEVERE", desc: "Diffuse bilateral ground-glass opacities", sx: -45, sy: 8 },
      sagittal: { title: "AORTIC ARCH", desc: "Mild calcification no stenosis", sx: 0, sy: 0 },
      coronal: { title: "BILATERAL EDEMA", desc: "Bilateral alveolar consolidation", sx: -50, sy: 0 }
    },
    audioLog: [
      { speaker: "AI Assist", text: "Chỉ số PaO2/FiO2 < 150. Khuyến nghị thông khí bảo vệ phổi và dùng giãn cơ.", time: "09:45" },
      { speaker: "Bs. Chi", text: "Bệnh nhân đã được đặt nội khí quản thành công, chế độ P-A/C, PEEP 12.", time: "09:50" }
    ],
    treatmentPlan: [
      { step: "1", title: "Thông khí bảo vệ phổi (LTV)", desc: "Cài đặt FiO2 tối ưu, Vt 6ml/kg PBW lý tưởng", dose: "Hỗ trợ thở máy ARDS", details: "Thể tích lưu thông: Vt 6 ml/kg trọng lượng lý tưởng • Áp lực cao nguyên (Pplat) < 30 cmH2O • An thần giãn cơ tránh chống máy." },
      { step: "2", title: "Thiết lập mức PEEP cao", desc: "PEEP từ 12-14 cmH2O giúp huy động phế nang", dose: "Theo sát khí máu động mạch", details: "Mục đích: Chống xẹp phế nang vùng phụ thuộc • Theo dõi huyết động tránh tụt huyết áp do tăng áp lực lồng ngực." },
      { step: "3", title: "Nằm sấp chủ động (Prone)", desc: "Cải thiện oxy hóa máu nếu PaO2/FiO2 < 150", dose: "12-16 giờ/ngày", details: "Thời gian: Ít nhất 12-16 tiếng mỗi ngày • Theo dõi: Tránh tuột ống nội khí quản, loét tỳ đè vùng mặt ngực." }
    ]
  },
  "Amara Okafor": {
    name: "Amara Okafor",
    age: 58,
    gender: "Nữ",
    id: "PT-32890",
    room: "Nội Tim mạch 4B",
    tag: "CAO",
    diagnosis: "Cơn tăng huyết áp (Hypertensive Crisis)",
    countdown: "01 : 45 : 10",
    vitals: { hr: 92, bp: "195/115", spo2: 97, rr: 20 },
    ekgWave: "M0,25 L25,25 L30,12 L35,38 L40,25 L60,25 L65,5 L70,45 L75,25 L95,25 L100,15 L105,30 L110,25 L130,25 L135,12 L140,38 L145,25 L165,25 L170,5 L175,45 L180,25 L200,25 L205,15 L210,30 L215,25 L235,25 L240,12 L245,38 L250,25 L270,25 L275,5 L280,45 L285,25 L305,25 L310,15 L315,30 L320,25 L340,25 L345,12 L350,38 L355,25 Q360,25 360,25",
    team: [
      { role: "Bs. Chính", name: "Bs. Phạm Minh Anh", status: "Điều trị Sẵn sàng" },
      { role: "Điều dưỡng", name: "ĐD. Ngô Quốc Trung", status: "Túc trực 4B" }
    ],
    pacsStenosis: {
      axial: { title: "HYPERTROPHY", desc: "Left ventricular wall thickness hypertrophy", sx: -10, sy: -12 },
      sagittal: { title: "AORTA FLAP", desc: "No aortic dissection detected", sx: 0, sy: 0 },
      coronal: { title: "HEART DRIFT", desc: "Mild cardiomegaly detected", sx: 0, sy: 0 }
    },
    audioLog: [
      { speaker: "AI Assist", text: "Huyết áp > 180/110. Khuyến nghị truyền tĩnh mạch Nicardipine để hạ HA từ từ.", time: "09:30" },
      { speaker: "Bs. Anh", text: "Đã bắt đầu truyền Nicardipine 5mg/h. Theo dõi HA xâm lấn liên tục mỗi 5 phút.", time: "09:35" }
    ],
    treatmentPlan: [
      { step: "1", title: "Truyền tĩnh mạch Nicardipine", desc: "Bắt đầu liều tải 5mg/h điều chỉnh dần", dose: "Truyền bơm tiêm điện", details: "Tốc độ truyền: Bắt đầu 5mg/giờ, tăng dần 2.5mg/giờ mỗi 15 phút đến khi đạt huyết áp mục tiêu (Tối đa 15mg/giờ)." },
      { step: "2", title: "Hạ huyết áp kiểm soát", desc: "Giảm áp lực động mạch trung bình tối đa 25% trong 1h", dose: "Tránh hạ quá nhanh gây thiếu máu", details: "Mục tiêu: Giảm tối đa 25% trong giờ đầu, sau đó duy trì mức 160/100-110 mmHg trong 2-6 giờ tiếp theo." },
      { step: "3", title: "Theo dõi huyết áp xâm lấn", desc: "Đặt catheter động mạch quay đo huyết áp liên tục", dose: "Chuẩn bị dụng cụ", details: "Mục đích: Đo huyết áp liên tục từng giây (Beat-to-Beat) • Chuẩn bị dụng cụ đặt catheter động mạch quay vô khuẩn." }
    ]
  }
};

function MedicalScanCanvas({
  patientName,
  mode,
  zoom,
  rotate,
}: {
  patientName?: string;
  mode: "axial" | "sagittal" | "coronal";
  zoom: number;
  rotate: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pulseState, setPulseState] = useState(true);

  // Animate the stenosis pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseState(p => !p);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = "#090E17";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw coordinate grids
    ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
    ctx.lineWidth = 0.5;
    const gridSize = 25;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Save and transform
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const cx = 0;
    const cy = 0;

    // Get current patient's stenosis details
    const patient = PATIENTS[patientName || "James Harrington"] || PATIENTS["James Harrington"];
    const stenosisInfo = patient.pacsStenosis[mode];

    // Drawing helper for the pulsing blockage
    const drawStenosis = (c: CanvasRenderingContext2D, sx: number, sy: number, pulse: boolean) => {
      const grad = c.createRadialGradient(sx, sy, 2, sx, sy, pulse ? 16 : 10);
      grad.addColorStop(0, "rgba(239, 68, 68, 1)");
      grad.addColorStop(0.3, "rgba(239, 68, 68, 0.5)");
      grad.addColorStop(1, "rgba(239, 68, 68, 0)");
      c.fillStyle = grad;
      c.beginPath();
      c.arc(sx, sy, pulse ? 16 : 10, 0, 2 * Math.PI);
      c.fill();

      c.fillStyle = "#F59E0B";
      c.beginPath();
      c.arc(sx, sy, 3, 0, 2 * Math.PI);
      c.fill();
    };

    // Helper to draw annotation callouts
    const drawAnnotation = (
      c: CanvasRenderingContext2D,
      sx: number,
      sy: number,
      title: string,
      desc: string,
      z: number,
      r: number
    ) => {
      c.restore(); // Exit trans/scaling to draw screen-space crisp annotations
      c.save();

      // Transformed coordinates of the stenosis to screen space
      const rad = (r * Math.PI) / 180;
      const rx = sx * Math.cos(rad) - sy * Math.sin(rad);
      const ry = sx * Math.sin(rad) + sy * Math.cos(rad);
      const tx = canvas.width / 2 + rx * z;
      const ty = canvas.height / 2 + ry * z;

      // Draw callout line
      c.strokeStyle = "#EF4444";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(tx, ty);
      c.lineTo(tx + 40, ty - 40);
      c.lineTo(tx + 130, ty - 40);
      c.stroke();

      // Callout box background
      c.fillStyle = "rgba(15, 23, 42, 0.85)";
      c.fillRect(tx + 45, ty - 56, 95, 26);
      c.strokeStyle = "#EF4444";
      c.strokeRect(tx + 45, ty - 56, 95, 26);

      // Text labels
      c.fillStyle = "#FFF";
      c.font = "bold 8px 'Inter', sans-serif";
      c.fillText(title, tx + 50, ty - 46);
      c.fillStyle = "#94A3B8";
      c.font = "7px sans-serif";
      c.fillText(desc, tx + 50, ty - 35);

      // Dynamic red pointer circle
      c.strokeStyle = "#EF4444";
      c.lineWidth = 1;
      c.setLineDash([2, 2]);
      c.beginPath();
      c.arc(tx, ty, 8, 0, 2 * Math.PI);
      c.stroke();
      c.setLineDash([]);
    };

    if (mode === "axial") {
      // Body chest contour
      ctx.beginPath();
      ctx.ellipse(cx, cy, 120, 85, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(71, 85, 105, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Spine
      ctx.beginPath();
      ctx.arc(cx, cy + 60, 12, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(148, 163, 184, 0.25)";
      ctx.fill();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
      ctx.stroke();

      // Spinal canal
      ctx.beginPath();
      ctx.arc(cx, cy + 60, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();

      // Lungs lobes (dark chambers)
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
      ctx.lineWidth = 1.5;
      // Left
      ctx.beginPath();
      ctx.ellipse(cx - 45, cy + 8, 35, 50, Math.PI / 12, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      // Right
      ctx.beginPath();
      ctx.ellipse(cx + 45, cy + 8, 35, 50, -Math.PI / 12, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Heart
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy - 12, 40, 30, -Math.PI / 8, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(239, 68, 68, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Coronary LAD branch
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 20);
      ctx.bezierCurveTo(cx - 15, cy - 30, cx - 28, cy - 20, cx - 32, cy - 8);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();

      const sx_loc = cx + stenosisInfo.sx;
      const sy_loc = cy + stenosisInfo.sy;
      drawStenosis(ctx, sx_loc, sy_loc, pulseState);
      drawAnnotation(ctx, sx_loc, sy_loc, stenosisInfo.title, stenosisInfo.desc, zoom, rotate);

    } else if (mode === "sagittal") {
      // Body sagittal contour
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy - 80);
      ctx.bezierCurveTo(cx - 20, cy - 80, cx - 15, cy - 40, cx - 25, cy + 40);
      ctx.bezierCurveTo(cx - 35, cy + 65, cx - 70, cy + 80, cx - 100, cy + 80);
      ctx.strokeStyle = "rgba(71, 85, 105, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Spine
      ctx.beginPath();
      ctx.moveTo(cx + 45, cy - 80);
      ctx.lineTo(cx + 45, cy + 80);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 14;
      ctx.stroke();

      // Lungs
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 35, 65, Math.PI / 18, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Heart
      ctx.beginPath();
      ctx.ellipse(cx - 15, cy + 8, 32, 24, Math.PI / 6, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(239, 68, 68, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Coronary branch
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 8);
      ctx.quadraticCurveTo(cx - 35, cy + 8, cx - 28, cy + 20);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();

      const sx_loc = cx + stenosisInfo.sx;
      const sy_loc = cy + stenosisInfo.sy;
      drawStenosis(ctx, sx_loc, sy_loc, pulseState);
      drawAnnotation(ctx, sx_loc, sy_loc, stenosisInfo.title, stenosisInfo.desc, zoom, rotate);

    } else if (mode === "coronal") {
      // Rib contour
      ctx.beginPath();
      ctx.ellipse(cx, cy, 100, 90, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(71, 85, 105, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Spine
      ctx.beginPath();
      ctx.moveTo(cx, cy - 90);
      ctx.lineTo(cx, cy + 90);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
      ctx.lineWidth = 10;
      ctx.stroke();

      // Lungs left / right
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
      ctx.lineWidth = 1.5;
      // Left
      ctx.beginPath();
      ctx.ellipse(cx - 40, cy, 32, 60, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      // Right
      ctx.beginPath();
      ctx.ellipse(cx + 40, cy, 32, 60, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Heart
      ctx.beginPath();
      ctx.ellipse(cx - 8, cy + 8, 36, 28, -Math.PI / 12, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(239, 68, 68, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Coronary artery
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy);
      ctx.bezierCurveTo(cx - 15, cy + 12, cx - 20, cy + 20, cx - 28, cy + 24);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();

      const sx_loc = cx + stenosisInfo.sx;
      const sy_loc = cy + stenosisInfo.sy;
      drawStenosis(ctx, sx_loc, sy_loc, pulseState);
      drawAnnotation(ctx, sx_loc, sy_loc, stenosisInfo.title, stenosisInfo.desc, zoom, rotate);
    }
  }, [mode, zoom, rotate, pulseState, patientName]);

  return <canvas ref={canvasRef} width={500} height={350} style={{ width: "100%", height: "100%", display: "block" }} />;
}

export function ExpertEmergencyView({
  selectedPatientName,
  onSelectPatientName,
  onBack
}: {
  selectedPatientName?: string;
  onSelectPatientName?: (name: string) => void;
  onBack: () => void;
}) {
  const [viewMode, setViewMode] = useState<"axial" | "sagittal" | "coronal">("axial");
  const [zoom, setZoom] = useState(1.5);
  const [rotate, setRotate] = useState(30);
  const [isMicActive, setIsMicActive] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [isInterventionActive, setIsInterventionActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const [localPatient, setLocalPatient] = useState("all");
  const patientName = selectedPatientName || localPatient;
  const setPatientName = onSelectPatientName || setLocalPatient;

  // Heart rate & vitals animation based on current patient baseline
  const [currentHr, setCurrentHr] = useState(112);
  const [currentBp, setCurrentBp] = useState("85/50");
  const [currentSpo2, setCurrentSpo2] = useState(89);

  const patient = PATIENTS[patientName] || PATIENTS["James Harrington"];

  useEffect(() => {
    if (patientName !== "all" && patient) {
      setCurrentHr(patient.vitals.hr);
      setCurrentBp(patient.vitals.bp);
      setCurrentSpo2(patient.vitals.spo2);
    }
  }, [patientName]);

  useEffect(() => {
    if (patientName === "all") return;
    const interval = setInterval(() => {
      setCurrentHr(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        const baseline = patient.vitals.hr;
        return next > baseline + 6 ? baseline + 5 : next < baseline - 6 ? baseline - 5 : next;
      });

      setCurrentBp(prev => {
        const parts = prev.split("/");
        if (parts.length === 2) {
          const sysBase = parseInt(patient.vitals.bp.split("/")[0]);
          const diaBase = parseInt(patient.vitals.bp.split("/")[1]);
          const sysDelta = Math.floor(Math.random() * 5) - 2;
          const diaDelta = Math.floor(Math.random() * 3) - 1;
          const sys = parseInt(parts[0]) + sysDelta;
          const dia = parseInt(parts[1]) + diaDelta;
          const finalSys = sys > sysBase + 8 ? sysBase + 6 : sys < sysBase - 8 ? sysBase - 6 : sys;
          const finalDia = dia > diaBase + 5 ? diaBase + 4 : dia < diaBase - 5 ? diaBase - 4 : dia;
          return `${finalSys}/${finalDia}`;
        }
        return prev;
      });

      setCurrentSpo2(prev => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1 to +1
        const next = prev + delta;
        const baseline = patient.vitals.spo2;
        return next > Math.min(100, baseline + 2) ? baseline + 1 : next < Math.max(70, baseline - 2) ? baseline - 1 : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [patientName, patient]);

  if (patientName === "all") {
    return <EmergencyAlarmCenter setPatientName={setPatientName} onBack={onBack} />;
  }

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
      description: `Hệ thống đã đồng bộ kế hoạch can thiệp ${patient.diagnosis} khẩn cấp xuống đơn vị phụ trách trực tiếp.`,
      duration: 5000,
    });
  };

  const triggerIntervention = () => {
    setIsInterventionActive(true);
    toast.error("BÁO ĐỘNG ĐỎ: ĐÃ KÍCH HOẠT QUY TRÌNH CAN THIỆP KHẨN CẤP!", {
      description: `Đội ngũ can thiệp lâm sàng cấp cứu của bệnh nhân ${patientName} đã được điều động ngay lập tức!`,
      duration: 7000,
    });
  };

  // Treatment Plan Checklist progress
  const stepsCount = patient.treatmentPlan.length;
  const checkedStepsCount = Object.keys(completedSteps).filter(k => k.startsWith(patientName) && completedSteps[k]).length;
  const progressPercent = stepsCount ? Math.round((checkedStepsCount / stepsCount) * 100) : 0;

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
        display: "flex", alignItems: "center", justifyBetween: "space-between", flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Btn variant="secondary" onClick={() => setPatientName("all")} style={{ padding: "6px 8px" }}><ArrowLeft size={16} /> Quay lại</Btn>
          <div style={{ width: 1, height: 24, backgroundColor: C.border }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <select
                  value={patientName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setPatientName(name);
                    toast.info(`Chuyển sang bệnh nhân: ${name}`);
                  }}
                  style={{
                    backgroundColor: "transparent",
                    color: C.text1,
                    border: "none",
                    fontWeight: 700,
                    fontSize: 16,
                    fontFamily: C.font,
                    outline: "none",
                    cursor: "pointer",
                    paddingRight: 20
                  }}
                >
                  {Object.keys(PATIENTS).map(k => (
                    <option key={k} value={k} style={{ color: "#000" }}>{k}</option>
                  ))}
                </select>
                <div style={{ position: "absolute", right: 2, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.text3 }}>▼</div>
              </div>
              <Badge variant={patient.tag === "NGUY KỊCH" ? "critical" : "warning"} style={{ fontSize: 9, padding: "2px 6px" }}>
                {patient.tag}
              </Badge>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
                <span style={{ fontSize: 10, color: C.text3, fontFamily: C.font }}>Thời gian vàng can thiệp:</span>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: C.mono, color: C.critical }}>
                  {patient.countdown}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 11, color: C.text2, fontFamily: C.font }}>{patient.age} tuổi · {patient.gender} · Mã BN: <strong>{patient.id}</strong></span>
              <span style={{ fontSize: 10, color: C.text3 }}>•</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.text2, fontFamily: C.font }}>Vị trí: {patient.room}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: 4 }}>
            <span style={{ fontSize: 8, color: C.text3, fontFamily: C.font }}>CHẨN ĐOÁN XÁC ĐỊNH BỞI AI:</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.critical, fontFamily: C.font }}>{patient.diagnosis}</span>
          </div>
          <button
            onClick={triggerIntervention}
            className="pulse-red-glow-btn btn-glow-danger"
            style={{
              padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: C.font, fontWeight: 700, fontSize: 12, color: "#fff", display: "flex", alignItems: "center", gap: 6
            }}
          >
            <ShieldAlert size={14} /> KÍCH HOẠT BÁO ĐỘNG ĐỎ
          </button>
        </div>
      </div>

      {/* Main Body Workspace */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, padding: 16, overflow: "hidden" }}>
        
        {/* Left Side: Medical Scan Workspace */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%", overflow: "hidden" }}>
          <Card style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#090E17", borderColor: "#1E293B", overflow: "hidden" }}>
            {/* PACS Scan Header Control */}
            <div style={{
              padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex", justifyBetween: "space-between", alignItems: "center", flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", fontFamily: C.font }}>HÌNH ẢNH HỌC PHÂN GIẢI CAO (PACS SCANNER)</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                  backgroundColor: "rgba(59, 130, 246, 0.2)", color: "#60A5FA", border: "1px solid rgba(96, 165, 250, 0.3)"
                }}>REAL-TIME ANNOTATED</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["axial", "sagittal", "coronal"].map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode as any);
                      toast.info(`PACS: Lát cắt dọc ${mode.toUpperCase()}`);
                    }}
                    style={{
                      padding: "4px 8px", borderRadius: 4, fontSize: 9, fontWeight: 600,
                      fontFamily: C.font, cursor: "pointer", border: "none",
                      backgroundColor: viewMode === mode ? C.primary : "rgba(255,255,255,0.06)",
                      color: "#fff", transition: "all 0.15s"
                    }}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Scan Image / Canvas Container */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", minHeight: 280 }}>
              <MedicalScanCanvas patientName={patientName} mode={viewMode as any} zoom={zoom} rotate={rotate} />
              
              {/* Overlay HUD indicators */}
              <div style={{ position: "absolute", left: 16, top: 16, pointerEvents: "none", fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.4)", display: "flex", flexDirection: "column", gap: 3 }}>
                <div>SCANNER: AI-MED-PACS-3D</div>
                <div>FPS: 60.0 (STABLE)</div>
                <div>FILTER: CORONARY ENHANCED</div>
                <div>CONTRAST: DYNAMIC ADJUSTED</div>
              </div>

              <div style={{ position: "absolute", right: 16, bottom: 16, pointerEvents: "none", fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.4)", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                <div>ZOOM RATE: {zoom.toFixed(1)}x</div>
                <div>ROTATION: {rotate}°</div>
                <div>WL: 400 / WW: 1500</div>
              </div>
            </div>

            {/* PACS Footer Adjustment Controls */}
            <div style={{
              padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0
            }}>
              <Btn variant="ghost" size="sm" onClick={() => setRotate(prev => (prev - 45 + 360) % 360)} style={{ color: "#fff", padding: "4px 8px" }}>
                <RotateCcw size={12} /> Rotate L
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => setRotate(prev => (prev + 45) % 360)} style={{ color: "#fff", padding: "4px 8px" }}>
                <RotateCw size={12} /> Rotate R
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))} style={{ color: "#fff", padding: "4px 8px" }}>
                <ZoomIn size={12} /> Zoom+
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.8))} style={{ color: "#fff", padding: "4px 8px" }}>
                <ZoomOut size={12} /> Zoom-
              </Btn>
              <div style={{ width: 1, height: 16, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center" }} />
              <Btn variant="ghost" size="sm" onClick={() => toast.info("Đã mở lát cắt động mạch vành")} style={{ color: "#fff", padding: "4px 8px" }}>
                <Scissors size={12} /> X-Sect
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => toast.success("Kích hoạt chế độ đo đạc và đánh dấu thương tổn")} style={{ color: "#fff", padding: "4px 8px" }}>
                <Edit3 size={12} /> Annot
              </Btn>
            </div>
          </Card>
        </div>

        {/* Right Side: EMR Details, Team, Vitals and Action Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", overflowY: "auto" }}>
          
          {/* Patient Vitals and ECG with Interactive Simulation Sliders */}
          <Card className="hover-lift" style={{ padding: 14, transition: "all 0.25s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 10 }}>
              <Activity size={14} color={C.critical} />
              <span style={{ fontFamily: C.font, fontSize: 12, fontWeight: 700, color: C.text1 }}>Sinh hiệu & Chỉ số sinh học (Giả lập)</span>
            </div>
            
            {/* Vitals Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div style={{ padding: 8, borderRadius: 8, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.text3, fontFamily: C.font }}>Tần số tim (HR)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: currentHr > 100 ? C.critical : C.text1, fontFamily: C.mono, display: "flex", alignItems: "baseline", gap: 3, marginTop: 2 }}>
                  {currentHr} <span style={{ fontSize: 10, fontWeight: 500, color: C.text2 }}>bpm</span>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: currentHr > 100 ? C.critical : C.success, display: "inline-block", animation: "pulse 0.6s infinite", marginLeft: 4 }} />
                </div>
              </div>
              
              <div style={{ padding: 8, borderRadius: 8, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.text3, fontFamily: C.font }}>Huyết áp (BP)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text1, fontFamily: C.mono, marginTop: 2 }}>
                  {currentBp} <span style={{ fontSize: 10, fontWeight: 500, color: C.text2 }}>mmHg</span>
                </div>
              </div>

              <div style={{ padding: 8, borderRadius: 8, backgroundColor: currentSpo2 < 92 ? C.warningLight : C.bgMuted, border: `1px solid ${currentSpo2 < 92 ? C.warningBorder : C.border}` }}>
                <div style={{ fontSize: 9, color: currentSpo2 < 92 ? C.warningDark : C.text3, fontFamily: C.font }}>Độ bão hòa Oxy (SpO2)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: currentSpo2 < 92 ? C.warningDark : C.text1, fontFamily: C.mono, marginTop: 2 }}>
                  {currentSpo2}% <span style={{ fontSize: 9, fontWeight: 600, color: currentSpo2 < 92 ? C.warningDark : C.text2 }}>{currentSpo2 < 92 ? "Thở oxy" : "Ổn định"}</span>
                </div>
              </div>

              <div style={{ padding: 8, borderRadius: 8, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.text3, fontFamily: C.font }}>Nhịp thở (RR)</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text1, fontFamily: C.mono, marginTop: 2 }}>
                  {patient.vitals.rr} <span style={{ fontSize: 10, fontWeight: 500, color: C.text2 }}>/phút</span>
                </div>
              </div>

              {/* INTERACTIVE CLINICAL VITALS SLIDERS (Thanh kéo điều hòa HR & SpO2) */}
              <div style={{ gridColumn: "span 2", padding: "10px 12px", borderRadius: 8, backgroundColor: "rgba(59, 130, 246, 0.05)", border: `1px dashed ${C.primary}`, marginTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, fontFamily: C.font }}>GIẢ LẬP LÂM SÀNG (ĐIỀU HÒA TẦN SỐ TIM)</span>
                  <span style={{ fontSize: 9, fontFamily: C.mono, color: C.text2, fontWeight: 600 }}>{currentHr} bpm</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={160}
                  value={currentHr}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentHr(val);
                    if (val < 100 && val > 70) {
                      toast.success(`Hồi sức thành công! Tần số tim ổn định: ${val} bpm`);
                    }
                  }}
                  style={{
                    width: "100%",
                    accentColor: C.primary,
                    cursor: "pointer",
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.15)"
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: C.text3, marginTop: 4 }}>
                  <span>Nhịp chậm (60)</span>
                  <span>Ổn định (70-90)</span>
                  <span>Nhịp nhanh (160)</span>
                </div>
              </div>

              <div style={{ gridColumn: "span 2", padding: "10px 12px", borderRadius: 8, backgroundColor: "rgba(16, 185, 129, 0.05)", border: `1px dashed ${C.success}`, marginTop: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.success, fontFamily: C.font }}>LIỆU PHÁP OXY (HỖ TRỢ HÔ HẤP SpO2)</span>
                  <span style={{ fontSize: 9, fontFamily: C.mono, color: C.text2, fontWeight: 600 }}>{currentSpo2}%</span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={100}
                  value={currentSpo2}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentSpo2(val);
                    if (val >= 95) {
                      toast.success(`Oxy hóa máu phục hồi xuất sắc: ${val}%! Bệnh nhân qua cơn nguy kịch.`);
                    }
                  }}
                  style={{
                    width: "100%",
                    accentColor: C.success,
                    cursor: "pointer",
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.15)"
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: C.text3, marginTop: 4 }}>
                  <span>Suy hô hấp (70%)</span>
                  <span>Mục tiêu phục hồi (&gt;=95%)</span>
                </div>
              </div>
            </div>

            {/* ECG Heart Rate Line Chart */}
            <div style={{ padding: "8px 6px", borderRadius: 8, backgroundColor: "#090E17", border: "1px solid #1E293B", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", marginBottom: 4, padding: "0 4px" }}>
                <span style={{ fontSize: 8, fontFamily: C.mono, color: C.success }}>EKG - LEAD II (LIVE SENSOR)</span>
                <span style={{ fontSize: 8, fontFamily: C.mono, color: "rgba(255,255,255,0.4)" }}>25 mm/s · 10 mm/mV</span>
              </div>
              <svg viewBox="0 0 360 50" width="100%" height={32} style={{ display: "block", overflow: "hidden" }}>
                <defs>
                  <linearGradient id="ekgSweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
                    <stop offset="80%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="97%" stopColor="#22C55E" stopOpacity="1" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
                  </linearGradient>
                  
                  <mask id="ekgMask">
                    <rect x="-360" y="0" width="360" height="50" fill="url(#ekgSweepGrad)">
                      <animate attributeName="x" from="-360" to="360" dur="2.5s" repeatCount="indefinite" />
                    </rect>
                  </mask>
                </defs>
                
                {/* Background faint EKG guide line */}
                <path d={patient.ekgWave} fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Bright swept glowing EKG line */}
                <path d={patient.ekgWave} fill="none" stroke="#10B981" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" mask="url(#ekgMask)" />
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
              {patient.team.map(member => (
                <div key={member.name} style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", padding: "6px 10px", borderRadius: 8, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text1 }}>{member.name}</div>
                    <div style={{ fontSize: 9, color: C.text3 }}>{member.role}</div>
                  </div>
                  <span style={{
                    fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    backgroundColor: C.successLight, color: C.successDark, border: `1px solid ${C.successBorder}`
                  }}>{member.status}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Medical Audio Transcript Log */}
          <Card className="hover-lift" style={{ padding: 14, transition: "all 0.25s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8 }}>
              <Mic size={14} color={C.primary} />
              <span style={{ fontFamily: C.font, fontSize: 12, fontWeight: 700, color: C.text1 }}>Nhật ký hội thoại & Lệnh AI</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxH: 150, overflowY: "auto" }}>
              {patient.audioLog.map((log, li) => (
                <div key={li} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "6px 10px", borderRadius: 8, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyBetween: "space-between", fontSize: 9, fontWeight: 600, color: log.speaker.includes("AI") ? C.primary : C.text2 }}>
                    <span>{log.speaker}</span>
                    <span style={{ color: C.text3 }}>{log.time}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.text1, marginTop: 2, fontStyle: log.speaker.includes("AI") ? "italic" : "normal" }}>{log.text}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Proposed Treatment Plan with Checklist & Rich Clinical Directives */}
          <Card className="hover-lift" style={{ padding: 14, transition: "all 0.25s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8 }}>
              <ShieldAlert size={14} color={C.warningDark} />
              <span style={{ fontFamily: C.font, fontSize: 12, fontWeight: 700, color: C.text1 }}>Đề xuất phác đồ can thiệp khẩn cấp</span>
            </div>
            
            {/* Protocol Completion Progress Bar */}
            <div style={{ marginBottom: 12, marginTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, color: C.text2, marginBottom: 4 }}>
                <span>Hoàn thành quy trình can thiệp:</span>
                <span style={{ color: C.primary, fontWeight: 700 }}>{progressPercent}% ({checkedStepsCount}/{stepsCount} bước)</span>
              </div>
              <div style={{ width: "100%", height: 6, backgroundColor: C.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${progressPercent}%`, height: "100%", backgroundColor: C.primary, borderRadius: 3, transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }} />
              </div>
            </div>

            {/* Scrollable checklist container */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto", paddingRight: 4, scrollbarWidth: "thin", marginBottom: 12 }}>
              {patient.treatmentPlan.map(plan => {
                const stepKey = `${patientName}-${plan.step}`;
                const isDone = !!completedSteps[stepKey];
                return (
                  <div key={plan.step} style={{
                    display: "flex", flexDirection: "column", padding: "10px 12px", borderRadius: 8,
                    backgroundColor: isDone ? "rgba(16, 185, 129, 0.04)" : C.bgMuted,
                    border: `1px solid ${isDone ? C.success : C.border}`,
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} className="hover-lift">
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={(e) => {
                          setCompletedSteps(prev => ({ ...prev, [stepKey]: e.target.checked }));
                          if (e.target.checked) {
                            toast.success(`Hoàn thành: Bước ${plan.step} - ${plan.title}`);
                          }
                        }}
                        style={{
                          width: 16, height: 16, accentColor: C.success, cursor: "pointer",
                          marginTop: 2, flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: isDone ? C.successDark : C.text1, textDecoration: isDone ? "line-through" : "none" }}>
                            Bước {plan.step}: {plan.title}
                          </span>
                          <Badge variant="blue" style={{ fontSize: 8, padding: "1px 4px" }}>{plan.dose}</Badge>
                        </div>
                        <div style={{ fontSize: 9, color: C.text3, marginTop: 2 }}>{plan.desc}</div>
                        {plan.details && (
                          <div style={{
                            fontSize: 8.5, color: C.text2, marginTop: 6, padding: "6px 8px",
                            backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 4,
                            borderLeft: `2.5px solid ${isDone ? C.success : C.primary}`,
                            fontFamily: C.font, lineHeight: 1.3
                          }}>
                            {plan.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                <Play size={14} fill="#fff" /> BÁO ĐỘNG ĐỎ CAN THIỆP KHẨN
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🚨 ALL PATIENTS EMERGENCY ALARM CENTER
// ==========================================
function EmergencyAlarmCenter({
  setPatientName,
  onBack
}: {
  setPatientName: (name: string) => void;
  onBack: () => void;
}) {
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "HIGH">("ALL");
  const [timers, setTimers] = useState<Record<string, string>>({
    "James Harrington": "00:46:15",
    "Elena Vasquez": "00:11:42",
    "Robert Chen": "01:14:05",
    "Amara Okafor": "01:43:55"
  });

  // Countdown timer ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          const parts = next[k].split(":");
          if (parts.length === 3) {
            let h = parseInt(parts[0]);
            let m = parseInt(parts[1]);
            let s = parseInt(parts[2]);
            s--;
            if (s < 0) {
              s = 59;
              m--;
              if (m < 0) {
                m = 59;
                h--;
              }
            }
            const pad = (v: number) => String(v).padStart(2, "0");
            next[k] = `${pad(h)}:${pad(m)}:${pad(s)}`;
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const patientList = Object.keys(PATIENTS).map(k => PATIENTS[k]);
  const filteredList = patientList.filter(p => {
    if (filter === "CRITICAL") return p.tag === "NGUY KỊCH";
    if (filter === "HIGH") return p.tag === "CAO";
    return true;
  });

  return (
    <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", backgroundColor: "#F8FAFC", display: "flex", flexDirection: "column", gap: 16 }}>
      
      {/* Alarm Center Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: 16, flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: C.text1, fontFamily: C.font, display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: C.critical, display: "inline-block", animation: "pulse 0.8s infinite" }} />
            TRUNG TÂM PHÒNG NGỪA & ĐIỀU PHỐI CẤP CỨU KHẨN CẤP
          </h2>
          <p style={{ fontSize: 11, color: C.text3, fontFamily: C.font, marginTop: 4, margin: 0 }}>
            Giám sát trực tuyến toàn viện • {patientList.length} ca nguy kịch đang chờ hội chẩn khẩn cấp
          </p>
        </div>
        <Btn variant="outline" size="sm" onClick={onBack}><ArrowLeft size={13} /> Quay lại Tổng quan</Btn>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {[
          { key: "ALL", label: "Tất cả ca bệnh" },
          { key: "CRITICAL", label: "Cấp độ: NGUY KỊCH" },
          { key: "HIGH", label: "Cấp độ: CAO" }
        ].map(btn => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key as any)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              fontFamily: C.font, cursor: "pointer", border: `1.5px solid ${filter === btn.key ? C.primary : C.border}`,
              backgroundColor: filter === btn.key ? C.primaryLight : "#fff",
              color: filter === btn.key ? C.primaryDark : C.text2,
              transition: "all 0.2s"
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Grid of Alarm Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, flex: 1, minHeight: 0 }}>
        {filteredList.map(p => {
          const isCritical = p.tag === "NGUY KỊCH";
          return (
            <Card key={p.name} className="hover-lift" style={{ padding: 16, border: `1.5px solid ${isCritical ? "rgba(239, 68, 68, 0.4)" : C.border}`, transition: "all 0.25s", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                {/* Card Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.text1, fontFamily: C.font }}>{p.name}</span>
                      <span style={{ fontSize: 9, color: C.text3 }}>({p.age}T · {p.gender})</span>
                    </div>
                    <div style={{ fontSize: 9, color: C.text3, marginTop: 2, fontFamily: C.mono }}>Mã BN: {p.id} · {p.room}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <Badge variant={isCritical ? "critical" : "warning"} style={{ fontSize: 8, padding: "2px 6px" }}>
                      {p.tag}
                    </Badge>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, fontFamily: C.mono, color: isCritical ? C.critical : C.warningDark, fontWeight: 700 }}>
                      <Clock size={10} />
                      <span>{timers[p.name] || p.countdown}</span>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div style={{ padding: "6px 10px", borderRadius: 6, backgroundColor: isCritical ? "rgba(239, 68, 68, 0.05)" : "rgba(245, 158, 11, 0.05)", border: `1px solid ${isCritical ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)"}`, marginBottom: 12 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isCritical ? C.critical : C.warningDark, fontFamily: C.font }}>CHẨN ĐOÁN LÂM SÀNG:</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.text1, fontFamily: C.font, marginLeft: 6 }}>{p.diagnosis}</span>
                </div>

                {/* Vitals & ECG Wave */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginBottom: 14 }}>
                  {/* Vitals Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div style={{ padding: "6px 8px", borderRadius: 6, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 8, color: C.text3 }}>HR (Tần số tim)</span>
                      <div style={{ fontSize: 13, fontWeight: 800, color: p.vitals.hr > 100 ? C.critical : C.text1, fontFamily: C.mono, marginTop: 2 }}>
                        {p.vitals.hr} <span style={{ fontSize: 8, fontWeight: 500, color: C.text3 }}>bpm</span>
                      </div>
                    </div>
                    <div style={{ padding: "6px 8px", borderRadius: 6, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 8, color: C.text3 }}>BP (Huyết áp)</span>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.text1, fontFamily: C.mono, marginTop: 2 }}>
                        {p.vitals.bp} <span style={{ fontSize: 8, fontWeight: 500, color: C.text3 }}>mmHg</span>
                      </div>
                    </div>
                    <div style={{ padding: "6px 8px", borderRadius: 6, backgroundColor: p.vitals.spo2 < 92 ? C.warningLight : C.bgMuted, border: `1px solid ${p.vitals.spo2 < 92 ? C.warningBorder : C.border}` }}>
                      <span style={{ fontSize: 8, color: p.vitals.spo2 < 92 ? C.warningDark : C.text3 }}>SpO2 (Oxy máu)</span>
                      <div style={{ fontSize: 13, fontWeight: 800, color: p.vitals.spo2 < 92 ? C.warningDark : C.text1, fontFamily: C.mono, marginTop: 2 }}>
                        {p.vitals.spo2}%
                      </div>
                    </div>
                    <div style={{ padding: "6px 8px", borderRadius: 6, backgroundColor: C.bgMuted, border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 8, color: C.text3 }}>RR (Nhịp thở)</span>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.text1, fontFamily: C.mono, marginTop: 2 }}>
                        {p.vitals.rr} <span style={{ fontSize: 8, fontWeight: 500, color: C.text3 }}>/phút</span>
                      </div>
                    </div>
                  </div>

                  {/* mini ECG Sweep */}
                  <div style={{ padding: 6, borderRadius: 6, backgroundColor: "#090E17", border: "1px solid #1E293B", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 7, fontFamily: C.mono, color: C.success }}>LIVE MONITOR EKG</span>
                    <svg viewBox="0 0 360 50" width="100%" height={24} style={{ display: "block", overflow: "hidden", marginTop: 4 }}>
                      <defs>
                        <linearGradient id={`sweepGrad-${p.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
                          <stop offset="80%" stopColor="#10B981" stopOpacity="0.25" />
                          <stop offset="97%" stopColor="#22C55E" stopOpacity="1" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
                        </linearGradient>
                        <mask id={`ekgMask-${p.id}`}>
                          <rect x="-360" y="0" width="360" height="50" fill={`url(#sweepGrad-${p.id})`}>
                            <animate attributeName="x" from="-360" to="360" dur="2.5s" repeatCount="indefinite" />
                          </rect>
                        </mask>
                      </defs>
                      <path d={p.ekgWave} fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth={1.5} />
                      <path d={p.ekgWave} fill="none" stroke="#10B981" strokeWidth={2} mask={`url(#ekgMask-${p.id})`} />
                    </svg>
                  </div>
                </div>

                {/* Consultation Team */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, color: C.text2, backgroundColor: C.bgMuted, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 12 }}>
                  <span>Đội ngũ on-call: <strong>{p.team[0]?.name}</strong> ({p.team[0]?.role})</span>
                  <span style={{ color: C.successDark, fontWeight: 700 }}>● {p.team[0]?.status}</span>
                </div>
              </div>

              {/* CTA Action */}
              <button
                onClick={() => {
                  setPatientName(p.name);
                  toast.success(`Đã vào hội chẩn: Bệnh nhân ${p.name}`);
                }}
                className="pulse-red-glow-btn btn-glow-danger"
                style={{
                  width: "100%", height: 34, borderRadius: 6, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontFamily: C.font, fontWeight: 700, fontSize: 11, color: "#fff",
                  transition: "all 0.2s"
                }}
              >
                VÀO HỘI CHẨN KHẨN CẤP <ArrowRight size={12} />
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
