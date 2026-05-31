import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { AlertCircle, Bot, Sparkles, Send, Users, ShieldAlert, Phone } from "lucide-react";
import { SEVERITY, QUICK_PROMPTS, type ChatMessage, type AIInsight, type Severity } from "./constants";

function SeverityBadge({ severity }: { severity: Severity }) {
  const s = SEVERITY[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${s.className}`}>
      <s.Icon className="w-3.5 h-3.5" aria-hidden />
      {s.label}
    </span>
  );
}

interface ChatAreaProps {
  messages: ChatMessage[];
  input: string;
  isTyping: boolean;
  insight: AIInsight;
  onSend: (message: string) => void;
  onInputChange: (value: string) => void;
  onViewDoctors: () => void;
}

export function ChatArea({ messages, input, isTyping, insight, onSend, onInputChange, onViewDoctors }: ChatAreaProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 xl:h-[calc(100vh-12rem)]">
      <div className="flex flex-col min-h-0 order-2 xl:order-1">
        <Card className="p-3 mb-3 bg-amber-50 border-amber-200 flex flex-row items-center gap-2" style={{ borderRadius: "12px" }}>
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800">
            <b>Lưu ý:</b> Kết quả AI chỉ mang tính hỗ trợ tham khảo và không thay thế chẩn đoán y khoa chuyên nghiệp.
          </p>
        </Card>

        <Card className="flex-1 min-h-[60vh] xl:min-h-0 overflow-hidden flex flex-col p-0 border border-slate-100 shadow-sm" style={{ borderRadius: "16px" }}>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-emerald-600" />
                      </div>
                    )}
                    {msg.role === "user" && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="bg-violet-100 text-violet-700">PT</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div className={`px-4 py-2.5 rounded-2xl ${
                        msg.role === "ai"
                          ? "bg-slate-100 text-slate-900 rounded-tl-sm"
                          : "bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-tr-none"
                      }`}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                      </div>
                      <div className={`text-xs text-muted-foreground mt-1 px-1 ${msg.role === "user" ? "text-right" : ""}`}>
                        {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl bg-slate-100 rounded-tl-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {messages.length === 1 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <div className="text-xs text-muted-foreground mb-2">Gợi ý nhanh:</div>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => onSend(prompt)}
                    className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex gap-2 items-end max-w-3xl mx-auto">
              <Textarea
                value={input}
                onChange={e => onInputChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(input); }
                }}
                placeholder="Mô tả triệu chứng của bạn..."
                className="resize-none min-h-[48px] max-h-32 rounded-xl border-slate-200 py-[13px] leading-[22px]"
                rows={1}
              />
              <Button
                size="icon"
                className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-sm"
                onClick={() => onSend(input)}
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Nhấn Enter để gửi, Shift+Enter để xuống dòng</p>
          </div>
        </Card>
      </div>

      <div className="space-y-3 order-1 xl:order-2">
        {insight.severity === "Khẩn cấp" && (
          <Card className="p-3 bg-red-50 border-red-300" style={{ borderRadius: "12px" }} role="alert">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" aria-hidden />
              <div>
                <div className="text-sm font-bold text-red-700">Cảnh báo khẩn cấp</div>
                <p className="text-xs text-red-700 mt-0.5">
                  Triệu chứng có dấu hiệu nguy hiểm. Nếu nặng, hãy gọi cấp cứu ngay thay vì chờ đặt lịch.
                </p>
                <a
                  href="tel:115"
                  className="mt-2 inline-flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1.5"
                >
                  <Phone className="w-4 h-4 mr-1.5" /> Gọi 115
                </a>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 border border-slate-100 shadow-sm" style={{ borderRadius: "16px" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">Phân tích AI</h4>
          </div>
          <div className="space-y-3">
            {insight.symptoms.length > 0 ? (
              <>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Triệu chứng</div>
                  <div className="flex flex-wrap gap-1">
                    {insight.symptoms.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                {insight.specialty && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Chuyên khoa liên quan</div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{insight.specialty}</Badge>
                  </div>
                )}
                {insight.severity && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Mức độ</div>
                    <SeverityBadge severity={insight.severity} />
                  </div>
                )}
                {insight.confidence !== null && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Độ tin cậy AI</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${(insight.confidence || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{Math.round((insight.confidence || 0) * 100)}%</span>
                    </div>
                  </div>
                )}
                {insight.nextAction && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Khuyến nghị</div>
                    <Card className="p-2 bg-emerald-50 border-emerald-200">
                      <p className="text-xs text-emerald-800">{insight.nextAction}</p>
                    </Card>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4 text-slate-500">
                <Bot className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">Hãy mô tả triệu chứng để AI phân tích</p>
              </div>
            )}
          </div>
        </Card>

        {insight.specialty && (
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-sm"
            onClick={onViewDoctors}
          >
            <Users className="w-4 h-4 mr-2" /> Xem bác sĩ phù hợp
          </Button>
        )}
      </div>
    </div>
  );
}
