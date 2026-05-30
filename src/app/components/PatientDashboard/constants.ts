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

export const SPECIALTIES = ["Tim mạch", "Da liễu", "Nhi khoa", "Tai mũi họng", "Cơ xương khớp", "Nội tổng quát"];
