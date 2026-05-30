# Áp Dụng 10 Nguyên Tắc Usability vào ExpertDashboard

## Tóm Tắt Các Thay Đổi Cần Làm

### 1. **Visibility — Khả Năng Thấy**
- ✅ Thêm emoji vào các label trong nav để dễ nhớ (📊 Tổng quan, 📈 Năng lực, 🎥 Hội chẩn, 🏥 Ca bệnh, 📋 SOP, 🤖 AI, 👥 Đội ngũ)
- ✅ Thêm border-left color-coded cho mỗi Card (blue, amber, green, purple)
- ✅ Indicator status rõ ràng: "● LIVE", "✅ Approved", "⏳ Pending"
- ✅ Emergency alert banner với animation pulse (hiển thị ngay trên overview)

### 2. **Feedback — Phản Hồi Rõ Ràng**
- ✅ Tất cả toast thêm icon: "✓", "⚠️", "ℹ️", "🔴"
- ✅ Button states rõ ràng: hover:shadow-md, hover:bg-slate-50 transitions
- ✅ Loading states: "Đang lưu...", "Đang gửi..."
- ✅ Success messages: "✓ Đã [hành động]"

### 3. **Logical Constraint — Ràng Buộc Logic**
- ✅ SOP approval buttons chỉ appear khi status = "pending"
- ✅ "Approve" button có màu xanh (success), "Reject" button outline
- ✅ Confirmation dialogs cho hành động destructive (delete, approve, reject)
- ✅ Required fields marked với "*"

### 4. **Physical Constraint — Ràng Buộc Vật Lý**
- ✅ Button sizes consistent: min-h-10 (44px touch target)
- ✅ Spacing: 8-16px between items, 24-32px between sections
- ✅ Card borders: border + border-l-4 color-coded + hover:shadow-md
- ✅ Tabs instead of buttons for section switching

### 5. **Cultural Constraint — Ràng Buộc Văn Hóa**
- ✅ All Vietnamese labels (không có tiếng Anh mix)
- ✅ Titles: "GS. TS.", "BS." used correctly
- ✅ Date format: "08/05 14:00" or "13 Tháng 5, 2026"
- ✅ Medical terminology: Chẩn đoán, Hồi sức, etc.

### 6. **Mapping — Sự Tương Ứng**
- ✅ Primary action (Save/Approve) on right, secondary (Cancel/Reject) on left
- ✅ Visual hierarchy: size, color, bold matches importance
- ✅ Related items grouped in Cards
- ✅ KPI metrics in grid: 4 columns (overview)

### 7. **Internal Consistency — Nhất Quán Nội Bộ**
- ✅ Same action → same result everywhere
- ✅ "Lưu", not "Save", "Update", "Submit" mixed
- ✅ "Bệnh nhân", not "Client" or "Patient"
- ✅ All Badges: same style, color-coded by state
- ✅ All Dialogs: DialogHeader + content + DialogFooter pattern

### 8. **External Consistency — Nhất Quán Ngoài**
- ✅ Use shadcn/ui components as designed
- ✅ Dialog for confirmations, not custom modal
- ✅ Toast for notifications (from sonner)
- ✅ Tabs for section switching
- ✅ Follow medical app conventions

### 9. **Affordance — Tính Gợi Ý**
- ✅ Buttons: solid color, hover effects, cursor pointer
- ✅ Links: blue, underline
- ✅ Icons: obvious function (✓, ✗, 🗑️, ✏️, 🔍, ⋯)
- ✅ Disabled: opacity-50, cursor-not-allowed
- ✅ Selected: border-blue-400, bg-blue-50

### 10. **Mental Model — Mô Hình Tinh Thần**
- ✅ Navigation order matches medical workflow: Overview → Performance → Consult → Cases → SOP → Chatbot → Team
- ✅ Each tab purpose clear
- ✅ Information grouped logically (patient info together, actions together)
- ✅ User understands what to do next (help text, hints)

---

## Cấu Trúc Navigation Labels Cải Tiến

```javascript
nav={[
  { key: "overview", label: "📊 Tổng quan", icon: LayoutDashboard },          // 1. See overview
  { key: "performance", label: "📈 Đánh giá", icon: TrendingUp },              // 2. Manage team performance
  { key: "consult", label: "🎥 Hội chẩn", icon: Video },                       // 3. Conduct consultations
  { key: "cases", label: "🏥 Ca bệnh", icon: FileSearch },                     // 4. Manage patient cases
  { key: "sop", label: "📋 SOP", icon: BookOpen },                             // 5. Review protocols
  { key: "chatbot", label: "🤖 AI", icon: Settings },                          // 6. Manage AI knowledge
  { key: "team", label: "👥 Đội ngũ", icon: Users2 },                         // 7. Manage staff
]}
```

---

## Card Styling Cải Tiến

**Mỗi Card nên có:**
```jsx
<Card className="p-5 border-l-4 border-[color]-400 hover:shadow-md transition">
  <h3 className="text-lg font-semibold flex items-center gap-2">
    [emoji] Tiêu đề
    <Badge variant="outline" className="ml-auto">[số lượng]</Badge>
  </h3>
  {/* content */}
</Card>
```

**Color Scheme:**
- Blue (📊/🎥/🤖): border-blue-400
- Amber (📈): border-amber-400
- Green (✅): border-green-400
- Purple (👥): border-purple-400

---

## Dialogs Cải Tiến

**Confirmation Dialog Pattern:**
```jsx
{confirmDialog && (
  <Dialog>
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
    </DialogHeader>
    <p>{message}</p>
    <DialogFooter>
      <Button variant="outline" onClick={cancel}>Hủy</Button>
      <Button className="bg-blue-600" onClick={confirm}>Xác nhận</Button>
    </DialogFooter>
  </Dialog>
)}
```

---

## Button Styling Cải Tiến

```jsx
// Primary (Save/Approve)
<Button className="bg-blue-600 hover:bg-blue-700">✓ Lưu</Button>

// Secondary (Cancel)
<Button variant="outline">Hủy</Button>

// Destructive (Delete/Reject)
<Button variant="destructive">✗ Xóa</Button>

// Disabled
<Button disabled className="cursor-not-allowed opacity-50">Action</Button>
```

---

## Toast Messages Cải Tiến

```javascript
// Success
toast.success("✓ Đã lưu ca bệnh");

// Error
toast.error("⚠ Lỗi: Vui lòng thử lại");

// Info
toast.info("ℹ Chuyển đến phòng hội chẩn");

// Warning  
toast.info("🔔 Có 3 ca bệnh chờ phê duyệt");
```

---

## Badge Styling Cải Tiến

```jsx
// Status badges
<Badge className="bg-green-100 text-green-700 border-0">✓ Approved</Badge>
<Badge className="bg-yellow-100 text-yellow-700 border-0">⏳ Pending</Badge>
<Badge className="bg-red-100 text-red-700 border-0">✗ Rejected</Badge>

// Priority badges
<Badge variant="destructive">🔴 Rất cao</Badge>
<Badge variant="secondary">🟡 Cao</Badge>
<Badge variant="outline">🟢 Bình thường</Badge>
```

---

## Help/Hint Text

Thêm vào overview hoặc sections mới:

```jsx
<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
  <Help className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
  <span className="text-sm text-blue-900">
    💡 <strong>Mẹo:</strong> Nhấp vào item để xem chi tiết.
  </span>
</div>
```

---

## Checklist Áp Dụng

- [ ] Cập nhật nav labels với emoji
- [ ] Thêm border-left color-coded cho tất cả Cards
- [ ] Thêm horiz-scroll badges show count (VD: "7 sự kiện")
- [ ] Thêm confirmation dialogs cho approve/reject actions
- [ ] Cập nhật tất cả toast messages với icon
- [ ] Thêm hover:shadow-md + transitions cho Cards
- [ ] Thêm help text các sections mới
- [ ] Đảm bảo consistent terminology (Bệnh nhân, Chẩn đoán, Hồi sức)
- [ ] Kiểm tra button sizes (min 44x44px)
- [ ] Test accessibility: tab navigation, screen reader labels

