import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export interface SyncEvent {
  type: 'create' | 'update' | 'delete';
  resource: 'patient' | 'appointment' | 'anamnese' | 'record';
  data: any;
  userId: string;
  timestamp: string;
}

class SyncService {
  private io: Server | null = null;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

  initialize(server: HttpServer) {
    this.io = new Server(server, {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_development') as any;
        socket.data.user = decoded;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log('🔗 Cliente conectado:', socket.data.user.userId);

      // Adicionar à lista de usuários conectados
      const userId = socket.data.user.userId;
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(socket.id);

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
      socket.on('join-room', (room: string) => {
        socket.join(room);
        console.log(`👥 Usuário ${userId} entrou na sala ${room}`);
      });

      socket.on('leave-room', (room: string) => {
        socket.leave(room);
        console.log(`🚪 Usuário ${userId} saiu da sala ${room}`);
      });
    });

    console.log('🔄 Serviço de sincronização inicializado');
  }

  // Broadcast para todos os usuários conectados
  broadcastToAll(event: SyncEvent) {
    if (this.io) {
      this.io.emit('sync-event', event);
      console.log('📡 Evento broadcast para todos:', event.type, event.resource);
    }
  }

  // Broadcast para usuários específicos
  broadcastToUsers(userIds: string[], event: SyncEvent) {
    if (this.io) {
      userIds.forEach(userId => {
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
          userSockets.forEach(socketId => {
            this.io!.to(socketId).emit('sync-event', event);
          });
        }
      });
      console.log('📡 Evento broadcast para usuários específicos:', userIds, event.type, event.resource);
    }
  }

  // Broadcast para uma sala específica
  broadcastToRoom(room: string, event: SyncEvent) {
    if (this.io) {
      this.io.to(room).emit('sync-event', event);
      console.log('📡 Evento broadcast para sala:', room, event.type, event.resource);
    }
  }

  // Notificar mudança em dados
  notifyDataChange(resource: SyncEvent['resource'], type: SyncEvent['type'], data: any, userId: string, targetUsers?: string[]) {
    const event: SyncEvent = {
      type,
      resource,
      data,
      userId,
      timestamp: new Date().toISOString()
    };

    if (targetUsers && targetUsers.length > 0) {
      this.broadcastToUsers(targetUsers, event);
    } else {
      this.broadcastToAll(event);
    }
  }

  // Obter usuários conectados
  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Verificar se usuário está conectado
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

export const syncService = new SyncService();
export default syncService;