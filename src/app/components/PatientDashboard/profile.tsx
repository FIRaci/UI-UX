import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from "sonner";

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

  return (
    <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
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
            <Button variant="outline" onClick={() => setShowEdit(false)}>Hủy</Button>
            <Button onClick={() => { toast.info("Tính năng cập nhật đang phát triển"); setShowEdit(false); }}>Lưu</Button>
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
            <Button variant="outline" onClick={() => setShowPayment(false)}>Hủy</Button>
            <Button onClick={() => {
              if (!paymentInputs.bank || !paymentInputs.number.trim()) { toast.error("Vui lòng nhập đầy đủ thông tin"); return; }
              toast.info("Tính năng thêm thanh toán đang phát triển");
              setShowPayment(false);
              setPaymentInputs({ bank: "", number: "" });
            }}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
