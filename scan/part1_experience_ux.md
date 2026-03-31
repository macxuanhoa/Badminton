# 🚀 PROMPT MASTER – PART 1 (EXPERIENCE + PROGRESS + SPATIAL UX)

## 🎯 ROLE
Bạn là một:
- Creative Technologist
- Senior Frontend Architect
- UX Director (specialized in immersive + spatial UX)

Bạn chuyên tạo ra các trải nghiệm web:
- Cinematic
- Interactive 3D
- Awwwards-level
- Nhưng không làm user bị lạc (progress-driven)

## 🌌 1. CORE PRINCIPLE: EXPERIENCE + PROGRESS
Thiết kế một web app đặt sân cầu lông nơi:
- Người dùng cảm thấy: “đang khám phá một không gian”
- NHƯNG: Luôn biết mình đang ở bước nào, bước tiếp theo là gì, đã hoàn thành bao nhiêu.
- ⚖️ Nguyên tắc vàng: “Exploration without confusion”

## 🧭 2. PROGRESS SYSTEM (ẨN NHƯNG RÕ)
KHÔNG dùng: progress bar truyền thống, stepper UI cứng.
PHẢI dùng: Progress layer ẩn trong không gian.

### 🧩 Step logic:
- Explore
- Select Court
- Choose Time
- Confirm

### 🧠 State design:
```json
{
  "currentStep": "EXPLORE" | "SELECT_COURT" | "CHOOSE_TIME" | "CONFIRM",
  "completedSteps": [],
  "focusedCourtId": null,
  "selectedSlot": null
}
```

## 🌗 3. PROGRESS = LIGHTING SYSTEM (QUAN TRỌNG NHẤT)
Ánh sáng KHÔNG để trang trí mà là ngôn ngữ dẫn hướng.

### 🎨 Mapping:
- **STEP 1 – EXPLORE**: Scene tối nhẹ, tất cả sân dim, ánh sáng ambient nhẹ. Ý nghĩa: “Bạn chưa chọn gì”.
- **STEP 2 – SELECT COURT**: Sân hover glow nhẹ, sân được chọn viền sáng spotlight focus, sân khác fade out. Progress: “Bạn đã chọn 1 phần”.
- **STEP 3 – CHOOSE TIME**: Timeline xuất hiện bằng ánh sáng. Slot: available (soft glow), hover (pulse), selected (strong glow). Progress: “Bạn gần hoàn thành”.
- **STEP 4 – CONFIRM**: Ánh sáng hội tụ, background tối lại, khu vực booking sáng mạnh. Progress: “Chuẩn bị hoàn tất”.
- **STEP COMPLETED**: Ánh sáng “lock”, scene ổn định lại.

## 🎥 4. MOTION = PROGRESS FEEDBACK
Mỗi step phải có Transition rõ ràng (không fade vô nghĩa).
- **Explore → Select Court**: Camera zoom nhẹ, depth tăng, background blur.
- **Select Court → Choose Time**: Timeline “emerge” từ sân, camera tilt nhẹ.
- **Choose Time → Confirm**: Scene co lại (focus), motion chậm hơn (tạo cảm giác quyết định).
- 🎯 Quy tắc: Có inertia (quán tính), không snap cứng, không animation thừa.

## 🌐 5. SPATIAL UI + NAVIGATION LAYER
UI = không gian 3D NHƯNG có Navigation layer ẩn.
- **🧭 Biểu hiện**: Góc màn hình (minimal UI): Explore → Select → Time → Confirm. KHÔNG phải text rõ ràng mà là dot / light node. Node sáng = step hiện tại, node dim = chưa tới, node locked = đã xong.

## 🧠 6. SUBTLE GUIDANCE (UX NGẦM)
KHÔNG dùng: popup, tooltip dài, onboarding truyền thống.
THAY BẰNG:
1. Ánh sáng dẫn đường (vùng cần click sáng hơn).
2. Motion gợi ý (object breathing animation).
3. Micro-interaction (hover → phản hồi ngay).

## 🎮 7. INTERACTION FLOW (CÓ PROGRESS)
- **STEP 1: EXPLORE**: User drag, xoay camera. System: chưa có highlight rõ.
- **STEP 2: SELECT COURT**: User hover preview, click select. System: highlight sân, dim phần còn lại, update progress.
- **STEP 3: CHOOSE TIME**: User hover slot, click chọn giờ. System: slot glow, timeline active.
- **STEP 4: CONFIRM**: User confirm. System: animation lock, ánh sáng hội tụ.

## ⚙️ 8. TECH REQUIREMENT (FE – PROGRESS AWARE)
- State: Zustand / Redux.
- Mapping bắt buộc: Step ↔ Camera position, Lighting state, Scene composition, Interaction enable/disable.

## ⚡ 9. PERFORMANCE + PROGRESS
- Progress phải: Instant, không delay.
- Loading: KHÔNG dùng spinner, thay bằng ánh sáng load dần, scene “thức dậy”.

## 🎬 10. OUTPUT YÊU CẦU (PART 1)
Hãy mô tả chi tiết:
1. UX flow cinematic (có progress rõ)
2. Cách thể hiện progress bằng ánh sáng
3. Motion system theo từng step
4. Scene transition giữa các bước
5. Navigation layer ẩn hoạt động thế nào
6. Mapping: Step ↔ Lighting, Camera, Interaction
7. Ví dụ cụ thể từng hành động user
