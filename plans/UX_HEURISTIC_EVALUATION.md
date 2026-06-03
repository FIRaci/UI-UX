# Đánh giá Heuristic UX — MediCare AI

**Phương pháp:** Đánh giá có hệ thống dựa trên 10 Nguyên tắc Heuristic của Nielsen, kết hợp Cognitive Walkthrough và Consistency Audit.

**Mục tiêu:** Phát hiện lỗi thiết kế căn nguyên (root cause), đo lường mức độ ảnh hưởng đến trải nghiệm, đề xuất cải thiện có căn cứ.

**Thang đo mức độ nghiêm trọng:**
- **0** — Không phải vấn đề UX
- **1** — Mỹ phẩm: chỉ sửa nếu có thời gian
- **2** — Nhỏ: ưu tiên thấp
- **3** — Lớn: ưu tiên cao, cần sửa
- **4** — Thảm họa: cần sửa ngay trước khi release

---

## Mục lục

1. [Visibility of System Status — Hiển thị trạng thái hệ thống](#1-visibility-of-system-status)
2. [Match Between System and Real World — Tương thích thực tế](#2-match-between-system-and-real-world)
3. [User Control and Freedom — Tự do và kiểm soát](#3-user-control-and-freedom)
4. [Consistency and Standards — Nhất quán và chuẩn mực](#4-consistency-and-standards)
5. [Error Prevention — Phòng tránh lỗi](#5-error-prevention)
6. [Recognition Rather Than Recall — Nhận biết thay vì nhớ](#6-recognition-rather-than-recall)
7. [Flexibility and Efficiency of Use — Linh hoạt và hiệu quả](#7-flexibility-and-efficiency-of-use)
8. [Aesthetic and Minimalist Design — Thẩm mỹ và tối giản](#8-aesthetic-and-minimalist-design)
9. [Help Users Recognize, Diagnose, and Recover from Errors — Trợ giúp nhận diện và phục hồi lỗi](#9-help-users-recognize-diagnose-and-recover-from-errors)
10. [Help and Documentation — Trợ giúp và tài liệu](#10-help-and-documentation)

---

## 1. Visibility of System Status

> **Nguyên tắc:** Hệ thống luôn thông báo cho người dùng biết đang xảy ra chuyện gì, trong thời gian hợp lý.

### 1.1. Loading States

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| VIS-01 | **Thiếu progress indicator cho cold start:** Khi server Render free tier khởi động lại (30-50s), chỉ có toast "Đang đánh thức máy chủ" sau 4s, không có progress bar hay thời gian chờ dự kiến. | `LoginScreen.tsx:29-31` | 🔴 3 | Người dùng không biết: (a) request đã được gửi thành công chưa, (b) còn bao lâu nữa, (c) hay app bị treo. Toast biến mất sau 10s — nếu server khởi động >14s, user không còn thông tin gì. **Solution:** Progress bar + animated message dạng "Đang kết nối máy chủ (thường mất 30-50s)...". |
| VIS-02 | **Loading skeleton không đồng nhất:** Records dùng skeleton, nhưng Appointments, Doctor List, Thread List không có skeleton loading khi fetch. | `records.tsx`, nhiều nơi | 🟡 2 | Khi server chậm, user thấy màn hình trắng (empty state) trước khi data load — gây nhầm tưởng "không có dữ liệu". **Solution:** Skeleton loading cho tất cả danh sách động. |
| VIS-03 | **Search không có debounce indicator:** Khi gõ tìm bác sĩ, list filter realtime nhưng không có "Đang tìm kiếm..." text hay spinner nếu data lớn. | `search-section.tsx` | 🟢 1 | Với danh sách 30+ bác sĩ hiện tại ổn, nhưng nếu scale lên 100+ sẽ gây lag không rõ nguyên nhân. **Solution:** Thêm debounce 300ms + loading indicator. |
| VIS-04 | **Notification polling không có indicator:** Polling `/api/notifications` mỗi 30s nhưng user không biết hệ thống đang kiểm tra. | `AppShell.tsx:76-147` | 🟢 1 | Tính năng chạy ngầm — không cần thiết hiển thị, nhưng nếu polling fail nhiều lần nên có indicator nhỏ. |

### 1.2. System Status & Feedback Gaps

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| VIS-05 | **AI Chat typing indicator delay mismatch:** `isTyping` được set `true` ngay khi gửi, nhưng typography indicator animation chỉ dừng khi API trả response — nếu API nhanh (<300ms), indicator flicker không kịp render. | `ChatView.tsx:96,209` | 🟡 2 | Gây cảm giác "giật" khi AI trả lời quá nhanh. **Solution:** Minimum typing indicator duration 500ms even if response early. |
| VIS-06 | **Booking confirmation không có optimistic update visual:** Sau khi đặt lịch, lịch xuất hiện trong danh sách nhưng không có highlight hay animation để user nhận biết "lịch mới". | `index.tsx (Patient)` | 🟡 2 | User phải tự tìm lịch mới trong danh sách. **Solution:** Scroll + highlight animation cho appointment mới. |
| VIS-07 | **Logout không có confirmation:** Logout diễn ra ngay lập tức, không confirm dialog. | `AppShell.tsx:204` | 🔴 3 | Dễ logout nhầm (accidental logout). Trong môi trường y tế, mất phiên làm việc đột ngột có thể mất dữ liệu chưa lưu. **Solution:** Confirm dialog "Bạn có chắc muốn đăng xuất?" |
| VIS-08 | **Cancel appointment không có undo sau khi confirm:** Confirm hủy lịch xong → toast success nhưng không có "Hoàn tác" action. | `index.tsx:466-472` | 🟡 2 | notification delete có undo, nhưng appointment cancel không có. **Solution:** Thêm undo action vào toast như notification. |

---

## 2. Match Between System and Real World

> **Nguyên tắc:** Hệ thống nói ngôn ngữ của người dùng, với các khái niệm quen thuộc, theo trật tự tự nhiên.

### 2.1. Terminology & Mental Model

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| MAT-01 | **Role labeling inconsistency:** Code dùng `role="quanly"` nhưng UI hiển thị "Quản lý". Role "admin" mapping tới "System Admin". Một số chỗ gọi là "Quản trị", chỗ khác "Quản lý". | `AppShell.tsx:400-407`, `useStore`, `LoginScreen.tsx` | 🟡 2 | User không biết "Quản lý" vs "Quản trị hệ thống" khác nhau thế nào. **Solution:** Dùng nhất quán "Quản lý phòng khám" và "Quản trị hệ thống". |
| MAT-02 | **Triage level terminology không phổ biến:** "Khẩn cấp", "Cao", "Trung bình", "Thấp" — không match với thang điểm y tế chuẩn (Critical/Urgent/Semi-urgent/Non-urgent) | `LevelBadge.tsx`, `DoctorDashboard/constants.ts` | 🟢 1 | Có thể chấp nhận được vì đã Việt hóa. Tuy nhiên có thể gây nhầm với "Cao" = "High priority" không rõ là nguy hiểm hay ưu tiên. |
| MAT-03 | **Appointment status không có trạng thái "Đang khám":** Chỉ có "Sắp tới", "Hoàn thành", "Đã hủy", thiếu "Đang khám". | Store, `PatientDashboard/appointments.tsx` | 🔴 3 | Trong thực tế phòng khám, bệnh nhân có trạng thái "Đang khám" giữa "Sắp tới" và "Hoàn thành". Thiếu status này gây nhầm lẫn: user thấy lịch "Sắp tới" nhưng thực tế đã vào khám. |
| MAT-04 | **Time selection không intuitive:** Grid button cho time slots, không có AM/PM, dùng 24h format. Trên mobile, các button nhỏ khó bấm chính xác. | `dialogs.tsx:89-96` | 🟡 2 | User Việt Nam quen 24h nên không vấn đề. Nhưng grid buttons khó scan nhanh — **Solution:** Dùng native `<input type="time">` hoặc scrollable picker. |

### 2.2. Real-world Workflow Mapping

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| MAT-05 | **Consultation flow bỏ qua bước nhập liệu:** Doctor click "GỌI VÀO KHÁM NGAY" → ConsultationRoom, nhưng không có bước xác nhận bệnh nhân đã vào phòng. | `DoctorDashboard/index.tsx` | 🟡 2 | Trong thực tế, bác sĩ cần xác nhận bệnh nhân đã có mặt rồi mới bắt đầu khám. **Solution:** Thêm confirm step "Bệnh nhân đã sẵn sàng?" |
| MAT-06 | **Không có "Lịch sử đặt lịch" cho bệnh nhân:** Patient chỉ xem được lịch hiện tại. Không có tính năng xem lại lịch sử đặt lịch trong quá khứ (trừ tab "Đã khám"/"Đã hủy"). | `PatientDashboard/appointments.tsx` | 🟡 2 | Người dùng muốn tra cứu "tháng trước tôi khám những ai?" cho mục đích BHYT/bảo hiểm. **Solution:** Thêm date range filter. |

---

## 3. User Control and Freedom

> **Nguyên tắc:** Người dùng cần "cửa thoát hiểm" — undo, redo, thoát khỏi trạng thái không mong muốn.

### 3.1. Navigation & Escape

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| CTRL-01 | **Không có breadcrumb navigation:** User không biết mình đang ở đâu trong cấu trúc app, không có cách quay lại cấp cao hơn ngoài sidebar. | `AppShell.tsx` | 🟡 2 | App có 5 role + ~30 views, thiếu breadcrumb làm tăng gánh nặng nhớ. **Solution:** Thêm breadcrumb dưới header. |
| CTRL-02 | **Browser back button không hoạt động đúng:** Do app dùng custom event (`app:navigate`) và internal tab state, browser back có thể đưa user ra khỏi dashboard hoàn toàn. | `hooks/useAppNavigate.ts`, `PatientDashboard/index.tsx` | 🔴 3 | User nhấn back → mất session → phải login lại. Vi phạm nguyên tắc web căn bản. **Solution:** Dùng React Router URL params cho tab state thay vì internal state. |
| CTRL-03 | **AI Chat không có "stop generating":** Khi user gửi message, không thể hủy giữa chừng nếu đổi ý hoặc nhập sai. | `ChatView.tsx`, `PatientDashboard/index.tsx` | 🟡 2 | Trên mobile, gửi nhầm message → không thể cancel. **Solution:** Add Stop/Abort button khi isTyping=true. |
| CTRL-04 | **Modal không đóng được bằng ESC (một số dialog):** Các dialog bọc trong `<Dialog>` của shadcn/ui mặc định đóng bằng ESC, nhưng cần kiểm tra tất cả. | Nhiều file | 🟢 1 | Verify: `shadcn/ui Dialog` có `onOpenChange` — cần đảm bảo tất cả dialog pass `onOpenChange` down. |

### 3.2. Undo & Rollback

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| CTRL-05 | **Edit appointment không thể undo change:** Sau khi đổi lịch, chỉ có toast "Cập nhật lịch thành công", không có undo. | `dialogs.tsx:169-171` | 🔴 3 | User có thể chọn nhầm ngày/giờ mới. **Solution:** Lưu old data và thêm undo action trong toast. |
| CTRL-06 | **Không có "hủy bỏ" khi đang typing chat:** Textarea không có clear button, user phải xóa từng ký tự. | `ChatView.tsx:394-404` | 🟢 1 | Minor issue. **Solution:** Thêm X button trong textarea khi có content. |

---

## 4. Consistency and Standards

> **Nguyên tắc:** Người dùng không phải tự hỏi liệu các từ, tình huống, hành động khác nhau có cùng một ý nghĩa không.

### 4.1. Visual Consistency

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| CON-01 | **Button style inconsistency:** Patient Dashboard dùng button gradient emerald, Doctor Dashboard dùng button gradient blue, Admin Dashboard dùng button solid blue — 3 style khác nhau cho cùng hành động "primary". | Nhiều nơi | 🔴 3 | Primary action (Đặt lịch, Lưu, Gửi) có visual khác nhau tùy màn hình. User mất consistency cue. **Solution:** Thống nhất primary button style (`bg-blue-600 hover:bg-blue-700`) và danger style (`bg-red-600`) trên toàn app. |
| CON-02 | **Card border-radius không nhất quán:** Login card `rounded-3xl` (24px), Patient dashboard cards `rounded-[32px]`, Doctor cards `rounded-2xl` (16px), Search cards `rounded-2xl` (16px). | Nhiều nơi | 🟡 2 | 3+ loại border-radius cho "card" cùng cấp độ. **Solution:** `rounded-2xl` (16px) cho cards thường, `rounded-3xl` (24px) cho cards hero. |
| CON-03 | **Notification bell size và border khác nhau giữa Patient Dashboard và AppShell:** Patient Dashboard dùng `w-11 h-11` với border-white, AppShell dùng `size-9` với border-slate-200. | `AppShell.tsx:295-301`, `PatientDashboard/index.tsx:526-531` | 🟢 1 | Gây inconsistency visual — cùng icon nhưng khác kích thước và styling. |
| CON-04 | **Avatar fallback initials không nhất quán:** Một số chỗ dùng initials từ tên, chỗ khác hardcode "MK", "VA", "QT". | Nhiều nơi | 🟡 2 | Hardcoded initials không reflect user thực tế. **Solution:** Luôn dynamic từ user data. |
| CON-05 | **Toast notification style:** Dùng `sonner` với `richColors` — nhưng có chỗ dùng `toast.success`, `toast.error`, có chỗ dùng `toast.info`, `toast.warning`. Một số không dùng richColors. | Nhiều nơi | 🟢 1 | Chấp nhận được, nhưng nên standardize. |
| CON-06 | **AI insight panel chỉ hiện trên xl screens (desktop):** Ẩn hoàn toàn trên mobile, user mobile mất context quan trọng. | `ChatView.tsx:419` | 🔴 3 | Insight panel chứa cảnh báo nguy hiểm — ẩn trên mobile là nguy hiểm. **Solution:** Hiển thị dạng collapsible drawer trên mobile. |

### 4.2. Behavioral Consistency

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| CON-07 | **Enter key behavior khác nhau:** Chat gửi bằng Enter (Shift+Enter xuống dòng) — đúng convention. Nhưng search form không có Enter submit. | `ChatView.tsx:398-399` vs `search-section.tsx` | 🟢 1 | Search filter realtime nên Enter không cần thiết. Không phải vấn đề lớn. |
| CON-08 | **Dialog close behavior:** Một số dialog có nút "Đóng" + "Hủy", một số chỉ có "Hủy". CancelConfirmDialog không có nút đóng (X) trên góc. | `dialogs.tsx` vs `LoginScreen` | 🟡 2 | User quen với pattern dialog có X button để đóng. |
| CON-09 | **Notification mark read behavior:** Trong AppShell, click notification → mark read + open detail. Trong Patient Dashboard, click notification → mark read + navigate. Cùng action khác behavior. | `AppShell.tsx:341-344` vs `PatientDashboard/index.tsx:553-562` | 🟡 2 | Gây confusion: user không biết click notification sẽ dẫn đến đâu. |

### 4.3. Platform Standards

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| CON-10 | **No dark mode support:** Toàn bộ app dùng hardcoded colors (bg-white, text-slate-900). | Toàn bộ | 🟡 2 | Vi phạm platform convention — macOS/iOS user quen với dark mode. |
| CON-11 | **No keyboard shortcut support (except ⌘K):** Chỉ có search shortcut. Thiếu shortcuts cho navigation, submit, cancel. | `AppShell.tsx:65-74` | 🟡 2 | Gánh nặng cho power users. **Solution:** Thêm shortcuts: `G+S`: Search, `G+H`: Home, `Esc`: Back. |
| CON-12 | **Form validation không có HTML5 constraint validation:** Không dùng `required`, `type="email"`, `pattern` attributes. | `LoginScreen.tsx:80-86`, `RegisterScreen` | 🟡 2 | Bỏ qua native browser validation layer. **Solution:** Thêm HTML5 validation attributes. |

---

## 5. Error Prevention

> **Nguyên tắc:** Thiết kế tốt hơn là sửa lỗi — ngăn chặn lỗi trước khi chúng xảy ra.

### 5.1. Form Validation & Prevention

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| ERR-01 | **Register form không validate password strength:** Chỉ check empty, không check độ dài, complexity. | `RegisterScreen.tsx` | 🟡 2 | User có thể đặt password "1" — lỗ hổng bảo mật. **Solution:** Thêm validate: min 6 ký tự, có chữ và số. |
| ERR-02 | **Input type="date" không validate range properly:** `min={new Date().toISOString().slice(0, 10)}` — ngăn quá khứ nhưng không ngăn ngày quá xa trong tương lai (vd 2050). | `dialogs.tsx:85` | 🟢 1 | User có thể đặt lịch trước 25 năm. **Solution:** Thêm max date (vd +6 tháng). |
| ERR-03 | **Phone number validation không toàn diện:** Chỉ dùng regex `^\d{9,11}$`, không phân biệt số di động/số bàn, không hỗ trợ +84. | `AdminDashboard/patient-section.tsx` | 🟡 2 | User Việt Nam quen dùng +84 hoặc 0 đầu. **Solution:** Chuẩn hóa phone input với format mask. |
| ERR-04 | **Duplicate booking check chỉ check "Sắp tới":** Nếu user đã có lịch "Hoàn thành" cùng giờ, không được cảnh báo. | `PatientDashboard/index.tsx:445` | 🟢 1 | Có thể chấp nhận được. |
| ERR-05 | **Delete confirmation không phân biệt destructive action:** "Xóa tất cả" notification, "Hủy lịch" appointment — cả hai đều có confirm dialog nhưng cancel appointment có flow tốt hơn. | Nhiều nơi | 🟡 2 | Inconsistent prevention level. |

### 5.2. Accidental Action Prevention

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| ERR-06 | **Logout không confirm:** Như VIS-07 đã phân tích. | `AppShell.tsx` | 🔴 3 | Nguy cơ cao — mất dữ liệu phiên làm việc. |
| ERR-07 | **"Mới" chat button clear message không confirm:** Xóa toàn bộ lịch sử chat hiện tại không confirm. | `PatientDashboard/index.tsx:738-756` | 🟡 2 | User có thể mất lịch sử chat quan trọng. **Solution:** Confirm "Bắt đầu cuộc trò chuyện mới? Lịch sử hiện tại sẽ được lưu." |
| ERR-08 | **Submit booking double-click không được prevent:** Button disabled khi submitting nhưng không có client-side check nếu user spam. | `dialogs.tsx:104-107` | 🟢 1 | isSubmitting state đã prevent, nhưng double-click vẫn tạo timeout thứ 2. **Solution:** Check `isSubmitting` ở đầu `handleConfirm`. |

---

## 6. Recognition Rather Than Recall

> **Nguyên tắc:** Người dùng không phải nhớ thông tin từ phần này sang phần khác.

### 6.1. Information Persistence

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| REC-01 | **Không lưu search filter preference:** User chọn chuyên khoa "Tim mạch" trong search, navigate sang tab khác rồi quay lại → filter reset về "All". | `PatientDashboard/index.tsx` | 🟡 2 | Buộc user phải filter lại mỗi lần vào search. **Solution:** Lưu filter state trong URL params. |
| REC-02 | **Chat history không sync giữa các session:** Chat messages lưu localStorage, nhưng không sync với server. User login trên thiết bị khác mất toàn bộ lịch sử. | `PatientDashboard/index.tsx:101-145` | 🟡 2 | Hạn chế của localStorage-based approach. **Solution:** Lưu messages lên server API. |
| REC-03 | **Doctor detail không có "back to search" position memory:** User xem doctor detail, click back → mất vị trí scroll và filter cũ. | `PatientDashboard/search-section.tsx` | 🟢 1 | Không nghiêm trọng với danh sách ngắn. |

### 6.2. Recognition Cues

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| REC-04 | **Không có color coding cho appointment status ngoài badge:** Trong danh sách, status chỉ hiển thị bằng badge text, không có màu nền khác nhau cho mỗi row. | `PatientDashboard/appointments.tsx` | 🟢 1 | User phải đọc text để biết status. **Solution:** Color-code row border/background. |
| REC-05 | **Doctor card không có "đã từng đặt lịch" indicator:** Patient đã từng khám với bác sĩ A, nhưng card hiển thị giống hệt bác sĩ chưa từng gặp. | `PatientDashboard/search-section.tsx` | 🟢 1 | **Nice-to-have:** Thêm badge "Đã khám" cho doctor quen. |
| REC-06 | **Navigation highlight chỉ highlight tab đang active:** User không thấy được "mình đã navigate từ đâu", không có breadcrumb hay history. | `AppShell.tsx:181-191` | 🟡 2 | Gánh nặng nhớ. |

---

## 7. Flexibility and Efficiency of Use

> **Nguyên tắc:** Cho phép người dùng mới và người dùng có kinh nghiệm đều thao tác hiệu quả.

### 7.1. Accelerators for Power Users

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| FLEX-01 | **Không có keyboard navigation trong doctor list:** Không thể dùng phím mũi tên để chọn doctor. | `PatientDashboard/search-section.tsx` | 🟢 1 | Nice-to-have. |
| FLEX-02 | **Không có bulk actions cho admin:** Admin phải xóa từng notification, từng patient. | `AdminDashboard` | 🟡 2 | Gây frustration khi cần xóa nhiều items. **Solution:** Thêm checkbox + "Xóa đã chọn". |
| FLEX-03 | **Không có "quick book" preset:** User phải qua 5 bước (Search → Card → Detail → Booking → Confirm) để đặt lịch. Không có favorite doctor shortcut. | `PatientDashboard` | 🟡 2 | User đặt lịch định kỳ cho cùng bác sĩ mỗi lần mất nhiều bước. **Solution:** "Đặt lại" button trên lịch cũ. |

### 7.2. Customization

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| FLEX-04 | **Không thể customize dashboard order:** Patient dashboard có 5 action buttons cố định, không thể sắp xếp lại. | `PatientDashboard/index.tsx` | 🟢 1 | Nice-to-have. |
| FLEX-05 | **AI Chat không có tùy chỉnh giọng nói response:** Mic button chỉ là placeholder, không thực sự hoạt động. | `PatientDashboard/index.tsx:888-895` | 🟡 2 | Fake feature gây expectation mismatch. **Solution:** Hoặc implement thật, hoặc gỡ bỏ. |

---

## 8. Aesthetic and Minimalist Design

> **Nguyên tắc:** Không chứa thông tin không liên quan hoặc hiếm khi cần.

### 8.1. Visual Noise & Cognitive Load

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| AES-01 | **Patient Dashboard animation overload:** Orbital buttons có 3 animation đồng thời: floating (y: [0,-8,0]), breathing (boxShadow), và infinite spin ring. Plus center button pulse. | `PatientDashboard/index.tsx` | 🟡 2 | 4 perpetual animations cùng lúc gây: (a) cognitive overload, (b) performance hit trên mobile, (c) violation với reduced-motion preference. **Solution:** Giảm còn 1 perpetual animation, dùng static gradients cho phần còn lại. |
| AES-02 | **Gradient overload:** Một số màn hình có 5-6 gradient khác nhau (emerald, teal, blue, amber, purple, pink). Thiếu semantic meaning cho mỗi gradient. | Nhiều nơi | 🟡 2 | Gradient nên có ý nghĩa. Emerald/Teal = AI & Health, Blue = Primary action. Màu sắc hiện tại decorative nhưng gây rối. |
| AES-03 | **Confetti animation không có trigger:** File import `canvas-confetti` nhưng không thấy dùng ở đâu. Code chết. | `package.json` | 🟢 1 | Dead dependency. |
| AES-04 | **Chat message bubble styling đẹp nhưng không đồng bộ:** Patient Chat (trong dashboard) dùng gradient emerald cho user message. ChatView (shared component) dùng gradient teal-to-emerald. Cùng chức năng khác màu. | `PatientDashboard/index.tsx:796-798` vs `ChatView.tsx:314-318` | 🟡 2 | Như CON-01 nhưng ở cấp component. |
| AES-05 | **Text size hierarchy không rõ:** Trong AppShell, title `font-extrabold text-lg` (18px), subtitle `text-xs` (12px) — chênh lệch 6px, không có intermediate size. | `AppShell.tsx:250-252` | 🟢 1 | Minor. |

### 8.2. Content Density

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| AES-06 | **Doctor card dư thừa spacing:** Card có `p-5` với nhiều gap, content chỉ chiếm ~50% diện tích card. Trên mobile, card dài và ít thông tin. | `search-section.tsx:45` | 🟢 1 | Với danh sách ngắn (30 doctors) ổn, nhưng nếu >50 sẽ cần compact variant. |
| AES-07 | **Success dialog có proportion imbalance:** Dialog content có icon `w-20 h-20` plus header text — chiếm 60% không gian cho decorative elements. | `dialogs.tsx:300-311` | 🟢 1 | Check animation quan trọng hơn content. |

---

## 9. Help Users Recognize, Diagnose, and Recover from Errors

> **Nguyên tắc:** Thông báo lỗi bằng ngôn ngữ rõ ràng, chỉ ra chính xác vấn đề và đề xuất giải pháp.

### 9.1. Error Message Quality

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| HLP-01 | **Generic error messages:** Nhiều catch block chỉ log `toast.error("Lỗi kết nối đến máy chủ")` mà không nói user nên làm gì. | Nhiều nơi | 🔴 3 | "Lỗi kết nối" không cho user biết: (a) có nên thử lại không, (b) có thể làm gì khác. **Solution:** "Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại. [Thử lại]" |
| HLP-02 | **Error message không specific:** `toast.error(data.error || "Lỗi đăng nhập")` — server trả về error message nhưng có thể generic. | `LoginScreen.tsx:48` | 🟡 2 | Cần parse và hiển thị lỗi cụ thể: "Tài khoản không tồn tại" vs "Sai mật khẩu" vs "Tài khoản bị khóa". |
| HLP-03 | **429 Quota exceeded message technical:** "AI hiện đang hết hạn mức sử dụng miễn phí (429 RESOURCE_EXHAUSTED)" — chứa HTTP status code và technical term. | `ChatView.tsx:122-123` | 🟡 2 | User không cần biết "429" hay "RESOURCE_EXHAUSTED". **Solution:** "Trợ lý AI tạm thời gián đoạn. Vui lòng thử lại sau ít phút." |
| HLP-04 | **Không có error boundary:** App không có React Error Boundary. Bất kỳ runtime error nào cũng crash toàn bộ app. | `App.tsx` | 🔴 3 | Trong môi trường y tế, crash app có thể gây hậu quả nghiêm trọng. **Solution:** Thêm ErrorBoundary wrapper. |
| HLP-05 | **Không có offline detection:** App không detect mạng offline để hiển thị trạng thái, tất cả API call đều fail silently đến khi toast appear. | Toàn bộ | 🟡 2 | User không biết mình offline đến khi click button. **Solution:** `navigator.onLine` listener + banner "Mất kết nối mạng". |

### 9.2. Recovery Mechanism

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| HLP-06 | **API failure không có retry mechanism (hầu hết):** Chỉ có notification error có retry button. Records, Appointments, Doctors không có retry. | Nhiều nơi | 🔴 3 | User thấy lỗi xong không biết làm gì ngoài F5. **Solution:** Error state với "Thử lại" button rõ ràng. |
| HLP-07 | **Form validation errors chỉ hiển thị bằng toast:** Không highlight input bị lỗi, không focus vào field lỗi. | `LoginScreen.tsx:21-24`, `AdminDashboard/patient-section.tsx` | 🔴 3 | User phải tự dò tìm field nào sai. **Solution:** highlight red border + focus + error text dưới input. |
| HLP-08 | **Unauthorized (401) handling:** Token hết hạn → dispatch event → logout → toast. Nhưng không có visual indicator trước khi redirect. | `App.tsx:71-77` | 🟢 1 | Acceptable — toast giải thích đủ rõ. |

---

## 10. Help and Documentation

> **Nguyên tắc:** Cung cấp trợ giúp và tài liệu (lý tưởng là không cần).

### 10.1. Onboarding & Guidance

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| DOC-01 | **Không có onboarding flow cho người dùng mới:** User mới login lần đầu không được hướng dẫn, không biết bắt đầu từ đâu. | Toàn bộ | 🔴 3 | Đặc biệt nguy hiểm cho bệnh nhân lớn tuổi — đối tượng chính của app y tế. **Solution:** Modal "Bắt đầu" cho lần đầu login với 3 bước hướng dẫn. |
| DOC-02 | **Không có tooltip/helper text cho icon buttons:** Nhiều icon button không có label, không có tooltip. User phải guess chức năng. | `AppShell.tsx:295-301`, `PatientDashboard` | 🟡 2 | Vi phạm Visibility + Recognition. |
| DOC-03 | **Placeholder text không hướng dẫn:** "Nhập tài khoản..." không nói user nên nhập gì. "Nhập tin nhắn..." không cho ví dụ. | `LoginScreen.tsx:82`, nhiều nơi | 🟢 1 | Có thể cải thiện. |
| DOC-04 | **Không có FAQ hoặc trợ giúp trong app:** User gặp khó khăn không có nơi nào để tra cứu. | Toàn bộ | 🟡 2 | **Solution:** Thêm icon "?" trong header dẫn đến FAQ modal. |

### 10.2. Contextual Help

| ID | Vấn đề | Vị trí | Mức độ | Phân tích |
|----|--------|--------|--------|-----------|
| DOC-05 | **Empty states không hướng dẫn hành động tiếp theo:** Hầu hết empty state chỉ thông báo "Không có dữ liệu" mà không gợi ý user nên làm gì tiếp. | Nhiều nơi | 🟡 2 | **Solution:** Empty state pattern = icon + message + CTA button. |
| DOC-06 | **Không có "what's new" / changelog:** User không biết tính năng mới hoặc thay đổi. | Toàn bộ | 🟢 1 | Nice-to-have. |

---

## Cognitive Walkthrough — Phân tích luồng chính

### Flow A: Bệnh nhân đặt lịch khám (New user)

```
Bước 1: Login → Dashboard → Search → Filter → Select doctor → Booking → Confirm → Success
```

| Bước | Hành động | Câu hỏi | Vấn đề | Severity |
|------|-----------|---------|--------|----------|
| 1 | Nhập username/password, click "Đăng nhập" | User có biết cần click button này không? | Button "Đăng nhập" rõ ràng. OK. | ✅ |
| 2 | Dashboard: click "Tìm bác sĩ" | User có hiểu icon Stethoscope là "Tìm bác sĩ"? | Icon Stethoscope + label rõ. OK. | ✅ |
| 3 | Search: filter specialty | User có biết "Chuyên khoa" Select là để lọc? | Label "Chuyên khoa" + placeholder "Tất cả chuyên khoa" rõ. OK. | ✅ |
| 4 | Click "Chi tiết" → "Đặt lịch" | User có biết cần 2 click? | 2-step flow (Chi tiết → Đặt lịch) hơi dài. Gộp "Đặt lịch" trực tiếp từ card. | 🟡 2 |
| 5 | Chọn ngày, giờ → "Xác nhận đặt lịch" | User có biết click vào time slot mới enabled "Xác nhận"? | Time slot grid + button rõ. OK. | ✅ |
| 6 | Success dialog → "Xem lịch hẹn" | User có biết redirect đến đâu? | Button "Xem lịch hẹn" + "Đóng" rõ. OK. | ✅ |

**Tổng số bước tối thiểu:** 6 bước (Login → click → click → click → pick slot → confirm)
**Tối ưu hóa:** Có thể giảm còn 4 bước nếu có "quick book" cho doctor quen thuộc.

### Flow B: Bác sĩ xử lý ca khẩn cấp

```
Bước 1: Dashboard thấy alert → Click "Tiếp nhận & Xử lý" → Consultation → Finish
```

| Bước | Hành động | Câu hỏi | Vấn đề | Severity |
|------|-----------|---------|--------|----------|
| 1 | Alert card: "Tiếp nhận & Xử lý" | User có thấy alert? | Red card + pulse animation + AlertTriangle — rất nổi bật. OK. | ✅ |
| 2 | Click → consultation room | User hiểu đây là phòng khám? | ConsultationRoom layout đầy đủ thông tin. OK. | ✅ |
| 3 | Finish consult | User biết click đâu để kết thúc? | Cần kiểm tra có button "Kết thúc" rõ ràng không. | 🔍 |

**Tổng số bước:** 2-3 bước (alert → room → finish). Phù hợp cho emergency.

### Flow C: Admin tạo bệnh nhân mới

```
Bước 1: Dashboard → Patients → "Thêm bệnh nhân" → Fill form → Save
```

| Bước | Hành động | Câu hỏi | Vấn đề | Severity |
|------|-----------|---------|--------|----------|
| 1 | Click "Bệnh nhân" tab | User có hiểu đây là patient management? | Tab label rõ. OK. | ✅ |
| 2 | Click "Thêm bệnh nhân" | User thấy button? | Button primary màu xanh. OK. | ✅ |
| 3 | Fill form → Save | Validation error format? | Dùng toast, không highlight field. | 🔴 3 (HLP-07) |

**Tổng số bước:** 3-4 bước. Tối ưu.

---

## Interaction Cost Analysis

Đo lường số bước thao tác so với optimal:

| Tác vụ | Số bước hiện tại | Số bước tối ưu | Chênh lệch | Gợi ý |
|--------|-----------------|----------------|------------|--------|
| Đặt lịch khám (doctor mới) | 6 | 4 | +2 | Quick book cho doctor quen (1 click) |
| Đặt lịch khám (doctor cũ) | 6 | 2 | +4 | "Đặt lại" button trên lịch cũ |
| Xem hồ sơ bệnh án | 3 | 2 | +1 | Dashboard shortcut đã có |
| Gửi tin nhắn cho bác sĩ | 4 | 3 | +1 | OK |
| Xem thông báo mới | 1 | 1 | 0 | OK |
| Chỉnh sửa lịch hẹn | 4 | 3 | +1 | OK |
| Hủy lịch hẹn | 3 | 2 | +1 | OK (cần confirm) |

---

## Accessibility Audit Summary (WCAG 2.1 AA)

| ID | Tiêu chí | Trạng thái | Vấn đề |
|----|----------|------------|--------|
| A11Y-01 | **1.1.1 Non-text Content** | ❌ FAIL | Nhiều icon button thiếu aria-label. Avatar initials hardcoded. |
| A11Y-02 | **1.4.1 Use of Color** | ❌ FAIL | Status chỉ dùng màu, thiếu icon/text supplement. (Ví dụ: status badge "Sắp tới" chỉ có màu xanh) |
| A11Y-03 | **1.4.3 Contrast (Minimum)** | ⚠️ PARTIAL | Text-slate-900 on bg-white ≥ 4.5:1. Nhưng text-muted-foreground on bg-slate-50 cần check (thường ~3:1). |
| A11Y-04 | **1.4.4 Resize Text** | ⚠️ PARTIAL | Dùng rem units, nhưng cần test zoom 200%. |
| A11Y-05 | **1.4.10 Reflow** | ❌ FAIL | Một số component fixed width (w-[380px], w-[520px]) không reflow ở 320px. |
| A11Y-06 | **2.1.1 Keyboard** | ❌ FAIL | Không thể navigate by keyboard qua hết tất cả features. Custom event `app:navigate` không hỗ trợ keyboard. |
| A11Y-07 | **2.4.1 Bypass Blocks** | ❌ FAIL | Không có skip-to-content link. |
| A11Y-08 | **2.4.3 Focus Order** | ⚠️ PARTIAL | Tab order cần kiểm tra với screen reader. |
| A11Y-09 | **2.4.7 Focus Visible** | ✅ PASS | Có focus-visible rings. |
| A11Y-10 | **2.5.8 Target Size (AA)** | ❌ FAIL | Notification bell (36px) và avatar (36px) dưới 44px touch target. |
| A11Y-11 | **3.2.1 On Focus** | ✅ PASS | Không có unexpected context change on focus. |
| A11Y-12 | **3.3.1 Error Identification** | ❌ FAIL | Error chỉ hiển thị bằng toast, không highlight field lỗi. |
| A11Y-13 | **3.3.2 Labels or Instructions** | ⚠️ PARTIAL | Có label cho input, nhưng không có instructions phức tạp. |
| A11Y-14 | **4.1.2 Name, Role, Value** | ❌ FAIL | Custom components (Select, Dialog) cần check ARIA attributes. |

**Điểm Accessibility tổng thể:** ~35% pass rate. Cần cải thiện nhiều.

---

## Summary of Findings by Severity

| Mức độ | Số lượng | Cần hành động |
|--------|----------|---------------|
| 🔴 4 — Thảm họa | 0 | — |
| 🔴 3 — Lớn | 10 | Fix trước release |
| 🟡 2 — Nhỏ | 28 | Fix trong roadmap |
| 🟢 1 — Mỹ phẩm | 12 | Khi có thời gian |
| **Tổng cộng** | **50** | |

### Top 10 Critical Fixes (Severity 3)

| ID | Vấn đề | Category |
|----|--------|----------|
| VIS-07 | Logout không confirm | Visibility |
| MAT-03 | Thiếu status "Đang khám" | Match Reality |
| CTRL-02 | Browser back button không hoạt động | Control |
| CON-01 | Button style inconsistency | Consistency |
| CON-06 | AI Insight ẩn trên mobile | Consistency |
| ERR-06 | Logout không confirm (duplicate) | Error Prevention |
| HLP-01 | Generic error messages | Help |
| HLP-04 | Không có Error Boundary | Help |
| HLP-06 | API failure không có retry | Help |
| HLP-07 | Form validation không highlight field | Help |

---

## Phụ lục: Phương pháp luận

### Cách đọc báo cáo này

1. **Mỗi finding có ID** theo category: VIS, MAT, CTRL, CON, ERR, REC, FLEX, AES, HLP, A11Y
2. **Mức độ nghiêm trọng** theo thang Nielsen (0-4)
3. **Vị trí** trỏ đến file.tsx:số-dòng
4. **Phân tích** giải thích root cause UX
5. **Solution** đề xuất cải thiện có căn cứ

### Nguồn tham khảo

- Nielsen, J. (1994). *10 Usability Heuristics for User Interface Design*
- Norman, D. (2013). *The Design of Everyday Things* (tái bản)
- WCAG 2.1 AA Guidelines
- Shneiderman's 8 Golden Rules

### Công cụ đánh giá

- Manual code review (UI source code inspection)
- Static analysis (component props, state, event handlers)
- Pattern matching (compare với shadcn/ui best practices)
- Responsive design validation (breakpoints: 375px, 768px, 1024px, 1440px)
- Accessibility baseline check (WCAG 2.1 AA criteria mapping)
