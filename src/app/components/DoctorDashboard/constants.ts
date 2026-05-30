export const ME_NAME = "BS. Nguyễn Văn An";
export const ME_ID = 2;

export type Triage = {
  id: number;
  level: "Khẩn cấp" | "Cao" | "Trung bình" | "Thấp";
  patient: string;
  age: number;
  symptoms: string;
  waited: string;
  vitals: { bp: string; hr: string; temp: string; spo2: string };
};

export const INITIAL_QUEUE: Triage[] = [];

export const URGENT_ALERT = {
  patient: "Trần Văn Hậu",
  age: 58,
  symptoms: "Đau ngực dữ dội, khó thở, vã mồ hôi",
  trigger: "Triệu chứng nghi nhồi máu cơ tim cấp",
};

export const NOTE_TEMPLATES = [
  { name: "Tăng huyết áp", body: "Chẩn đoán: Tăng huyết áp giai đoạn 1.\nKhuyến nghị:\n- Amlodipine 5mg, 1 viên/sáng\n- Theo dõi huyết áp 2 lần/ngày\n- Tái khám sau 4 tuần" },
  { name: "Viêm họng", body: "Chẩn đoán: Viêm họng cấp.\nKê đơn:\n- Amoxicillin 500mg, 3 lần/ngày × 7 ngày\n- Paracetamol khi sốt > 38.5°C\n- Súc miệng nước muối, nghỉ ngơi" },
  { name: "Tái khám tim mạch", body: "Bệnh nhân đáp ứng tốt với phác đồ.\n- Tiếp tục thuốc hiện tại\n- Xét nghiệm lipid máu sau 3 tháng\n- Tái khám 1 tháng/lần" },
];
