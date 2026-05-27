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
      <Card className="p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h4 className="tracking-tight">Quản lý hồ sơ bệnh nhân</h4>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9 w-64" placeholder="Tìm theo tên, SĐT..." value={pSearch} onChange={e => setPSearch(e.target.value)} />
            </div>
            <Button onClick={() => setEditingP({ id: 0, name: "", phone: "", gender: "Nam", dob: "", address: "" })}>
              <Plus className="w-4 h-4 mr-1" /> Thêm
            </Button>
          </div>
        </div>
        {filteredP.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {patients.length === 0 ? "Danh sách bệnh nhân trống" : "Không tìm thấy bệnh nhân phù hợp"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredP.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="w-8 h-8"><AvatarFallback className="bg-rose-100 text-rose-700 text-xs">{p.name[0]}</AvatarFallback></Avatar>
                    {p.name}
                  </TableCell>
                  <TableCell>{p.phone}</TableCell>
                  <TableCell>{p.gender}</TableCell>
                  <TableCell>{p.dob}</TableCell>
                  <TableCell className="text-muted-foreground">{p.address}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setEditingP(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
