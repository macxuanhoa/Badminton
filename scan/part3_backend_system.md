# 🚀 PROMPT MASTER – PART 3 (BACKEND + DEVOPS + BUSINESS + AI + SCALE)

## 🎯 ROLE (FINAL FORM)
Bạn là:
- Backend System Architect
- Distributed Systems Engineer
- DevOps / Cloud Architect
- Product Engineer (hiểu business)

Bạn phải thiết kế hệ thống: real-time, scalable, fault-tolerant, production-ready.

## 🧱 1. BACKEND ARCHITECTURE (MICROSERVICE-READY)
🧩 Core Services:
1. **Booking Service (TRUNG TÂM)**: tạo booking, giữ slot (lock), timeout, tránh double booking.
2. **Realtime Service**: WebSocket server, broadcast event.
3. **User Service**: Auth (JWT), profile, lịch sử chơi.
4. **Court Service**: danh sách sân, metadata (loại sân, giá, layout).
5. **Payment Service**: VNPay, Stripe.
6. **Notification Service**: email, push, realtime alert.

## 🔄 2. REAL-TIME + LOCKING (CỰC QUAN TRỌNG)
⚠️ Problem: 2 user chọn cùng 1 slot.
✅ Solution: Redis Lock.
- **Flow**: User click slot → FE gửi LOCK_SLOT → Backend check DB → SET Redis: `SET lock:courtId:timeSlot userId EX 30 NX`.
- **Nếu thành công**: broadcast SLOT_LOCKED.
- **Nếu fail**: trả về lỗi, FE revert UI.
- **Sau khi confirm**: ghi DB, xoá Redis lock.

## 🗄️ 3. DATABASE DESIGN
- **Users**: id, email, password_hash, role, created_at.
- **Courts**: id, name, type, price_per_hour.
- **Slots**: id, court_id, start_time, end_time, status.
- **Bookings**: id, user_id, court_id, slot_id, status, payment_status, created_at.
- **Payments**: id, booking_id, amount, provider, status.

## 🌐 4. API DESIGN
- **REST**: GET /courts, GET /slots?courtId=, POST /booking, POST /payment.
- **WebSocket Events**:
  - Client → Server: LOCK_SLOT, RELEASE_SLOT, JOIN_ROOM.
  - Server → Client: SLOT_LOCKED, SLOT_RELEASED, BOOKING_CONFIRMED, USER_PRESENCE.

## ⚙️ 5. DEVOPS & INFRASTRUCTURE
- **Deployment**: FE (Vercel), BE (Docker + Kubernetes).
- **Stack**: Node.js (NestJS), Redis Cluster, PostgreSQL (RDS).
- **CI/CD**: GitHub Actions (build, test, deploy).
- **Monitoring**: Sentry, Prometheus + Grafana.

## ⚡ 6. SCALING STRATEGY
- **Horizontal Scaling**: nhiều instance backend, load balancer.
- **Redis**: dùng pub/sub cho realtime.
- **DB**: read replica, index slot + court.

## 💰 7. BUSINESS LOGIC (THỰC TẾ)
- **Pricing**: giờ cao điểm (dynamic pricing), giảm giá giờ thấp.
- **Membership**: user VIP (ưu tiên slot, giảm giá).
- **Cancellation**: trước 2h (hoàn tiền), sau (mất phí).

## 🎛️ 8. ADMIN SYSTEM
- **Dashboard**: quản lý sân, booking, user.
- **Analytics**: số giờ thuê, doanh thu, peak hours.

## 🧠 9. AI RECOMMENDATION
- **🎯 Gợi ý**: giờ thường chơi, sân hay đặt, bạn bè chơi cùng.
- **🧩 Logic**: Level 1 (rule-based), Level 2 (collaborative filtering).

## 🔐 10. SECURITY
JWT auth, rate limit, chống spam booking, validate input.

## ⚡ 11. PERFORMANCE (BACKEND)
cache slot bằng Redis, debounce request, batch query.

## 🧨 12. FAILURE HANDLING
Redis down → fallback DB check, payment fail → rollback booking, WebSocket disconnect → reconnect.

## 🎬 13. FULL SYSTEM FLOW
User chọn sân → chọn slot → gọi LOCK_SLOT → Redis lock → UI update realtime → user confirm → payment → ghi DB → broadcast update.

## 🎯 14. OUTPUT YÊU CẦU (PART 3)
Mô tả chi tiết:
1. Backend architecture (services)
2. Real-time + Redis locking flow
3. Database schema
4. API + WebSocket design
5. DevOps & deployment
6. Scaling strategy
7. Business logic (pricing, membership)
8. Admin system
9. AI recommendation system
10. Security & failure handling
11. End-to-end booking flow
