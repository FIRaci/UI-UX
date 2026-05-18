import { useState } from "react";
import {
  Bot, Plus, Search, GitFork, Play, Check,
  CornerDownRight, RefreshCw, Layers, Sliders, ArrowUpRight, BarChart2,
} from "lucide-react";
import { C, Card, Badge, Btn } from "./ExpertDashboardShared";
import { toast } from "sonner";

interface Scenario {
  id: string;
  name: string;
  status: "Live" | "Draft";
  nodes: number;
}

interface NodeItem {
  id: string;
  type: "Start" | "Question" | "Answer";
  label: string;
  responseText: string;
  conditions: { text: string; nextNode: string }[];
}

export function ExpertAIView() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: "sc-1", name: "Triage Tim mạch", status: "Live", nodes: 14 },
    { id: "sc-2", name: "Tầm soát Đột quỵ", status: "Live", nodes: 8 },
    { id: "sc-3", name: "Khám sơ bộ Nhi khoa", status: "Draft", nodes: 12 },
    { id: "sc-4", name: "Chẩn đoán Da liễu", status: "Live", nodes: 6 },
    { id: "sc-5", name: "Sàng lọc Dinh dưỡng", status: "Draft", nodes: 5 },
  ]);
  const [selectedScenario, setSelectedScenario] = useState("sc-1");
  const [search, setSearch] = useState("");

  // Triage scenario nodes
  const [nodes, setNodes] = useState<NodeItem[]>([
    {
      id: "NODE-START",
      type: "Start",
      label: "Bắt đầu Sàng lọc",
      responseText: "Chào bạn, tôi là trợ lý AI y tế. Tôi có thể giúp bạn kiểm tra các triệu chứng ban đầu.",
      conditions: [{ text: "Kích hoạt", nextNode: "NODE-001" }]
    },
    {
      id: "NODE-001",
      type: "Question",
      label: "Có đau ngực dữ dội không?",
      responseText: "Hiện tại bạn có đang trải qua cảm giác đau thắt ngực hoặc đè nén dữ dội ở lồng ngực không?",
      conditions: [
        { text: "Có", nextNode: "NODE-002" },
        { text: "Không", nextNode: "NODE-003" }
      ]
    },
    {
      id: "NODE-002",
      type: "Question",
      label: "Khó thở & vã mồ hôi?",
      responseText: "Cơn đau ngực có đi kèm triệu chứng khó thở, vã mồ hôi lạnh, hoặc lan lên vai/hàm không?",
      conditions: [
        { text: "Có", nextNode: "NODE-ANS-CRITICAL" },
        { text: "Không", nextNode: "NODE-ANS-HIGH" }
      ]
    },
    {
      id: "NODE-003",
      type: "Question",
      label: "Đau cơ xương khớp nhẹ?",
      responseText: "Cơn đau ngực có thay đổi khi bạn thay đổi tư thế, hít thở sâu hoặc ấn vào thành ngực không?",
      conditions: [
        { text: "Có", nextNode: "NODE-ANS-LOW" },
        { text: "Không", nextNode: "NODE-ANS-FOLLOW" }
      ]
    },
    {
      id: "NODE-ANS-CRITICAL",
      type: "Answer",
      label: "Báo động đỏ: Cấp cứu ngay lập tức!",
      responseText: "Cảnh báo: Triệu chứng của bạn chỉ ra nguy cơ Nhồi máu cơ tim cấp. Hệ thống đang tự động kích hoạt cuộc gọi cấp cứu và điều động bác sĩ chuyên khoa khẩn cấp.",
      conditions: []
    },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState("NODE-002");
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const handleUpdateNode = (updated: Partial<NodeItem>) => {
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, ...updated } as NodeItem : n));
    toast.success("Đã cập nhật thuộc tính nút tạm thời");
  };

  const handleRunSimulation = () => {
    toast.success("MÔ PHỎNG AI TRIAGE THÀNH CÔNG!", {
      description: `Đã chạy thử nghiệm kịch bản thông qua 10.000 hội thoại giả lập. Tỷ lệ phân loại chính xác: 98.4%, thời gian xử lý: 0.12s.`,
      duration: 5000,
    });
  };

  const handlePublish = () => {
    toast.success("XUẤT BẢN KỊCH BẢN THÀNH CÔNG!", {
      description: "Kịch bản AI Triage mới đã được đồng bộ lên môi trường Live cho MedAssist Chatbot toàn viện.",
      duration: 4000,
    });
  };

  const filteredScenarios = scenarios.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", overflow: "hidden" }}>
      
      {/* 1. Left Scenarios Sidebar */}
      <div style={{
        width: 250, borderRight: `1px solid ${C.border}`, backgroundColor: C.bgCard,
        display: "flex", flexDirection: "column", height: "100%", flexShrink: 0
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Layers size={14} color={C.primary} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text1, fontFamily: C.font }}>KỊCH BẢN AI TRIAGE</span>
          </div>
          <Btn variant="outline" size="sm" onClick={() => toast.success("Tạo kịch bản mới")} style={{ padding: "3px 6px" }}>
            <Plus size={12} />
          </Btn>
        </div>

        {/* Search Bar */}
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Tìm kịch bản..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", height: 32, paddingLeft: 28, paddingRight: 8,
                border: `1px solid ${C.border}`, borderRadius: 6,
                fontSize: 11, fontFamily: C.font, backgroundColor: C.bgMuted, outline: "none"
              }}
            />
            <Search size={12} color={C.text3} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        {/* Scenarios List */}
        <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {filteredScenarios.map(sc => {
            const isSel = sc.id === selectedScenario;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenario(sc.id);
                  toast.info(`Mở kịch bản: ${sc.name}`);
                }}
                style={{
                  width: "100%", padding: "8px 10px", borderRadius: 8, border: "none",
                  textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                  backgroundColor: isSel ? C.primaryLight : "transparent",
                  outline: "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isSel ? C.primaryDark : C.text1, fontFamily: C.font }}>{sc.name}</span>
                  <Badge variant={sc.status === "Live" ? "success" : "default"} style={{ fontSize: 8, padding: "1px 4px" }}>{sc.status}</Badge>
                </div>
                <div style={{ fontSize: 9, color: isSel ? C.primary : C.text3, marginTop: 4, fontFamily: C.font }}>{sc.nodes} Nút quy trình · Cập nhật hôm nay</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Editor Canvas */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F8FAFC", overflow: "hidden" }}>
        
        {/* Editor Controls Header */}
        <div style={{
          padding: "12px 16px", backgroundColor: C.bgCard, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text1, fontFamily: C.font }}>SƠ ĐỒ LUỒNG PHÂN LOẠI CẤP CỨU TIM MẠCH</span>
            <Badge variant="blue">v2.4.0 (Live)</Badge>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <Btn variant="outline" size="sm" onClick={handleRunSimulation} style={{ color: C.teal, borderColor: "#A5F3FC" }}>
              <Play size={13} /> Chạy Mô Phỏng
            </Btn>
            <Btn variant="primary" size="sm" onClick={handlePublish}>
              <ArrowUpRight size={13} /> Xuất bản Luồng Mới
            </Btn>
          </div>
        </div>

        {/* Flow Canvas Grid / Interactive Nodes */}
        <div style={{ flex: 1, overflow: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16, alignItems: "center", position: "relative" }}>
          
          {/* Loop over nodes to render a flow chart */}
          {nodes.map((node, i) => {
            const isSel = node.id === selectedNodeId;
            return (
              <div key={node.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 360 }}>
                {/* Connecting arrow if not first */}
                {i > 0 && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth={1.5} style={{ margin: "-4px 0" }}>
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                )}

                {/* Node Box */}
                <button
                  onClick={() => setSelectedNodeId(node.id)}
                  className="interactive-node"
                  style={{
                    width: "100%", padding: 12, borderRadius: 12, border: `1.5px solid ${isSel ? C.primary : C.border}`,
                    backgroundColor: "#fff", cursor: "pointer", outline: "none",
                    boxShadow: isSel ? "0 0 0 3px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0,0,0,0.06)" : "0 2px 6px rgba(0,0,0,0.03)",
                    textAlign: "left", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, fontFamily: C.mono, color: C.text3 }}>{node.id}</span>
                    <Badge variant={node.type === "Start" ? "blue" : node.type === "Question" ? "warning" : "critical"} style={{ fontSize: 8, padding: "1px 4px" }}>
                      {node.type}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text1, marginTop: 4, fontFamily: C.font }}>{node.label}</div>
                  
                  {/* Branching preview */}
                  {node.conditions.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                      {node.conditions.map((c, ci) => (
                        <span key={ci} style={{ fontSize: 8, fontWeight: 600, padding: "1px 4px", borderRadius: 4, backgroundColor: C.bgSection, color: C.text2, border: `1px solid ${C.border}` }}>
                          {c.text} → {c.nextNode}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </div>
            );
          })}

        </div>
      </div>

      {/* 3. Right Node Properties Panel */}
      <div style={{
        width: 300, borderLeft: `1px solid ${C.border}`, backgroundColor: C.bgCard,
        display: "flex", flexDirection: "column", height: "100%", flexShrink: 0
      }}>
        {/* Properties Header */}
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}>
          <Sliders size={14} color={C.primary} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text1, fontFamily: C.font }}>THUỘC TÍNH NÚT QUY TRÌNH</span>
        </div>

        {/* Properties Fields */}
        <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          
          {/* Node ID */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: C.text3 }}>NODE ID</label>
            <input
              type="text"
              readOnly
              value={selectedNode.id}
              style={{
                width: "100%", height: 32, padding: "0 8px", borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 11, fontFamily: C.mono,
                backgroundColor: C.bgMuted, color: C.text2
              }}
            />
          </div>

          {/* Node Type */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: C.text3 }}>LOẠI NÚT</label>
            <input
              type="text"
              readOnly
              value={selectedNode.type}
              style={{
                width: "100%", height: 32, padding: "0 8px", borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 11, fontFamily: C.font,
                backgroundColor: C.bgMuted, color: C.text2
              }}
            />
          </div>

          {/* Node Label */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: C.text3 }}>NHÃN NÚT (TÊN CÂU HỎI)</label>
            <input
              type="text"
              value={selectedNode.label}
              onChange={e => handleUpdateNode({ label: e.target.value })}
              style={{
                width: "100%", height: 32, padding: "0 8px", borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 11, fontFamily: C.font,
                color: C.text1, outline: "none"
              }}
            />
          </div>

          {/* Response Text */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: C.text3 }}>KỊCH BẢN PHẢN HỒI CỦA AI CHATBOT</label>
            <textarea
              rows={5}
              value={selectedNode.responseText}
              onChange={e => handleUpdateNode({ responseText: e.target.value })}
              style={{
                width: "100%", padding: 8, borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 11, fontFamily: C.font,
                color: C.text1, outline: "none", resize: "none", lineHeight: 1.4
              }}
            />
          </div>

          {/* Branching conditions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: C.text3 }}>ĐIỀU KIỆN RẼ NHÁNH</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {selectedNode.conditions.map((cond, idx) => (
                <div key={idx} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 600, width: 45, color: C.text2 }}>{cond.text} →</span>
                  <input
                    type="text"
                    readOnly
                    value={cond.nextNode}
                    style={{
                      flex: 1, height: 26, padding: "0 6px", borderRadius: 4,
                      border: `1px solid ${C.border}`, fontSize: 10, fontFamily: C.mono,
                      backgroundColor: C.bgMuted, color: C.text3
                    }}
                  />
                </div>
              ))}
              {selectedNode.conditions.length === 0 && (
                <span style={{ fontSize: 10, color: C.text3, fontStyle: "italic" }}>Nút kết thúc (Không rẽ nhánh)</span>
              )}
            </div>
          </div>

          <div style={{ width: "100%", height: 1, backgroundColor: C.border, margin: "6px 0" }} />

          {/* Usage Statistics */}
          <div className="hover-lift" style={{ padding: 10, borderRadius: 8, backgroundColor: C.bgMuted, border: `1px solid ${C.border}`, transition: "all 0.25s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
              <BarChart2 size={12} color={C.primary} />
              <span style={{ fontSize: 9, fontWeight: 700, color: C.text2, fontFamily: C.font }}>THỐNG KÊ HOẠT ĐỘNG</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: C.font, color: C.text2, marginBottom: 4 }}>
              <span>Lượt kích hoạt (24h):</span>
              <span style={{ fontWeight: 700 }}>1,284 lần</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: C.font, color: C.text2, marginBottom: 4 }}>
              <span>Thời gian TB trên nút:</span>
              <span style={{ fontWeight: 700 }}>4.8 giây</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: C.font, color: C.text2 }}>
              <span>Tỷ lệ thoát (Drop-off):</span>
              <span style={{ fontWeight: 700, color: C.successDark }}>1.2%</span>
            </div>
          </div>

        </div>

        {/* Action Panel Footer */}
        <div style={{ padding: 12, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <Btn variant="outline" size="sm" onClick={handleRunSimulation} style={{ justifyContent: "center" }}>
            <RefreshCw size={12} /> Test Kịch Bản
          </Btn>
          <Btn variant="primary" size="sm" onClick={handlePublish} style={{ justifyContent: "center" }}>
            <Check size={12} /> Áp dụng Luồng này
          </Btn>
        </div>

      </div>

    </div>
  );
}
