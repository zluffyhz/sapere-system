// Tipos para o sistema de recados/comunicação
export interface Message {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'announcement' | 'schedule' | 'urgent' | 'system';
  pinned: boolean;
  expiresAt?: string;
  targetRoles?: string[]; // roles que podem ver a mensagem
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  replies?: MessageReply[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface MessageReaction {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

export interface MessageReply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface MessageFilters {
  category?: string;
  priority?: string;
  authorId?: string;
  pinned?: boolean;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CreateMessageRequest {
  title: string;
  content: string;
  priority: Message['priority'];
  category: Message['category'];
  pinned?: boolean;
  expiresAt?: string;
  targetRoles?: string[];
  attachments?: File[];
}

export interface UpdateMessageRequest {
  id: string;
  title?: string;
  content?: string;
  priority?: Message['priority'];
  category?: Message['category'];
  pinned?: boolean;
  expiresAt?: string;
  targetRoles?: string[];
}