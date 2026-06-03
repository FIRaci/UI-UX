import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Sparkles, Star, Clock, X } from "lucide-react";
import { DOCTORS, type DoctorRec } from "./constants";

interface DoctorListProps {
  filterSpecialty?: string | null;
  onFilterClear?: () => void;
  onViewDoctor: (d: DoctorRec) => void;
  onBookDoctor: (d: DoctorRec) => void;
}

export function DoctorList({ filterSpecialty, onFilterClear, onViewDoctor, onBookDoctor }: DoctorListProps) {
  const filtered = filterSpecialty
    ? DOCTORS.filter(d => d.specialty === filterSpecialty || d.tags.some(t => t === filterSpecialty))
    : DOCTORS;
  const others = filterSpecialty ? DOCTORS.filter(d => !filtered.includes(d)) : [];

  return (
    <div className="space-y-4">
      {filterSpecialty ? (
        <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200" style={{ borderRadius: "16px" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Lọc theo chuyên khoa: <b>{filterSpecialty}</b></span>
              </div>
              <p className="text-sm mt-1 text-slate-600">Hiển thị bác sĩ phù hợp với triệu chứng bạn đã mô tả</p>
            </div>
            <Button size="sm" variant="ghost" className="rounded-xl text-slate-500 gap-1.5" onClick={onFilterClear}>
              <X className="w-3.5 h-3.5" /> Xem tất cả
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-gradient-to-r from-violet-50 to-teal-50 border-violet-200" style={{ borderRadius: "16px" }}>
          <div className="flex items-center gap-2 text-violet-700">
            <Sparkles className="w-4 h-4" /> <span className="text-sm font-medium">Ghép đôi bởi AI</span>
          </div>
          <p className="text-sm mt-1">Các bác sĩ dưới đây được AI chọn lựa dựa trên triệu chứng và lịch sử của bạn</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(doc => (
          <Card key={doc.id} className="p-5 hover:shadow-md hover:border-emerald-100 transition-all duration-300 border border-slate-100" style={{ borderRadius: "16px" }}>
            <div className="flex items-start gap-3">
              <Avatar className="w-14 h-14 border border-slate-100 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg">
                  {doc.name.split(" ").pop()?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-800">{doc.name}</div>
                <Badge variant="secondary" className="mt-0.5">{doc.specialty}</Badge>
                <div className="flex items-center gap-3 text-sm mt-2">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {doc.rating}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {doc.availability}
                  </span>
                </div>
              </div>
            </div>

            <Card className="p-3 bg-emerald-50 border-emerald-200 mt-3" style={{ borderRadius: "12px" }}>
              <div className="text-xs font-semibold text-emerald-700 mb-1">Lý do phù hợp</div>
              <p className="text-sm text-slate-700">{doc.matchReason}</p>
            </Card>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {doc.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
            </div>

            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => onViewDoctor(doc)}>Chi tiết</Button>
              <Button size="sm" className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => onBookDoctor(doc)}>
                Đặt lịch ngay
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {others.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground font-medium px-1 pt-2">Bác sĩ chuyên khoa khác</p>
          <div className="grid md:grid-cols-2 gap-4 opacity-75">
            {others.map(doc => (
              <Card key={doc.id} className="p-5 hover:shadow-md hover:border-slate-200 transition-all duration-300 border border-slate-100" style={{ borderRadius: "16px" }}>
                <div className="flex items-start gap-3">
                  <Avatar className="w-14 h-14 border border-slate-100 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-500 text-white font-bold text-lg">
                      {doc.name.split(" ").pop()?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800">{doc.name}</div>
                    <Badge variant="secondary" className="mt-0.5">{doc.specialty}</Badge>
                    <div className="flex items-center gap-3 text-sm mt-2">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" /> {doc.rating}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5" /> {doc.availability}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => onViewDoctor(doc)}>Chi tiết</Button>
                  <Button size="sm" className="flex-1 rounded-xl bg-slate-600 hover:bg-slate-700" onClick={() => onBookDoctor(doc)}>
                    Đặt lịch ngay
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
