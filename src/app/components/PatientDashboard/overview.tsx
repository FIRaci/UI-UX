import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Clock, Search, MessagesSquare, FileHeart, ChevronRight, Activity, ArrowRight, ActivitySquare, HeartPulse, Bot, CalendarDays } from "lucide-react";
import type { Appointment } from "../../store";

export function Overview({ onJump, appts, threads }: { onJump: (v: string) => void; appts: Appointment[]; threads: any[] }) {
  const upcoming = appts.find((a: Appointment) => a.status === "Sắp tới");
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Hero Section / Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 bg-blue-900 text-white shadow-xl relative overflow-hidden border-0 group rounded-[32px]">
          {/* Decorative glowing orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 transition-colors duration-700" />
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl -z-10 translate-y-1/3 transition-colors duration-700" />
          
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-blue-100 tracking-wide uppercase mb-6">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> <span>Tổng quan Sức khỏe</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                Sức khỏe của bạn <br/> <span className="text-blue-300">đang rất ổn định</span>
              </h2>
              <p className="text-blue-100/80 text-[15px] max-w-md leading-relaxed">
                Chỉ số sức khỏe hiện tại đạt 86/100. Hãy tiếp tục duy trì chế độ sinh hoạt và uống nước đều đặn.
              </p>
            </div>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <Button onClick={() => onJump("chat")} className="h-14 px-8 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-[15px] shadow-sm transition-all hover:scale-105 border-0">
                <Bot className="w-5 h-5 mr-2" /> Trò chuyện với AI ngay
              </Button>
              <Button onClick={() => onJump("records")} variant="outline" className="h-14 px-8 rounded-2xl bg-white/5 border-white/20 text-white hover:bg-white/10 font-semibold text-[15px] backdrop-blur-md">
                Xem chi tiết hồ sơ
              </Button>
            </div>
          </div>
        </Card>

        {/* Upcoming Appointment */}
        <Card className="p-7 bg-white shadow-sm border border-slate-200 relative overflow-hidden group flex flex-col rounded-[32px]">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <Clock className="w-32 h-32" />
          </div>
          
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full self-start mb-6 uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" /> Lịch khám sắp tới
          </div>
          
          {upcoming ? (
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-[13px] font-semibold text-slate-400 mb-1">{upcoming.date} • {upcoming.time}</div>
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight mb-2">{upcoming.doctorName}</h3>
              <p className="text-slate-500 font-medium text-[15px]">{upcoming.doctorSpec}</p>
              
              <div className="mt-8">
                <Button onClick={() => onJump("appointments")} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                  Xem chi tiết lịch hẹn
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <CalendarDays className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium mb-6">Bạn không có lịch hẹn khám nào trong tuần này.</p>
              <Button onClick={() => onJump("search")} className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm">
                Đặt lịch khám mới
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Services Bento Grid */}
      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mt-8 mb-4 px-2">Dịch vụ & Tính năng</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Chatbot shortcut */}
        <Card onClick={() => onJump("chat")} className="p-6 bg-blue-50 border-0 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
            <MessagesSquare className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-1">Tư vấn sức khỏe AI</h4>
          <p className="text-sm text-slate-600 font-medium">Hỏi đáp trực tiếp với trợ lý thông minh</p>
        </Card>

        {/* Search Doctors shortcut */}
        <Card onClick={() => onJump("search")} className="p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-1">Tìm Bác sĩ</h4>
          <p className="text-sm text-slate-500 font-medium">Danh sách các chuyên gia y tế hàng đầu</p>
        </Card>

        {/* Tracking shortcut */}
        <Card onClick={() => onJump("tracking")} className="p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <ActivitySquare className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-1">Theo dõi chỉ số</h4>
          <p className="text-sm text-slate-500 font-medium">Huyết áp, nhịp tim, đường huyết</p>
        </Card>

        {/* Records shortcut */}
        <Card onClick={() => onJump("records")} className="p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <FileHeart className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-1">Hồ sơ bệnh án</h4>
          <p className="text-sm text-slate-500 font-medium">Lưu trữ kết quả khám và đơn thuốc</p>
        </Card>

      </div>
    </div>
  );
}
