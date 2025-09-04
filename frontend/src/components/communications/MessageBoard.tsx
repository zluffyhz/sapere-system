// Componente do mural de recados
import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Pin,
  PinOff,
  Edit,
  Trash2,
  Filter,
  Search,
  Clock,
  User,
  AlertCircle,
  Megaphone,
  Calendar,
  Settings,
  Heart,
  ThumbsUp,
  Smile
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { useSystemNotifications } from '@/context/SystemNotificationsContext';
import { mockMessagesAPI } from '@/services/mockMessages';
import { formatDate } from '@/utils/formatting';
import type { Message, MessageFilters, CreateMessageRequest } from '@/types/messages';

interface MessageBoardProps {
  onMessageCreated?: (message: Message) => void;
}

const MessageBoard: React.FC<MessageBoardProps> = ({ onMessageCreated }) => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const { addNotification: addSystemNotification } = useSystemNotifications();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<MessageFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [newMessage, setNewMessage] = useState<CreateMessageRequest>({
    title: '',
    content: '',
    priority: 'normal',
    category: 'general',
    pinned: false,
    targetRoles: ['admin', 'profissional']
  });

  useEffect(() => {
    loadMessages();
  }, [filters, searchTerm]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const result = await mockMessagesAPI.getAll({
        ...filters,
        search: searchTerm || undefined
      });
      setMessages(result);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.title.trim() || !newMessage.content.trim()) {
      error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const createdMessage = await mockMessagesAPI.create(
        newMessage,
        user.id,
        user.name,
        user.role
      );

      success('Recado publicado com sucesso');
      setShowCreateForm(false);
      setNewMessage({
        title: '',
        content: '',
        priority: 'normal',
        category: 'general',
        pinned: false,
        targetRoles: ['admin', 'profissional']
      });

      // Adicionar notificação do sistema
      addSystemNotification({
        type: 'message_posted',
        title: 'Novo recado publicado',
        message: `${user.name} publicou: ${createdMessage.title}`,
        priority: createdMessage.priority === 'urgent' ? 'high' : 'normal',
        read: false,
        data: { messageId: createdMessage.id }
      });

      if (onMessageCreated) {
        onMessageCreated(createdMessage);
      }

      loadMessages();
    } catch (err) {
      error('Erro ao publicar recado');
    }
  };

  const handleTogglePin = async (messageId: string) => {
    try {
      await mockMessagesAPI.togglePin(messageId);
      success('Recado atualizado');
      loadMessages();
    } catch (err) {
      error('Erro ao atualizar recado');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Tem certeza que deseja excluir este recado?')) return;

    try {
      await mockMessagesAPI.delete(messageId);
      success('Recado excluído');
      loadMessages();
    } catch (err) {
      error('Erro ao excluir recado');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      await mockMessagesAPI.addReaction(messageId, emoji, user.id, user.name);
      loadMessages();
    } catch (err) {
      error('Erro ao reagir');
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <Megaphone className="h-4 w-4 text-orange-500" />;
      case 'normal': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'low': return <MessageSquare className="h-4 w-4 text-gray-500" />;
      default: return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'normal': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-500 bg-gray-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      general: 'Geral',
      announcement: 'Comunicado',
      schedule: 'Agenda',
      urgent: 'Urgente',
      system: 'Sistema'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar recados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            />
            <Search className="h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-sapere-orange text-white' : ''}`}
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Recado
        </button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({...filters, category: e.target.value || undefined})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange"
              >
                <option value="">Todas</option>
                <option value="general">Geral</option>
                <option value="announcement">Comunicado</option>
                <option value="schedule">Agenda</option>
                <option value="urgent">Urgente</option>
                <option value="system">Sistema</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters({...filters, priority: e.target.value || undefined})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange"
              >
                <option value="">Todas</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="normal">Normal</option>
                <option value="low">Baixa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fixados</label>
              <select
                value={filters.pinned === undefined ? '' : filters.pinned.toString()}
                onChange={(e) => setFilters({...filters, pinned: e.target.value === '' ? undefined : e.target.value === 'true'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange"
              >
                <option value="">Todos</option>
                <option value="true">Fixados</option>
                <option value="false">Não fixados</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de criação */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <form onSubmit={handleCreateMessage} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Novo Recado</h3>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={newMessage.category}
                  onChange={(e) => setNewMessage({...newMessage, category: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange"
                >
                  <option value="general">Geral</option>
                  <option value="announcement">Comunicado</option>
                  <option value="schedule">Agenda</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select
                  value={newMessage.priority}
                  onChange={(e) => setNewMessage({...newMessage, priority: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange"
                >
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div className="flex items-center space-x-4 pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newMessage.pinned}
                    onChange={(e) => setNewMessage({...newMessage, pinned: e.target.checked})}
                    className="rounded border-gray-300 text-sapere-orange focus:ring-sapere-orange"
                  />
                  <span className="ml-2 text-sm text-gray-700">Fixar recado</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
              <textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Publicar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de mensagens */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapere-orange"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map(message => (
            <div
              key={message.id}
              className={`bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow ${getPriorityColor(message.priority)} ${message.pinned ? 'ring-2 ring-sapere-orange ring-opacity-20' : ''}`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(message.priority)}
                    <h3 className="text-lg font-semibold text-gray-900">{message.title}</h3>
                    {message.pinned && <Pin className="h-4 w-4 text-sapere-orange" />}
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {getCategoryLabel(message.category)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleTogglePin(message.id)}
                          className="text-gray-400 hover:text-sapere-orange"
                          title={message.pinned ? 'Desafixar' : 'Fixar'}
                        >
                          {message.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                        </button>
                        {message.authorId === user?.id && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-gray-400 hover:text-red-500"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{message.content}</p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{message.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(message.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReaction(message.id, '👍')}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      {message.reactions?.filter(r => r.emoji === '👍').length || 0}
                    </button>
                    <button
                      onClick={() => handleReaction(message.id, '❤️')}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                      <Heart className="h-3 w-3" />
                      {message.reactions?.filter(r => r.emoji === '❤️').length || 0}
                    </button>
                    <button
                      onClick={() => handleReaction(message.id, '😊')}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                      <Smile className="h-3 w-3" />
                      {message.reactions?.filter(r => r.emoji === '😊').length || 0}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum recado encontrado</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-2 text-sapere-orange hover:text-sapere-brown"
            >
              Publique o primeiro recado
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBoard;