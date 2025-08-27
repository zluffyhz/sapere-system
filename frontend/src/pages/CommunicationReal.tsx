import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Send, 
  Phone, 
  Mail, 
  Calendar,
  User,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

interface Communication {
  id: string;
  patientName: string;
  type: 'call' | 'email' | 'whatsapp' | 'message';
  subject: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  status: 'pending' | 'sent' | 'received' | 'read';
  createdAt: string;
  createdBy: string;
  contactInfo?: string;
}

const CommunicationReal: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    patientName: '',
    type: 'message' as Communication['type'],
    subject: '',
    content: '',
    contactInfo: ''
  });

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = () => {
    setIsLoading(true);
    try {
      const saved = localStorage.getItem('sapere_communications');
      if (saved) {
        setCommunications(JSON.parse(saved));
      } else {
        // Dados mock para demonstração
        const mockCommunications: Communication[] = [
          {
            id: '1',
            patientName: 'João Silva',
            type: 'whatsapp',
            subject: 'Confirmação de consulta',
            content: 'Confirmando presença na consulta de amanhã às 09:00.',
            direction: 'outgoing',
            status: 'sent',
            createdAt: new Date().toISOString(),
            createdBy: user?.name || 'Admin',
            contactInfo: '(11) 99999-9999'
          },
          {
            id: '2',
            patientName: 'Ana Costa',
            type: 'email',
            subject: 'Relatório de sessão',
            content: 'Segue em anexo o relatório da sessão de hoje. A paciente apresentou ótima evolução.',
            direction: 'outgoing', 
            status: 'sent',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            createdBy: user?.name || 'Admin',
            contactInfo: 'ana@email.com'
          },
          {
            id: '3',
            patientName: 'Maria Silva',
            type: 'call',
            subject: 'Reagendamento',
            content: 'Paciente solicitou reagendamento da consulta da próxima semana.',
            direction: 'incoming',
            status: 'received',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            createdBy: 'Recepção',
            contactInfo: '(11) 88888-8888'
          }
        ];
        localStorage.setItem('sapere_communications', JSON.stringify(mockCommunications));
        setCommunications(mockCommunications);
      }
    } catch (err) {
      error('Erro ao carregar comunicações');
    } finally {
      setIsLoading(false);
    }
  };

  const saveCommunications = (updated: Communication[]) => {
    localStorage.setItem('sapere_communications', JSON.stringify(updated));
    setCommunications(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.content) {
      error('Nome do paciente e conteúdo são obrigatórios');
      return;
    }

    const newCommunication: Communication = {
      id: Date.now().toString(),
      patientName: formData.patientName,
      type: formData.type,
      subject: formData.subject,
      content: formData.content,
      direction: 'outgoing',
      status: 'sent',
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Sistema',
      contactInfo: formData.contactInfo
    };

    const updated = [newCommunication, ...communications];
    saveCommunications(updated);
    
    resetForm();
    setShowModal(false);
    success('Comunicação registrada com sucesso!');
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      type: 'message',
      subject: '',
      content: '',
      contactInfo: ''
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'call': return 'Ligação';
      case 'email': return 'Email';
      case 'whatsapp': return 'WhatsApp';
      default: return 'Mensagem';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'sent': return 'Enviado';
      case 'received': return 'Recebido';
      case 'read': return 'Lido';
      default: return status;
    }
  };

  const filteredCommunications = communications
    .filter(comm => {
      const matchesSearch = comm.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           comm.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || comm.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const todayCommunications = communications.filter(c => 
    format(new Date(c.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown">Comunicação</h1>
          <p className="text-gray-600">Gerencie comunicações com pacientes e responsáveis</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Comunicação</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-sapere-brown">{communications.length}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-sapere-orange" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoje</p>
              <p className="text-2xl font-bold text-blue-600">{todayCommunications.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ligações</p>
              <p className="text-2xl font-bold text-green-600">
                {communications.filter(c => c.type === 'call').length}
              </p>
            </div>
            <Phone className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mensagens</p>
              <p className="text-2xl font-bold text-purple-600">
                {communications.filter(c => c.type === 'whatsapp' || c.type === 'message').length}
              </p>
            </div>
            <MessageCircle className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar comunicações..."
              className="pl-10 input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <select
            className="input-field"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todos os tipos</option>
            <option value="call">Ligações</option>
            <option value="email">Emails</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="message">Mensagens</option>
          </select>
        </div>
      </div>

      {/* Lista de Comunicações */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapere-orange"></div>
          </div>
        ) : filteredCommunications.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma comunicação encontrada' : 'Nenhuma comunicação registrada'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Tente ajustar os termos da pesquisa' : 'Registre uma nova comunicação'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommunications.map((comm) => (
              <div key={comm.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      comm.direction === 'outgoing' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {getTypeIcon(comm.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{comm.patientName}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{getTypeLabel(comm.type)}</span>
                        <span>•</span>
                        <span>{format(new Date(comm.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                        <span>•</span>
                        <span>{comm.createdBy}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(comm.status)}`}>
                    {getStatusLabel(comm.status)}
                  </span>
                </div>

                {comm.subject && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Assunto: </span>
                    <span className="text-sm text-gray-900">{comm.subject}</span>
                  </div>
                )}

                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Conteúdo: </span>
                  <span className="text-sm text-gray-900">{comm.content}</span>
                </div>

                {comm.contactInfo && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Contato: </span>
                    <span>{comm.contactInfo}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-sapere-brown">Nova Comunicação</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Paciente/Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Comunicação
                  </label>
                  <select
                    className="input-field"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Communication['type'] })}
                  >
                    <option value="message">Mensagem</option>
                    <option value="call">Ligação</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contato (Telefone/Email)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  placeholder="(92) 99999-9999 ou email@exemplo.com"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo da Comunicação *
                </label>
                <textarea
                  required
                  className="input-field"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Descreva o conteúdo da comunicação..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Registrar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="https://wa.me/5592992305850"
          target="_blank"
          rel="noopener noreferrer"
          className="card hover:bg-green-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-full">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">WhatsApp da Clínica</h3>
              <p className="text-sm text-gray-600">(92) 99230-5850</p>
            </div>
          </div>
        </a>

        <a
          href="mailto:Sapere.recepcao@gmail.com"
          className="card hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email da Clínica</h3>
              <p className="text-sm text-gray-600">Sapere.recepcao@gmail.com</p>
            </div>
          </div>
        </a>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <Phone className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Telefone</h3>
              <p className="text-sm text-gray-600">(92) 99230-5850</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationReal;