import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from "sonner";
import { Droplets, Activity, Ruler, Weight, HeartPulse, AlertCircle, Phone } from "lucide-react";

export function Profile() {
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ email: "minhkhoa@email.com", phone: "0901 234 567", dob: "1990-08-15", gender: "Nam", address: "123 Đường Lê Lợi, Quận 1, TP.HCM" });
  const [notifSettings, setNotifSettings] = useState({ sms: true, thuoc: true, xetnghiem: false, email: false });
  const [accessSettings, setAccessSettings] = useState(() => {
    const saved = localStorage.getItem("access_settings");
    return saved ? JSON.parse(saved) : { autoVoiceChat: false };
  });

  const toggleAccess = () => {
    const next = { ...accessSettings, autoVoiceChat: !accessSettings.autoVoiceChat };
    setAccessSettings(next);
    localStorage.setItem("access_settings", JSON.stringify(next));
    toast.success(next.autoVoiceChat ? "Đã bật tự động mở AI (Push to talk)" : "Đã tắt tự động mở AI");
  };

  const [showPayment, setShowPayment] = useState(false);
  const [paymentInputs, setPaymentInputs] = useState({ bank: "", number: "" });

  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Health Stats (Mock Data)
  const healthStats = {
    bloodType: "O+",
    height: "172 cm",
    weight: "68 kg",
    bmi: 23.0,
    bmiStatus: "Bình thường",
    allergies: "Hải sản (Tôm, Cua)",
    history: "Viêm dạ dày nhẹ (2023)",
    emergency: "Nguyễn Thị Mai (Vợ) - 0909 123 456"
  };

  return (
    <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
      <div className="space-y-5">
        {/* Personal Info */}
        <Card className="p-6 bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-5">Thông tin tài khoản</h4>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">MK</div>
            <div>
              <div className="font-bold text-slate-800 text-base">Nguyễn Minh Khoa</div>
              <div className="text-xs text-slate-500 mt-0.5">Bệnh nhân • Mã số: BN-2024-00123</div>
              <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200">Tài khoản hoạt động</span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Email", value: editForm.email },
              { label: "Số điện thoại", value: editForm.phone },
              { label: "Ngày sinh", value: editForm.dob },
              { label: "Giới tính", value: editForm.gender },
              { label: "Địa chỉ", value: editForm.address },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                <span className="text-xs font-semibold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
          <Button className="mt-5 w-full rounded-xl text-xs h-9 bg-slate-900 hover:bg-slate-800" onClick={() => setShowEdit(true)}>Chỉnh sửa thông tin</Button>
        </Card>

        {/* Health Stats Card */}
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50/50 backdrop-blur-2xl border border-emerald-100/50 shadow-[0_8px_32px_rgba(16,185,129,0.06)] hover:shadow-emerald-500/15 transition-all duration-300 relative overflow-hidden" style={{ borderRadius: "20px" }}>
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <HeartPulse className="w-32 h-32 text-emerald-500" />
          </div>
          <h4 className="font-bold text-emerald-900 text-sm tracking-tight mb-5 flex items-center gap-2 relative z-10">
            <Activity className="w-4 h-4 text-emerald-600" />
            Chỉ số Sức khỏe Cơ bản
          </h4>
          
          <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
            <div className="bg-white/80 p-3 rounded-2xl border border-white shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500"><Droplets className="w-5 h-5" /></div>
              <div><div className="text-[10px] text-slate-500 font-semibold">Nhóm máu</div><div className="text-sm font-bold text-red-600">{healthStats.bloodType}</div></div>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-white shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><Ruler className="w-5 h-5" /></div>
              <div><div className="text-[10px] text-slate-500 font-semibold">Chiều cao</div><div className="text-sm font-bold text-slate-800">{healthStats.height}</div></div>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-white shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><Weight className="w-5 h-5" /></div>
              <div><div className="text-[10px] text-slate-500 font-semibold">Cân nặng</div><div className="text-sm font-bold text-slate-800">{healthStats.weight}</div></div>
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><Activity className="w-5 h-5" /></div>
              <div>
                <div className="text-[10px] text-slate-500 font-semibold">Chỉ số BMI</div>
                <div className="flex items-center gap-1.5">
                  <div className="text-sm font-bold text-emerald-600">{healthStats.bmi}</div>
                  <div className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">{healthStats.bmiStatus}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 relative z-10 bg-white/60 p-4 rounded-2xl border border-white shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">Dị ứng</div>
                <div className="text-xs text-slate-600 mt-0.5">{healthStats.allergies}</div>
              </div>
            </div>
            <div className="w-full h-px bg-slate-200/50"></div>
            <div className="flex items-start gap-3">
              <HeartPulse className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">Tiền sử bệnh lý</div>
                <div className="text-xs text-slate-600 mt-0.5">{healthStats.history}</div>
              </div>
            </div>
            <div className="w-full h-px bg-slate-200/50"></div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">Liên hệ khẩn cấp</div>
                <div className="text-xs text-slate-600 mt-0.5">{healthStats.emergency}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="p-5 bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Cài đặt thông báo</h4>
          <div className="space-y-3">
            {[
              { key: "sms" as const, label: "Nhắc lịch khám (SMS)" },
              { key: "thuoc" as const, label: "Nhắc uống thuốc" },
              { key: "xetnghiem" as const, label: "Thông báo kết quả xét nghiệm" },
              { key: "email" as const, label: "Email bản tin sức khỏe" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-700 font-medium">{item.label}</span>
                <button
                  onClick={() => setNotifSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${notifSettings[item.key] ? "bg-sky-500" : "bg-slate-200"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${notifSettings[item.key] ? "translate-x-4" : ""}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Hỗ trợ tiếp cận (Người khuyết tật)</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-700 font-bold block">Tự động mở AI (Giọng nói)</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Tự động mở chat và bật mic khi vào app</span>
              </div>
              <button
                onClick={toggleAccess}
                className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${accessSettings.autoVoiceChat ? "bg-sky-500" : "bg-slate-200"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${accessSettings.autoVoiceChat ? "translate-x-4" : ""}`} />
              </button>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-4">Thanh toán &amp; Ví điện tử</h4>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 relative group">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold">MB</div>
                <div>
                  <div className="text-xs font-bold text-slate-800">MBBank • **** 4521</div>
                  <div className="text-[10px] text-slate-400">Mặc định</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 group-hover:hidden block">Đã liên kết</span>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 hidden group-hover:flex" onClick={() => toast.success("Đã ngắt kết nối tài khoản ngân hàng")}>Ngắt kết nối</Button>
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-xl text-xs h-9 border-dashed border-slate-300 text-slate-500" onClick={() => setShowPayment(true)}>+ Thêm phương thức thanh toán / Đổi tài khoản liên kết</Button>
          </div>
        </Card>
        <Card className="p-5 bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300" style={{ borderRadius: "20px" }}>
          <h4 className="font-bold text-slate-800 text-sm tracking-tight mb-3">Bảo mật tài khoản</h4>
          <div className="space-y-2">
            <Button variant="outline" className="w-full rounded-xl text-xs h-9 justify-start border-slate-200 text-slate-700" onClick={() => toast.info("Tính năng đổi mật khẩu đang phát triển")}>Đổi mật khẩu</Button>
            <Button variant="outline" className="w-full rounded-xl text-xs h-9 justify-start border-slate-200 text-slate-700" onClick={() => toast.info("Tính năng 2FA đang phát triển")}>Xác thực 2 bước (2FA)</Button>
            <Button variant="outline" className="w-full rounded-xl text-xs h-9 justify-start border-slate-200 text-slate-700" onClick={() => toast.info("Tính năng đăng nhập sinh trắc học đang phát triển")}>Đăng nhập sinh trắc học (Vân tay / Face ID)</Button>
          </div>
          <div className="mt-6 pt-4 border-t border-red-100">
            <h4 className="font-bold text-red-600 text-sm tracking-tight mb-3">Vùng nguy hiểm</h4>
            <Button variant="outline" className="w-full rounded-xl text-xs h-9 justify-start border-red-200 text-red-600 hover:bg-red-50" onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn? Dữ liệu y tế sẽ không thể khôi phục.")) {
                toast.success("Đã gửi yêu cầu xóa tài khoản");
              }
            }}>Xóa tài khoản vĩnh viễn</Button>
          </div>
        </Card>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="animate-scale-in">
          <DialogHeader><DialogTitle>Chỉnh sửa thông tin</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Email</Label><Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Số điện thoại</Label><Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Giới tính</Label>
              <Select value={editForm.gender} onValueChange={v => setEditForm({ ...editForm, gender: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Địa chỉ</Label><Input value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="active:scale-95 transition-all" onClick={() => setShowEdit(false)} disabled={isSubmittingProfile}>Hủy</Button>
            <Button className="active:scale-95 transition-all w-24" disabled={isSubmittingProfile} onClick={() => { 
              setIsSubmittingProfile(true);
              setTimeout(() => {
                setIsSubmittingProfile(false);
                toast.success("Đã cập nhật thông tin thành công"); 
                setShowEdit(false); 
              }, 1000);
            }}>
              {isSubmittingProfile ? <span className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></span> : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="animate-scale-in">
          <DialogHeader><DialogTitle>Thêm phương thức thanh toán</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Ngân hàng</Label>
              <Select value={paymentInputs.bank} onValueChange={v => setPaymentInputs({ ...paymentInputs, bank: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn ngân hàng..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MB">MBBank</SelectItem>
                  <SelectItem value="VCB">Vietcombank</SelectItem>
                  <SelectItem value="TCB">Techcombank</SelectItem>
                  <SelectItem value="ACB">ACB</SelectItem>
                  <SelectItem value="VPB">VPBank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Số tài khoản</Label><Input placeholder="Nhập số tài khoản..." value={paymentInputs.number} onChange={e => setPaymentInputs({ ...paymentInputs, number: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="active:scale-95 transition-all" onClick={() => setShowPayment(false)} disabled={isSubmittingPayment}>Hủy</Button>
            <Button className="active:scale-95 transition-all w-24" disabled={isSubmittingPayment} onClick={() => {
              if (!paymentInputs.bank || !paymentInputs.number.trim()) { toast.error("Vui lòng nhập đầy đủ thông tin"); return; }
              setIsSubmittingPayment(true);
              setTimeout(() => {
                setIsSubmittingPayment(false);
                toast.success("Đã thêm phương thức thanh toán thành công");
                setShowPayment(false);
                setPaymentInputs({ bank: "", number: "" });
              }, 1000);
            }}>
              {isSubmittingPayment ? <span className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></span> : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
