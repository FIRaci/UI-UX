import { AlertTriangle, ShieldAlert, Activity, CheckCircle2 } from "lucide-react";

export const ME_NAME = "Phạm Thanh Tâm";

export type Severity = "Khẩn cấp" | "Cao" | "Trung bình" | "Thấp";

export type DoctorRec = {
  id: number;
  name: string;
  specialty: string;
  matchReason: string;
  rating: number;
  availability: string;
  tags: string[];
  nextSlot: string;
  slotPool: string[];
};

export type ConsultHistory = {
  id: number;
  date: string;
  symptoms: string[];
  severity: Severity;
  actions: string[];
  specialty: string;
  bookingRec: string;
};

export const DOCTORS: DoctorRec[] = [
  {
    id: 1,
    name: "BS. Nguyễn Văn An",
    specialty: "Tim mạch",
    matchReason: "Chuyên gia về đau ngực và rối loạn nhịp tim, phù hợp với triệu chứng của bạn",
    rating: 4.9,
    availability: "Khám sáng & chiều trong tuần",
    tags: ["Tim mạch", "Huyết áp", "ECG"],
    nextSlot: "Sớm nhất hôm nay",
    slotPool: ["08:30", "09:30", "10:30", "14:00", "15:00", "16:30"],
  },
  {
    id: 2,
    name: "CV. Đỗ Thanh Hằng",
    specialty: "Tâm lý",
    matchReason: "Chuyên trị lo âu, stress và rối loạn giấc ngủ",
    rating: 4.8,
    availability: "Online, có cả khung buổi tối",
    tags: ["Lo âu", "Stress", "Mất ngủ"],
    nextSlot: "Nhiều khung linh hoạt",
    slotPool: ["09:00", "10:30", "11:30", "13:30", "15:00", "16:30", "19:00", "20:30"],
  },
  {
    id: 3,
    name: "BS. Trần Minh Đức",
    specialty: "Hô hấp",
    matchReason: "Bác sĩ đầu ngành về các bệnh phổi và đường hô hấp",
    rating: 4.7,
    availability: "Chủ yếu khám buổi chiều",
    tags: ["Phổi", "Ho", "Hen suyễn"],
    nextSlot: "Sớm nhất chiều nay",
    slotPool: ["13:30", "14:30", "15:30", "16:30", "17:00"],
  },
];

function seeded(n: number): number {
  let x = (n ^ 0x9e3779b9) >>> 0;
  x ^= x << 13; x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5; x >>>= 0;
  return x / 0xffffffff;
}

export function slotsForDay(doc: DoctorRec, dayIndex: number): string[] {
  const pool = doc.slotPool;
  const seed = doc.id * 1000 + dayIndex;
  const MIN_SLOTS = 1;
  const countSeed = (seed * 2654435761 + 0xabcd) >>> 0;
  const count = MIN_SLOTS + Math.floor(seeded(countSeed) * (pool.length - MIN_SLOTS + 1));
  return pool
    .map((t, i) => ({ t, i, r: seeded(seed * 31 + i) }))
    .sort((a, b) => b.r - a.r)
    .slice(0, count)
    .sort((a, b) => a.i - b.i)
    .map(s => s.t);
}

export const HISTORY: ConsultHistory[] = [
  {
    id: 1,
    date: "2026-05-10",
    symptoms: ["Đau đầu", "Mất ngủ", "Lo âu"],
    severity: "Trung bình",
    actions: ["Nghỉ ngơi đầy đủ", "Tập thở 4-7-8", "Hạn chế caffeine sau 14h"],
    specialty: "Tâm lý",
    bookingRec: "Nên đặt lịch tư vấn tâm lý nếu triệu chứng kéo dài > 2 tuần",
  },
  {
    id: 2,
    date: "2026-05-05",
    symptoms: ["Đau ngực nhẹ", "Hồi hộp"],
    severity: "Cao",
    actions: ["Đo huyết áp 2 lần/ngày", "Hạn chế muối", "Tái khám nếu đau tăng"],
    specialty: "Tim mạch",
    bookingRec: "Khuyến nghị đặt lịch khám tim mạch trong 3 ngày",
  },
];

export const SEVERITY: Record<Severity, { className: string; Icon: typeof AlertTriangle; label: string }> = {
  "Khẩn cấp":   { className: "bg-red-100 text-red-700 border-red-300",           Icon: ShieldAlert,   label: "Khẩn cấp" },
  "Cao":        { className: "bg-orange-100 text-orange-700 border-orange-300",   Icon: AlertTriangle, label: "Cao" },
  "Trung bình": { className: "bg-amber-100 text-amber-700 border-amber-300",      Icon: Activity,      label: "Trung bình" },
  "Thấp":       { className: "bg-emerald-100 text-emerald-700 border-emerald-300", Icon: CheckCircle2,  label: "Thấp" },
};

export type Appointment = {
  id: number;
  doctorName: string;
  specialty: string;
  time: string;
  notes: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

export type AIInsight = {
  symptoms: string[];
  specialty: string | null;
  severity: Severity | null;
  confidence: number | null;
  nextAction: string | null;
};

export const QUICK_PROMPTS = [
  "Tôi bị đau đầu",
  "Tôi bị đau ngực",
  "Tôi khó thở",
  "Tôi bị sốt",
  "Tôi bị mất ngủ",
  "Tôi bị đau bụng",
];

export type Article = {
  t: string; c: string; d: string; author: string; date: string;
  cover: string; lead: string; sections: { h: string; p: string }[];
};

export const ARTICLES: Article[] = [
  {
    t: "Quản lý stress hiệu quả", c: "Tâm lý", d: "5 phút đọc",
    author: "CV. Đỗ Thanh Hằng", date: "02/05/2026",
    cover: "linear-gradient(135deg,#a78bfa,#60a5fa)",
    lead: "Stress là phản ứng bình thường của cơ thể trước áp lực, nhưng kéo dài có thể ảnh hưởng nghiêm trọng đến sức khỏe thể chất và tinh thần.",
    sections: [
      { h: "Nhận diện dấu hiệu", p: "Mất ngủ, khó tập trung, dễ cáu gắt, đau đầu hoặc đau cơ kéo dài đều là tín hiệu cảnh báo. Hãy ghi chú lại tần suất xuất hiện trong 1-2 tuần để có đánh giá chính xác." },
      { h: "Kỹ thuật thở 4-7-8", p: "Hít vào trong 4 giây, giữ hơi 7 giây, thở ra 8 giây. Lặp 4 chu kỳ mỗi sáng và tối giúp hệ thần kinh phó giao cảm hoạt động ổn định hơn." },
      { h: "Cân bằng công việc", p: "Áp dụng quy tắc 90/20: làm việc tập trung 90 phút rồi nghỉ 20 phút. Tránh kiểm tra email/điện thoại 1 giờ trước khi ngủ." },
    ],
  },
  {
    t: "Chế độ ăn cho người cao huyết áp", c: "Dinh dưỡng", d: "8 phút đọc",
    author: "CV. Lý Mai Phương", date: "28/04/2026",
    cover: "linear-gradient(135deg,#34d399,#10b981)",
    lead: "Chế độ ăn DASH được chứng minh giảm 8-14 mmHg huyết áp tâm thu nếu duy trì đều đặn ít nhất 8 tuần.",
    sections: [
      { h: "Nguyên tắc chung", p: "Giảm muối <1.500mg/ngày, tăng kali từ chuối, khoai lang, rau xanh đậm. Hạn chế đồ chiên rán, thực phẩm chế biến sẵn và rượu bia." },
      { h: "Thực đơn mẫu", p: "Sáng: yến mạch + chuối + sữa hạt. Trưa: cá hồi áp chảo + cơm lứt + rau luộc. Tối: ức gà + salad rau củ + 1 quả táo." },
      { h: "Lưu ý khi đi chợ", p: "Đọc nhãn dinh dưỡng, ưu tiên sản phẩm <140mg natri/khẩu phần. Mua thực phẩm tươi thay cho đồ đóng hộp khi có thể." },
    ],
  },
  {
    t: "Bài tập thư giãn trước khi ngủ", c: "Tâm lý", d: "3 phút đọc",
    author: "CV. Đỗ Thanh Hằng", date: "20/04/2026",
    cover: "linear-gradient(135deg,#f472b6,#a78bfa)",
    lead: "Một bài tập kéo giãn 5 phút trước khi ngủ giúp giảm 30% thời gian đi vào giấc ngủ sâu.",
    sections: [
      { h: "Tư thế em bé", p: "Quỳ gối, gập người về trước, hai tay duỗi thẳng. Giữ 60 giây, hít thở sâu bằng bụng." },
      { h: "Vặn cột sống nằm", p: "Nằm ngửa, co một gối kéo qua bên đối diện, đầu xoay ngược lại. Giữ mỗi bên 45 giây." },
      { h: "Quét cơ thể", p: "Nhắm mắt, di chuyển ý thức từ đỉnh đầu xuống chân, thả lỏng từng nhóm cơ. Thực hiện trong 3-5 phút." },
    ],
  },
  {
    t: "Hiểu về sức khỏe tim mạch", c: "Tim mạch", d: "10 phút đọc",
    author: "BS. Nguyễn Văn An", date: "15/04/2026",
    cover: "linear-gradient(135deg,#fb7185,#f97316)",
    lead: "Bệnh tim mạch là nguyên nhân tử vong hàng đầu tại Việt Nam, nhưng 80% trường hợp có thể phòng ngừa được.",
    sections: [
      { h: "Yếu tố nguy cơ", p: "Tăng huyết áp, rối loạn lipid máu, đái tháo đường, hút thuốc, ít vận động và béo phì là 6 yếu tố cần kiểm soát đầu tiên." },
      { h: "Tầm soát định kỳ", p: "Người >40 tuổi nên đo huyết áp 6 tháng/lần, xét nghiệm lipid máu hàng năm, ECG nếu có triệu chứng đau ngực hoặc khó thở." },
      { h: "Vận động thông minh", p: "150 phút cường độ vừa hoặc 75 phút cường độ cao mỗi tuần. Đi bộ nhanh, bơi, đạp xe đều phù hợp." },
    ],
  },
  {
    t: "Chăm sóc da theo mùa", c: "Da liễu", d: "6 phút đọc",
    author: "BS. Trần Thị Bình", date: "10/04/2026",
    cover: "linear-gradient(135deg,#fcd34d,#fb923c)",
    lead: "Da chúng ta phản ứng khác nhau với độ ẩm và nhiệt độ. Routine chăm sóc cần điều chỉnh theo mùa.",
    sections: [
      { h: "Mùa hè", p: "Sữa rửa mặt dịu nhẹ, kem chống nắng SPF 50+ thoa lại sau mỗi 2-3 giờ. Dưỡng ẩm gel nhẹ tránh bít tắc lỗ chân lông." },
      { h: "Mùa đông", p: "Chuyển sang cleanser dạng kem, dưỡng ẩm chứa ceramide và hyaluronic acid. Hạn chế tắm nước quá nóng." },
      { h: "Khi giao mùa", p: "Da dễ kích ứng nhất, ưu tiên sản phẩm tối giản 3 bước: rửa - dưỡng - chống nắng." },
    ],
  },
  {
    t: "Tư thế ngồi đúng cho dân văn phòng", c: "Cơ xương khớp", d: "4 phút đọc",
    author: "BS. Vũ Quốc Đạt", date: "05/04/2026",
    cover: "linear-gradient(135deg,#38bdf8,#6366f1)",
    lead: "Ngồi sai tư thế 8 tiếng/ngày làm tăng 40% nguy cơ thoái hóa cột sống cổ và lưng dưới.",
    sections: [
      { h: "Quy tắc 90 độ", p: "Khuỷu tay, hông và đầu gối đều tạo góc 90°. Hai chân đặt phẳng trên sàn hoặc kê bục thấp." },
      { h: "Vị trí màn hình", p: "Đỉnh màn hình ngang tầm mắt, cách mặt 50-70cm. Tránh nghiêng cổ xuống nhìn laptop liên tục." },
      { h: "Nghỉ ngắn 20-20-20", p: "Mỗi 20 phút nhìn vật cách 20 feet trong 20 giây. Đứng dậy vận động nhẹ mỗi giờ một lần." },
    ],
  },
];

export type BookingDay = {
  key: string;
  dateLabel: string;
  dayLabel: string;
  fullLabel: string;
};
