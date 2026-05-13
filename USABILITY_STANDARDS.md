# Tiêu Chuẩn Usability & UX Design - Nguyên Tắc Norman

## 1. Visibility — Khả Năng Thấy (Hiển Thị)

### ✅ Conformance (Tuân Thủ)
- **System Status Visible**: Hiển thị trạng thái hệ thống rõ ràng (online/offline, loading, ready)
  - Indicators: Loading spinners, progress bars, status badges
  - Location: Top bar, critical sections
  - Color: Green ✅ (success), Red 🔴 (error), Yellow ⚠️ (warning), Blue ℹ️ (info)
  
- **Critical Information Prioritized**: Thông tin quan trọng ở trên cùng, dễ nhìn
  - Emergency alerts: Red border-left, bold heading, action button
  - Patient data: Large font, high contrast
  - Status: Color-coded badges with icons
  
- **User Feedback Instant**: Mọi hành động nhận phản hồi ngay lập tức
  - Toast notifications: Sonner toast (success, error, info)
  - Button states: Loading, disabled, active, hover
  - Visual state changes: Opacity, shadow, color

### ❌ Violation (Vi Phạm)
- ❌ Hidden information or disabled features without explanation
- ❌ Small icons without labels
- ❌ Status only shown in logs (not live)
- ❌ Same color for different states
- ❌ Silent failures (no error messages)

### Implementation Details
```tsx
// ✅ GOOD: Clear status visibility
<div className="p-4 bg-red-50 border-l-4 border-red-500">
  <h3 className="font-semibold text-red-900">🚨 Critical Alert</h3>
  <p className="text-sm text-red-800">Patient condition requires immediate attention</p>
  <Button className="mt-2 bg-red-600">Take Action</Button>
</div>

// ✅ GOOD: Loading state visible
{loading ? (
  <div className="flex items-center gap-2">
    <Loader className="w-4 h-4 animate-spin" />
    <span className="text-sm text-muted-foreground">Loading patient data...</span>
  </div>
) : (
  <PatientCard data={patient} />
)}

// ❌ BAD: Hidden status
<Button disabled>Action</Button> {/* No explanation why disabled */}

// ❌ BAD: Silent failure
onClick={() => saveData()} // No feedback if failed
```

---

## 2. Feedback — Phản Hồi Rõ Ràng

### ✅ Conformance
- **Immediate Response**: Mỗi hành động nhận phản hồi trong < 200ms
  - Visual: Color change, hover effect, scale animation
  - Audio: Toast notification sound
  - Text: Success/error message in UI
  
- **Clear Success/Error Messages**: Tin nhắn rõ ràng, hữu ích
  - Success: "✓ Đã lưu ca bệnh" (specific action, past tense)
  - Error: "⚠ Chứng chỉ hết hạn, vui lòng cập nhật" (specific, actionable)
  - Info: "ℹ Tìm thấy 12 ca tương tự" (informational)
  
- **Multiple Feedback Channels**: Phản hồi qua nhiều cách
  - Visual: Color, icon, animation
  - Text: Message on screen or toast
  - State: Button disabled/enabled, item selected/unselected

### ❌ Violation
- ❌ No response to user action
- ❌ Generic error: "Error" or "Failed"
- ❌ Error message that doesn't help: "ERROR CODE 500"
- ❌ Feedback disappears immediately (too fast to read)
- ❌ Same feedback for different actions

### Implementation
```tsx
// ✅ GOOD: Complete feedback
const handleSave = async () => {
  setSaving(true);
  try {
    await saveData(data);
    toast.success("✓ Đã lưu ca bệnh thành công");
    setData(null); // Visual feedback: close dialog
  } catch (error) {
    toast.error(`⚠ Lỗi: ${error.message}`);
  } finally {
    setSaving(false);
  }
};

// ✅ GOOD: Button state feedback
<Button 
  disabled={saving} 
  onClick={handleSave}
  className={saving ? "opacity-50 cursor-wait" : ""}
>
  {saving ? "Đang lưu..." : "Lưu dữ liệu"}
</Button>

// ❌ BAD: No feedback
onClick={() => {
  saveData(); // Nothing happens visually
}}

// ❌ BAD: Unhelpful error
toast.error("Error occurred")
```

---

## 3. Logical Constraint — Ràng Buộc Logic

### ✅ Conformance
- **Workflow Order**: Các bước tuân theo logic tự nhiên
  - Nhập dữ liệu → Xác nhận → Lưu → Hiển thị kết quả
  - Thấy bệnh nhân → Chẩn đoán → Kê đơn → Theo dõi
  
- **Conditional Availability**: Feature chỉ available khi hợp lý
  - "Approve SOP" button: Chỉ visible khi status = "pending"
  - "Consult" button: Chỉ enabled khi có room available
  - "Edit" button: Chỉ visible khi user là owner
  
- **Prevention of Errors**: Ngăn chặn hành động sai
  - Required fields: Mark with * and validate before submit
  - Confirm dangerous actions: Delete, discharge, submit assessment
  - Disable incompatible options

### ❌ Violation
- ❌ Approve button available for already-approved items
- ❌ Delete without confirmation
- ❌ Save disabled but no explanation why
- ❌ Can submit incomplete form
- ❌ Out-of-order steps possible

### Implementation
```tsx
// ✅ GOOD: Logical workflow
{sopDetail.status === "pending" ? (
  <div className="space-x-2">
    <Button variant="outline">Reject</Button>
    <Button className="bg-green-600">Approve</Button>
  </div>
) : (
  <Badge>{sopDetail.status}</Badge> // Just show status if already processed
)}

// ✅ GOOD: Required field indication
<Input 
  required 
  placeholder="Patient ID *"
  aria-label="Patient ID (required)"
/>

// ✅ GOOD: Confirmation for destructive actions
const handleDelete = () => {
  Dialog.confirm({
    title: "Delete case?",
    description: "This cannot be undone. Delete case BN-2031?",
    onConfirm: async () => {
      await deleteCase(id);
      toast.success("✓ Đã xóa ca bệnh");
    }
  });
};

// ❌ BAD: No order control
<Button onClick={saveCaseFile}>Save</Button>
<Button onClick={submitForReview}>Submit</Button>
// User can submit before saving!

// ❌ BAD: No confirmation
<Button variant="destructive" onClick={() => deletePatient(id)}>Delete</Button>
```

---

## 4. Physical Constraint — Ràng Buộc Vật Lý

### ✅ Conformance
- **Size/Space Appropriately**: Kích thước phù hợp với hành động
  - Buttons: Minimum 44x44px for touch targets (mobile)
  - Icons: 16-24px for common actions, 32-48px for primary actions
  - Spacing: 8-16px between related elements, 24-32px between sections
  
- **Navigation Limited to Available Options**: Chỉ hiển thị valid paths
  - Sidebar: Chỉ show roles/features user có access
  - Tabs: Disable tabs user không thể access
  - Breadcrumbs: Chỉ show valid navigation history
  
- **Visual Boundaries**: Rõ ràng các vùng/section khác nhau
  - Cards: Border + shadow for clear separation
  - Groups: Whitespace or divider between groups
  - Sections: Background color or distinct styling

### ❌ Violation
- ❌ Buttons too small (< 32px)
- ❌ No clear separation between sections
- ❌ Can click disabled items (opacity change isn't enough)
- ❌ Navigation options user shouldn't access visible
- ❌ Overloaded with options (> 7 items)

### Implementation
```tsx
// ✅ GOOD: Proper spacing and touch targets
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {staff.map(s => (
    <Card 
      key={s.id}
      className="p-4 cursor-pointer hover:shadow-md transition"
      onClick={() => selectStaff(s)}
    >
      {/* Minimum 44px touch target */}
      <div className="min-h-12 flex items-center gap-3">
        <Avatar />
        <div>{s.name}</div>
      </div>
    </Card>
  ))}
</div>

// ✅ GOOD: Clear disabled state
<Button 
  disabled={!hasPermission}
  className={!hasPermission ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
>
  Approve
</Button>

// ✅ GOOD: Visual boundaries
<Card className="p-5 border rounded-lg">
  <h3>Section Title</h3>
  <Separator className="my-3" />
  <p>Content here</p>
</Card>

// ❌ BAD: No clear boundaries
<div>
  <p>Title</p>
  <p>Content</p>
</div>

// ❌ BAD: Button too small
<Button size="sm">Action</Button> // Only 32x32px
```

---

## 5. Cultural Constraint — Ràng Buộc Văn Hóa

### ✅ Conformance
- **Language & Terminology**: Sử dụng ngôn ngữ phù hợp đối tượng
  - Vietnamese: All labels, buttons, messages in Vietnamese
  - Medical terms: Use proper medical terminology (not simplified slang)
  - Titles: Dr., Prof., BS. (Bác sĩ) used correctly
  - Dates: DD/MM/YYYY or "13 Tháng 5, 2026" (Vietnamese date format)
  
- **Culturally Appropriate Icons/Colors**: 
  - Red: Danger/critical (universal in medicine)
  - Green: Success/approved
  - Yellow: Warning
  - Blue: Info/secondary
  - Icons: Simple, recognizable, medical context
  
- **Context-Appropriate Content**: 
  - Hospital/medical context: Use medical language and concepts
  - Names: Vietnamese names, titles, roles
  - Time: 24-hour format (14:00, not 2:00 PM)

### ❌ Violation
- ❌ Mixed languages (English/Vietnamese)
- ❌ Western-only date format (MM/DD/YYYY)
- ❌ Inappropriate emoji or slang terms
- ❌ Wrong use of titles or formality
- ❌ Symbols that mean something else in Vietnamese culture

### Implementation
```tsx
// ✅ GOOD: Vietnamese language and medical terminology
<div className="space-y-3">
  <div>
    <label className="text-sm font-medium">Chẩn đoán chính</label>
    <Input placeholder="VD: Suy tim độ III" />
  </div>
  <div className="text-sm text-muted-foreground">
    Cập nhật: 13 Tháng 5, 2026 • 14:32
  </div>
  <Badge>GS. TS. Hoàng Minh Tuấn</Badge>
</div>

// ✅ GOOD: Appropriate icons and colors
<div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
  <AlertTriangle className="w-5 h-5 text-red-600" />
  <h3 className="font-semibold text-red-900">Cảnh báo: Chỉ số nguy hiểm</h3>
</div>

// ❌ BAD: English only
<Button>Save Case File</Button>
<p>Updated: 05/13/2026</p>

// ❌ BAD: Inappropriate formality
<Button>yo, check this out</Button>
<span>Your patient</span> // Should use "Bệnh nhân của bạn"
```

---

## 6. Mapping — Sự Tương Ứng

### ✅ Conformance
- **Controls Map to Functions**: Nút bấm ở vị trí phù hợp
  - Primary action (Save): Right side of form
  - Secondary action (Cancel): Left of primary
  - Destructive action (Delete): Rightmost, colored red
  
- **Visual Hierarchy Reflects Importance**: Kích thước/color phản ánh mức độ quan trọng
  - Primary button: Solid blue, larger
  - Secondary button: Outline, smaller
  - Danger button: Solid red
  - Tertiary/link: Text only, smallest
  
- **Spatial Grouping**: Liên quan đến nhau → gần nhau
  - Patient info: Together in one section
  - Actions: Together at bottom
  - Related stats: Together in grid/card

### ❌ Violation
- ❌ Important action in small button on left
- ❌ Delete button looks like normal button
- ❌ Primary action (save) far from related fields
- ❌ Unrelated items grouped together
- ❌ Visual hierarchy doesn't match importance

### Implementation
```tsx
// ✅ GOOD: Clear mapping and hierarchy
<DialogFooter className="flex justify-between items-center">
  <Button 
    variant="outline" 
    onClick={handleClose}
  >
    Cancel
  </Button>
  <div className="flex gap-2">
    <Button 
      variant="outline" 
      className="text-red-600 border-red-200"
      onClick={handleDelete}
    >
      Delete
    </Button>
    <Button 
      className="bg-blue-600 hover:bg-blue-700"
      onClick={handleSave}
    >
      Save
    </Button>
  </div>
</DialogFooter>

// ✅ GOOD: Related items grouped
<Card className="p-5">
  <div className="space-y-3">
    <Input placeholder="Patient ID" />
    <Input placeholder="Patient Name" />
    <Textarea placeholder="History" rows={3} />
  </div>
  <Button className="mt-4 w-full">Save Patient Info</Button>
</Card>

// ❌ BAD: Poor mapping
<Button size="sm">Save</Button>
<Button className="bg-blue-600 w-32 h-12">Delete</Button>
// Delete looks more prominent than Save!

// ❌ BAD: Unrelated items together
<Input placeholder="Doctor name" />
<Input placeholder="Patient name" />
<Input placeholder="Hospital address" />
```

---

## 7. Internal Consistency — Nhất Quán Nội Bộ

### ✅ Conformance
- **Same Pattern, Same Result**: Các hành động tương tự → kết quả tương tự
  - Save button: Always saves and shows success message
  - Delete button: Always asks for confirmation, then deletes
  - Search: Always filters list immediately
  
- **Consistent Terminology**: 
  - "Save" not mixed with "Update" or "Submit"
  - "Patient" not mixed with "Client"
  - "Approved" not mixed with "Verified"
  
- **Consistent Visual Style**:
  - Buttons: All same height, same text style
  - Cards: All same border, spacing, shadow
  - Colors: Same color for same meaning everywhere
  - Icons: Same style/weight throughout app

### ❌ Violation
- ❌ "Save" button works differently on different pages
- ❌ Some pages use "Patient", others use "Client"
- ❌ Some dialogs have borders, others don't
- ❌ Button text varies: "Submit", "Save", "Apply" for same action
- ❌ Different colors for same state on different pages

### Implementation
```tsx
// ✅ GOOD: Consistent patterns
// Everywhere in app:
const handleSave = async () => {
  setSaving(true);
  try {
    await save(data);
    toast.success("✓ Đã lưu thành công");
    onClose?.();
  } catch (error) {
    toast.error(`⚠ ${error.message}`);
  } finally {
    setSaving(false);
  }
};

// Consistent button styling
<Button className="bg-blue-600 hover:bg-blue-700">Lưu</Button>
<Button variant="outline">Hủy</Button>
<Button variant="destructive">Xóa</Button>

// Consistent terminology throughout
function CaseFileDialog({ caseFile, onClose }) {
  // Always use "case file", never "case" or "medical record"
  return (
    <Dialog>
      <DialogTitle>Case File: {caseFile.id}</DialogTitle>
    </Dialog>
  );
}

// ❌ BAD: Inconsistent
// Page 1: Save button
// Page 2: Submit button
// Page 3: Apply button
// (All do the same thing but user confused)

// ❌ BAD: Inconsistent terminology
<p>Patient name</p>
<p>Client email</p>
<p>Doctor information</p>
```

---

## 8. External Consistency — Nhất Quán Ngoài

### ✅ Conformance
- **Follow Platform Conventions**: Tuân theo quy ước của hệ điều hành/web
  - Web: Back button works as expected, URL changes with navigation
  - Mobile: Swipe left/right for navigation (if supported)
  - Medical apps: Follow HL7 or industry standards
  
- **Follow shadcn/ui Conventions**:
  - Use shadcn/ui components as designed
  - Dialog for confirmation, not custom modal
  - Toast for notifications, not custom alerts
  - Tabs for section switching, not buttons
  
- **Similar to Other Medical Apps**:
  - Medical data visible and clear
  - Critical info highlighted in red/yellow
  - Patient-centric workflow
  - Undo/redo for data operations

### ❌ Violation
- ❌ Custom dialog that doesn't work like system dialogs
- ❌ Back button doesn't work
- ❌ Keyboard shortcuts that conflict with browser
- ❌ Scroll behavior different from standard
- ❌ Doesn't follow shadcn/ui component patterns

### Implementation
```tsx
// ✅ GOOD: Using shadcn/ui as designed
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

// Use Dialog for confirmations
<Dialog open={showConfirm} onOpenChange={setShowConfirm}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Delete</DialogTitle>
    </DialogHeader>
    <p>Delete this case file?</p>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowConfirm(false)}>No</Button>
      <Button className="bg-red-600" onClick={handleDelete}>Yes, Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Use Tabs for section switching
<Tabs defaultValue="overview" value={active} onValueChange={setActive}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="cases">Cases</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">{/* content */}</TabsContent>
  <TabsContent value="cases">{/* content */}</TabsContent>
</Tabs>

// Use Sonner toast for notifications
toast.success("✓ Đã lưu thành công");
toast.error("⚠ Lỗi hệ thống");
toast.info("ℹ Cập nhật mới");

// ❌ BAD: Custom implementations
<div className="custom-dialog">
  {/* Custom dialog that doesn't behave like standard dialog */}
</div>
<div onClick={handleClick}>Custom Tab</div>
alert("Notification") // Browser alert, not app toast
```

---

## 9. Affordance — Tính Gợi Ý

### ✅ Conformance
- **Visual Cues Suggest Function**: Hình dáng/màu sắc gợi ý cách dùng
  - Buttons: Appear clickable (color, shadow, pointer on hover)
  - Links: Underlined and colored blue (web convention)
  - Icons: Clear and recognizable
  - Disabled items: Grayed out with cursor-not-allowed
  
- **Consistent Icons**: 
  - Save → Floppy disk or ✓
  - Delete → Trash icon
  - Edit → Pencil icon
  - More options → Three dots (⋯)
  
- **State Visibility**:
  - Selected item: Highlighted or has checkmark
  - Hovered item: Different background or shadow
  - Disabled: Opacity 50%, cursor-not-allowed
  - Loading: Spinner icon

### ❌ Violation
- ❌ Text that looks like text but is actually button
- ❌ Disabled buttons still look clickable
- ❌ Icons that don't match their function
- ❌ No visual indication of interactivity
- ❌ Inconsistent icon usage

### Implementation
```tsx
// ✅ GOOD: Clear affordance
<Button 
  className="bg-blue-600 hover:bg-blue-700 cursor-pointer transition"
  onClick={handleAction}
>
  <Save className="w-4 h-4 mr-2" />
  Save Case
</Button>

// ✅ GOOD: Disabled state clear
<Button 
  disabled={!hasPermission}
  className="opacity-50 cursor-not-allowed"
>
  Approve
</Button>

// ✅ GOOD: Selected state obvious
<Card 
  className={`p-4 cursor-pointer transition ${
    selected ? 'border-2 border-blue-500 bg-blue-50' : 'border'
  }`}
  onClick={() => setSelected(!selected)}
>
  {selected && <CheckCircle className="w-4 h-4" />}
  {item.name}
</Card>

// ✅ GOOD: Hover state
<Card className="p-4 cursor-pointer hover:shadow-md hover:bg-slate-50 transition">
  Click me to see details
</Card>

// ❌ BAD: No affordance
<span onClick={handleClick}>Click here</span>
<Button disabled>Approve</Button> // Still looks clickable

// ❌ BAD: Wrong icons
<Trash className="..." /> {/* Used for Edit, not Delete */}
<Edit className="..." /> {/* Used for Save, not Edit */}
```

---

## 10. Mental Model — Mô Hình Tinh Thần

### ✅ Conformance
- **App Works As User Expects**: Ứng dụng hoạt động như user tưởng tượng
  - Medical workflow: Admit → Diagnose → Treat → Discharge
  - Dashboard: Overview → Details → Actions
  - Consultation: List rooms → Join room → Video → Chat
  
- **Information Architecture Matches User's Mental Model**:
  - Navigation: By role (Doctor, Expert, Admin, Consultant, Patient)
  - Sections: By workflow phase (Overview, Cases, Performance, SOP)
  - Filtering: By common criteria (Doctor, Priority, Date)
  
- **Terminology Matches User's Language**:
  - Use "Case File" not "Medical Record"
  - Use "Consultation" not "Meeting"
  - Use "Approval" not "Verification"
  - Use "Staff" not "Team Members"

### ❌ Violation
- ❌ Workflow that doesn't match medical reality
- ❌ Navigation structure that doesn't make sense medically
- ❌ Terminology user doesn't recognize
- ❌ Features in unexpected locations
- ❌ Multiple ways to do same task causing confusion

### Implementation
```tsx
// ✅ GOOD: Mental model aligned with medical workflow
export function ExpertDashboard() {
  // 1. Overview - see what's urgent
  // 2. Performance - manage team capability
  // 3. Consultation - conduct multidisciplinary consultations
  // 4. Cases - manage patient files
  // 5. SOP - maintain protocol standards
  // 6. Chatbot - manage AI knowledge
  // 7. Team - manage staff
  
  const [active, setActive] = useState("overview");
  
  return (
    <div>
      <nav>
        <button onClick={() => setActive("overview")}>Tổng quan</button>
        <button onClick={() => setActive("performance")}>Đánh giá năng lực</button>
        <button onClick={() => setActive("consult")}>Hội chẩn</button>
        <button onClick={() => setActive("cases")}>Ca bệnh</button>
        <button onClick={() => setActive("sop")}>Kho SOP</button>
        <button onClick={() => setActive("chatbot")}>Quản trị AI</button>
        <button onClick={() => setActive("team")}>Đội ngũ</button>
      </nav>
      
      {active === "overview" && <OverviewTab />}
      {active === "performance" && <PerformanceTab />}
      {/* etc */}
    </div>
  );
}

// ✅ GOOD: Information organized logically
<Card className="p-5">
  <h3 className="font-semibold text-lg">Ca Bệnh Phức Tạp</h3>
  <div className="space-y-2 mt-3">
    {cases.map(c => (
      <CaseRow 
        key={c.id}
        patient={c.patient}
        diagnosis={c.diagnosis}
        priority={c.priority}
        onView={() => viewCaseFile(c)}
      />
    ))}
  </div>
</Card>

// ✅ GOOD: Terminology matches medical context
function CaseFileDialog({ caseFile }) {
  return (
    <Dialog>
      <DialogTitle>Case File: {caseFile.id}</DialogTitle>
      <div className="space-y-3">
        <section>
          <label>Chẩn đoán chính</label>
          <p>{caseFile.diagnosis}</p>
        </section>
        <section>
          <label>Tiền sử</label>
          <p>{caseFile.history}</p>
        </section>
        <section>
          <label>Kết quả cận lâm sàng</label>
          <ul>{caseFile.tests.map(t => <li>{t}</li>)}</ul>
        </section>
      </div>
    </Dialog>
  );
}

// ❌ BAD: Mental model doesn't match workflow
// Expert can see everything at once, confusing
// No clear task flow
// Terminology mismatch

// ❌ BAD: Users confused about how to proceed
// Multiple ways to do same task
// Navigation doesn't match medical workflow
```

---

## Summary: How to Apply These Standards

### For ExpertDashboard:
1. ✅ Emergency alerts visible (Visibility + Feedback)
2. ✅ Performance metrics clear with improvement suggestions (Logical + Mental model)
3. ✅ SOP approval workflow logical (Logical constraint)
4. ✅ Consistent terminology throughout (Internal + External + Cultural)
5. ✅ Clear button affordances (Affordance)
6. ✅ Medical workflow-based navigation (Mental model)

### For AdminDashboard:
1. ✅ System status visible everywhere
2. ✅ Administrative actions clear and confirmed
3. ✅ User management logical and secure
4. ✅ Reports accessible and understandable
5. ✅ Consistent with admin app conventions

### Checklist for Every Component:
- [ ] Can user see current state?
- [ ] Does user get immediate feedback?
- [ ] Is workflow logical and prevent errors?
- [ ] Are disabled/hidden items explained?
- [ ] Do visual elements indicate function?
- [ ] Is terminology consistent?
- [ ] Is this like other apps in same domain?
- [ ] Is spacing/size appropriate for interaction?
- [ ] Are colors meaningful (not just pretty)?
- [ ] Does UI match how users think about the task?

---

## Color Meanings (Consistent Throughout App)
- 🔴 **Red (#ef4444)**: Critical, danger, error, delete, reject
- 🟢 **Green (#22c55e)**: Success, approve, active, healthy
- 🟡 **Yellow/Amber (#f59e0b)**: Warning, pending, caution
- 🔵 **Blue (#3b82f6)**: Info, primary action, selected
- ⚫ **Gray/Slate (#64748b)**: Disabled, muted, secondary

## Icon Usage (Consistent Throughout App)
- ✅ CheckCircle: Approved, success, done
- ❌ AlertTriangle: Warning, caution, pending
- 🔴 AlertCircle: Critical, error, urgent
- 💾 Save: Save data, commit
- 🗑️ Trash: Delete
- ✏️ Edit: Edit, modify
- 🔍 Search: Find, filter
- ⋯ MoreVertical: More options, menu
- ↑↓ TrendingUp/Down: Performance trending

