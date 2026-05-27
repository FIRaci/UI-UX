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
  id: number | string;
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
    {
      id: 6, staffId: 203, staffName: "BS. Lê Hoàng Cường", staffSpec: "Nhi khoa",
      userRole: "benhnhan", userName: "Trần Thu Hà", topic: "Hỏi về sức khỏe trẻ",
      status: "Đang diễn ra", last: "Bé nhà em sốt 2 ngày nay, có nên cho uống hạ sốt không ạ?",
      updatedAt: Date.now() - 30 * 60 * 1000,
      msgs: [
        { f: "user", txt: "Bé nhà em 3 tuổi, sốt 38.5 độ từ hôm qua, có nên cho uống hạ sốt không ạ?", t: "30 phút trước" },
        { f: "staff", txt: "Bạn cho bé uống Paracetamol theo cân nặng (10-15mg/kg), cách 4-6h nếu còn sốt trên 38.5°C. Theo dõi thêm nhé.", t: "25 phút trước" },
        { f: "user", txt: "Dạ cảm ơn bác sĩ. Bé vẫn chơi được nhưng biếng ăn ạ.", t: "20 phút trước" },
        { f: "staff", txt: "Biếng ăn khi sốt là bình thường. Cho bé uống nhiều nước, ăn cháo loãng, nếu sốt kéo dài >3 ngày thì đưa bé đi khám.", t: "15 phút trước" },
      ],
    },
    {
      id: 7, staffId: 105, staffName: "BS. Vũ Quốc Đạt", staffSpec: "Cơ xương khớp",
      userRole: "benhnhan", userName: "Phạm Bích Ngọc", topic: "Đau lưng",
      status: "Chờ phản hồi", last: "Em tập yoga được 2 tuần nhưng đau lưng nhiều hơn",
      updatedAt: Date.now() - 45 * 60 * 1000,
      msgs: [
        { f: "user", txt: "Em tập yoga được 2 tuần nhưng đau lưng nhiều hơn, có nên tiếp tục không ạ?", t: "45 phút trước" },
      ],
    },
    {
      id: 8, staffId: 204, staffName: "BS. Phạm Mai Dung", staffSpec: "Tai mũi họng",
      userRole: "benhnhan", userName: "Lê Văn Tú", topic: "Viêm xoang",
      status: "Đã kết thúc", last: "Cảm ơn bác sĩ, em đã đỡ nhiều rồi ạ",
      updatedAt: Date.now() - 48 * 60 * 60 * 1000,
      msgs: [
        { f: "user", txt: "Em bị viêm xoang tái phát lần thứ 3 trong năm, có cách nào điều trị dứt điểm không ạ?", t: "3 ngày trước" },
        { f: "staff", txt: "Viêm xoang tái phát nhiều lần cần được nội soi và chụp CT để đánh giá. Em có thể cần can thiệp rửa xoang hoặc phẫu thuật nếu thuốc không hiệu quả.", t: "3 ngày trước" },
        { f: "user", txt: "Cảm ơn bác sĩ, em đã đỡ nhiều rồi ạ", t: "2 ngày trước" },
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
    { id: 10, patientName: "Nguyễn Minh Khoa", doctorName: "BS. Lê Hoàng Cường", doctorSpec: "Nhi khoa", date: "2026-05-20", time: "08:30", clinic: "CN Tân Bình", status: "Sắp tới", age: 35, symptoms: "Tư vấn sức khỏe trẻ em", level: "Thấp" },
    { id: 11, patientName: "Trần Thu Hà", doctorName: "BS. Vũ Quốc Đạt", doctorSpec: "Cơ xương khớp", date: "2026-05-18", time: "15:30", clinic: "CN Q7", status: "Sắp tới", age: 28, symptoms: "Đau khớp gối phải", level: "Trung bình", vitals: { bp: "122/78", hr: "76", temp: "36.6°C", spo2: "99%" } },
    { id: 12, patientName: "Phạm Bích Ngọc", doctorName: "BS. Trần Thị Bình", doctorSpec: "Da liễu", date: "2026-05-22", time: "11:00", clinic: "CN Q3", status: "Sắp tới", age: 47, symptoms: "Tái khám da liễu - mụn trứng cá", level: "Thấp" },
    { id: 13, patientName: "Đặng Quỳnh Anh", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "08:45", clinic: "CN Q1", status: "Hoàn thành", age: 34, symptoms: "Sốt cao, đau đầu kéo dài 3 ngày", level: "Cao", vitals: { bp: "118/78", hr: "76", temp: "36.8°C", spo2: "98%" } },
    { id: 14, patientName: "Mai Hồng Yến", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-04-28", time: "10:45", clinic: "CN Q1", status: "Hoàn thành", age: 29, symptoms: "Khám sức khỏe định kỳ", level: "Thấp" },
    { id: 15, patientName: "Trần Văn Hậu", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-01", time: "09:00", clinic: "CN Q1", status: "Đã hủy", age: 58, level: "Khẩn cấp" },
    { id: 16, patientName: "Nguyễn Minh Khoa", doctorName: "BS. Phạm Mai Dung", doctorSpec: "Tai mũi họng", date: "2026-05-25", time: "14:30", clinic: "CN Q1", status: "Sắp tới", symptoms: "Khám họng định kỳ", level: "Thấp" },
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
    let resultId = 0;
    setState(s => {
      const existing = s.threads.find(
        th => th.staffId === t.staffId && th.userName === t.userName && th.userRole === t.userRole
          && th.status !== "Đã kết thúc"
      );
      if (existing) {
        resultId = existing.id;
        return {
          ...s,
          threads: s.threads.map(th =>
            th.id === existing.id
              ? { ...th, msgs: [...th.msgs, ...t.msgs], last: t.last, updatedAt: Date.now(), status: "Chờ phản hồi" as const }
              : th
          ),
        };
      }
      const id = Date.now();
      resultId = id;
      return { ...s, threads: [{ ...t, id, updatedAt: Date.now() }, ...s.threads] };
    });
    return resultId;
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
    const id = String(Date.now());
    setState(s => ({ ...s, appointments: [{ ...a, id }, ...s.appointments] }));

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch("http://localhost:3000/api/appointments", {
      method: "POST",
      headers,
      body: JSON.stringify({
        patientName: a.patientName,
        doctorName: a.doctorName,
        doctorSpec: a.doctorSpec,
        date: a.date,
        time: a.time,
        clinic: a.clinic,
        status: a.status,
        age: a.age,
        symptoms: a.symptoms,
        level: a.level,
        vitalsBp: a.vitals?.bp,
        vitalsHr: a.vitals?.hr,
        vitalsTemp: a.vitals?.temp,
        vitalsSpo2: a.vitals?.spo2
      })
    }).then(res => {
      if (handleUnauthorizedResponse(res)) {
        setState(s => ({ ...s, appointments: s.appointments.filter(x => x.id !== id) }));
        return;
      }
      if (res.ok) {
        fetchAppointments();
      }
    }).catch(err => {
      console.error("Error adding appointment:", err);
      setState(s => ({ ...s, appointments: s.appointments.filter(x => x.id !== id) }));
    });
    return id;
  },
  updateAppointment: (id: number | string, patch: Partial<Appointment>) => {
    const prev = state.appointments.find(a => String(a.id) === String(id));
    setState(s => ({ ...s, appointments: s.appointments.map(a => String(a.id) === String(id) ? { ...a, ...patch } : a) }));

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`http://localhost:3000/api/appointments/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        status: patch.status,
        date: patch.date,
        time: patch.time
      })
    }).then(res => {
      if (handleUnauthorizedResponse(res)) {
        if (prev) {
          setState(s => ({ ...s, appointments: s.appointments.map(a => String(a.id) === String(prev.id) ? prev : a) }));
        }
        return;
      }
      if (res.ok) {
        fetchAppointments();
      }
    }).catch(err => {
      console.error("Error updating appointment:", err);
      if (prev) {
        setState(s => ({ ...s, appointments: s.appointments.map(a => String(a.id) === String(prev.id) ? prev : a) }));
      }
    });
  },
};

export const formatRelative = (ts: number): string => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};

const handleUnauthorizedResponse = (res: Response) => {
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.dispatchEvent(new CustomEvent("app:unauthorized"));
    return true;
  }
  return false;
};

export const fetchAppointments = async () => {
  try {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("http://localhost:3000/api/appointments", { headers });
    if (handleUnauthorizedResponse(res)) return;
    if (res.ok) {
      const data: Record<string, unknown>[] = await res.json();
      const mapped = data.map((a: Record<string, unknown>) => ({
        id: a.id,
        patientName: a.patientName,
        doctorName: a.doctorName,
        doctorSpec: a.doctorSpec,
        date: a.date,
        time: a.time,
        clinic: a.clinic,
        status: a.status as "Sắp tới" | "Hoàn thành" | "Đã hủy",
        age: a.age ?? undefined,
        symptoms: a.symptoms ?? undefined,
        level: a.level as "Khẩn cấp" | "Cao" | "Trung bình" | "Thấp" | undefined,
        vitals: (a.vitalsBp || a.vitalsHr || a.vitalsTemp || a.vitalsSpo2) ? {
          bp: a.vitalsBp ?? "",
          hr: a.vitalsHr ?? "",
          temp: a.vitalsTemp ?? "",
          spo2: a.vitalsSpo2 ?? ""
        } : undefined
      }));
      setState(s => {
        const serverMap = new Map(mapped.map(a => [String(a.id), a]));
        const localPending = s.appointments.filter(a => !serverMap.has(String(a.id)));
        return { ...s, appointments: [...localPending, ...mapped] };
      });
    }
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
  }
};

if (typeof window !== "undefined") {
  fetchAppointments();
}
