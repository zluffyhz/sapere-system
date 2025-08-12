"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class SyncService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map(); // userId -> Set<socketId>
    }
    initialize(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
                credentials: true
            }
        });
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret_key_development');
                socket.data.user = decoded;
                next();
            }
            catch (err) {
                next(new Error('Authentication error'));
            }
        });
        this.io.on('connection', (socket) => {
            console.log('🔗 Cliente conectado:', socket.data.user.userId);
            // Adicionar à lista de usuários conectados
            const userId = socket.data.user.userId;
            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
            }
            this.connectedUsers.get(userId).add(socket.id);
            socket.on('disconnect', () => {
                console.log('🔌 Cliente desconectado:', socket.data.user.userId);
                // Remover da lista de usuários conectados
                const userSockets = this.connectedUsers.get(userId);
                if (userSockets) {
                    userSockets.delete(socket.id);
                    if (userSockets.size === 0) {
                        this.connectedUsers.delete(userId);
                    }
                }
            });
            // Eventos personalizados
            socket.on('join-room', (room) => {
                socket.join(room);
                console.log(`👥 Usuário ${userId} entrou na sala ${room}`);
            });
            socket.on('leave-room', (room) => {
                socket.leave(room);
                console.log(`🚪 Usuário ${userId} saiu da sala ${room}`);
            });
        });
        console.log('🔄 Serviço de sincronização inicializado');
    }
    // Broadcast para todos os usuários conectados
    broadcastToAll(event) {
        if (this.io) {
            this.io.emit('sync-event', event);
            console.log('📡 Evento broadcast para todos:', event.type, event.resource);
        }
    }
    // Broadcast para usuários específicos
    broadcastToUsers(userIds, event) {
        if (this.io) {
            userIds.forEach(userId => {
                const userSockets = this.connectedUsers.get(userId);
                if (userSockets) {
                    userSockets.forEach(socketId => {
                        this.io.to(socketId).emit('sync-event', event);
                    });
                }
            });
            console.log('📡 Evento broadcast para usuários específicos:', userIds, event.type, event.resource);
        }
    }
    // Broadcast para uma sala específica
    broadcastToRoom(room, event) {
        if (this.io) {
            this.io.to(room).emit('sync-event', event);
            console.log('📡 Evento broadcast para sala:', room, event.type, event.resource);
        }
    }
    // Notificar mudança em dados
    notifyDataChange(resource, type, data, userId, targetUsers) {
        const event = {
            type,
            resource,
            data,
            userId,
            timestamp: new Date().toISOString()
        };
        if (targetUsers && targetUsers.length > 0) {
            this.broadcastToUsers(targetUsers, event);
        }
        else {
            this.broadcastToAll(event);
        }
    }
    // Obter usuários conectados
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
    // Verificar se usuário está conectado
    isUserConnected(userId) {
        return this.connectedUsers.has(userId);
    }
}
exports.syncService = new SyncService();
exports.default = exports.syncService;
//# sourceMappingURL=syncService.js.map