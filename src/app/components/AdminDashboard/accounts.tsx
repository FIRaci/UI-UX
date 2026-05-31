import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Trash2, UserPlus, Shield, User, Stethoscope, MessagesSquare } from "lucide-react";

type UserAccount = {
  id: string;
  username: string;
  role: string;
  name: string;
  createdAt: string;
};

const ROLES = {
  benhnhan: { label: "Bệnh nhân", icon: User, color: "text-blue-600 bg-blue-50" },
  tuvan: { label: "Tư vấn viên", icon: MessagesSquare, color: "text-emerald-600 bg-emerald-50" },
  bacsi: { label: "Bác sĩ", icon: Stethoscope, color: "text-indigo-600 bg-indigo-50" },
  quanly: { label: "Quản lý", icon: Shield, color: "text-slate-600 bg-slate-50" },
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AccountsManager() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("bacsi");

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword || !newName) {
      toast.error("Vui lòng điền đủ thông tin");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newName,
          role: newRole
        })
      });
      
      const data = await res.json();
      if (res.ok && data.id) {
        toast.success("Tạo tài khoản thành công!");
        setIsCreating(false);
        setNewUsername("");
        setNewPassword("");
        setNewName("");
        fetchUsers();
      } else {
        toast.error(data.error || "Tạo tài khoản thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success("Xóa tài khoản thành công");
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Không thể xóa tài khoản");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Tài khoản</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách người dùng và cấp quyền truy cập hệ thống.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl h-10 px-4">
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm tài khoản
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6 mb-8 bg-white border-blue-100 shadow-lg shadow-blue-900/5 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Tạo tài khoản mới</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Họ và tên</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Vd: BS. Nguyễn Văn A" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Vai trò</Label>
              <select 
                value={newRole} 
                onChange={e => setNewRole(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="bacsi">Bác sĩ</option>
                <option value="tuvan">Tư vấn viên</option>
                <option value="quanly">Quản lý</option>
                <option value="benhnhan">Bệnh nhân</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Tên đăng nhập</Label>
              <Input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Vd: bacsia" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Mật khẩu</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••" className="h-10" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsCreating(false)} className="h-10 px-6 rounded-xl">Hủy</Button>
            <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 rounded-xl">Tạo ngay</Button>
          </div>
        </Card>
      )}

      <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Họ và tên</th>
                <th className="p-4">Tên đăng nhập</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4 pr-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map(u => {
                const roleInfo = ROLES[u.role as keyof typeof ROLES] || { label: u.role, icon: User, color: "text-slate-600 bg-slate-50" };
                const Icon = roleInfo.icon;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-medium text-slate-900">{u.name || u.username}</td>
                    <td className="p-4 text-slate-600">{u.username}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${roleInfo.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td className="p-4 pr-6 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
