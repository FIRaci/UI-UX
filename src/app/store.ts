import { useSyncExternalStore } from "react";

export type Msg = { f: "user" | "staff"; txt: string; t: string };

export type Thread = {
  id: number;
  staffId: number;
  staffName: string;
  staffSpec: string;
  userRole: "benhnhan" | "tuvan";
  userName: string;
  topic: string;
  status: "Đang diễn ra" | "Đã kết thúc" | "Chờ phản hồi";
  msgs: Msg[];
  last: string;
  updatedAt: number;
};

export type Appointment = {
  id: number;
  patientName: string;
  doctorName: string;
  doctorSpec: string;
  date: string;
  time: string;
  clinic: string;
  status: "Sắp tới" | "Hoàn thành" | "Đã hủy";
  age?: number;
  symptoms?: string;
  level?: "Khẩn cấp" | "Cao" | "Trung bình" | "Thấp";
  vitals?: { bp: string; hr: string; temp: string; spo2: string };
};

type State = { threads: Thread[]; appointments: Appointment[] };

const initial: State = {
  threads: [
    {
      id: 1, staffId: 2, staffName: "BS. Nguyễn Văn An", staffSpec: "Tim mạch",
      userRole: "benhnhan", userName: "Đặng Quỳnh Anh", topic: "Sau khám",
      status: "Chờ phản hồi", last: "Bác sĩ ơi, em có nên uống thuốc lúc đói không ạ?",
      updatedAt: Date.now() - 5 * 60 * 1000,
      msgs: [{ f: "user", txt: "Bác sĩ ơi, em có nên uống thuốc lúc đói không ạ?", t: "5 phút trước" }],
    },
    {
      id: 2, staffId: 2, staffName: "BS. Nguyễn Văn An", staffSpec: "Tim mạch",
      userRole: "benhnhan", userName: "Trần Văn Hậu", topic: "Sau khám",
      status: "Chờ phản hồi", last: "Sau khi khám về em vẫn còn đau ngực nhẹ, có sao không?",
      updatedAt: Date.now() - 20 * 60 * 1000,
      msgs: [{ f: "user", txt: "Sau khi khám về em vẫn còn đau ngực nhẹ, có sao không?", t: "20 phút trước" }],
    },
    {
      id: 3, staffId: 2, staffName: "BS. Nguyễn Văn An", staffSpec: "Tim mạch",
      userRole: "benhnhan", userName: "Mai Hồng Yến", topic: "Lịch tái khám",
      status: "Đã kết thúc", last: "Em đã đặt lịch tái khám tuần sau",
      updatedAt: Date.now() - 60 * 60 * 1000,
      msgs: [{ f: "user", txt: "Em đã đặt lịch tái khám tuần sau", t: "1 giờ trước" }],
    },
    {
      id: 4, staffId: 102, staffName: "CV. Đỗ Thanh Hằng", staffSpec: "Tâm lý",
      userRole: "tuvan", userName: "Phạm Thanh Tâm", topic: "Tâm lý",
      status: "Đang diễn ra", last: "Bạn có thể chia sẻ thêm không?",
      updatedAt: Date.now() - 10 * 60 * 1000,
      msgs: [
        { f: "user", txt: "Em chào chị, dạo này em hay mất ngủ và lo âu", t: "09:01" },
        { f: "staff", txt: "Chào bạn, mình hiểu cảm giác đó. Tình trạng này kéo dài bao lâu rồi?", t: "09:03" },
        { f: "user", txt: "Khoảng 3 tuần ạ, từ khi áp lực công việc tăng", t: "09:04" },
        { f: "staff", txt: "Bạn có thể chia sẻ thêm không?", t: "09:05" },
      ],
    },
    {
      id: 5, staffId: 104, staffName: "CV. Lý Mai Phương", staffSpec: "Dinh dưỡng",
      userRole: "tuvan", userName: "Phạm Thanh Tâm", topic: "Dinh dưỡng",
      status: "Đã kết thúc", last: "Cảm ơn chị, em sẽ thử áp dụng",
      updatedAt: Date.now() - 24 * 60 * 60 * 1000,
      msgs: [
        { f: "user", txt: "Em muốn hỏi về chế độ ăn giảm cân ạ", t: "Hôm qua" },
        { f: "staff", txt: "Mình gợi ý bạn ăn 1500-1700 kcal/ngày, ưu tiên rau xanh và protein nạc...", t: "Hôm qua" },
        { f: "user", txt: "Cảm ơn chị, em sẽ thử áp dụng", t: "Hôm qua" },
      ],
    },
  ],
  appointments: [
    { id: 1, patientName: "Trần Văn Hậu", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "08:00", clinic: "CN Q1", status: "Sắp tới", age: 58, symptoms: "Đau ngực dữ dội, khó thở", level: "Khẩn cấp", vitals: { bp: "160/100", hr: "112", temp: "37.2°C", spo2: "94%" } },
    { id: 2, patientName: "Đặng Quỳnh Anh", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "08:45", clinic: "CN Q1", status: "Sắp tới", age: 34, symptoms: "Sốt cao, đau đầu kéo dài 3 ngày", level: "Cao", vitals: { bp: "120/80", hr: "98", temp: "39.1°C", spo2: "97%" } },
    { id: 3, patientName: "Phạm Bích Ngọc", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "09:30", clinic: "CN Q1", status: "Sắp tới", age: 47, symptoms: "Đau lưng dưới, tê chân phải", level: "Trung bình", vitals: { bp: "125/82", hr: "78", temp: "36.7°C", spo2: "98%" } },
    { id: 4, patientName: "Lê Văn Tú", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "10:00", clinic: "CN Q1", status: "Sắp tới", age: 41, symptoms: "Tái khám tăng huyết áp", level: "Trung bình", vitals: { bp: "138/88", hr: "82", temp: "36.8°C", spo2: "98%" } },
    { id: 5, patientName: "Mai Hồng Yến", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "10:45", clinic: "CN Q1", status: "Sắp tới", age: 29, symptoms: "Khám sức khỏe định kỳ", level: "Thấp", vitals: { bp: "118/76", hr: "72", temp: "36.5°C", spo2: "99%" } },
    { id: 6, patientName: "Nguyễn Minh Khoa", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-10", time: "09:00", clinic: "CN Q1", status: "Sắp tới" },
    { id: 7, patientName: "Nguyễn Minh Khoa", doctorName: "BS. Phạm Mai Dung", doctorSpec: "Tai mũi họng", date: "2026-04-22", time: "14:30", clinic: "CN Q1", status: "Hoàn thành" },
    { id: 8, patientName: "Nguyễn Minh Khoa", doctorName: "BS. Trần Thị Bình", doctorSpec: "Da liễu", date: "2026-04-05", time: "10:00", clinic: "CN Q3", status: "Hoàn thành" },
    { id: 9, patientName: "Trần Thu Hà", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-08", time: "09:30", clinic: "CN Q1", status: "Sắp tới" },
  ],
};

let state: State = initial;
const listeners = new Set<() => void>();

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const emit = () => listeners.forEach(l => l());
const setState = (updater: (s: State) => State) => { state = updater(state); emit(); };

const getState = () => state;
export const useStoreState = (): State => useSyncExternalStore(subscribe, getState, getState);
export const useStore = <T,>(selector: (s: State) => T): T => selector(useStoreState());

export const store = {
  // Threads
  addThread: (t: Omit<Thread, "id" | "updatedAt">) => {
    const id = Date.now();
    setState(s => ({ ...s, threads: [{ ...t, id, updatedAt: Date.now() }, ...s.threads] }));
    return id;
  },
  appendMessage: (threadId: number, msg: Msg, newStatus?: Thread["status"]) => {
    setState(s => ({
      ...s,
      threads: s.threads.map(t =>
        t.id === threadId
          ? { ...t, msgs: [...t.msgs, msg], last: msg.txt, updatedAt: Date.now(), status: newStatus ?? (t.status === "Chờ phản hồi" && msg.f === "staff" ? "Đang diễn ra" : t.status) }
          : t
      ),
    }));
  },
  setThreadStatus: (threadId: number, status: Thread["status"]) => {
    setState(s => ({ ...s, threads: s.threads.map(t => t.id === threadId ? { ...t, status } : t) }));
  },

  // Appointments
  addAppointment: (a: Omit<Appointment, "id">) => {
    const id = Date.now();
    setState(s => ({ ...s, appointments: [{ ...a, id }, ...s.appointments] }));
    return id;
  },
  updateAppointment: (id: number, patch: Partial<Appointment>) => {
    setState(s => ({ ...s, appointments: s.appointments.map(a => a.id === id ? { ...a, ...patch } : a) }));
  },
};

export const formatRelative = (ts: number): string => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};
