import { Server, Socket } from 'socket.io';
export declare class BookingGateway {
    server: Server;
    private usersCount;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private activeLocks;
    handleCursorMove(client: Socket, position: [number, number, number]): void;
    handleLockSlot(client: Socket, data: {
        slotId: string;
        userId: string;
    }): void;
    handleReleaseSlot(client: Socket, data: {
        slotId: string;
        userId: string;
    }): void;
}
