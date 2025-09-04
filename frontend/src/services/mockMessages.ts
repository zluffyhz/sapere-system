// API mock para sistema de recados
import type { Message, CreateMessageRequest, UpdateMessageRequest, MessageFilters } from '@/types/messages';

class MockMessagesAPI {
  private messages: Message[] = [
    {
      id: '1',
      title: 'Bem-vindos ao Centro de Desenvolvimento Sapere',
      content: 'Estamos felizes em ter todos vocês em nossa equipe! Este é nosso novo sistema de comunicação interna.',
      authorId: 'admin-1',
      authorName: 'Administração',
      authorRole: 'admin',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      category: 'announcement',
      pinned: true,
      targetRoles: ['admin', 'profissional'],
      attachments: [],
      reactions: [],
      replies: []
    },
    {
      id: '2',
      title: 'Lembrete: Atualização de Prontuários',
      content: 'Pessoal, lembrem-se de manter os prontuários sempre atualizados após cada sessão. Isso nos ajuda a ter um melhor controle e continuidade dos tratamentos.',
      authorId: 'coord-1',
      authorName: 'Coordenação Clínica',
      authorRole: 'admin',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'normal',
      category: 'general',
      pinned: false,
      targetRoles: ['profissional'],
      attachments: [],
      reactions: [],
      replies: []
    },
    {
      id: '3',
      title: 'Novo Template de Anamnese Disponível',
      content: 'Temos um novo template de anamnese multiprofissional disponível no sistema! Ele pode ser usado por todas as especialidades: fonoaudiologia, psicologia, terapia ocupacional, fisioterapia, neuropsicologia, nutrição e musicoterapia.',
      authorId: 'admin-1',
      authorName: 'Sistema Sapere',
      authorRole: 'admin',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      priority: 'normal',
      category: 'system',
      pinned: false,
      targetRoles: ['admin', 'profissional'],
      attachments: [],
      reactions: [],
      replies: []
    }
  ];

  async getAll(filters?: MessageFilters): Promise<Message[]> {
    await this.delay(300);
    
    let filtered = [...this.messages];

    // Aplicar filtros
    if (filters?.category) {
      filtered = filtered.filter(msg => msg.category === filters.category);
    }

    if (filters?.priority) {
      filtered = filtered.filter(msg => msg.priority === filters.priority);
    }

    if (filters?.authorId) {
      filtered = filtered.filter(msg => msg.authorId === filters.authorId);
    }

    if (filters?.pinned !== undefined) {
      filtered = filtered.filter(msg => msg.pinned === filters.pinned);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.title.toLowerCase().includes(searchTerm) ||
        msg.content.toLowerCase().includes(searchTerm) ||
        msg.authorName.toLowerCase().includes(searchTerm)
      );
    }

    // Ordenar: pinned primeiro, depois por data
    filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }

  async getById(id: string): Promise<Message | null> {
    await this.delay(200);
    return this.messages.find(msg => msg.id === id) || null;
  }

  async create(data: CreateMessageRequest, authorId: string, authorName: string, authorRole: string): Promise<Message> {
    await this.delay(500);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      title: data.title,
      content: data.content,
      authorId,
      authorName,
      authorRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: data.priority,
      category: data.category,
      pinned: data.pinned || false,
      expiresAt: data.expiresAt,
      targetRoles: data.targetRoles || ['admin', 'profissional'],
      attachments: [],
      reactions: [],
      replies: []
    };

    this.messages.unshift(newMessage);
    return newMessage;
  }

  async update(data: UpdateMessageRequest): Promise<Message> {
    await this.delay(500);

    const messageIndex = this.messages.findIndex(msg => msg.id === data.id);
    if (messageIndex === -1) {
      throw new Error('Mensagem não encontrada');
    }

    const updatedMessage = {
      ...this.messages[messageIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.messages[messageIndex] = updatedMessage;
    return updatedMessage;
  }

  async delete(id: string): Promise<void> {
    await this.delay(300);

    const messageIndex = this.messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) {
      throw new Error('Mensagem não encontrada');
    }

    this.messages.splice(messageIndex, 1);
  }

  async togglePin(id: string): Promise<Message> {
    await this.delay(300);

    const message = this.messages.find(msg => msg.id === id);
    if (!message) {
      throw new Error('Mensagem não encontrada');
    }

    message.pinned = !message.pinned;
    message.updatedAt = new Date().toISOString();
    
    return message;
  }

  async addReaction(messageId: string, emoji: string, userId: string, userName: string): Promise<Message> {
    await this.delay(200);

    const message = this.messages.find(msg => msg.id === messageId);
    if (!message) {
      throw new Error('Mensagem não encontrada');
    }

    // Remover reação existente do usuário se houver
    message.reactions = message.reactions?.filter(r => r.userId !== userId) || [];

    // Adicionar nova reação
    message.reactions.push({
      id: `reaction-${Date.now()}`,
      userId,
      userName,
      emoji,
      createdAt: new Date().toISOString()
    });

    return message;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockMessagesAPI = new MockMessagesAPI();
export default mockMessagesAPI;