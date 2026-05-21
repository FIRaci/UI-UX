import { useState } from "react";
import {
  BookOpen, Search, ShieldCheck, Check, X, AlertCircle, Save, Reply, FileText, User
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

interface Protocol {
  id: string;
  name: string;
  patient: string;
  doctor: string;
  status: "pending" | "approved" | "rejected";
  checklist: CompareItem[];
  comments: string;
}

export function ExpertKnowledgeView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProtocolId, setSelectedProtocolId] = useState("stemi");

  const [protocols, setProtocols] = useState<Protocol[]>([
    {
      id: "stemi",
      name: "Phác đồ Nhồi máu cơ tim cấp",
      patient: "James Harrington (STEMI)",
      doctor: "Bs. Nguyễn Tiến Dũng",
      status: "pending",
      comments: "Vui lòng tăng liều nạp Ticagrelor lên 180mg và ưu tiên can thiệp mạch vành dưới 90 phút để đảm bảo an toàn tối đa cho bệnh nhân.",
      checklist: [
        { id: 1, label: "Liều nạp Ticagrelor", proposed: "90mg ngậm", reference: "180mg ngậm", status: "differ" },
        { id: 2, label: "Liều tải Heparin", proposed: "5.000 IU (Bolus tĩnh mạch)", reference: "5.000 IU (Bolus tĩnh mạch)", status: "match" },
        { id: 3, label: "Thời gian can thiệp mạch vành (PCI)", proposed: "Trong vòng 120 phút", reference: "Trong vòng 90 phút", status: "partial" },
        { id: 4, label: "Liều nạp Aspirin", proposed: "300mg ngậm", reference: "325mg ngậm", status: "match" },
        { id: 5, label: "Theo dõi sinh hiệu sau can thiệp", proposed: "Mỗi 15 phút trong 1 giờ đầu", reference: "Mỗi 15 phút trong 1 giờ đầu", status: "match" },
      ]
    },
    {
      id: "sepsis",
      name: "Phác đồ Nhiễm khuẩn huyết nặng",
      patient: "Nguyễn Văn Hải (Sepsis)",
      doctor: "Bs. Lê Hoàng Nam",
      status: "pending",
      comments: "Cần đổi kháng sinh sang Meropenem + Vancomycin do bệnh nhân có dấu hiệu sốc nhiễm khuẩn nặng và tiền sử kháng thuốc cephalosporin thế hệ 3.",
      checklist: [
        { id: 1, label: "Kháng sinh phổ rộng ban đầu", proposed: "Ceftriaxone 2g IV", reference: "Meropenem 1g IV + Vancomycin 1g IV", status: "differ" },
        { id: 2, label: "Bù dịch tĩnh mạch", proposed: "30 mL/kg dịch truyền tinh thể", reference: "30 mL/kg dịch truyền tinh thể", status: "match" },
        { id: 3, label: "Thời gian dùng kháng sinh", proposed: "Trong vòng 3 giờ đầu", reference: "Trong vòng 1 giờ đầu tiên", status: "differ" },
        { id: 4, label: "Kiểm soát huyết áp (Vận mạch)", proposed: "Noradrenaline duy trì MAP >= 65 mmHg", reference: "Noradrenaline duy trì MAP >= 65 mmHg", status: "match" },
      ]
    },
    {
      id: "stroke",
      name: "Phác đồ Đột quỵ thiếu máu não cấp",
      patient: "Trần Văn Hùng (Stroke)",
      doctor: "Bs. Đỗ Minh Trí",
      status: "pending",
      comments: "Đã quá cửa sổ thời gian 4.5 giờ để dùng rtPA thông thường. Đề nghị hội chẩn can thiệp lấy huyết khối bằng dụng cụ cơ học khẩn cấp.",
      checklist: [
        { id: 1, label: "Thuốc tiêu sợi huyết (rtPA)", proposed: "Alteplase 0.6 mg/kg", reference: "Alteplase 0.9 mg/kg (Tối đa 90mg)", status: "differ" },
        { id: 2, label: "Thời điểm dùng rtPA", proposed: "Giờ thứ 5 từ khi khởi phát", reference: "Trong vòng 4.5 giờ từ khi khởi phát", status: "differ" },
        { id: 3, label: "Kiểm soát huyết áp trước rtPA", proposed: "Huyết áp 190/110 mmHg", reference: "Duy trì huyết áp < 185/110 mmHg", status: "partial" },
        { id: 4, label: "Chụp CT/MRI sọ não", proposed: "Đã hoàn thành trong 20 phút", reference: "Thực hiện ngay khi nhập viện (< 25 phút)", status: "match" },
      ]
    },
    {
      id: "copd",
      name: "Phác đồ Đợt cấp COPD",
      patient: "Lê Văn Cường (COPD)",
      doctor: "Bs. Phạm Thu Thảo",
      status: "pending",
      comments: "Liệu pháp thở oxy và corticoid đã tối ưu. Theo dõi sát khí máu động mạch sau 2 giờ.",
      checklist: [
        { id: 1, label: "Liệu pháp Oxy dòng cao", proposed: "Thở oxy gọng kính 2 L/phút", reference: "Duy trì SpO2 từ 88% - 92%", status: "match" },
        { id: 2, label: "Thuốc giãn phế quản (SABA/SAMA)", proposed: "Khí dung Salbutamol + Ipratropium", reference: "Khí dung Salbutamol + Ipratropium mỗi 4-6 giờ", status: "match" },
        { id: 3, label: "Corticosteroid đường toàn thân", proposed: "Methylprednisolone 40mg IV", reference: "Methylprednisolone 40mg IV mỗi 24 giờ", status: "match" },
        { id: 4, label: "Chỉ định dùng Kháng sinh", proposed: "Không dùng kháng sinh", reference: "Chỉ dùng khi có ít nhất 2 triệu chứng tăng nặng hoặc đờm mủ", status: "match" },
      ]
    }
  ]);

  const selectedProtocol = protocols.find(p => p.id === selectedProtocolId) || protocols[0];

  const handleUpdateComment = (val: string) => {
    setProtocols(prev => prev.map(p => {
      if (p.id === selectedProtocolId) {
        return { ...p, comments: val };
      }
      return p;
    }));
  };

  const toggleStatus = (itemId: number) => {
    setProtocols(prev => prev.map(p => {
      if (p.id === selectedProtocolId) {
        const updatedChecklist = p.checklist.map(item => {
          if (item.id === itemId) {
            const order: ("match" | "differ" | "partial")[] = ["match", "differ", "partial"];
            const nextIdx = (order.indexOf(item.status) + 1) % order.length;
            const nextStatus = order[nextIdx];
            toast.info(`Thay đổi đánh giá "${item.label}" sang: ${nextStatus === "match" ? "Khớp" : nextStatus === "differ" ? "Mâu thuẫn" : "Khớp một phần"}`);
            return { ...item, status: nextStatus };
          }
          return item;
        });
        return { ...p, checklist: updatedChecklist };
      }
      return p;
    }));
  };

  const handleApproveSync = () => {
    setProtocols(prev => prev.map(p => {
      if (p.id === selectedProtocolId) {
        return { ...p, status: "approved" };
      }
      return p;
    }));
    toast.success("PHÊ DUYỆT & ĐỒNG BỘ THÀNH CÔNG!", {
      description: `Phác đồ "${selectedProtocol.name}" đã được đồng bộ với hệ thống bệnh án điện tử EHR.`,
      duration: 4000,
    });
  };

  const handleReject = () => {
    setProtocols(prev => prev.map(p => {
      if (p.id === selectedProtocolId) {
        return { ...p, status: "rejected" };
      }
      return p;
    }));
    toast.error("ĐÃ TỪ CHỐI VÀ YÊU CẦU ĐIỀU CHỈNH!", {
      description: `Đề xuất đã được gửi trả về cho ${selectedProtocol.doctor} chỉnh sửa lại.`,
      duration: 4000,
    });
  };

  const filteredProtocols = protocols.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", overflow: "hidden", backgroundColor: C.bgPage }}>
      
      {/* LEFT SIDEBAR: Protocol Queue List */}
      <div style={{
        width: 320,
        backgroundColor: C.bgCard,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0
      }}>
        {/* Search header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: C.font, fontSize: 13, fontWeight: 700, color: C.text1, marginBottom: 12 }}>
            HÀNG ĐỢI SO KHỚP PHÁC ĐỒ
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Tìm kiếm phác đồ, bác sĩ, bệnh nhân..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", height: 36, paddingLeft: 34, paddingRight: 12,
                border: `1.5px solid ${C.border}`, borderRadius: 8,
                fontSize: 11, fontFamily: C.font, color: C.text2,
                backgroundColor: C.bgMuted, outline: "none",
              }}
            />
            <Search size={13} color={C.text3} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        {/* List items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredProtocols.map(p => {
              const isSelected = p.id === selectedProtocolId;
              const matchesCount = p.checklist.filter(i => i.status === "match").length;
              const differsCount = p.checklist.filter(i => i.status === "differ").length;
              const partialCount = p.checklist.filter(i => i.status === "partial").length;
              
              let statusText = "Chờ duyệt";
              let statusVar: "default" | "success" | "critical" = "default";
              if (p.status === "approved") {
                statusText = "Đã duyệt";
                statusVar = "success";
              } else if (p.status === "rejected") {
                statusText = "Đã trả về";
                statusVar = "critical";
              }

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProtocolId(p.id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${isSelected ? C.primary : C.border}`,
                    backgroundColor: isSelected ? C.primaryLight : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? C.shadowHover : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                    <span style={{
                      fontFamily: C.font,
                      fontSize: 12,
                      fontWeight: 700,
                      color: isSelected ? C.primaryDark : C.text1,
                      lineHeight: 1.3
                    }}>
                      {p.name.replace("Phác đồ ", "")}
                    </span>
                    <Badge variant={statusVar} style={{ fontSize: 9, padding: "1px 5px" }}>{statusText}</Badge>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: C.text2, fontSize: 11 }}>
                    <User size={11} color={C.text3} />
                    <span>{p.patient}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, color: C.text3, fontSize: 10 }}>
                    <FileText size={11} />
                    <span>{p.doctor}</span>
                  </div>

                  {/* Summary match badges */}
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {matchesCount > 0 && (
                      <span style={{ fontSize: 9, color: C.successDark, backgroundColor: C.successLight, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                        {matchesCount} Khớp
                      </span>
                    )}
                    {differsCount > 0 && (
                      <span style={{ fontSize: 9, color: C.criticalDark, backgroundColor: C.criticalLight, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                        {differsCount} Lệch
                      </span>
                    )}
                    {partialCount > 0 && (
                      <span style={{ fontSize: 9, color: C.warningDark, backgroundColor: C.warningLight, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                        {partialCount} Lệch nhẹ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredProtocols.length === 0 && (
              <div style={{ textAlign: "center", color: C.text3, fontSize: 11, padding: "24px 0" }}>
                Không tìm thấy phác đồ phù hợp
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT WORKSPACE: Comparison details & Action */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%", overflow: "hidden" }}>
        
        {/* Title / Meta Block */}
        <div style={{
          padding: "16px 24px",
          backgroundColor: C.bgCard,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: C.font, fontSize: 15, fontWeight: 700, color: C.text1 }}>ĐÁNH GIÁ SỰ PHÙ HỢP CỦA PHÁC ĐỒ</span>
              <Badge variant="blue">{selectedProtocol.name}</Badge>
            </div>
            <div style={{ fontFamily: C.font, fontSize: 11, color: C.text2, marginTop: 6, display: "flex", gap: 14 }}>
              <span>Bác sĩ điều trị: <b style={{ color: C.text1 }}>{selectedProtocol.doctor}</b></span>
              <span style={{ color: C.borderDark }}>|</span>
              <span>Ca bệnh: <b style={{ color: C.text1 }}>{selectedProtocol.patient}</b></span>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 10 }}>
            {selectedProtocol.status === "approved" && (
              <Badge variant="success" style={{ fontSize: 12, padding: "6px 12px" }}>✓ Đã duyệt & Đồng bộ EHR</Badge>
            )}
            {selectedProtocol.status === "rejected" && (
              <Badge variant="critical" style={{ fontSize: 12, padding: "6px 12px" }}>✗ Đã yêu cầu chỉnh sửa</Badge>
            )}
            {selectedProtocol.status === "pending" && (
              <Badge variant="default" style={{ fontSize: 12, padding: "6px 12px" }}>● Đang chờ thẩm định</Badge>
            )}
          </div>
        </div>

        {/* Scrollable details list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Header of columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 1fr", gap: 16, padding: "0 8px", flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text3, fontFamily: C.font, letterSpacing: "0.05em" }}>ĐỀ XUẤT ĐIỀU TRỊ CỦA BÁC SĨ</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text3, fontFamily: C.font, textAlign: "center", letterSpacing: "0.05em" }}>SO KHỚP</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text3, fontFamily: C.font, letterSpacing: "0.05em" }}>TIÊU CHUẨN SOP KHUYẾN NGHỊ</div>
          </div>

          {/* Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {selectedProtocol.checklist.map(item => {
              const bg = item.status === "match" ? C.successLight : item.status === "differ" ? C.criticalLight : C.warningLight;
              const text = item.status === "match" ? C.successDark : item.status === "differ" ? C.criticalDark : C.warningDark;
              const border = item.status === "match" ? C.successBorder : item.status === "differ" ? C.criticalBorder : C.warningBorder;
              const IconComp = item.status === "match" ? Check : item.status === "differ" ? X : AlertCircle;

              return (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 1fr", gap: 16, alignItems: "stretch" }}>
                  
                  {/* Left Column: Proposed */}
                  <div style={{
                    padding: "12px 16px", borderRadius: 10, backgroundColor: "#fff",
                    border: `1.5px solid ${item.status === "differ" ? C.criticalBorder : C.border}`,
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.01)"
                  }}>
                    <span style={{ fontSize: 10, color: C.text3, fontWeight: 600, textTransform: "uppercase" }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text1, marginTop: 4 }}>{item.proposed}</span>
                  </div>

                  {/* Middle Column: Status trigger */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className="interactive-node"
                      title="Click để thay đổi nhanh đánh giá so khớp"
                      style={{
                        width: 36, height: 36, borderRadius: 10, border: `1px solid ${border}`,
                        backgroundColor: bg, color: text, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.03)"
                      }}
                    >
                      <IconComp size={16} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Right Column: Reference */}
                  <div style={{
                    padding: "12px 16px", borderRadius: 10, backgroundColor: "#fff",
                    border: `1.5px solid ${C.border}`,
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.01)"
                  }}>
                    <span style={{ fontSize: 10, color: C.primary, fontWeight: 600, textTransform: "uppercase" }}>SOP Chuẩn Y văn</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text1, marginTop: 4 }}>{item.reference}</span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Consultant Comments Block - SIMPLIFIED */}
          <Card style={{ padding: 18, marginTop: 6, backgroundColor: "#fff", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontFamily: C.font, fontSize: 12, fontWeight: 700, color: C.text1 }}>
                Ý KIẾN ĐÓNG GÓP & YÊU CẦU ĐIỀU CHỈNH
              </span>
            </div>

            {/* Clean input for comments without rich text tools */}
            <textarea
              rows={3}
              value={selectedProtocol.comments}
              onChange={e => handleUpdateComment(e.target.value)}
              placeholder="Nhập ý kiến chuyên môn của bạn ở đây để gửi cho bác sĩ điều trị..."
              style={{
                width: "100%", padding: 12, fontSize: 12, fontFamily: C.font, color: C.text1,
                border: `1.5px solid ${C.border}`, borderRadius: 8, resize: "none",
                outline: "none", backgroundColor: C.bgMuted, lineHeight: 1.5,
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = C.primary}
              onBlur={e => e.currentTarget.style.borderColor = C.border}
            />

            {/* Consolidated Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 14 }}>
              <Btn
                variant="outline"
                size="sm"
                onClick={handleReject}
                style={{ color: C.critical, borderColor: C.criticalBorder }}
              >
                <Reply size={13} /> Gửi trả & Yêu cầu sửa
              </Btn>
              <Btn
                variant="success"
                size="sm"
                onClick={handleApproveSync}
              >
                <ShieldCheck size={13} /> Duyệt & Đồng bộ ngay
              </Btn>
            </div>
          </Card>

          {/* Bottom spacer to prevent overlap with chatbot */}
          <div style={{ height: 32, flexShrink: 0 }} />
        </div>

      </div>
    </div>
  );
}
