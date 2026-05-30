export const ME_NAME = "Phạm Thanh Tâm";

export type DoctorRec = {
  id: number;
  name: string;
  specialty: string;
  matchReason: string;
  rating: number;
  availability: string;
  tags: string[];
  nextSlot: string;
};

export type ConsultHistory = {
  id: number;
  date: string;
  symptoms: string[];
  severity: "Khẩn cấp" | "Cao" | "Trung bình" | "Thấp";
  actions: string[];
  specialty: string;
  bookingRec: string;
};

export const DOCTORS: DoctorRec[] = [];

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

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

export type AIInsight = {
  symptoms: string[];
  specialty: string | null;
  severity: "Khẩn cấp" | "Cao" | "Trung bình" | "Thấp" | null;
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

export const ARTICLES: Article[] = [];
