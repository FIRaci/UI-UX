import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Search, Star, MapPin } from "lucide-react";
import { SPECIALTIES, type Doctor } from "./constants";

export function SearchSection({
  search, setSearch, specFilter, setSpecFilter, doctors, onPick, onBook
}: {
  search: string; setSearch: (v: string) => void;
  specFilter: string; setSpecFilter: (v: string) => void;
  doctors: Doctor[];
  onPick: (d: Doctor) => void;
  onBook: (d: Doctor) => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: "16px" }}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:ring-1 focus:ring-sky-500" placeholder="Tìm theo tên bác sĩ, chuyên khoa..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={specFilter} onValueChange={setSpecFilter}>
            <SelectTrigger className="md:w-56 h-10 rounded-xl border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium"><SelectValue placeholder="Chuyên khoa" /></SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-lg">
              <SelectItem value="all" className="text-xs">Tất cả chuyên khoa</SelectItem>
              {SPECIALTIES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {doctors.length === 0 ? (
        <Card className="p-10 text-center bg-white border-slate-100" style={{ borderRadius: "16px" }}>
          <p className="text-slate-400 font-medium">Không tìm thấy bác sĩ phù hợp.</p>
          <p className="text-xs text-slate-400 mt-1">Hãy thử tìm với từ khóa khác hoặc xóa bộ lọc.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {doctors.map(d => (
            <Card key={d.id} className="p-5 hover:shadow-md transition-all duration-300 bg-white border border-slate-100 hover:border-sky-100 card-hover" style={{ borderRadius: "16px" }}>
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14 border border-slate-100 shadow-sm"><AvatarFallback className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-bold text-lg">{d.name.split(" ").pop()![0]}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-800 text-base tracking-tight">{d.name}</div>
                      <span className="inline-flex px-2 py-0.5 mt-1 rounded-md bg-sky-50 text-sky-700 text-[10px] font-semibold tracking-wide border border-sky-100">{d.spec}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100"><Star className="w-3.5 h-3.5 fill-current" />{d.rating}</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-3 flex items-center gap-3.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {d.clinic}</span>
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{d.fee}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">Có lịch trống hôm nay</span>
                  </div>
                  <div className="flex gap-2.5 mt-3">
                    <Button size="sm" variant="outline" className="rounded-xl flex-1 text-xs" onClick={() => onPick(d)}>Chi tiết</Button>
                    <Button size="sm" className="rounded-xl flex-1 text-xs bg-slate-900 hover:bg-slate-800 shadow-sm" onClick={() => onBook(d)}>Đặt lịch</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
