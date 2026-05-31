"""MediCare AI Service — FastAPI entry point.

Endpoints:
  POST /api/chat        — Chat với AI theo role
  POST /api/suggestions — Gợi ý chủ động cho bệnh nhân
"""

import os
import json
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

from models import (
    ChatRequest,
    ChatResponse,
    SuggestionsRequest,
    SuggestionsResponse,
)
from prompts import SYSTEM_PROMPTS, RESPONSE_FORMAT_INSTRUCTION
from suggestions_service import (
    build_fallback_suggestions,
    generate_suggestions_with_gemini,
)

load_dotenv()

app = FastAPI(title="MediCare AI - AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------- Gemini client init ---------------

api_key = os.getenv("GEMINI_API_KEY")
if api_key and genai:
    client = genai.Client(api_key=api_key)
else:
    client = None


# --------------- /api/chat ---------------

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not client:
        # Fallback nếu chưa có API key
        if "đau" in request.message.lower() or "sốt" in request.message.lower():
            return ChatResponse(
                text="Tôi là AI phản hồi mẫu do chưa cấu hình Gemini API Key. Vui lòng thiết lập GEMINI_API_KEY trong file .env. Dấu hiệu của bạn cần được bác sĩ kiểm tra.",
                actions=["WARNING_RED", "NAVIGATE_APPOINTMENT"],
                suggestedActions=[
                    {"label": "Đặt lịch khám ngay", "action": "BOOK_APPOINTMENT", "data": {}},
                    {"label": "Gọi hotline cấp cứu", "action": "CALL_EMERGENCY", "data": {}},
                ],
            )
        return ChatResponse(
            text="Hệ thống AI đang ở chế độ giả lập do chưa có API Key. Xin chào " + request.role,
            actions=[],
            suggestedActions=[
                {"label": "Đặt lịch khám", "action": "BOOK_APPOINTMENT", "data": {}},
            ],
        )

    sys_prompt = SYSTEM_PROMPTS.get(request.role, "Bạn là trợ lý AI y tế MediCare.")
    sys_prompt += RESPONSE_FORMAT_INSTRUCTION

    # Xây dựng lịch sử hội thoại cho Gemini
    contents = []
    for msg in request.history:
        role = "user" if msg.get("from") == "me" else "model"
        if not msg.get("text"):
            continue
        contents.append({
            "role": role,
            "parts": [{"text": msg.get("text")}],
        })
    contents.append({
        "role": "user",
        "parts": [{"text": request.message}],
    })

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=sys_prompt,
                response_mime_type="application/json",
            ),
        )

        raw_text = response.text.strip()

        # Trích xuất JSON object từ response
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
        return ChatResponse(
            text=data.get("text", ""),
            actions=data.get("actions", []),
            suggestedActions=data.get("suggestedActions", []),
        )
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "quota" in error_msg.lower():
            friendly_text = "Hệ thống AI đang quá tải do vượt quá giới hạn API miễn phí (Quota Exceeded). Vui lòng đợi khoảng 1 phút rồi thử lại nhé."
            return ChatResponse(text=friendly_text, actions=[])
        return ChatResponse(text=f"Lỗi khi gọi AI: {error_msg}", actions=[])


# --------------- /api/suggestions ---------------

@app.post("/api/suggestions", response_model=SuggestionsResponse)
async def suggestions_endpoint(request: SuggestionsRequest):
    """Trả về 3-5 gợi ý chủ động dựa trên dữ liệu bệnh nhân."""
    if client and types:
        items = await generate_suggestions_with_gemini(client, types, request)
    else:
        items = build_fallback_suggestions(request)

    return SuggestionsResponse(suggestions=items)


# --------------- Run ---------------

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
