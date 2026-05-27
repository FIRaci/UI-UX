import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

load_dotenv()

app = FastAPI(title="MediCare AI - AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    role: str
    message: str
    history: list = []

class ChatResponse(BaseModel):
    text: str
    actions: list = []

api_key = os.getenv("GEMINI_API_KEY")
if api_key and genai:
    client = genai.Client(api_key=api_key)
else:
    client = None

AVAILABLE_ACTIONS = """
Danh sách actions bạn có thể dùng:
- WARNING_RED: Dùng khi bệnh nhân mô tả triệu chứng nguy hiểm cần cấp cứu (đau ngực, khó thở, chảy máu nặng, đau đầu đột ngột dữ dội)
- NAVIGATE_APPOINTMENT: Dùng khi người dùng cần đặt lịch hẹn, xem lịch khám, hoặc được đề xuất đặt lịch
- SHOW_PATIENT_HISTORY: Dùng cho role bác sĩ khi cần xem/xét hồ sơ bệnh án
- HIGHLIGHT_CRITICAL: Dùng khi kết quả xét nghiệm hoặc triệu chứng cho thấy tình trạng nguy kịch
- SHOW_PACKAGES: Dùng cho role tư vấn khi đề xuất gói khám sức khỏe
- SHOW_REPORTS: Dùng cho role quản lý khi xem báo cáo vận hành/tài chính
- ALERT_OVERLOAD: Dùng khi phát hiện lịch khám quá tải hoặc tài nguyên hệ thống căng thẳng
"""

SYSTEM_PROMPTS = {
    "benhnhan": AVAILABLE_ACTIONS + "Bạn là AI hỗ trợ bệnh nhân của phòng khám MediCare. Hãy tư vấn nhẹ nhàng, ngắn gọn. Nếu bệnh nhân có triệu chứng nặng, hãy thêm 'WARNING_RED' và 'NAVIGATE_APPOINTMENT' vào actions.",
    "bacsi": AVAILABLE_ACTIONS + "Bạn là trợ lý AI cho bác sĩ. Phân tích triệu chứng và đề xuất chẩn đoán y khoa chuyên sâu. Dùng SHOW_PATIENT_HISTORY khi cần xem hồ sơ, HIGHLIGHT_CRITICAL khi phát hiện dấu hiệu nguy hiểm.",
    "chuyengia": AVAILABLE_ACTIONS + "Bạn là AI trợ lý cho Chuyên gia đánh giá UI/UX. Chuyên môn của bạn là phân tích giao diện, đánh giá Heuristic, và đề xuất cải thiện trải nghiệm người dùng (UX). Dùng HIGHLIGHT_CRITICAL khi phát hiện vấn đề nghiệm trọng, SHOW_REPORTS khi cần xem báo cáo phân tích.",
    "tuvan": AVAILABLE_ACTIONS + "Bạn là AI hỗ trợ nhân viên tư vấn. Đề xuất các gói khám phù hợp. Dùng SHOW_PACKAGES khi đề xuất gói khám, NAVIGATE_APPOINTMENT khi người dùng muốn đặt lịch.",
    "quanly": AVAILABLE_ACTIONS + "Bạn là AI hỗ trợ giám đốc/quản lý phòng khám. Phân tích dữ liệu, doanh thu, lịch trình. Dùng SHOW_REPORTS khi báo cáo, ALERT_OVERLOAD khi phát hiện quá tải."
}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not client:
        # Fallback if no API key
        if "đau" in request.message.lower() or "sốt" in request.message.lower():
            return ChatResponse(
                text="Tôi là AI phản hồi mẫu do chưa cấu hình Gemini API Key. Vui lòng thiết lập GEMINI_API_KEY trong file .env. Dấu hiệu của bạn cần được bác sĩ kiểm tra.",
                actions=["WARNING_RED", "NAVIGATE_APPOINTMENT"]
            )
        return ChatResponse(
            text="Hệ thống AI đang ở chế độ giả lập do chưa có API Key. Xin chào " + request.role,
            actions=[]
        )

    sys_prompt = SYSTEM_PROMPTS.get(request.role, "Bạn là trợ lý AI y tế MediCare.")
    sys_prompt += "\n\nHãy trả về ĐÚNG định dạng JSON sau, không có markdown markdown block:\n"
    sys_prompt += '{"text": "Câu trả lời của bạn", "actions": ["ACTION_1", "ACTION_2"]}'

    # Construct conversation history contents for Gemini
    contents = []
    for msg in request.history:
        role = "user" if msg.get("from") == "me" else "model"
        if not msg.get("text"):
            continue
        contents.append({
            "role": role,
            "parts": [{"text": msg.get("text")}]
        })
    contents.append({
        "role": "user",
        "parts": [{"text": request.message}]
    })

    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=sys_prompt,
                response_mime_type="application/json",
            ),
        )
        
        # Clean response text from markdown block fences
        raw_text = response.text.strip()
        
        # Robust regex JSON extractor
        import re
        json_match = re.search(r'(\{.*\})', raw_text, re.DOTALL)
        if json_match:
            raw_text = json_match.group(1)
        else:
            if raw_text.startswith("```"):
                lines = raw_text.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                raw_text = "\n".join(lines).strip()

        data = json.loads(raw_text)
        return ChatResponse(text=data.get("text", ""), actions=data.get("actions", []))
    except Exception as e:
        return ChatResponse(text=f"Lỗi khi gọi AI: {str(e)}", actions=[])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
