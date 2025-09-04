import { io, Socket } from 'socket.io-client';

export interface SyncEvent {
  type: 'create' | 'update' | 'delete';
  resource: 'patient' | 'appointment' | 'anamnese' | 'record';
  data: any;
  userId: string;
  timestamp: string;
}

export type SyncEventHandler = (event: SyncEvent) => void;

class SyncService {
  private socket: Socket | null = null;
  private handlers: Map<string, Set<SyncEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnected = false;
  
  connect(token: string) {
    // WEBSOCKET TEMPORARIAMENTE DESABILITADO PARA CORRIGIR NAVEGAÇÃO
    console.log('WebSocket desabilitado - sistema funcionando sem sincronização em tempo real');
    this.isConnected = false;
    return this;
    
    /*
    if (this.socket) {
      this.disconnect();
    }

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3002';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000
    });

    /*
    this.socket.on('connect', () => {
      console.log('🔗 Conectado ao servidor de sincronização');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado do servidor de sincronização:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro na conexão WebSocket:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Máximo de tentativas de reconexão atingido');
        this.disconnect();
      }
    });

    this.socket.on('sync-event', (event: SyncEvent) => {
      console.log('📡 Evento de sincronização recebido:', event);
      this.handleSyncEvent(event);
    });

    return this;
    */
  }

  disconnect() {
    // WebSocket desabilitado - apenas resetar estado
    this.socket = null;
    this.isConnected = false;
    console.log('🔌 Serviço de sincronização desabilitado');
  }

  // Assinar eventos de um recurso específico
  subscribe(resource: string, handler: SyncEventHandler) {
    const key = `${resource}:*`;
    
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    
    this.handlers.get(key)!.add(handler);
    
    console.log(`📝 Inscrito em eventos do recurso: ${resource}`);
    
    // Retorna uma função para cancelar a inscrição
    return () => {
      this.unsubscribe(resource, handler);
    };
  }

  // Assinar eventos de um tipo e recurso específicos
  subscribeToResourceType(resource: string, type: SyncEvent['type'], handler: SyncEventHandler) {
    const key = `${resource}:${type}`;
    
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    
    this.handlers.get(key)!.add(handler);
    
    console.log(`📝 Inscrito em eventos ${type} do recurso: ${resource}`);
    
    return () => {
      this.unsubscribeFromResourceType(resource, type, handler);
    };
  }

  // Cancelar inscrição de eventos de um recurso
  unsubscribe(resource: string, handler: SyncEventHandler) {
    const key = `${resource}:*`;
    const handlers = this.handlers.get(key);
    
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(key);
      }
    }
    
    console.log(`🗑️ Cancelada inscrição em eventos do recurso: ${resource}`);
  }

  // Cancelar inscrição de eventos de um tipo e recurso específicos
  unsubscribeFromResourceType(resource: string, type: SyncEvent['type'], handler: SyncEventHandler) {
    const key = `${resource}:${type}`;
    const handlers = this.handlers.get(key);
    
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(key);
      }
    }
    
    console.log(`🗑️ Cancelada inscrição em eventos ${type} do recurso: ${resource}`);
  }

  // Limpar todas as inscrições
  unsubscribeAll() {
    this.handlers.clear();
    console.log('🗑️ Todas as inscrições canceladas');
  }

  // Entrar em uma sala específica
  joinRoom(room: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', room);
      console.log(`👥 Entrou na sala: ${room}`);
    }
  }

  // Sair de uma sala específica  
  leaveRoom(room: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-room', room);
      console.log(`🚪 Saiu da sala: ${room}`);
    }
  }

  // Verificar se está conectado
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Processar evento de sincronização recebido
  private handleSyncEvent(event: SyncEvent) {
    // Notificar handlers de recurso específico
    const resourceKey = `${event.resource}:*`;
    const resourceHandlers = this.handlers.get(resourceKey);
    
    if (resourceHandlers) {
      resourceHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Erro ao processar evento de sincronização:', error);
        }
      });
    }

    // Notificar handlers de tipo específico
    const typeKey = `${event.resource}:${event.type}`;
    const typeHandlers = this.handlers.get(typeKey);
    
    if (typeHandlers) {
      typeHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Erro ao processar evento de sincronização:', error);
        }
      });
    }
  }
}

export const syncService = new SyncService();
export default syncService;