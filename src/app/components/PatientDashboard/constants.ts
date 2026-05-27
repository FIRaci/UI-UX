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

export const DOCTORS: Doctor[] = [
  { id: 2, name: "BS. Nguyễn Văn An", spec: "Tim mạch", rating: 4.9, fee: "300.000đ", clinic: "CN Q1", avail: ["08:00", "09:00", "10:30", "14:00"] },
  { id: 103, name: "BS. Trần Thị Bình", spec: "Da liễu", rating: 4.8, fee: "250.000đ", clinic: "CN Q3", avail: ["09:30", "11:00", "15:00"] },
  { id: 203, name: "BS. Lê Hoàng Cường", spec: "Nhi khoa", rating: 4.7, fee: "280.000đ", clinic: "CN Tân Bình", avail: ["08:30", "10:00", "13:30", "16:00"] },
  { id: 204, name: "BS. Phạm Mai Dung", spec: "Tai mũi họng", rating: 4.9, fee: "320.000đ", clinic: "CN Q1", avail: ["09:00", "11:30", "14:30"] },
  { id: 105, name: "BS. Vũ Quốc Đạt", spec: "Cơ xương khớp", rating: 4.6, fee: "350.000đ", clinic: "CN Q7", avail: ["08:00", "10:30", "15:30"] },
];

export const SPECIALTIES = ["Tim mạch", "Da liễu", "Nhi khoa", "Tai mũi họng", "Cơ xương khớp", "Nội tổng quát"];
