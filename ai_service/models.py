"""Pydantic models cho MediCare AI Service."""

from pydantic import BaseModel


class ChatRequest(BaseModel):
    """Request body cho endpoint /api/chat."""
    role: str
    message: str
    history: list = []


class SuggestedAction(BaseModel):
    """Hành động gợi ý kèm theo phản hồi chat — giúp UI render nút bấm."""
    label: str
    action: str
    data: dict = {}


class ChatResponse(BaseModel):
    """Response body cho endpoint /api/chat.

    Trường `suggestedActions` là danh sách hành động gợi ý proactive
    (backwards-compatible: default rỗng).
    """
    text: str
    actions: list = []
    suggestedActions: list[SuggestedAction] = []


# --------------- Suggestions endpoint models ---------------

class SuggestionItem(BaseModel):
    """Một suggestion item trả về từ /api/suggestions."""
    id: str
    type: str
    title: str
    description: str
    action: str
    actionLabel: str


class SuggestionsRequest(BaseModel):
    """Request body cho endpoint /api/suggestions."""
    patientName: str
    upcomingAppointments: list = []
    recentRecords: list = []


class SuggestionsResponse(BaseModel):
    """Response body cho endpoint /api/suggestions."""
    suggestions: list[SuggestionItem] = []
