# Kế hoạch Kiểm thử UI/UX - MediCare AI

**Dự án:** Hệ thống Y tế Thông minh (MediCare AI)  
**Vai trò:** Kiểm thử UI/UX  
**Phạm vi:** 4 Dashboard (Patient, Doctor, Consultant, Admin) + Login/Register + AppShell + ChatView  
**Tổng số màn hình chính:** 30+ screens / dialogs

---

## Mục lục

1. [Chiến lược kiểm thử](#1-chiến-lược-kiểm-thử)
2. [Test Case Matrix](#2-test-case-matrix)
3. [Kịch bản kiểm thử theo luồng](#3-kịch-bản-kiểm-thử-theo-luồng)
4. [Checklist kỹ thuật](#4-checklist-kỹ-thuật)

---

## 1. Chiến lược kiểm thử

### 1.1. Kỹ thuật kiểm thử

| Kỹ thuật | Áp dụng cho | Công cụ |
|----------|-------------|---------|
| **Manual Exploratory Testing** | Luồng chính (happy paths) | Test script dạng checklist |
| **Visual Regression** | UI components | Storybook / Chromatic |
| **Accessibility Audit** | WCAG 2.1 AA | axe-core, Lighthouse, VoiceOver |
| **Touch Target Validation** | Mobile-first | DevTools responsive mode (iPhone SE: 375×667) |
| **Contrast Verification** | Color tokens | Contrast Ratio checker |
| **Reduced Motion Testing** | Animation system | prefers-reduced-motion: reduce |
| **Dynamic Type Testing** | Text scaling | iOS Dynamic Type: AX5, Android: Font Size 200% |
| **Device Matrix** | Layout rendering | 375px / 768px / 1024px / 1440px |

### 1.2. Môi trường kiểm thử

- **Trình duyệt:** Chrome (latest), Safari (latest), Firefox (latest)
- **Kích thước màn hình:** iPhone SE (375×667), iPhone 14 (390×844), iPad Mini (768×1024), Desktop (1440×900)
- **OS:** macOS (Light/Dark mode), iOS Simulator, Android
- **Trạng thái mạng:** Online, Offline, Slow 3G, Cold start (server cold boot ~30-50s)

### 1.3. Phân loại mức độ ưu tiên

| Mức | Mô tả | Mục tiêu |
|-----|-------|----------|
| **P0 - Critical** | Crash, không thể hoàn thành luồng chính | 100% pass |
| **P1 - High** | Lỗi UX nghiêm trọng, mất dữ liệu, không truy cập được | 100% pass |
| **P2 - Medium** | Lỗi thẩm mỹ, thiếu feedback, animation giật | >= 95% pass |
| **P3 - Low** | Cải thiện UX nhỏ, micro-copy | >= 90% pass |

---

## 2. Test Case Matrix

### TC-01: Authentication Module

| ID | Test Case | Steps | Expected Result | Priority | Category |
|----|-----------|-------|-----------------|----------|----------|
| AUTH-01 | Login form - Empty validation | Nhấn "Đăng nhập" khi để trống username/password | Toast error: "Vui lòng nhập đầy đủ thông tin" | P0 | Form |
| AUTH-02 | Login form - Loading state | Nhập valid credentials, click Đăng nhập | Button disabled + spinner Loader2 hiển thị | P0 | Interaction |
| AUTH-03 | Login form - Cold start warning | Submit, chờ >4s | Toast info: "Đang đánh thức máy chủ (có thể mất 30-50s...)" | P1 | Feedback |
| AUTH-04 | Login form - Network error | Submit khi offline | Toast error: "Lỗi kết nối đến máy chủ" | P0 | Error |
| AUTH-05 | Login form - Password toggle | Click Eye/EyeOff icon | Input type chuyển password ↔ text | P1 | Interaction |
| AUTH-06 | Login form - Enter key submit | Focus vào password, nhấn Enter | Gọi API login | P1 | Interaction |
| AUTH-07 | Login form - Label association | Kiểm tra htmlFor="user" và htmlFor="pwd" | Click vào label → focus input tương ứng | P2 | A11y |
| AUTH-08 | Login branding - Animation | Load trang | Logo + title + card animate-in: fade-in slide-in-from-top-4 | P2 | Animation |
| AUTH-09 | Login - Navigate to Register | Click "Đăng ký ngay" | Gọi onNavigateRegister callback | P1 | Navigation |
| AUTH-10 | Register - Role selection | Click "Bệnh nhân" / "Người cần tư vấn" | Card highlighted với border màu tương ứng (blue/emerald) | P1 | Visual |
| AUTH-11 | Register - Empty validation | Submit với fields trống | Toast error: "Vui lòng nhập đầy đủ thông tin" | P0 | Form |
| AUTH-12 | Register - Submit loading | Click Đăng ký | Button disabled + spinner + không thể submit lại | P0 | Interaction |
| AUTH-13 | Register - Success flow | Register thành công | Toast success + chuyển về Login | P0 | Feedback |
| AUTH-14 | Login/Register - Keyboard trap | Tab qua các field | Tab order: username → password → submit → register link (hoặc ngược lại) | P2 | A11y |
| AUTH-15 | Login - Focus visible ring | Focus vào input trống | focus-visible:ring-blue-600 xuất hiện (2-4px) | P2 | A11y |

### TC-02: AppShell (Shared Layout)

| ID | Test Case | Steps | Expected Result | Priority | Category |
|----|-----------|-------|-----------------|----------|----------|
| SHELL-01 | Sidebar - Brand header | Load AppShell | HeartPulse icon + "MediCare AI" + roleLabel hiển thị | P1 | Visual |
| SHELL-02 | Sidebar - Navigation items | Click từng nav item | active state gradient: linear-gradient(135deg, #2563EB, #3B82F6) | P1 | Visual |
| SHELL-03 | Sidebar - Mobile toggle | Resize <1024px, click hamburger | Sidebar fixed overlay + backdrop black/40 | P0 | Responsive |
| SHELL-04 | Sidebar - Close on nav | Mobile: click nav item | Sidebar đóng + showMobile = false | P1 | UX |
| SHELL-05 | Header - Title/Subtitle | Load | title font-extrabold, subtitle text-xs text-slate-500 | P2 | Visual |
| SHELL-06 | Search bar - ⌘K shortcut | Nhấn Ctrl+K / ⌘K | Focus vào search input | P1 | UX |
| SHELL-07 | Search bar - Empty state | Click vào search khi chưa được implement | Toast info: "Chức năng tìm kiếm đang phát triển..." | P1 | Feedback |
| SHELL-08 | Notification bell - Badge | Có unread notifications | Bell icon + badge số đỏ (min-w-[18px], bg-rose-500) | P1 | Visual |
| SHELL-09 | Notification dropdown - Open | Click Bell | Popover mở với animation fade-in, w-80 | P1 | Animation |
| SHELL-10 | Notification - Mark all read | Click "Đọc tất cả" | Tất cả notif read=true + toast success | P1 | Interaction |
| SHELL-11 | Notification - Delete all | Click "Xóa tất cả" | Notifs cleared + toast "Hoàn tác" action | P1 | UX |
| SHELL-12 | Notification - Undo delete | Click "Hoàn tác" sau khi xóa | Notifs restored + toast "Đã khôi phục" | P2 | UX |
| SHELL-13 | Notification - View detail dialog | Click vào 1 notification | Dialog mở với title, body, time + metadata icon | P1 | Dialog |
| SHELL-14 | Notification - Emergency visual | Notif kind="emergency" | Icon AlertTriangle + bg-rose-100 + text-rose-600 | P2 | Visual |
| SHELL-15 | Notification - Empty state | Không có notif | Bell icon + text "Không có thông báo mới" | P2 | Empty State |
| SHELL-16 | Notification - Error state | API failure | Bell icon in red circle + "Không thể tải thông báo" + retry button | P1 | Error |
| SHELL-17 | Header - Role badge | Load với role="Bác sĩ" | Badge bg-violet-100 text-violet-700 + border-violet-200 | P2 | Visual |
| SHELL-18 | Header - Avatar profile popover | Click avatar | Popover mở gradient bg + thông tin: name, email, phone, position | P1 | Interaction |
| SHELL-19 | Logout button - Hover state | Hover vào Đăng xuất | Background chuyển rgba(239,68,68,0.15) + border đỏ | P2 | Visual |
| SHELL-20 | Sidebar nav - Hover + translate | Hover vào nav item | hover:translate-x-1 active:scale-95 | P2 | Animation |
| SHELL-21 | Main content - Fade animation | Chuyển tab | animate-fade-in applied | P2 | Animation |
| SHELL-22 | Sidebar scroll - Custom scrollbar | Nav items overflow | custom-scrollbar class applied (overflow-auto) | P3 | Visual |

### TC-03: Patient Dashboard

| ID | Test Case | Steps | Expected Result | Priority | Category |
|----|-----------|-------|-----------------|----------|----------|
| PAT-01 | Dashboard - Orbital layout load | Vào /patient | 5 action buttons (Tìm bác sĩ, Lịch hẹn, Hồ sơ, Theo dõi, Tin nhắn) + Center AI button | P0 | Layout |
| PAT-02 | Dashboard - Ambient background | Load | radial-gradient ellipses + blur effects | P2 | Visual |
| PAT-03 | Dashboard - Center AI Chat button | Click | navigate("/patient/chat") + welcome message | P0 | Navigation |
| PAT-04 | Dashboard - AI breathing animation | Load | Bot icon pulse animation infinite + boxShadow cycle | P2 | Animation |
| PAT-05 | Dashboard - ActionItem hover | Hover vào action button | scale(1.1) + shadow tăng | P1 | Interaction |
| PAT-06 | Dashboard - ActionItem badge | Lịch hẹn có badge số | "upcoming" count hiển thị badge đỏ trên icon | P1 | Visual |
| PAT-07 | Dashboard - Suggestion chips | Load khi có suggestions | Chip gradient từ emerald-600 to teal-600 + Sparkles icon | P1 | UX |
| PAT-08 | Dashboard - Suggestion dismiss | Click "Đóng" | Chip ẩn (dismissedSuggestion = true) | P1 | Interaction |
| PAT-09 | Dashboard - Notification dropdown | Click Bell trong dashboard | Dropdown mở animation + danh sách notification | P1 | Dialog |
| PAT-10 | Dashboard - Notification click navigate | Click 1 notification có "lịch hẹn" | Navigate đến /patient/appointments | P1 | Navigation |
| PAT-11 | Dashboard - Logout button | Click LogOut | Gọi onLogout | P0 | Interaction |
| PAT-12 | Dashboard - Profile avatar | Click avatar | navigate("/patient/profile") | P1 | Navigation |
| PAT-13 | Dashboard - Concentric rings | Load | 3 rings: solid, solid, dashed + spin animation 120s | P3 | Visual |
| PAT-14 | Chat view - Fullscreen slide up | Click Chat AI | Chat view spring-animate từ bottom (y: "100%" → 0) | P0 | Animation |
| PAT-15 | Chat view - Header | Load | ArrowLeft back button + Avatar AI gradient + "Đang hoạt động" pulse | P1 | Visual |
| PAT-16 | Chat view - Welcome message | Lần đầu mở chat | Bot message + suggested actions (4 buttons gradient) | P0 | Interaction |
| PAT-17 | Chat view - Send message | Type + Enter / click Send | User message thêm vào + input clear + typing indicator xuất hiện | P0 | Interaction |
| PAT-18 | Chat view - Typing indicator | AI đang trả lời | 3 dots bounce animation staggered | P1 | Animation |
| PAT-19 | Chat view - Quick prompts | Load chat | 6 prompt buttons + "Đổi" button để rotate set | P1 | UX |
| PAT-20 | Chat view - Prompt set rotation | Click "Đổi" | 6 prompts mới từ set khác | P2 | UX |
| PAT-21 | Chat view - Suggested action click | Click action button | Navigate tương ứng (search, records, appointments...) | P1 | Navigation |
| PAT-22 | Chat view - Mic button toggle | Click Mic | Button animate-pulse + toast "Đang lắng nghe..." / "Đã tắt mic" | P2 | Interaction |
| PAT-23 | Chat view - History button | Click History icon | Mở chat history panel/modal | P2 | Navigation |
| PAT-24 | Chat view - New conversation | Click "Mới" | Reset messages + welcome + toast success | P1 | Interaction |
| PAT-25 | Chat view - Auto scroll | Nhiều messages | scrollRef luôn scroll vào cuối | P1 | Performance |
| PAT-26 | Chat view - Message markdown | Bot reply có **bold** / *italic* / __underline__ | bold: font-bold text-red-600, italic: italic text-emerald-700, underline: underline | P2 | Visual |
| PAT-27 | Chat view - Empty state | messages.length === 0 | Bot icon + "Xin chào..." + quick prompts grid | P2 | Empty State |
| PAT-28 | Chat view - Enter to send | Nhấn Enter (không Shift) | Gọi sendChat | P0 | Interaction |
| PAT-29 | Chat view - Shift+Enter newline | Nhấn Shift+Enter | Xuống dòng trong textarea | P1 | UX |
| PAT-30 | Search - Doctor list | Navigate đến /patient/search | Grid doctors: Avatar + name + specialty badge + rating + clinic + fee | P0 | Layout |
| PAT-31 | Search - Filter by specialty | Chọn specialty từ Select | Filter doctors list | P1 | Interaction |
| PAT-32 | Search - Search by name/keyword | Type in search input | Filter realtime theo name/spec | P1 | Interaction |
| PAT-33 | Search - Empty result | Search không có kết quả | Card: "Không tìm thấy bác sĩ phù hợp" | P1 | Empty State |
| PAT-34 | Search - Doctor card hover | Hover vào card | scale-[1.02] + shadow-lg + border-blue-100 | P2 | Animation |
| PAT-35 | Search - "Có lịch trống hôm nay" badge | Load doctor card | Badge bg-emerald-50 text-emerald-700 | P2 | Visual |
| PAT-36 | Search - Rating display | Load | Star icon fill-amber-500 + rating number | P2 | Visual |
| PAT-37 | Search - Detail dialog | Click "Chi tiết" | Dialog: Avatar + spec badge + rating + clinic + fee + description | P1 | Dialog |
| PAT-38 | Search - Booking flow | Click "Đặt lịch" → chọn time slot → confirm | BookingDialog → 1000ms delay → appointment created + toast success | P0 | Feedback |
| PAT-39 | Search - Time slot selection | Click time slot button | Button bg-sky-500 text-white (selected state) | P1 | Visual |
| PAT-40 | Search - Booking validation | Không chọn time/date | Toast error: "Vui lòng chọn ngày và giờ khám" | P1 | Form |
| PAT-41 | Search - Past date validation | Chọn ngày trong quá khứ | Toast error: "Không thể đặt lịch trong quá khứ" | P1 | Form |
| PAT-42 | Search - Out of hours validation | Chọn giờ <7h hoặc >20h | Toast error: "Phòng khám chỉ nhận lịch từ 07:00 đến 20:00" | P1 | Form |
| PAT-43 | Search - Duplicate slot validation | Đặt trùng giờ | Toast error: "Bạn đã có lịch trùng giờ." | P1 | Form |
| PAT-44 | Appointments - Tab switching | Click "Sắp tới" / "Đã khám" / "Đã hủy" | Tab active với data tương ứng | P1 | UX |
| PAT-45 | Appointments - Empty state per tab | Tab không có data | "Không có lịch hẹn ở trạng thái này." | P2 | Empty State |
| PAT-46 | Appointments - Appointment card | Load card | Doctor name + spec badge + time + clinic + QR tag | P1 | Visual |
| PAT-47 | Appointments - Edit flow | Click "Sửa" → chọn time mới → confirm | EditAppointmentDialog → 1000ms delay → toast success | P1 | Interaction |
| PAT-48 | Appointments - Cancel flow | Click "Hủy" → confirm dialog → confirm | CancelConfirmDialog with spring animation + AlertTriangle → appointment cancelled | P0 | Feedback |
| PAT-49 | Appointments - Cancel confirm animation | Mở cancel dialog | AlertTriangle icon spring animation (scale: 0 → 1, rotate: -180 → 0) | P2 | Animation |
| PAT-50 | Appointments - Success dialog animation | Booking success | CheckCircle spring animation (scale: 0 → 1) | P2 | Animation |
| PAT-51 | Appointments - Detail dialog | Click vào appointment card | Dialog: doctor + time + clinic + "Lưu ý trước khi khám" list | P1 | Dialog |
| PAT-52 | Records - Tabs loading skeleton | Load records | 3 skeleton items (h-4 w-3/5, h-3 w-2/5, h-10 w-full) | P1 | Performance |
| PAT-53 | Records - Error state + retry | API fail | Error icon + "Không thể tải dữ liệu hồ sơ" + "Thử lại" button | P1 | Error |
| PAT-54 | Records - Empty state per tab | Không có dữ liệu | Icon + "Chưa có dữ liệu..." | P2 | Empty State |
| PAT-55 | Records - Detail dialog | Click vào record | Full medical report layout: header hospital + vitals grid + diagnosis + prescription + signature | P1 | Dialog |
| PAT-56 | Records - Vitals grid | Mở medical report | 4-card grid: Huyết áp, Nhịp tim, Nhiệt độ, SpO2 | P1 | Layout |
| PAT-57 | Records - "Tải PDF" button | Click "Tải Phiếu Khám (PDF)" | Toast info: "Tính năng tải PDF đang phát triển" | P2 | Feedback |
| PAT-58 | Records - Cold start warning | Load khi server cold | Toast "Đang khởi động lại máy chủ..." sau 4s | P1 | Feedback |
| PAT-59 | Messages tab - Thread list | Load | Thread list sorted by updatedAt desc | P1 | Layout |
| PAT-60 | Messages tab - New message | Click "Gửi tin nhắn mới" | Dialog: Select doctor + Textarea → Send | P1 | Dialog |
| PAT-61 | Messages tab - Message send loading | Click Gửi | IsSubmitting spinner + 1000ms delay | P1 | Interaction |
| PAT-62 | Messages tab - Validation | Gửi không chọn doctor | Toast error: "Vui lòng chọn bác sĩ và nhập nội dung" | P1 | Form |
| PAT-63 | Profile - Load | Navigate /patient/profile | Avatar + "Thông tin công tác" + "Tùy chọn thông báo" | P1 | Layout |
| PAT-64 | Profile - Toggle notification | Click toggle switch | Toggle animation + toast "Đã cập nhật tùy chọn thông báo" | P2 | Interaction |

### TC-04: Doctor Dashboard

| ID | Test Case | Steps | Expected Result | Priority | Category |
|----|-----------|-------|-----------------|----------|----------|
| DOC-01 | Overview - Urgent alert card | Load | Card gradient rose-to-white + AlertTriangle icon + pulse ping + "CẢNH BÁO KHẨN CẤP" badge | P0 | Visual |
| DOC-02 | Overview - Urgent alert action | Click "Tiếp nhận & Xử lý" | Open consult (nếu patient trong queue) or toast "Đã xử lý cảnh báo" | P1 | Interaction |
| DOC-03 | Overview - Call Next Patient | Queue > 0 | Large card: patient name (text-4xl) + level + age + wait + symptoms + "GỌI VÀO KHÁM NGAY" button | P0 | UX |
| DOC-04 | Overview - Call Next Patient hover | Hover vào card | scale-[1.01] transition | P2 | Animation |
| DOC-05 | Overview - Queue list | Queue > 1 | Grid cards: Level badge + waited time + avatar + patient info + vitals (HA, Nhịp) + "Mở án →" | P1 | Layout |
| DOC-06 | Overview - Empty queue state | No patients | HeartPulse icon + "Bạn đã khám xong tất cả bệnh nhân. Giỏi quá!" | P2 | Empty State |
| DOC-07 | Overview - Right sidebar stats | Load | 4 stat cards: Khẩn cấp, Đang chờ, Sắp tới, Đã khám - mỗi card có số lớn | P1 | Visual |
| DOC-08 | Overview - Schedule widget | Load | "Lịch sắp tới" header + appointments list | P1 | Layout |
| DOC-09 | Overview - Schedule item hover | Hover vào item | background + shadow + blue text transition | P2 | Animation |
| DOC-10 | Overview - Level badge color | Level="Khẩn cấp" | Badge bg-rose-100 text-rose-700 | P1 | Visual |
| DOC-11 | Consultation Room - Load | Click "GỌI VÀO KHÁM NGAY" | ConsultationRoom component renders (full screen consultation) | P0 | Navigation |
| DOC-12 | Consultation Room - Finish | Click finish consult | Patient removed from queue + toast success | P1 | Interaction |
| DOC-13 | Schedule - Today's appointments | Load | Filtered schedule + level filter + global search | P1 | Layout |
| DOC-14 | Patient List - Patient cards | Load | Grid: avatar + name + last visit + "Hồ sơ" + "Hội chẩn" buttons | P1 | Layout |
| DOC-15 | Patient List - Empty state | No patients | "Chưa có dữ liệu bệnh nhân" | P2 | Empty State |
| DOC-16 | Patient List - Hover animation | Hover vào card | hover:-translate-y-1 + hover:shadow-xl | P2 | Animation |
| DOC-17 | Records - View record | Click record | RecordView dialog open | P1 | Dialog |
| DOC-18 | Records - New prescription | Click tạo mới | Dialog: type + patient + content + template | P1 | Dialog |
| DOC-19 | Consult messages - Thread list | Load | Thread items sorted by updatedAt | P1 | Layout |
| DOC-20 | Consult messages - Reply | Type reply + Send | Message appended + Toast | P1 | Interaction |
| DOC-21 | Profile - Edit toggle | Click "Chỉnh sửa" | Fields become editable (Input) + button changes to "Lưu thông tin" | P1 | Interaction |
| DOC-22 | Profile - Cover gradient | Load | h-32 gradient from-violet-500 to-indigo-500 overlay | P2 | Visual |

### TC-05: Consultant Dashboard

| ID | Test Case | Steps | Expected Result | Priority | Category |
|----|-----------|-------|-----------------|----------|----------|
| CNS-01 | Dashboard - Appointment overview | Load | DashboardTab: list of booked appointments | P1 | Layout |
| CNS-02 | AI Chat - Welcome message | Load | Bot message + timestamp | P1 | Interaction |
| CNS-03 | AI Chat - Symptom detection | Gõ "đau đầu" | AIResponse parses symptom → setAiInsight symptoms=["Đau đầu"] | P0 | Logic |
| CNS-04 | AI Chat - Emergency detection | Gõ "đau ngực" | Response + insight severity="Khẩn cấp" + nextAction="Gọi 115" | P0 | Logic |
| CNS-05 | AI Chat - Typing delay | Send message | setTimeout 1500ms + Math.random()*1000ms before AI response | P2 | Animation |
| CNS-06 | AI Chat - Conversation step progression | Liên tục chat | conversationStep tăng dần → responses thay đổi theo step | P1 | Logic |
| CNS-07 | AI Chat - Insight panel | AI phát hiện triệu chứng | AiInsight: symptoms list + specialty + severity + confidence + nextAction | P1 | Feedback |
| CNS-08 | Doctor list - Grid | Load | Danh sách bác sĩ với specialty, rating, availability | P1 | Layout |
| CNS-09 | Appointment booking - Date selection | Chọn ngày | 5-day range: Hôm nay, Mai, T2, T3, T4 + time slots | P1 | UX |
| CNS-10 | Appointment booking - Confirm booking | Chọn doctor + slot + confirm | Toast success + navigate to dashboard | P0 | Feedback |
| CNS-11 | History tab - Previous consultations | Load | List of past consultations + view detail | P1 | Layout |
| CNS-12 | Library tab - Articles | Load | Article list + read article dialog | P1 | Layout |

### TC-06: Admin Dashboard

| ID | Test Case | Steps | Expected Result | Priority | Category |
|----|-----------|-------|-----------------|----------|----------|
| ADM-01 | Overview - Stats grid | Load | 4 stat cards: Doanh thu, Lượt khám, Bệnh nhân mới, Bác sĩ - mỗi card có icon + value + change % | P0 | Layout |
| ADM-02 | Overview - Stat hover | Hover vào stat card | hover:shadow-md + bottom gradient bar opacity 0→1 | P2 | Animation |
| ADM-03 | Overview - Revenue chart | Load | BarChartSimple: 6-month revenue data | P1 | Chart |
| ADM-04 | Overview - Specialty Pie chart | Load | Donut chart: innerRadius=55 outerRadius=80, paddingAngle=4, cornerRadius=4 + legend list | P1 | Chart |
| ADM-05 | Overview - Pie chart hover segments | Hover vào pie slice | hover:opacity-80 transition | P2 | Animation |
| ADM-06 | Overview - Weekly activity AreaChart | Load | AreaChart: visits + appointments with gradient fill | P1 | Chart |
| ADM-07 | Overview - Quick actions | Load | 3 cards: Bệnh nhân chờ, Lịch hôm nay, Thông báo mới | P1 | Layout |
| ADM-08 | Overview - Quick action hover | Hover | group-hover:text-blue-600 + group-hover:scale-110 arrow | P2 | Animation |
| ADM-09 | Reports - Summary stats | Load | 4 stat cards with trend arrows | P1 | Visual |
| ADM-10 | Reports - Type filter toggle | Click "Doanh thu"/"Lượt khám"/"Theo bác sĩ" | Chart data + labels thay đổi tương ứng | P1 | Interaction |
| ADM-11 | Reports - Empty data simulation | Click "Mô phỏng trống" | Empty state: BarChart3 icon + "Không có dữ liệu" | P1 | Empty State |
| ADM-12 | Reports - Line chart | Load | LineChartSimple with REVENUE/VISITS data | P1 | Chart |
| ADM-13 | Reports - Summary table | Load | Table: chỉ số + giá trị + thay đổi (Badge) | P1 | Layout |
| ADM-14 | Reports - Export PDF/Excel | Click export button | Toast info: "Tính năng xuất PDF/Excel đang phát triển" | P2 | Feedback |
| ADM-15 | Patient section - Table | Load | Table: Avatar + name + phone + gender badge + dob + address + edit button | P1 | Layout |
| ADM-16 | Patient section - Search/filter | Type name in search | Filter patient list realtime | P1 | Interaction |
| ADM-17 | Patient section - Gender filter | Select "Nữ" | Only female patients shown | P1 | Interaction |
| ADM-18 | Patient section - Empty search | Search không có kết quả | "Không tìm thấy bệnh nhân" + "Thử thay đổi bộ lọc" | P2 | Empty State |
| ADM-19 | Patient section - Add patient dialog | Click "Thêm bệnh nhân" | Dialog: name + phone + gender + dob + address + validation | P1 | Dialog |
| ADM-20 | Patient section - Edit patient | Click Pencil icon | Dialog with same fields prefilled + "Lưu thay đổi" | P1 | Dialog |
| ADM-21 | Patient section - Phone validation | Nhập phone không hợp lệ | Toast error: "Số điện thoại không hợp lệ" + regex /^\d{9,11}$/ | P1 | Form |
| ADM-22 | Patient section - Name/phone required | Save với empty fields | Toast error: "Vui lòng nhập đầy đủ Họ tên và Số điện thoại" | P1 | Form |
| ADM-23 | Patient section - Row hover | Hover vào row | hover:bg-slate-50/50 + edit button opacity 0→1 | P2 | Animation |
| ADM-24 | Schedule section - Stats | Load | 3 cards: Sắp tới / Hoàn thành / Đã hủy với số count | P1 | Visual |
| ADM-25 | Schedule section - Filter by branch | Select chi nhánh | Filter schedules by clinic | P1 | Interaction |
| ADM-26 | Schedule section - Status badge | Load | Badge với dot màu tương ứng status | P1 | Visual |
| ADM-27 | Schedule section - Empty filter | No matches | Calendar icon + "Không có lịch hẹn" | P2 | Empty State |
| ADM-28 | Schedule section - Create dialog | Click "Tạo lịch mới" | Dialog: doctor + patient + spec + branch + date + time + validation | P1 | Dialog |
| ADM-29 | Schedule section - Edit/Delete actions | Hover vào schedule card | Edit + Delete buttons opacity 0→1 (group-hover) | P2 | Animation |
| ADM-30 | Schedule section - Delete confirm | Click trash icon | Toast: "Xác nhận hủy lịch?" + action "Hủy lịch" + cancel "Giữ lại" | P1 | Feedback |
| ADM-31 | Doctor shifts - Load | Load | DoctorShifts component renders | P1 | Layout |
| ADM-32 | Notifications - Compose form | Load | Form: target select + title + content + datetime + Send button | P1 | Form |
| ADM-33 | Notifications - Send validation | Submit với fields trống | Toast error: "Vui lòng nhập đầy đủ tiêu đề, nội dung và thời gian" | P1 | Form |
| ADM-34 | Notifications - Send loading | Click Gửi | Button disabled + spinner Loader2 + "Đang gửi..." | P1 | Interaction |
| ADM-35 | Notifications - Sent list | Load | Notif items: icon + title + status badge + content preview + time + delete | P1 | Layout |
| ADM-36 | Notifications - Empty sent list | No notifications | Bell icon + "Chưa có thông báo nào" | P2 | Empty State |
| ADM-37 | Notifications - Loading skeleton | Loading true | 3 skeleton placeholder items animate-pulse | P2 | Performance |
| ADM-38 | Notifications - Delete | Click trash | Confirm → fetch lại list → toast | P1 | Interaction |

### TC-07: ChatView (Shared Component)

| ID | Test Case | Steps | Expected Result | Priority | Category |
|----|-----------|-------|-----------------|----------|----------|
| CHAT-01 | Role-based config | Login as different roles | Welcome message + prompts khác nhau theo ROLE_CONFIG | P0 | UX |
| CHAT-02 | Warning banner | Load ChatView | "Kết quả AI chỉ mang tính hỗ trợ tham khảo..." amber banner | P1 | Visual |
| CHAT-03 | Message bubble styling | Bot message | bg-slate-100 text-slate-900 rounded-tl-sm | P1 | Visual |
| CHAT-04 | Message bubble user | User message | gradient from-teal-500 to-emerald-600 text-white | P1 | Visual |
| CHAT-05 | Suggested action buttons | Bot reply có actions | Buttons: bg-white + border-emerald-200 + Sparkles icon + hover | P1 | Interaction |
| CHAT-06 | Typing indicator dots | isTyping = true | 3 dots animate-bounce với staggered delay (0ms, 150ms, 300ms) | P2 | Animation |
| CHAT-07 | AI Insight panel (desktop) | xl screens | Right sidebar: card + Sparkles icon + insight text + "Phân tích AI" | P1 | Layout |
| CHAT-08 | Warning state in insight | action has WARNING_RED | Card border-red-200 bg-red-50 + Badge "Cảnh báo" | P1 | Visual |
| CHAT-09 | Prompt tree navigation (patient) | Click symptom prompt | Active prompts update to sub-prompts (BENHNHAN_PROMPT_TREE) | P1 | UX |
| CHAT-10 | "Làm mới gợi ý" button | Click "Làm mới gợi ý" | Reset activePrompts to default | P2 | UX |
| CHAT-11 | 429 quota handling | API returns 429 | Offline response + toast warning + fallback suggested actions | P1 | Error |

### TC-08: Cross-cutting Concerns

| ID | Test Case | Steps | Expected Result | Priority | Category |
|----|-----------|-------|-----------------|----------|----------|
| CROSS-01 | Color contrast - Body text | Inspect text-slate-900 on bg-white | Contrast ratio >= 4.5:1 | P0 | A11y |
| CROSS-02 | Touch target - All buttons | Measure buttons | Min 44×44pt (all buttons use h-12 = 48px, h-11 = 44px, h-10 = 40px — h-10 phải có padding bù) | P1 | Touch |
| CROSS-03 | Touch target - Icon-only buttons | Measure icon buttons | size-9 = 36px (dưới 44pt → cần hitSlop hoặc padding) | P1 | Touch |
| CROSS-04 | Keyboard navigation - Tab order | Tab through screens | Logical order: sidebar → header → main content | P1 | A11y |
| CROSS-05 | Reduced motion | Set prefers-reduced-motion: reduce | Animations không gây khó chịu; motion animations dùng duration thấp | P2 | A11y |
| CROSS-06 | Dark mode | Toggle dark mode | Code review: không có dark mode support (all colors hardcoded) | P1 | Style |
| CROSS-07 | CSS color tokens | Check color usage | Colors dùng tailwind classes + inline styles (hardcoded hex) → không có semantic tokens | P2 | Style |
| CROSS-08 | Responsive 375px | Resize to 375px | No horizontal scroll, content fits, nav accessible via hamburger | P0 | Responsive |
| CROSS-09 | Responsive 768px | Resize to 768px (iPad) | Layout adjusts (grid-cols-2, sidebar hidden) | P1 | Responsive |
| CROSS-10 | Responsive 1024px | Resize to 1024px | Sidebar visible, 2-column grids | P1 | Responsive |
| CROSS-11 | Console errors | Navigate all screens | Không có React key warnings, hydration errors, undefined access | P1 | Perf |
| CROSS-12 | Loading states | All async operations | Loading spinner/skeleton hiển thị trong khi chờ API | P0 | UX |
| CROSS-13 | Empty states | All lists/tables | Empty state with icon + message + action (nếu có) | P1 | UX |
| CROSS-14 | Error states | All API calls fail | Error message + retry action | P0 | UX |
| CROSS-15 | SVG icons consistency | All icons in UI | Chỉ dùng lucide-react icons, không emoji làm icon | P1 | Visual |
| CROSS-16 | Focus management after modal close | Close dialog | Focus quay về trigger element | P2 | A11y |
| CROSS-17 | Tab bar bottom nav | Check max items | Bottom nav (sidebar) >5 items → vi phạm "bottom-nav-limit max 5" | P1 | Nav |

---

## 3. Kịch bản kiểm thử theo luồng

### Flow 1: Bệnh nhân đặt lịch khám (E2E)

```
LoginScreen → PatientDashboard → Search → Select Doctor → BookingDialog → Confirm → AppointmentSuccessDialog → View Appointments
```

**Checkpoints:**
1. [AUTH-02] Loading state khi login
2. [PAT-01] Dashboard load với 5 action buttons
3. [PAT-30] Search hiển thị danh sách bác sĩ
4. [PAT-37] Doctor detail dialog
5. [PAT-38] Booking flow + time slot + confirm
6. [PAT-50] Success animation
7. [PAT-44] Appointment xuất hiện trong tab "Sắp tới"

### Flow 2: Bác sĩ khám bệnh (E2E)

```
DoctorDashboard → Overview → Urgent Alert → Call Next Patient → ConsultationRoom → Finish Consult
```

**Checkpoints:**
1. [DOC-01] Urgent alert card
2. [DOC-03] "Call Next Patient" button
3. [DOC-11] ConsultationRoom opens
4. [DOC-12] Finish consult removes patient from queue

### Flow 3: Người cần tư vấn tìm bác sĩ (E2E)

```
ConsultantDashboard → AI Chat → Symptom Input → Doctor Suggestion → Booking
```

**Checkpoints:**
1. [CNS-02] Welcome + AI analysis
2. [CNS-03] Symptom detection
3. [CNS-07] Insight panel updates
4. [CNS-09] Appointment booking flow

### Flow 4: Admin quản lý hệ thống (E2E)

```
AdminDashboard → Overview → Reports → Patient Section → Create Patient → Schedule → Send Notification
```

**Checkpoints:**
1. [ADM-01] Stats grid
2. [ADM-09] Reports + chart
3. [ADM-15] Patient table
4. [ADM-19] Add patient dialog
5. [ADM-24] Schedule section
6. [ADM-32] Notification compose + send

---

## 4. Checklist kỹ thuật

### 4.1. Accessibility (P0)

- [ ] **AUTH-07/15**: Label-for association, focus-visible rings
- [ ] **SHELL-16**: Notification error có retry
- [ ] **CROSS-01**: Text contrast >= 4.5:1
- [ ] **CROSS-04**: Keyboard tab order
- [ ] **CROSS-05**: Reduced-motion support
- [ ] **PAT-47**: Cancel confirm dialog có focus trap
- [ ] Tất cả icon buttons có aria-label (check: SHELL-03 hamburger có aria-label="Toggle menu" ✓)
- [ ] Image alt text: Không có <img> tags trong code (SVG icons via lucide)
- [ ] Form errors sử dụng aria-live: Toast dùng sonner (aria-live không rõ ràng)
- [ ] Skip to main content link: Không có

### 4.2. Touch Targets (P1)

| Element | Size | Pass? |
|---------|------|-------|
| Login inputs | h-12 (48px) | ✓ |
| Login button | h-12 (48px) | ✓ |
| Sidebar nav items | py-3 (48px + padding) | ✓ |
| Notification bell | size-9 (36px) → **FAIL** | ✗ |
| Avatar | w-9 h-9 (36px) → **FAIL** | ✗ |
| Logout button | py-2.5 (10px + 20px + 10px = 40px) → **FAIL** | ✗ |
| Chat send button | h-11 w-11 (44px) | ✓ |
| ActionItem buttons | w-[100px] h-[100px] | ✓ |
| Dialog close buttons | variable → cần kiểm tra | ? |
| Tabs triggers | px-4 py-1.5 (cần tính padding) | ? |

### 4.3. Animation Review

| Animation | Duration | CSS/JS | Issues |
|-----------|----------|--------|--------|
| Login fade-in | 700ms | CSS animate-in | Acceptable (entry animation) |
| Orbital hub rings | 120s spin | CSS animate-[spin_120s_linear_infinite] | Slow enough, decorative |
| Center AI button pulse | 3s loop | motion animate | Continuous animation → might violate reduced-motion |
| Chat slide up | spring damping=25, stiffness=200 | motion spring | Smooth spring physics ✓ |
| Message fade-in | default motion | 0.3s opacity/y | Appropriate micro-interaction |
| Action buttons floating | 4s loop translateY | motion | Perpetual animation → check reduced-motion |
| Typing dots | 0.6s loop bounce | motion | Micro-interaction, acceptable |
| Dialog spring animations | spring damping=15, stiffness=200 | motion | Good use of spring physics |
| Bell notification dropdown | default motion | scale+y | Smooth |
| Suggestion chip | delay=0.4, y: 20→0 | motion | Appropriate entrance |

### 4.4. Responsive Breakpoints

| Screen | Sidebar | Layout | Issues |
|--------|---------|--------|--------|
| 375px (iPhone SE) | Hidden (hamburger) | Stacked, full-width | Check no horizontal scroll |
| 768px (iPad) | Hidden (hamburger) | 2-column grids | Content readable |
| 1024px + | Fixed sidebar w-64 | Multi-column | Standard desktop |

### 4.5. Color & Theme (Rủi ro)

- **Không có dark mode**: Tất cả màu hardcoded (bg-white, text-slate-900, bg-slate-50)
- **Không có semantic color tokens**: Dùng trực tiếp tailwind classes
- **Dynamic colors**: Sử dụng `bg-${color}-50` template literals (có thể fail vì Tailwind JIT purge)
- **Không có CSS variables**: Colors được dùng dạng inline + tailwind classes
- **Tailwind JIT risk**: `text-${stat.color}-600`, `bg-${stat.color}-50` trong AdminDashboard/overview.tsx → có thể bị purge nếu không dùng `safelist`

### 4.6. Known Risks / Anti-Patterns

| Risk | Location | Impact |
|------|----------|--------|
| Dynamic Tailwind classes (`text-${color}-600`) | AdminOverview, Reports | Classes bị purge mất màu |
| Icon-only buttons without aria-labels | Nhiều nơi | A11y fail |
| No dark mode | Toàn bộ | User preference không tôn trọng |
| Touch target <44px | Avatar/Notification icons (36px) | Accessibility fail |
| No reduced-motion check | PatientDashboard motion animations | Một số user có thể bị khó chịu |
| No skip-link | AppShell | Screen reader users không skip được nav |
| Inline styles (not CSS variables) | AppShell, nhiều component | Không theme-able |
| Sử dụng `bg-${stat.color}-50` dynamic | AdminDashboard | JIT purge risk |
| No form autocomplete attributes | LoginScreen | UX cho password manager kém |
| Toast sonner accessibility | Toàn bộ | aria-live chưa được kiểm tra |
| Avatar initials fallback | Nhiều nơi | Hardcoded "MK", "VA", "QT" thay vì dynamic |

---

## Tổng hợp

| Hạng mục | Số lượng TC | P0 | P1 | P2 | P3 |
|----------|------------|----|----|----|----|
| Authentication (AUTH) | 15 | 3 | 8 | 4 | 0 |
| AppShell (SHELL) | 22 | 1 | 9 | 11 | 1 |
| Patient Dashboard (PAT) | 64 | 5 | 35 | 22 | 2 |
| Doctor Dashboard (DOC) | 22 | 2 | 11 | 9 | 0 |
| Consultant Dashboard (CNS) | 12 | 2 | 8 | 2 | 0 |
| Admin Dashboard (ADM) | 38 | 4 | 21 | 12 | 1 |
| ChatView (CHAT) | 11 | 1 | 7 | 3 | 0 |
| Cross-cutting (CROSS) | 17 | 3 | 9 | 4 | 1 |
| **TOTAL** | **201** | **21** | **108** | **67** | **5** |

### Critical Path (P0 - must pass)

1. **Login**: Tính năng đăng nhập/đăng ký hoạt động (AUTH-01→06)
2. **Patient Dashboard**: Orbital layout render + Chat AI + Booking flow (PAT-01→PAT-50)
3. **Doctor Dashboard**: Urgent alert + Call Next Patient + Consultation (DOC-01→DOC-12)
4. **Admin Overview**: Stats + Charts render (ADM-01→ADM-08)
5. **Responsive**: Không overflow, accessible trên mobile (CROSS-08)
6. **Empty/Error states**: Tất cả async operations có loading + error handling

### Priority Fixes

1. **Dark mode support**: Thiếu hoàn toàn → architectural decision required
2. **Touch targets**: Icon-only buttons (size-9) dưới 44pt → cần hitSlop hoặc tăng size
3. **Tailwind JIT purge**: Dynamic class names có thể bị mất trong production build
4. **Avatar initials**: Hardcoded thay vì dynamic → fallback không chính xác với user thật
5. **Accessibility**: Thiếu skip-link, một số icon buttons thiếu aria-label
