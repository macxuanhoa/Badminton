import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';
import api from '../api';

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;
    if (this.socket && !this.socket.connected) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    const baseURL = api.defaults.baseURL || 'http://localhost:3001';
    this.socket = io(baseURL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 8000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Listen for slot locking events from others
    this.socket.on('SLOT_LOCKED', (data: { slotId: string; userId: string }) => {
      useStore.getState().updateRealtimeLock(data.slotId, data.userId);
    });

    this.socket.on('SLOT_RELEASED', (data: { slotId: string }) => {
      useStore.getState().updateRealtimeLock(data.slotId, null);
    });

    this.socket.on('USER_PRESENCE', (count: number) => {
      useStore.setState({ usersOnline: count });
    });

    this.socket.on('CURSOR_UPDATE', (data: { userId: string; position: [number, number, number] }) => {
      useStore.getState().updatePresence(data.userId, data.position);
    });

    this.socket.on('BOOKING_CONFIRMED', (booking: any) => {
      const state = useStore.getState();
      const exists = state.bookings.some(b => b.id === booking.id);
      if (!exists) {
        useStore.setState({ bookings: [booking as any, ...state.bookings] });
      }
    });

    this.socket.on('BOOKING_CANCELLED', (booking: any) => {
      const state = useStore.getState();
      const updatedBookings = state.bookings.map(b => 
        b.id === booking.id ? { ...b, status: 'CANCELLED' as const } : b
      );
      useStore.setState({ bookings: updatedBookings });
    });
  }

  lockSlot(slotId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('LOCK_SLOT', { slotId, userId });
    }
  }

  releaseSlot(slotId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('RELEASE_SLOT', { slotId, userId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const socketService = new SocketService();
