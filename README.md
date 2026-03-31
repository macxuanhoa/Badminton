# Badminton Real-time Interactive Platform 🏸

## 🚀 Overview
This project is a high-performance, real-time court booking platform featuring an immersive 3D experience using React Three Fiber, GSAP, and a distributed backend system.

## 📁 Project Structure

### `client/` (Frontend)
- **`src/components/3d/`**: Immersive 3D components (Courts, Timeline, Lights).
- **`src/store/`**: Global state management using Zustand (Progress, 3D target, Real-time locks).
- **`src/hooks/`**: Custom hooks for 3D interaction, camera transitions, and animations.
- **`src/services/`**: Network layer for REST/GraphQL and WebSocket communication.

### `server/` (Backend)
- **`src/controllers/`**: REST API endpoints for court and user management.
- **`src/services/`**: Core business logic (Booking, Court availability, AI recommendations).
- **`src/models/`**: Data schemas for PostgreSQL.
- **`src/gateways/`**: WebSocket gateways for real-time slot locking and presence.
- **`src/utils/`**: Shared utilities and Redis locking helper.

### `scan/` (Documentation & Spec)
- **`part1_experience_ux.md`**: Immersive UX and progress-driven design specs.
- **`part2_frontend_realtime.md`**: Frontend architecture and 3D system design.
- **`part3_backend_system.md`**: Backend services, Redis locking, and infrastructure.

## 🌗 Core Philosophy
- **Lighting = Progress**: Visual progress is communicated through scene lighting intensity and focus.
- **Exploration without Confusion**: Immersive 3D navigation combined with subtle, minimal UI guidance.
- **Real-time Synchronization**: Using Redis locks and WebSockets to ensure zero double-booking and immediate feedback.
