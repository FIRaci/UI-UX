"""Logic sinh suggestions cho endpoint /api/suggestions.

Hỗ trợ 2 chế độ:
- Gemini API available → gọi LLM để sinh suggestions cá nhân hoá
- Fallback → trả suggestions dựa trên dữ liệu đầu vào bằng rule-based
"""

import json
import re
import uuid
from typing import Optional

from models import SuggestionItem, SuggestionsRequest


def _generate_id() -> str:
    """Tạo ID ngắn cho suggestion."""
    return uuid.uuid4().hex[:8]


# --------------- Fallback (rule-based) ---------------

def _build_fallback_suggestions(req: SuggestionsRequest) -> list[SuggestionItem]:
    """Sinh suggestions dựa trên dữ liệu đầu vào — không cần API."""
    suggestions: list[SuggestionItem] = []

    # 1) Nhắc lịch hẹn sắp tới
    if req.upcomingAppointments:
        appt = req.upcomingAppointments[0]
        doctor = appt.get("doctor", "bác sĩ")
        date = appt.get("date", "sắp tới")
        suggestions.append(SuggestionItem(
            id=_generate_id(),
            type="appointment_reminder",
            title="Nhắc lịch khám",
            description=f"Bạn có lịch hẹn với {doctor} vào {date}. Đừng quên chuẩn bị hồ sơ nhé!",
            action="VIEW_APPOINTMENT",
            actionLabel="Xem chi tiết lịch hẹn",
        ))
    else:
        # Không có lịch hẹn → gợi ý đặt lịch
        suggestions.append(SuggestionItem(
            id=_generate_id(),
            type="book_appointment",
            title="Đặt lịch khám định kỳ",
            description=f"Chào {req.patientName}, bạn chưa có lịch khám nào sắp tới. Đặt lịch khám sức khỏe định kỳ để theo dõi sức khỏe nhé!",
            action="BOOK_APPOINTMENT",
            actionLabel="Đặt lịch ngay",
        ))

    # 2) Gợi ý dựa trên hồ sơ gần đây
    if req.recentRecords:
        last_record = req.recentRecords[0]
        diagnosis = last_record.get("diagnosis", "")
        if diagnosis:
            suggestions.append(SuggestionItem(
                id=_generate_id(),
                type="follow_up",
                title="Tái khám theo dõi",
                description=f"Lần khám gần nhất bạn được chẩn đoán '{diagnosis}'. Hãy đặt lịch tái khám để theo dõi tiến triển.",
                action="BOOK_APPOINTMENT",
                actionLabel="Đặt lịch tái khám",
            ))
    else:
        suggestions.append(SuggestionItem(
            id=_generate_id(),
            type="health_checkup",
            title="Khám sức khỏe tổng quát",
            description="Bạn chưa có hồ sơ khám bệnh gần đây. Nên khám tổng quát ít nhất 1 lần/năm.",
            action="SHOW_PACKAGES",
            actionLabel="Xem gói khám",
        ))

    # 3) Mẹo sức khỏe chung (luôn thêm)
    suggestions.append(SuggestionItem(
        id=_generate_id(),
        type="health_tip",
        title="Mẹo sức khỏe hàng ngày",
        description="Uống đủ 2 lít nước mỗi ngày và tập thể dục ít nhất 30 phút để tăng cường sức khỏe.",
        action="VIEW_ARTICLE",
        actionLabel="Đọc thêm mẹo sức khỏe",
    ))

    # 4) Nhắc thuốc (nếu có record gần đây có medication)
    has_medication = any(
        r.get("medication") for r in req.recentRecords
    ) if req.recentRecords else False

    if has_medication:
        med_record = next(r for r in req.recentRecords if r.get("medication"))
        suggestions.append(SuggestionItem(
            id=_generate_id(),
            type="medication_reminder",
            title="Nhắc uống thuốc",
            description=f"Bạn đang dùng thuốc '{med_record['medication']}'. Hãy uống đúng giờ và đủ liều theo chỉ định.",
            action="VIEW_MEDICATION",
            actionLabel="Xem chi tiết đơn thuốc",
        ))

    return suggestions[:5]  # Giới hạn tối đa 5


# --------------- Gemini-powered ---------------

_SUGGESTIONS_SYSTEM_PROMPT = """Bạn là AI hỗ trợ bệnh nhân MediCare. Dựa trên thông tin bệnh nhân được cung cấp,
hãy trả về 3-5 gợi ý chủ động (proactive suggestions) dạng JSON array.

Mỗi item PHẢI có đầy đủ các trường sau:
{
  "id": "mã ngắn 8 ký tự",
  "type": "appointment_reminder | book_appointment | follow_up | health_tip | medication_reminder | health_checkup",
  "title": "Tiêu đề ngắn gọn",
  "description": "Mô tả chi tiết, thân thiện, cá nhân hoá theo tên bệnh nhân",
  "action": "VIEW_APPOINTMENT | BOOK_APPOINTMENT | SHOW_PACKAGES | VIEW_ARTICLE | VIEW_MEDICATION",
  "actionLabel": "Nhãn nút bấm tiếng Việt"
}

Trả về ĐÚNG JSON array, KHÔNG có markdown block.
"""


async def generate_suggestions_with_gemini(
    client,  # genai.Client
    types_module,  # google.genai.types
    req: SuggestionsRequest,
) -> list[SuggestionItem]:
    """Gọi Gemini để sinh suggestions cá nhân hoá."""
    user_prompt = (
        f"Tên bệnh nhân: {req.patientName}\n"
        f"Lịch hẹn sắp tới: {json.dumps(req.upcomingAppointments, ensure_ascii=False)}\n"
        f"Hồ sơ khám gần đây: {json.dumps(req.recentRecords, ensure_ascii=False)}"
    )

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[{"role": "user", "parts": [{"text": user_prompt}]}],
            config=types_module.GenerateContentConfig(
                system_instruction=_SUGGESTIONS_SYSTEM_PROMPT,
                response_mime_type="application/json",
            ),
        )

        raw = response.text.strip()

        # Trích xuất JSON array từ response
        arr_match = re.search(r'(\[.*\])', raw, re.DOTALL)
        if arr_match:
            raw = arr_match.group(1)

        items = json.loads(raw)
        return [SuggestionItem(**item) for item in items[:5]]
    except Exception:
        # Nếu Gemini lỗi → fallback
        return _build_fallback_suggestions(req)


def build_fallback_suggestions(req: SuggestionsRequest) -> list[SuggestionItem]:
    """Public wrapper cho fallback suggestions."""
    return _build_fallback_suggestions(req)
