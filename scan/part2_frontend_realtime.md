# 🚀 PROMPT MASTER – PART 2 (FRONTEND ARCHITECTURE + REALTIME + 3D SYSTEM)

## 🎯 ROLE (MỞ RỘNG)
Bạn là:
- Senior Frontend Architect
- Realtime System Designer
- 3D Web Engineer (Three.js / R3F)

Bạn không chỉ thiết kế UI mà phải Build một interactive system đồng bộ với backend real-time.

## 🧠 1. FRONTEND ARCHITECTURE (5 LAYER RÕ RÀNG)
Phải chia layer:
1. **Rendering Layer (3D Engine)**: React Three Fiber, Three.js. Quản lý: Scene, Camera, Lights, Mesh objects.
2. **Interaction Layer**: Xử lý Raycasting (click vào object 3D), Hover detection, Drag/pan/zoom. Mapping: click court → SELECT_COURT, click slot → CHOOSE_TIME.
3. **Motion System**: GSAP (cinematic timeline, camera transition), Framer Motion (UI state animation). Quan trọng: Animation phải subscribe vào state change.
4. **State Layer (CRITICAL)**: Zustand (global state nhẹ), TanStack Query (server state).
5. **Network Layer**: REST/GraphQL (fetch court, slot), WebSocket (realtime update: slot lock, user presence).

## ⚡ 2. REAL-TIME SYSTEM (FE SIDE)
App này phải behave như: multiplayer game.
- **Concept**: FE gửi LOCK_SLOT, Optimistic update (highlight ngay), revert if fail.
- **WebSocket events**: SLOT_LOCKED, SLOT_RELEASED, USER_JOINED, USER_LEFT.
- **UI phản ứng**: Event ↔ Effect mapping (e.g., SLOT_LOCKED → slot đỏ nhẹ).

## 🎮 3. 3D SYSTEM DESIGN (PRODUCTION)
### 🏟️ Scene Structure
Scene ├── Environment ├── Lighting System ├── Court Instances ├── Timeline Layer (3D UI) └── Effects Layer
### ⚡ Optimization BẮT BUỘC
- Instancing (nhiều sân), LOD (xa/gần), Lazy load.
- GPU Strategy: giảm draw calls, reuse material, texture atlas.

## 💡 4. LIGHTING SYSTEM (DATA-DRIVEN)
Ánh sáng gắn với state:
- **Mapping**: lightingState = { EXPLORE: "dim", SELECT_COURT: "focus", CHOOSE_TIME: "interactive", CONFIRM: "spotlight" }.
- **Dynamic behavior**: hover → tăng intensity, select → đổi màu, locked → flicker nhẹ.

## 🎥 5. CAMERA SYSTEM (CỰC QUAN TRỌNG)
Camera = công cụ dẫn dắt UX.
- **Mapping**: Step ↔ Camera (wide view, zoom nhẹ, focus gần, close + stable).
- **Motion rules**: smooth interpolation, easing tự nhiên, không jump.

## 🎯 6. INTERACTION MAPPING (RẤT CHI TIẾT)
- **Case 1: Hover Court**: raycast detect, update hoveredCourtId, trigger light glow.
- **Case 2: Click Court**: set selectedCourtId, change step, trigger camera animation.
- **Case 3: Select Slot**: gửi API lock, highlight slot, update progress.

## ⚡ 7. PERFORMANCE STRATEGY (FE)
- Target: 60 FPS (desktop), 30 FPS (low-end).
- Techniques: requestAnimationFrame control, throttle interaction, memoization, dynamic import 3D.
- **🧨 Fallback Mode**: Nếu device yếu, disable shadow/reflection/heavy animation, chuyển sang 2D layout.

## 🧠 8. PROGRESS ↔ STATE ↔ SCENE SYNC
- Rule: Step change = trigger ALL (camera, lighting, interaction, animation).
- Ví dụ: `if (currentStep === "CHOOSE_TIME") { enableTimeline(); focusCamera(); highlightSlots(); }`

## 🎬 9. OUTPUT YÊU CẦU (PART 2)
Mô tả chi tiết:
1. Frontend architecture (5 layer)
2. State management design
3. Real-time flow (WebSocket)
4. 3D scene structure
5. Lighting system (data-driven)
6. Camera system (mapping theo step)
7. Interaction system (raycasting + event)
8. Performance optimization strategy
9. Fallback mode (low device)
10. Cách đồng bộ: Step ↔ State ↔ Scene ↔ Animation
