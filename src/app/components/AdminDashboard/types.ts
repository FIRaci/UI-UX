export type Patient = { id: number; name: string; phone: string; gender: string; dob: string; address: string };
export type Schedule = { id: number; doctor: string; date: string; time: string; clinic: string };

export const REVENUE = [
  { m: "T1", v: 230 }, { m: "T2", v: 280 }, { m: "T3", v: 310 },
  { m: "T4", v: 340 }, { m: "T5", v: 290 }, { m: "T6", v: 380 },
];
export const VISITS = [
  { d: "T2", v: 120 }, { d: "T3", v: 145 }, { d: "T4", v: 132 },
  { d: "T5", v: 168 }, { d: "T6", v: 190 }, { d: "T7", v: 110 }, { d: "CN", v: 80 },
];
export const SPECS = [
  { name: "Tim mạch", value: 35 },
  { name: "Da liễu", value: 20 },
  { name: "Nhi", value: 18 },
  { name: "TMH", value: 15 },
  { name: "Khác", value: 12 },
];
export const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e"];
