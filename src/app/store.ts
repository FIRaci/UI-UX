import { useSyncExternalStore } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

export type Notification = {
  id: string;
  target: string;
  title: string;
  content: string;
  time: string;
  status: string;
  isRead: boolean;
  createdAt: string;
};

type State = {
  threads: Thread[];
  appointments: Appointment[];
  doctors: any[];
  articles: any[];
  notifications: Notification[];
};

const initial: State = {
  threads: [],
  appointments: [],
  doctors: [],
  articles: [],
  notifications: [],
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
    setState(s => {
      const existing = s.threads.find(
        th => th.staffId === t.staffId && th.userName === t.userName && th.userRole === t.userRole
          && th.status !== "Đã kết thúc"
      );
      if (existing) {
        return {
          ...s,
          threads: s.threads.map(th =>
            th.id === existing.id
              ? { ...th, msgs: [...th.msgs, ...t.msgs], last: t.last, updatedAt: Date.now(), status: "Chờ phản hồi" as const }
              : th
          ),
        };
      }
      return { ...s, threads: [{ ...t, id, updatedAt: Date.now() }, ...s.threads] };
    });

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_URL}/api/threads`, {
      method: "POST",
      headers,
      body: JSON.stringify(t)
    }).then(res => {
      if (res.ok) fetchThreads();
    }).catch(console.error);

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

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_URL}/api/threads/${threadId}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...msg, newStatus })
    }).then(res => {
      if (res.ok) fetchThreads();
    }).catch(console.error);
  },
  setThreadStatus: (threadId: number, status: Thread["status"]) => {
    setState(s => ({ ...s, threads: s.threads.map(t => t.id === threadId ? { ...t, status } : t) }));

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_URL}/api/threads/${threadId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status })
    }).then(res => {
      if (res.ok) fetchThreads();
    }).catch(console.error);
  },
  deleteThread: (threadId: number) => {
    setState(s => ({ ...s, threads: s.threads.filter(t => t.id !== threadId) }));

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_URL}/api/threads/${threadId}`, {
      method: "DELETE",
      headers
    }).then(res => {
      if (res.ok) fetchThreads();
    }).catch(console.error);
  },

  // Appointments
  addAppointment: (a: Omit<Appointment, "id">) => {
    const tempId = "temp_" + Date.now();
    setState(s => ({ ...s, appointments: [{ ...a, id: tempId }, ...s.appointments] }));

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_URL}/api/appointments`, {
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
        setState(s => ({ ...s, appointments: s.appointments.filter(x => x.id !== tempId) }));
        return;
      }
      if (res.ok) {
        // Remove temp appointment, then fetch real data from server
        setState(s => ({ ...s, appointments: s.appointments.filter(x => x.id !== tempId) }));
        fetchAppointments();
      }
    }).catch(err => {
      console.error("Error adding appointment:", err);
      setState(s => ({ ...s, appointments: s.appointments.filter(x => x.id !== tempId) }));
    });
    return tempId;
  },
  updateAppointment: (id: number | string, patch: Partial<Appointment>) => {
    const prev = state.appointments.find(a => String(a.id) === String(id));
    setState(s => ({ ...s, appointments: s.appointments.map(a => String(a.id) === String(id) ? { ...a, ...patch } : a) }));

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_URL}/api/appointments/${id}`, {
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

  // Notifications
  markNotificationRead: (id: string) => {
    setState(s => ({ ...s, notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) }));
    
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers
    }).then(res => {
      if (res.ok) fetchNotifications();
    }).catch(console.error);
  },
  markAllNotificationsRead: () => {
    setState(s => ({ ...s, notifications: s.notifications.map(n => ({ ...n, isRead: true })) }));
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers
    }).then(res => {
      if (res.ok) fetchNotifications();
    }).catch(console.error);
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

    const res = await fetch(`${API_URL}/api/appointments`, { headers });
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

export const fetchThreads = async () => {
  try {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/api/threads`, { headers });
    if (handleUnauthorizedResponse(res)) return;
    if (res.ok) {
      const threads = await res.json();
      setState(s => ({ ...s, threads }));
    }
  } catch (error) {
    console.error("Failed to fetch threads:", error);
  }
};

export const fetchDoctors = async () => {
  try {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/api/doctors`, { headers });
    if (handleUnauthorizedResponse(res)) return;
    if (res.ok) {
      const data = await res.json();
      const mapped = data.map((d: any) => ({
        ...d,
        avail: typeof d.avail === 'string' ? JSON.parse(d.avail) : d.avail
      }));
      setState(s => ({ ...s, doctors: mapped }));
    }
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
  }
};

export const fetchArticles = async () => {
  try {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/api/articles`, { headers });
    if (handleUnauthorizedResponse(res)) return;
    if (res.ok) {
      const articles = await res.json();
      setState(s => ({ ...s, articles }));
    }
  } catch (error) {
    console.error("Failed to fetch articles:", error);
  }
};

export const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/api/notifications`, { headers });
    if (handleUnauthorizedResponse(res)) return;
    if (res.ok) {
      const notifications = await res.json();
      setState(s => ({ ...s, notifications }));
    }
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
  }
};

export const fetchAllData = () => {
  fetchAppointments();
  fetchThreads();
  fetchDoctors();
  fetchArticles();
  fetchNotifications();
};

if (typeof window !== "undefined") {
  fetchAllData();
}
