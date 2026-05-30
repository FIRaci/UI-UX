import { useState, useEffect } from "react";
import { AppShell } from "../AppShell";
import { useStore, store, formatRelative } from "../../store";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Send, CheckCircle2, MessageSquareText, Search, User, Clock, ShieldCheck, Activity } from "lucide-react";

export function ConsultantDashboard({ onLogout, role }: { onLogout: () => void; role: string }) {
  const [active, setActive] = useState("chat");
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");

  // Get threads where the userRole is "tuvan" (Consultant) or where the staff role matches
  // Since we don't have login context for specific staff, we'll just show all threads that belong to "CV." (Consultant)
  // or userRole = "tuvan" (which means the patient was talking to a consultant)
  const threads = useStore(s => 
    s.threads.filter(t => t.staffName.startsWith("CV.") || t.userRole === "tuvan")
             .sort((a, b) => b.updatedAt - a.updatedAt)
  );

  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);

  const activeThread = threads.find(t => t.id === activeThreadId);

  const filteredThreads = threads.filter(t => 
    t.userName.toLowerCase().includes(search.toLowerCase()) || 
    t.topic.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!reply.trim() || !activeThread) return;
    store.appendMessage(activeThread.id, { f: "staff", txt: reply, t: "vừa xong" });
    setReply("");
  };

  const handleComplete = () => {
    if (!activeThread) return;
    store.setThreadStatus(activeThread.id, "Đã kết thúc");
  };

  return (
    <AppShell
      title="Trung tâm Tư vấn Online"
      subtitle="Chuyên gia tư vấn"
      roleLabel="Tư vấn viên"
      roleColor="bg-emerald-100 text-emerald-700 border border-emerald-200"
      initials="CV"
      active={active}
      onNav={setActive}
      onLogout={onLogout}
      nav={[
        { key: "chat", label: "Tin nhắn bệnh nhân", icon: MessageSquareText },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4">
        
        {/* Left Column: Thread List */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(8,112,184,0.04)] rounded-[2rem] flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100/60 bg-white/50">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-4">Danh sách phiên tư vấn</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Tìm kiếm bệnh nhân, chủ đề..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm shadow-sm"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {filteredThreads.length === 0 ? (
                <div className="py-12 text-center text-sm font-medium text-slate-400">Không tìm thấy phiên tư vấn nào.</div>
              ) : filteredThreads.map(t => {
                const isActive = t.id === activeThreadId;
                const isUnread = t.status === "Đang diễn ra" || t.status === "Chờ phản hồi";
                
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveThreadId(t.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border group flex gap-4 ${
                      isActive 
                        ? "bg-emerald-50 border-emerald-200 shadow-md shadow-emerald-500/10" 
                        : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                    }`}
                  >
                    <div className="relative shrink-0">
                       <Avatar className={`w-12 h-12 shadow-sm border-2 ${isActive ? "border-emerald-100" : "border-white group-hover:scale-105 transition-transform"}`}>
                         <AvatarFallback className={`${isActive ? "bg-emerald-500 text-white" : "bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600"} font-bold`}>
                           {t.userName[0]}
                         </AvatarFallback>
                       </Avatar>
                       {isUnread && (
                         <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center animate-pulse shadow-sm"></span>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className={`font-bold truncate text-[15px] ${isActive ? "text-emerald-900" : "text-slate-800"}`}>
                          {t.userName}
                        </div>
                        <div className={`text-[11px] font-medium shrink-0 ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
                          {formatRelative(t.updatedAt)}
                        </div>
                      </div>
                      <div className={`text-[13px] font-medium truncate mb-1.5 ${isActive ? "text-emerald-700/80" : "text-slate-500"}`}>
                        {t.topic}
                      </div>
                      <div className={`text-sm truncate line-clamp-1 ${isUnread && !isActive ? "font-semibold text-slate-700" : isActive ? "text-emerald-800" : "text-slate-500"}`}>
                        {t.last}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Column: Chat Box */}
        <div className="bg-white/90 backdrop-blur-3xl border border-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] rounded-[2rem] flex flex-col overflow-hidden">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 shadow-sm border border-slate-200">
                     <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">{activeThread.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-lg font-extrabold text-slate-800 tracking-tight">{activeThread.userName}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> {activeThread.topic}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        activeThread.status === "Đang diễn ra" ? "bg-emerald-100 text-emerald-700" :
                        activeThread.status === "Chờ phản hồi" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {activeThread.status}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleComplete}
                  disabled={activeThread.status === "Đã kết thúc"}
                  className="rounded-xl h-10 px-4 font-bold border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all text-slate-600 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Đánh dấu hoàn thành
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-6 bg-slate-50/50">
                <div className="space-y-6">
                  {activeThread.msgs.map((m, i) => {
                    const isStaff = m.f === "staff";
                    return (
                      <div key={i} className={`flex ${isStaff ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`} style={{ animationDelay: `${i * 50}ms` }}>
                        <div className={`flex gap-3 max-w-[80%] ${isStaff ? "flex-row-reverse" : ""}`}>
                          <Avatar className="w-8 h-8 shrink-0 shadow-sm">
                            <AvatarFallback className={`${isStaff ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"} text-xs font-bold`}>
                              {isStaff ? "CV" : activeThread.userName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className={`px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed shadow-sm ${
                              isStaff 
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm" 
                                : "bg-white border border-slate-200/60 text-slate-800 rounded-tl-sm"
                            }`}>
                              {m.txt}
                            </div>
                            <div className={`text-[11px] font-medium mt-1.5 px-1 ${isStaff ? "text-right text-slate-400" : "text-slate-400"}`}>
                              {m.t}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 bg-white border-t border-slate-100">
                {activeThread.status === "Đã kết thúc" ? (
                  <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-slate-500 font-medium flex items-center justify-center gap-2">
                     <ShieldCheck className="w-5 h-5 text-emerald-500" />
                     Phiên tư vấn này đã được đánh dấu hoàn thành.
                  </div>
                ) : (
                  <div className="flex gap-3 items-center bg-slate-50 rounded-2xl p-2 border border-slate-200 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 transition-all">
                    <Input 
                      placeholder="Nhập nội dung tư vấn chuyên môn..." 
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSend()}
                      className="border-0 bg-transparent h-12 px-3 text-[15px] focus-visible:ring-0 shadow-none"
                    />
                    <Button 
                      onClick={handleSend} 
                      disabled={!reply.trim()}
                      className="h-12 w-12 shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-transform active:scale-95 border-0"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <MessageSquareText className="w-16 h-16 mb-4 text-slate-300" />
              <div className="text-lg font-bold text-slate-600 mb-1">Chưa chọn phiên tư vấn</div>
              <div className="text-sm">Chọn một bệnh nhân từ danh sách bên trái để bắt đầu.</div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
