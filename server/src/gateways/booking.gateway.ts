// server/src/gateways/booking.gateway.ts

import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class BookingGateway {
  @WebSocketServer()
  server: Server;

  // Track online users
  private usersCount = 0;

  handleConnection(client: Socket) {
    this.usersCount++;
    this.server.emit('USER_PRESENCE', this.usersCount);
  }

  handleDisconnect(client: Socket) {
    this.usersCount--;
    this.server.emit('USER_PRESENCE', this.usersCount);
    // Cleanup presence
    this.server.emit('CURSOR_UPDATE', { userId: client.id, position: null });
  }

  // Map to store current locks: slotId -> userId
  private activeLocks: Map<string, string> = new Map();

  @SubscribeMessage('CURSOR_MOVE')
  handleCursorMove(client: Socket, position: [number, number, number]) {
    // Broadcast this user's position to everyone else
    client.broadcast.emit('CURSOR_UPDATE', { userId: client.id, position });
  }

  @SubscribeMessage('LOCK_SLOT')
  handleLockSlot(client: Socket, data: { slotId: string; userId: string }) {
    const { slotId, userId } = data;

    // Check if slot is already locked
    if (this.activeLocks.has(slotId)) {
      client.emit('LOCK_FAIL', { slotId, message: 'Slot already locked by another user' });
      return;
    }

    // Lock in Redis (Simulation)
    this.activeLocks.set(slotId, userId);

    // Broadcast to all other users
    this.server.emit('SLOT_LOCKED', { slotId, userId });

    // Set a timeout for the lock (30s)
    setTimeout(() => {
      if (this.activeLocks.get(slotId) === userId) {
        this.activeLocks.delete(slotId);
        this.server.emit('SLOT_RELEASED', { slotId });
      }
    }, 30000);
  }

  @SubscribeMessage('RELEASE_SLOT')
  handleReleaseSlot(client: Socket, data: { slotId: string; userId: string }) {
    const { slotId, userId } = data;
    if (this.activeLocks.get(slotId) === userId) {
      this.activeLocks.delete(slotId);
      this.server.emit('SLOT_RELEASED', { slotId });
    }
  }
}
