import { useState } from 'react';
import { MessageSquare, Plus, Search, Send, Phone, Mail, MessageCircle, Users, Calendar } from 'lucide-react';

interface Message {
  id: string;
  type: 'email' | 'whatsapp' | 'sms' | 'call';
  recipient: string;
  subject?: string;
  content: string;
  date: string;
  status: 'sent' | 'delivered' | 'read' | 'pending';
}

export default function Communications() {
  const [activeTab, setActiveTab] = useState<'messages' | 'templates' | 'scheduled'>('messages');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const messages: Message[] = [
    {
      id: '1',
      type: 'whatsapp',
      recipient: 'Maria Silva (mãe de João)',
      subject: 'Lembrete de consulta',
      content: 'Olá Maria! Lembrando que a consulta do João está agendada para amanhã às 14:00.',
      date: '2024-03-15 10:30',
      status: 'read'
    },
    {
      id: '2',
      type: 'email',
      recipient: 'carlos.santos@email.com',
      subject: 'Relatório de avaliação neuropsicológica',
      content: 'Segue em anexo o relatório da avaliação neuropsicológica da Ana.',
      date: '2024-03-14 16:45',
      status: 'delivered'
    },
    {
      id: '3',
      type: 'sms',
      recipient: 'Pedro Souza',
      content: 'Sua consulta foi reagendada para sexta-feira, 16h. Confirme o recebimento.',
      date: '2024-03-14 14:20',
      status: 'delivered'
    },
    {
      id: '4',
      type: 'call',
      recipient: 'Ana Costa',
      content: 'Ligação para esclarecimentos sobre o tratamento',
      date: '2024-03-13 11:15',
      status: 'sent'
    }
  ];

  const templates = [
    {
      id: '1',
      name: 'Lembrete de Consulta',
      content: 'Olá {nome_responsavel}! Lembrando que a consulta do(a) {nome_paciente} está agendada para {data} às {hora}.',
      type: 'whatsapp'
    },
    {
      id: '2',
      name: 'Confirmação de Agendamento',
      content: 'Sua consulta foi agendada com sucesso para {data} às {hora}. Local: Clínica Sapere.',
      type: 'sms'
    },
    {
      id: '3',
      name: 'Relatório Enviado',
      content: 'O relatório da avaliação está pronto e foi enviado por email. Em caso de dúvidas, entre em contato.',
      type: 'email'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="text-green-600" size={16} />;
      case 'email': return <Mail className="text-blue-600" size={16} />;
      case 'sms': return <MessageSquare className="text-purple-600" size={16} />;
      case 'call': return <Phone className="text-orange-600" size={16} />;
      default: return <MessageSquare className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'read': return 'Lido';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  const filteredMessages = messages.filter(message =>
    message.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Comunicação</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie mensagens, emails e comunicações com pacientes
          </p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
          <Plus size={20} className="mr-2" />
          Nova Mensagem
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <MessageSquare className="text-pink-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total de Mensagens</p>
              <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Send className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Enviadas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Contatos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">48</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Agendadas</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'messages', label: 'Mensagens', icon: MessageSquare },
              { key: 'templates', label: 'Modelos', icon: Mail },
              { key: 'scheduled', label: 'Agendadas', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar mensagens..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Messages List */}
              <div className="space-y-3">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getTypeIcon(message.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{message.recipient}</h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                              {getStatusLabel(message.status)}
                            </span>
                          </div>
                          {message.subject && (
                            <p className="text-sm font-medium text-gray-700 mb-1">{message.subject}</p>
                          )}
                          <p className="text-sm text-gray-600">{message.content}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{new Date(message.date).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Modelos de Mensagem</h3>
                <button className="inline-flex items-center px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm">
                  <Plus size={16} className="mr-2" />
                  Novo Modelo
                </button>
              </div>

              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          {getTypeIcon(template.type)}
                        </div>
                        <p className="text-sm text-gray-600">{template.content}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Usar</button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm">Editar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma mensagem agendada</h3>
              <p className="mt-1 text-sm text-gray-500">
                As mensagens agendadas aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}