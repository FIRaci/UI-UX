export interface Doctor {
  id: number;
  name: string;
  spec: string;
  rating: number;
  fee: string;
  clinic: string;
  avail: string[];
}

export const ME = "Nguyễn Minh Khoa";

export const DOCTORS: Doctor[] = [];

export const SPECIALTIES = [
  "Tim mạch", "Da liễu", "Nhi khoa", "Tai mũi họng", "Cơ xương khớp",
  "Sản phụ khoa", "Nội tiết", "Thần kinh", "Tiêu hóa", "Mắt",
  "Hô hấp", "Ngoại thần kinh", "Nam khoa", "Răng Hàm Mặt", "Ung bướu",
  "Tâm lý", "Chấn thương chỉnh hình", "Phục hồi chức năng", "Truyền nhiễm"
];
