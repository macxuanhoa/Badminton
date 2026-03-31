"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let BookingGateway = class BookingGateway {
    constructor() {
        this.usersCount = 0;
        this.activeLocks = new Map();
    }
    handleConnection(client) {
        this.usersCount++;
        this.server.emit('USER_PRESENCE', this.usersCount);
    }
    handleDisconnect(client) {
        this.usersCount--;
        this.server.emit('USER_PRESENCE', this.usersCount);
        this.server.emit('CURSOR_UPDATE', { userId: client.id, position: null });
    }
    handleCursorMove(client, position) {
        client.broadcast.emit('CURSOR_UPDATE', { userId: client.id, position });
    }
    handleLockSlot(client, data) {
        const { slotId, userId } = data;
        if (this.activeLocks.has(slotId)) {
            client.emit('LOCK_FAIL', { slotId, message: 'Slot already locked by another user' });
            return;
        }
        this.activeLocks.set(slotId, userId);
        this.server.emit('SLOT_LOCKED', { slotId, userId });
        setTimeout(() => {
            if (this.activeLocks.get(slotId) === userId) {
                this.activeLocks.delete(slotId);
                this.server.emit('SLOT_RELEASED', { slotId });
            }
        }, 30000);
    }
    handleReleaseSlot(client, data) {
        const { slotId, userId } = data;
        if (this.activeLocks.get(slotId) === userId) {
            this.activeLocks.delete(slotId);
            this.server.emit('SLOT_RELEASED', { slotId });
        }
    }
};
exports.BookingGateway = BookingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], BookingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('CURSOR_MOVE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Array]),
    __metadata("design:returntype", void 0)
], BookingGateway.prototype, "handleCursorMove", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('LOCK_SLOT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], BookingGateway.prototype, "handleLockSlot", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('RELEASE_SLOT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], BookingGateway.prototype, "handleReleaseSlot", null);
exports.BookingGateway = BookingGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } })
], BookingGateway);
//# sourceMappingURL=booking.gateway.js.map