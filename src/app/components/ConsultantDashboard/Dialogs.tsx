import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Star, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { DoctorRec, ConsultHistory, Article } from "./constants";

interface DialogsProps {
  showConfirm: boolean;
  selectedDoctor: DoctorRec | null;
  selectedSlot: string;
  appointmentNotes: string;
  viewingDoctor: DoctorRec | null;
  viewingHistory: ConsultHistory | null;
  readingArticle: Article | null;
  onCloseConfirm: () => void;
  onCloseViewDoctor: () => void;
  onCloseViewHistory: () => void;
  onCloseReadingArticle: () => void;
  onConfirmBooking: () => void;
  onBookFromDoctor: (d: DoctorRec) => void;
  onNavigateToDoctors: () => void;
}

export function Dialogs({
  showConfirm, selectedDoctor, selectedSlot, appointmentNotes,
  viewingDoctor, viewingHistory, readingArticle,
  onCloseConfirm, onCloseViewDoctor, onCloseViewHistory, onCloseReadingArticle,
  onConfirmBooking, onBookFromDoctor, onNavigateToDoctors,
}: DialogsProps) {
  return (
    <>
      <Dialog open={showConfirm} onOpenChange={onCloseConfirm}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Xác nhận đặt lịch</DialogTitle>
            <DialogDescription>Vui lòng kiểm tra lại thông tin</DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Bác sĩ</div>
                  <div className="mt-0.5 font-medium">{selectedDoctor.name}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Chuyên khoa</div>
                  <div className="mt-0.5 font-medium">{selectedDoctor.specialty}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Thời gian</div>
                  <div className="mt-0.5 font-medium">{selectedSlot}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Ngày</div>
                  <div className="mt-0.5 font-medium">Hôm nay</div>
                </div>
              </div>
              {appointmentNotes && (
                <Card className="p-3 bg-slate-50 border-slate-100">
                  <div className="text-xs text-muted-foreground mb-1">Ghi chú</div>
                  <p className="text-sm">{appointmentNotes}</p>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={onCloseConfirm}>Hủy</Button>
            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={onConfirmBooking}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingDoctor} onOpenChange={onCloseViewDoctor}>
        <DialogContent className="animate-scale-in">
          {viewingDoctor && (
            <>
              <DialogHeader className="text-left">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-slate-100">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                      {viewingDoctor.name.split(" ").pop()?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{viewingDoctor.name}</DialogTitle>
                    <DialogDescription>{viewingDoctor.specialty}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Đánh giá</div>
                  <div className="mt-1 flex items-center gap-1 font-semibold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{viewingDoctor.rating}/5.0</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-muted-foreground">Slot tiếp theo</div>
                  <div className="mt-1 font-medium">{viewingDoctor.nextSlot}</div>
                </div>
              </div>
              <Card className="p-3 bg-emerald-50 border-emerald-200" style={{ borderRadius: "10px" }}>
                <div className="text-xs font-semibold text-emerald-700 mb-1">Lý do phù hợp</div>
                <p className="text-sm text-slate-700">{viewingDoctor.matchReason}</p>
              </Card>
              <div>
                <div className="text-sm font-medium mb-2">Chuyên môn</div>
                <div className="flex flex-wrap gap-1.5">
                  {viewingDoctor.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={onCloseViewDoctor}>Đóng</Button>
                <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => onBookFromDoctor(viewingDoctor)}>
                  Đặt lịch
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingHistory} onOpenChange={onCloseViewHistory}>
        <DialogContent className="max-w-2xl animate-scale-in">
          {viewingHistory && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>Tóm tắt tư vấn AI</DialogTitle>
                <DialogDescription>{viewingHistory.date}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Triệu chứng đã thảo luận</div>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingHistory.symptoms.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Đánh giá mức độ</div>
                  <Badge variant={viewingHistory.severity === "Khẩn cấp" ? "destructive" : "secondary"}>
                    {viewingHistory.severity}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Khuyến nghị hành động</div>
                  <div className="space-y-1.5">
                    {viewingHistory.actions.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Chuyên khoa đề xuất</div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{viewingHistory.specialty}</Badge>
                </div>
                <Card className="p-3 bg-amber-50 border-amber-200" style={{ borderRadius: "10px" }}>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <b>Khuyến nghị đặt lịch:</b> {viewingHistory.bookingRec}
                    </div>
                  </div>
                </Card>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={onCloseViewHistory}>Đóng</Button>
                <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={onNavigateToDoctors}>
                  Đặt lịch với chuyên gia
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!readingArticle} onOpenChange={onCloseReadingArticle}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 animate-scale-in">
          {readingArticle && (
            <>
              <div className="h-40 relative" style={{ background: readingArticle.cover }}>
                <Badge variant="secondary" className="absolute bottom-3 left-6 bg-white/90 backdrop-blur">{readingArticle.c}</Badge>
              </div>
              <div className="px-6 pb-6">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl tracking-tight">{readingArticle.t}</DialogTitle>
                  <DialogDescription>{readingArticle.author} • {readingArticle.date} • {readingArticle.d}</DialogDescription>
                </DialogHeader>
                <p className="mt-4 text-base leading-relaxed text-slate-700 italic border-l-4 border-emerald-300 pl-3">
                  {readingArticle.lead}
                </p>
                <div className="mt-5 space-y-4">
                  {readingArticle.sections.map((s, idx) => (
                    <section key={idx}>
                      <h4 className="tracking-tight text-slate-900">{s.h}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700">{s.p}</p>
                    </section>
                  ))}
                </div>
                <DialogFooter className="mt-6">
                  <Button variant="outline" className="rounded-xl" onClick={() => { toast.info("Tính năng lưu bài viết đang phát triển"); }}>Lưu bài viết</Button>
                  <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={onCloseReadingArticle}>Đóng</Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
