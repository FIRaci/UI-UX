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

export const INITIAL_QUEUE: Triage[] = [
  { id: 1, level: "Khẩn cấp", patient: "Trần Văn Hậu", age: 58, symptoms: "Đau ngực dữ dội, khó thở", waited: "2 phút", vitals: { bp: "160/100", hr: "112", temp: "37.2°C", spo2: "94%" } },
  { id: 2, level: "Cao", patient: "Đặng Quỳnh Anh", age: 34, symptoms: "Sốt cao, đau đầu kéo dài 3 ngày", waited: "12 phút", vitals: { bp: "120/80", hr: "98", temp: "39.1°C", spo2: "97%" } },
  { id: 3, level: "Trung bình", patient: "Phạm Bích Ngọc", age: 47, symptoms: "Đau lưng dưới, tê chân phải", waited: "25 phút", vitals: { bp: "125/82", hr: "78", temp: "36.7°C", spo2: "98%" } },
  { id: 4, level: "Trung bình", patient: "Lê Văn Tú", age: 41, symptoms: "Tái khám tăng huyết áp", waited: "30 phút", vitals: { bp: "138/88", hr: "82", temp: "36.8°C", spo2: "98%" } },
  { id: 5, level: "Thấp", patient: "Mai Hồng Yến", age: 29, symptoms: "Khám sức khỏe định kỳ", waited: "45 phút", vitals: { bp: "118/76", hr: "72", temp: "36.5°C", spo2: "99%" } },
];

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
