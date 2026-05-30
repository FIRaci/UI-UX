import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Search, Plus, Pencil, Filter, Download, MoreHorizontal, Phone, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "./types";

export function PatientSection() {
  const [patients, setPatients] = useState<Patient[]>([
    { id: 1, name: "Nguyễn Minh Khoa", phone: "0901234567", gender: "Nam", dob: "1992-04-15", address: "Q1, TP.HCM" },
    { id: 2, name: "Trần Thu Hà", phone: "0907654321", gender: "Nữ", dob: "1996-08-22", address: "Q3, TP.HCM" },
    { id: 3, name: "Lê Văn Tú", phone: "0912345678", gender: "Nam", dob: "1980-12-01", address: "Q.Tân Bình" },
    { id: 4, name: "Phạm Bích Ngọc", phone: "0987654321", gender: "Nữ", dob: "1975-06-10", address: "Q7, TP.HCM" },
    { id: 5, name: "Hoàng Văn Nam", phone: "0923456789", gender: "Nam", dob: "1988-03-18", address: "Q.10, TP.HCM" },
    { id: 6, name: "Ngô Thị Mai", phone: "0934567890", gender: "Nữ", dob: "1995-11-25", address: "Q.Bình Thạnh" },
  ]);
  const [pSearch, setPSearch] = useState("");
  const [editingP, setEditingP] = useState<Patient | null>(null);
  const [genderFilter, setGenderFilter] = useState("all");

  const filteredP = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(pSearch.toLowerCase()) || p.phone.includes(pSearch);
    const matchesGender = genderFilter === "all" || p.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Quản lý bệnh nhân</h2>
            <p className="text-sm text-slate-500 mt-1">Quản lý hồ sơ bệnh nhân trong hệ thống</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="w-4 h-4 mr-2" />
              Xuất file
            </Button>
            <Button onClick={() => setEditingP({ id: 0, name: "", phone: "", gender: "Nam", dob: "", address: "" })} className="h-9 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm bệnh nhân
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Tổng bệnh nhân", value: patients.length, color: "blue" },
            { label: "Nam", value: patients.filter(p => p.gender === "Nam").length, color: "sky" },
            { label: "Nữ", value: patients.filter(p => p.gender === "Nữ").length, color: "pink" },
            { label: "Mới tháng này", value: "128", color: "emerald" },
          ].map((stat, i) => (
            <Card key={i} className="p-4 bg-white border-0 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="text-sm text-slate-500">{stat.label}</div>
              <div className={`text-2xl font-bold text-${stat.color}-600 mt-1`}>{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Filters & Search */}
        <Card className="p-4 bg-white border-0 shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Tìm theo tên, số điện thoại..."
                value={pSearch}
                onChange={e => setPSearch(e.target.value)}
              />
            </div>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[140px] h-10 bg-slate-50 border-slate-200 rounded-lg">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Nam">Nam</SelectItem>
                <SelectItem value="Nữ">Nữ</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-slate-500">
              Hiển thị <span className="font-medium text-slate-900">{filteredP.length}</span> bệnh nhân
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-white border-0 shadow-sm overflow-hidden" style={{ borderRadius: "16px" }}>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 bg-slate-50/50">
                <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider h-12">Bệnh nhân</TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider h-12">Liên hệ</TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider h-12">Giới tính</TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider h-12">Ngày sinh</TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider h-12">Địa chỉ</TableHead>
                <TableHead className="text-right font-semibold text-slate-600 text-xs uppercase tracking-wider h-12 w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredP.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-slate-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Không tìm thấy bệnh nhân</p>
                      <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredP.map(p => (
                  <TableRow key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-slate-100 group-hover:scale-105 transition-transform">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium text-sm">
                            {p.name.split(" ").pop()?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-500">ID: #{p.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {p.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${p.gender === "Nam" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "bg-pink-50 text-pink-700 hover:bg-pink-100"} font-medium`}
                      >
                        {p.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {p.dob}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-600 max-w-[180px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{p.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => setEditingP(p)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={!!editingP} onOpenChange={() => setEditingP(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {editingP && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{editingP.id ? "Cập nhật" : "Thêm mới"} bệnh nhân</DialogTitle>
                <DialogDescription>Thông tin hành chính bệnh nhân</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-sm font-medium">Họ và tên</Label>
                  <Input
                    value={editingP.name}
                    onChange={e => setEditingP({ ...editingP, name: e.target.value })}
                    placeholder="Nhập họ tên"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Số điện thoại</Label>
                  <Input
                    value={editingP.phone}
                    onChange={e => setEditingP({ ...editingP, phone: e.target.value })}
                    placeholder="0901234567"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Giới tính</Label>
                  <Select value={editingP.gender} onValueChange={v => setEditingP({ ...editingP, gender: v })}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ngày sinh</Label>
                  <Input
                    type="date"
                    value={editingP.dob}
                    onChange={e => setEditingP({ ...editingP, dob: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Địa chỉ</Label>
                  <Input
                    value={editingP.address}
                    onChange={e => setEditingP({ ...editingP, address: e.target.value })}
                    placeholder="Quận, TP.HCM"
                    className="h-10"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setEditingP(null)}>
                  Hủy
                </Button>
                <Button onClick={savePatient} className="bg-blue-600 hover:bg-blue-700">
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
