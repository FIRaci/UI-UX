import { useState } from "react";
import {
  BookOpen, Search, ArrowRight, ShieldCheck,
  Edit, CornerDownRight, Check, X, AlertCircle, Save, Reply,
} from "lucide-react";
import { C, Card, Badge, Btn } from "./ExpertDashboardShared";
import { toast } from "sonner";

interface CompareItem {
  id: number;
  label: string;
  proposed: string;
  reference: string;
  status: "match" | "differ" | "partial";
}

export function ExpertKnowledgeView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [comments, setComments] = useState("Vui lòng tăng liều nạp Ticagrelor lên 180mg và ưu tiên can thiệp mạch vành dưới 90 phút để đảm bảo an toàn tối đa cho bệnh nhân.");
  
  const [checklist, setChecklist] = useState<CompareItem[]>([
    { id: 1, label: "Liều nạp Ticagrelor", proposed: "90mg ngậm", reference: "180mg ngậm", status: "differ" },
    { id: 2, label: "Liều tải Heparin", proposed: "5.000 IU (Bolus tĩnh mạch)", reference: "5.000 IU (Bolus tĩnh mạch)", status: "match" },
    { id: 3, label: "Thời gian can thiệp mạch vành (PCI)", proposed: "Trong vòng 120 phút", reference: "Trong vòng 90 phút", status: "partial" },
    { id: 4, label: "Liều nạp Aspirin", proposed: "300mg ngậm", reference: "325mg ngậm", status: "match" },
    { id: 5, label: "Theo dõi sinh hiệu sau can thiệp", proposed: "Mỗi 15 phút trong 1 giờ đầu", reference: "Mỗi 15 phút trong 1 giờ đầu", status: "match" },
  ]);

  const toggleStatus = (id: number) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const order: ("match" | "differ" | "partial")[] = ["match", "differ", "partial"];
        const nextIdx = (order.indexOf(item.status) + 1) % order.length;
        const nextStatus = order[nextIdx];
        toast.info(`Thay đổi đánh giá "${item.label}" sang: ${nextStatus === "match" ? "Khớp" : nextStatus === "differ" ? "Mâu thuẫn" : "Khớp một phần"}`);
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleApproveSync = () => {
    toast.success("PHÊ DUYỆT & ĐỒNG BỘ THÀNH CÔNG!", {
      description: "Phác đồ đã được đồng bộ với hệ thống bệnh án điện tử EHR và cập nhật hồ sơ điều trị.",
      duration: 4000,
    });
  };

  const handleReject = () => {
    toast.error("ĐÃ TỪ CHỐI VÀ GỬI PHẢN HỒI!", {
      description: "Đề xuất đã được trả về cho bác sĩ điều trị để điều chỉnh liều lượng và thời gian can thiệp.",
      duration: 4000,
    });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      
      {/* Top Search SOPs bar */}
      <div style={{
        padding: "12px 20px", backgroundColor: C.bgCard, borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, maxWidth: 600 }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Tìm kiếm phác đồ, hướng dẫn điều trị SOP, tài liệu khoa học chuẩn..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", height: 36, paddingLeft: 34, paddingRight: 12,
                border: `1.5px solid ${C.border}`, borderRadius: 8,
                fontSize: 12, fontFamily: C.font, color: C.text2,
                backgroundColor: C.bgMuted, outline: "none",
              }}
            />
            <Search size={14} color={C.text3} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" size="sm" onClick={() => toast.info("Xem hàng đợi 4 phác đồ đang chờ duyệt")}>Hàng đợi duyệt (4)</Btn>
          <Btn variant="primary" size="sm" onClick={() => toast.info("Mở kho tài liệu SOP chuẩn của bệnh viện")}>Kho SOP chuẩn</Btn>
        </div>
      </div>

      {/* Main Review Workspace */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16, gap: 16, minHeight: 0, overflow: "hidden" }}>
        
        {/* Title / Meta Block */}
        <div style={{
          padding: "12px 16px", backgroundColor: C.bgCard, borderRadius: 12,
          border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: C.font, fontSize: 14, fontWeight: 700, color: C.text1 }}>ĐÁNH GIÁ SỰ PHÙ HỢP CỦA PHÁC ĐỒ</span>
              <Badge variant="blue">Phác đồ Nhồi máu cơ tim cấp</Badge>
            </div>
            <div style={{ fontFamily: C.font, fontSize: 11, color: C.text3, marginTop: 4 }}>
              Được soạn thảo bởi: <b>Bs. Nguyễn Tiến Dũng</b> (Bác sĩ nội trú) • Ca lâm sàng: <b>James Harrington (STEMI)</b>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="outline" size="sm" onClick={handleReject} style={{ borderColor: C.criticalBorder, color: C.critical }}>
              <Reply size={13} /> Trả về & Yêu cầu sửa
            </Btn>
            <Btn variant="success" size="sm" onClick={handleApproveSync}>
              <ShieldCheck size={13} /> Duyệt & Đồng bộ ngay
            </Btn>
          </div>
        </div>

        {/* Comparison Layout Grid */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto", gap: 12 }}>
          
          {/* Header of columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 80px 1.2fr", gap: 12, padding: "0 8px", flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text2, fontFamily: C.font }}>ĐỀ XUẤT ĐIỀU TRỊ CỦA BÁC SĨ</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text2, fontFamily: C.font, textAlign: "center" }}>SO KHỚP</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text2, fontFamily: C.font }}>TIÊU CHUẨN SOP KHUYẾN NGHỊ (AI DETECTED)</div>
          </div>

          {/* Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {checklist.map(item => {
              const bg = item.status === "match" ? C.successLight : item.status === "differ" ? C.criticalLight : C.warningLight;
              const text = item.status === "match" ? C.successDark : item.status === "differ" ? C.criticalDark : C.warningDark;
              const border = item.status === "match" ? C.successBorder : item.status === "differ" ? C.criticalBorder : C.warningBorder;
              const IconComp = item.status === "match" ? Check : item.status === "differ" ? X : AlertCircle;

              return (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 80px 1.2fr", gap: 12, alignItems: "stretch" }}>
                  
                  {/* Left Column: Proposed */}
                  <div className="hover-lift" style={{
                    padding: 12, borderRadius: 10, backgroundColor: "#fff",
                    border: `1px solid ${item.status === "differ" ? C.criticalBorder : C.border}`,
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    transition: "all 0.25s"
                  }}>
                    <span style={{ fontSize: 10, color: C.text3, fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text1, marginTop: 4 }}>{item.proposed}</span>
                  </div>

                  {/* Middle Column: Status trigger */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className="interactive-node"
                      style={{
                        width: 38, height: 38, borderRadius: 10, border: `1px solid ${border}`,
                        backgroundColor: bg, color: text, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.03)", transition: "all 0.25s"
                      }}
                    >
                      <IconComp size={16} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Right Column: Reference */}
                  <div className="hover-lift" style={{
                    padding: 12, borderRadius: 10, backgroundColor: "#fff",
                    border: `1px solid ${C.border}`,
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    transition: "all 0.25s"
                  }}>
                    <span style={{ fontSize: 10, color: C.primary, fontWeight: 600 }}>SOP Chuẩn Y văn</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text1, marginTop: 4 }}>{item.reference}</span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Consultant Comments Block */}
          <Card className="hover-lift" style={{ padding: 14, marginTop: 8, backgroundColor: C.bgMuted, flexShrink: 0, transition: "all 0.25s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 6, marginBottom: 10 }}>
              <Edit size={14} color={C.primary} />
              <span style={{ fontFamily: C.font, fontSize: 12, fontWeight: 700, color: C.text1 }}>Ý kiến đóng góp & Phản hồi của Chuyên gia</span>
            </div>

            {/* Simulated Rich Editor Toolbar */}
            <div style={{
              display: "flex", gap: 4, padding: "4px 8px", backgroundColor: "#fff",
              border: `1px solid ${C.border}`, borderBottom: "none", borderRadius: "8px 8px 0 0",
              alignItems: "center"
            }}>
              {["B", "I", "U", "H1", "H2", "• List", "Link"].map(tool => (
                <button key={tool} onClick={() => toast.info(`Đã kích hoạt định dạng: ${tool}`)} style={{
                  padding: "3px 8px", borderRadius: 4, border: "none", backgroundColor: "transparent",
                  fontSize: 10, fontWeight: 600, color: C.text2, cursor: "pointer"
                }} onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bgSection} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                  {tool}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={comments}
              onChange={e => setComments(e.target.value)}
              style={{
                width: "100%", padding: 12, fontSize: 12, fontFamily: C.font, color: C.text1,
                border: `1px solid ${C.border}`, borderRadius: "0 0 8px 8px", resize: "none",
                outline: "none", backgroundColor: "#fff", lineHeight: 1.5
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <Btn variant="outline" size="sm" onClick={handleReject} style={{ color: C.critical, borderColor: C.criticalBorder }}>
                <Reply size={13} /> Gửi trả & Yêu cầu sửa đổi
              </Btn>
              <Btn variant="primary" size="sm" onClick={handleApproveSync}>
                <Save size={13} /> Lưu, Ký số & Đồng bộ EHR
              </Btn>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
