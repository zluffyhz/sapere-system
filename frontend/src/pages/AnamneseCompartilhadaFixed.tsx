// Página para gerenciar anamneses compartilhadas - VERSÃO CORRIGIDA

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  Users, 
  Star, 
  Eye, 
  Edit2, 
  Trash2,
  Copy,
  Download,
  MessageCircle,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import AnamneseUploadWithPatients from '@/components/anamnese/AnamneseUploadWithPatients';

const AnamneseCompartilhada: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');
  const [anamneses, setAnamneses] = useState<any[]>([]);

  // Dados mock temporários
  const mockAnamneses = [
    {
      id: '1',
      titulo: 'Anamnese Pediátrica - João Silva',
      categoria: 'pediatrica',
      pacienteNome: 'João Silva',
      queixaPrincipal: 'Dificuldades de concentração e organização nas tarefas escolares',
      createdAt: new Date().toISOString(),
      criador: { name: 'Admin Sapere' },
      tags: ['TDAH', 'Concentração'],
      visibilidade: 'publica',
      isFavorito: false,
      comentarios: []
    },
    {
      id: '2',
      titulo: 'Anamnese Neuropsicológica - Maria Santos',
      categoria: 'neuropsicologica',
      pacienteNome: 'Maria Santos',
      queixaPrincipal: 'Avaliação cognitiva para diagnóstico de autismo',
      createdAt: new Date().toISOString(),
      criador: { name: 'Dra. Maria Silva' },
      tags: ['Autismo', 'Avaliação'],
      visibilidade: 'publica',
      isFavorito: true,
      comentarios: []
    }
  ];

  const categorias = [
    { value: 'pediatrica', label: 'Pediátrica', color: 'bg-blue-100 text-blue-800' },
    { value: 'adulto', label: 'Adulto', color: 'bg-green-100 text-green-800' },
    { value: 'neuropsicologica', label: 'Neuropsicológica', color: 'bg-purple-100 text-purple-800' },
    { value: 'fonoaudiologica', label: 'Fonoaudiológica', color: 'bg-orange-100 text-orange-800' },
    { value: 'psicologica', label: 'Psicológica', color: 'bg-pink-100 text-pink-800' },
    { value: 'geral', label: 'Geral', color: 'bg-gray-100 text-gray-800' }
  ];

  const stats = {
    total: mockAnamneses.length,
    porVisibilidade: { publica: mockAnamneses.length },
    favoritosCount: mockAnamneses.filter(a => a.isFavorito).length,
    recentesCount: mockAnamneses.length
  };

  useEffect(() => {
    setAnamneses(mockAnamneses);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getCategoriaInfo = (categoria: string) => {
    return categorias.find(c => c.value === categoria) || categorias[5];
  };

  const filteredAnamneses = anamneses.filter(anamnese => 
    anamnese.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anamnese.pacienteNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Anamneses Compartilhadas
          </h1>
          <p className="text-gray-600 mt-1">
            Sistema de anamneses com upload de arquivos e busca por pacientes cadastrados
          </p>
        </div>

        <div className="flex gap-3">
          {activeTab === 'list' && (
            <>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>
              
              <button 
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar Anamnese
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-sapere-orange text-sapere-brown'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Anamneses Cadastradas
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-sapere-orange text-sapere-brown'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📤 Upload de Arquivos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'list' ? (
            <div className="space-y-6">
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-sapere-brown">{stats.total}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-sapere-orange" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Públicas</p>
                      <p className="text-2xl font-bold text-green-600">{stats.porVisibilidade.publica}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Favoritos</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.favoritosCount}</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Recentes</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.recentesCount}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Busca */}
              <div className="bg-gray-50 rounded-lg border">
                <div className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Buscar por título, paciente, queixa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Anamneses */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapere-orange mx-auto"></div>
                    <p className="text-gray-600 mt-4">Carregando anamneses...</p>
                  </div>
                ) : filteredAnamneses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Nenhuma anamnese encontrada
                    </h3>
                    <p className="text-gray-500">
                      Tente ajustar os filtros ou usar a aba de upload para adicionar uma nova anamnese
                    </p>
                  </div>
                ) : (
                  filteredAnamneses.map(anamnese => {
                    const categoriaInfo = getCategoriaInfo(anamnese.categoria);
                    
                    return (
                      <div key={anamnese.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {anamnese.titulo}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoriaInfo.color}`}>
                                {categoriaInfo.label}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Pública
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {anamnese.pacienteNome}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(anamnese.createdAt)}
                              </div>
                              <div>
                                Por: {anamnese.criador.name}
                              </div>
                            </div>

                            <p className="text-gray-700 mb-3">
                              <strong>Queixa:</strong> {truncateText(anamnese.queixaPrincipal, 200)}
                            </p>

                            {anamnese.tags.length > 0 && (
                              <div className="flex items-center gap-2 mb-3">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <div className="flex gap-1 flex-wrap">
                                  {anamnese.tags.map((tag: string) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MessageCircle className="h-4 w-4" />
                            {anamnese.comentarios?.length || 0} comentários
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              className={`p-2 rounded-lg transition-colors ${
                                anamnese.isFavorito 
                                  ? 'text-yellow-500 hover:bg-yellow-50' 
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title={anamnese.isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            >
                              <Star className={`h-4 w-4 ${anamnese.isFavorito ? 'fill-current' : ''}`} />
                            </button>

                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Duplicar"
                            >
                              <Copy className="h-4 w-4" />
                            </button>

                            <button
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Exportar PDF"
                            >
                              <Download className="h-4 w-4" />
                            </button>

                            {(user?.id === anamnese.criadoPor || user?.role === 'admin') && (
                              <>
                                <button
                                  className="p-2 text-sapere-brown hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>

                                <button
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <AnamneseUploadWithPatients
              onFileUploaded={(file) => {
                success(`Arquivo ${file.name} enviado com sucesso para ${file.patientName}`);
                console.log('Arquivo enviado:', file);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnamneseCompartilhada;