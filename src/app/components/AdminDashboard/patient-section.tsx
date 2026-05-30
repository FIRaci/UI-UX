import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Search, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "./types";

export function PatientSection() {
  const [patients, setPatients] = useState<Patient[]>([
    { id: 1, name: "Nguyễn Minh Khoa", phone: "0901234567", gender: "Nam", dob: "1992-04-15", address: "Q1, TP.HCM" },
    { id: 2, name: "Trần Thu Hà", phone: "0907654321", gender: "Nữ", dob: "1996-08-22", address: "Q3, TP.HCM" },
    { id: 3, name: "Lê Văn Tú", phone: "0912345678", gender: "Nam", dob: "1980-12-01", address: "Q.Tân Bình" },
    { id: 4, name: "Phạm Bích Ngọc", phone: "0987654321", gender: "Nữ", dob: "1975-06-10", address: "Q7, TP.HCM" },
  ]);
  const [pSearch, setPSearch] = useState("");
  const [editingP, setEditingP] = useState<Patient | null>(null);

  const filteredP = patients.filter(p =>
    p.name.toLowerCase().includes(pSearch.toLowerCase()) ||
    p.phone.includes(pSearch)
  );

  const savePatient = () => {
    if (!editingP) return;
    if (!editingP.name.trim() || !editingP.phone.trim()) {
      toast.error("Vui lòng nhập đầy đủ Họ tên và Số điện thoại");
      return;
    }
    if (!/^\d{9,11}$/.test(editingP.phone)) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }
    setPatients(prev => {
      const exists = prev.find(p => p.id === editingP.id);
      return exists ? prev.map(p => p.id === editingP.id ? editingP : p) : [{ ...editingP, id: Date.now() }, ...prev];
    });
    toast.success("Cập nhật thông tin thành công");
    setEditingP(null);
  };

  return (
    <>
      <Card className="p-6 bg-white/90 backdrop-blur-xl border border-white shadow-[0_10px_40px_rgb(0,0,0,0.05)] transition-all duration-300 animate-slide-up" style={{ borderRadius: "28px" }}>
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h4 className="text-xl font-extrabold tracking-tight text-slate-800">Quản lý bệnh nhân</h4>
            <div className="text-sm text-slate-500 font-medium mt-1">Danh sách hồ sơ bệnh nhân trong hệ thống</div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input className="pl-10 w-72 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-[15px]" placeholder="Tìm theo tên, SĐT..." value={pSearch} onChange={e => setPSearch(e.target.value)} />
            </div>
            <Button onClick={() => setEditingP({ id: 0, name: "", phone: "", gender: "Nam", dob: "", address: "" })} className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 font-bold border-0">
              <Plus className="w-4 h-4 mr-2" /> Thêm hồ sơ
            </Button>
          </div>
        </div>
        {filteredP.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {patients.length === 0 ? "Danh sách bệnh nhân trống" : "Không tìm thấy bệnh nhân phù hợp"}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="font-bold text-slate-600 uppercase tracking-wider text-xs h-12">Họ tên</TableHead>
                  <TableHead className="font-bold text-slate-600 uppercase tracking-wider text-xs h-12">SĐT</TableHead>
                  <TableHead className="font-bold text-slate-600 uppercase tracking-wider text-xs h-12">Giới tính</TableHead>
                  <TableHead className="font-bold text-slate-600 uppercase tracking-wider text-xs h-12">Ngày sinh</TableHead>
                  <TableHead className="font-bold text-slate-600 uppercase tracking-wider text-xs h-12">Địa chỉ</TableHead>
                  <TableHead className="text-right font-bold text-slate-600 uppercase tracking-wider text-xs h-12">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredP.map(p => (
                  <TableRow key={p.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                    <TableCell className="flex items-center gap-3 py-3">
                      <Avatar className="w-10 h-10 border border-white shadow-sm group-hover:scale-105 transition-transform"><AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-bold text-sm">{p.name[0]}</AvatarFallback></Avatar>
                      <span className="font-bold text-slate-800 text-[15px]">{p.name}</span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-600">{p.phone}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${p.gender === "Nam" ? "bg-blue-50 text-blue-700" : p.gender === "Nữ" ? "bg-pink-50 text-pink-700" : "bg-slate-100 text-slate-700"}`}>
                        {p.gender}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-600">{p.dob}</TableCell>
                    <TableCell className="text-slate-500 max-w-[200px] truncate">{p.address}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => setEditingP(p)}><Pencil className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={!!editingP} onOpenChange={() => setEditingP(null)}>
        <DialogContent className="animate-scale-in">
          {editingP && (
            <>
              <DialogHeader>
                <DialogTitle>{editingP.id ? "Cập nhật" : "Thêm"} bệnh nhân</DialogTitle>
                <DialogDescription>Thông tin hành chính bệnh nhân</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2"><Label>Họ tên</Label><Input value={editingP.name} onChange={e => setEditingP({ ...editingP, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Số điện thoại</Label><Input value={editingP.phone} onChange={e => setEditingP({ ...editingP, phone: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Giới tính</Label>
                  <Select value={editingP.gender} onValueChange={v => setEditingP({ ...editingP, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Ngày sinh</Label><Input type="date" value={editingP.dob} onChange={e => setEditingP({ ...editingP, dob: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Địa chỉ</Label><Input value={editingP.address} onChange={e => setEditingP({ ...editingP, address: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditingP(null); toast.info("Đã hủy thay đổi"); }}>Hủy</Button>
                <Button onClick={savePatient}>Lưu</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
