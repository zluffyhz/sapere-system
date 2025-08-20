// Página para gerenciar anamneses compartilhadas

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
import { anamneseAPI } from '@/services/api';
import { formatDate, truncateText } from '@/utils/formatting';
import AnamneseModal from '@/components/anamnese/AnamneseModal';
import AnamneseUploadWithPatients from '@/components/anamnese/AnamneseUploadWithPatients';
import syncService from '@/services/syncService';
import mockAnamneseAPI from '@/services/mockAnamnese';
import mockAppointmentsAPI, { mockAppointmentUtils } from '@/services/mockAppointments';
import type { 
  AnamneseCompartilhada, 
  AnamneseFilters, 
  AnamneseCategoria, 
  AnamneseVisibilidade,
  AnamneseStats,
  AnamneseTemplate,
  CreateAnamneseRequest
} from '@/types/anamnese';
import type { Professional, Patient } from '@/types/appointments';

const AnamneseCompartilhada: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  
  const [anamneses, setAnamneses] = useState<AnamneseCompartilhada[]>([]);
  const [stats, setStats] = useState<AnamneseStats | null>(null);
  const [templates, setTemplates] = useState<AnamneseTemplate[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AnamneseFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAnamnese, setSelectedAnamnese] = useState<AnamneseCompartilhada | null>(null);
  const [showAnamneseModal, setShowAnamneseModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');

  // Debug das abas - detectar mudanças
  useEffect(() => {
    console.log('=== DEBUG ABAS ANAMNESE COMPARTILHADA ===');
    console.log('Aba ativa atual:', activeTab);
    console.log('Timestamp:', new Date().toLocaleTimeString());
    console.log('==========================================');
  }, [activeTab]);

  const categorias: { value: AnamneseCategoria; label: string; color: string }[] = [
    { value: 'pediatrica', label: 'Pediátrica', color: 'bg-blue-100 text-blue-800' },
    { value: 'adulto', label: 'Adulto', color: 'bg-green-100 text-green-800' },
    { value: 'neuropsicologica', label: 'Neuropsicológica', color: 'bg-purple-100 text-purple-800' },
    { value: 'fonoaudiologica', label: 'Fonoaudiológica', color: 'bg-orange-100 text-orange-800' },
    { value: 'psicologica', label: 'Psicológica', color: 'bg-pink-100 text-pink-800' },
    { value: 'geral', label: 'Geral', color: 'bg-gray-100 text-gray-800' }
  ];

  const visibilidadeOptions: { value: AnamneseVisibilidade; label: string }[] = [
    { value: 'publica', label: 'Pública' }
  ];

  // Carregar dados iniciais
  useEffect(() => {
    loadAnamneses();
    loadStats();
    loadTemplates();
    loadProfessionalsAndPatients();

    // Configurar sincronização em tempo real - TEMPORARIAMENTE DESABILITADO
    // const unsubscribe = syncService.subscribe('anamnese', (event) => {
    //   console.log('📡 Evento de anamnese recebido:', event);
    //   
    //   // Recarregar dados quando houver mudanças
    //   if (event.userId !== user?.id) {
    //     switch (event.type) {
    //       case 'create':
    //         success(`Nova anamnese criada por outro usuário: ${event.data.titulo}`);
    //         loadAnamneses();
    //         loadStats();
    //         break;
    //       case 'update':
    //         success(`Anamnese atualizada por outro usuário`);
    //         loadAnamneses();
    //         break;
    //       case 'delete':
    //         success(`Anamnese excluída por outro usuário`);
    //         loadAnamneses();
    //         loadStats();
    //         break;
    //     }
    //   }
    // });

    // return () => {
    //   unsubscribe();
    // };
  }, [filters, searchTerm, currentPage, user?.id]);

  const loadAnamneses = async () => {
    try {
      setLoading(true);
      const result = await anamneseAPI.list({
        search: searchTerm || undefined,
        categoria: filters.categoria,
        visibilidade: filters.visibilidade,
        page: currentPage,
        limit: 20
      });
      
      setAnamneses(result.anamneses);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error('Erro ao carregar anamneses:', err);
      error('Erro ao carregar anamneses');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await anamneseAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesData = await mockAnamneseAPI.templates.list();
      setTemplates(templatesData);
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
    }
  };

  const loadProfessionalsAndPatients = async () => {
    try {
      const professionalsData = await mockAppointmentUtils.getProfessionals();
      const patientsData = await mockAppointmentUtils.getPatients();
      setProfessionals(professionalsData);
      setPatients(patientsData);
    } catch (err) {
      console.error('Erro ao carregar profissionais e pacientes:', err);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadAnamneses();
  };

  const handleToggleFavorito = async (anamneseId: string) => {
    try {
      const anamnese = anamneses.find(a => a.id === anamneseId);
      if (!anamnese) return;

      const isFavorito = await mockAnamneseAPI.favoritos.toggle(anamneseId, user?.id || '');
      success(isFavorito ? 'Adicionado aos favoritos' : 'Removido dos favoritos');

      // Atualizar estado local
      setAnamneses(prev => prev.map(a => 
        a.id === anamneseId ? { ...a, isFavorito: isFavorito } : a
      ));
    } catch (err) {
      error('Erro ao atualizar favoritos');
    }
  };

  const handleDuplicate = async (anamneseId: string) => {
    try {
      await mockAnamneseAPI.anamneses.duplicate(anamneseId);
      success('Anamnese duplicada com sucesso');
      loadAnamneses();
    } catch (err) {
      error('Erro ao duplicar anamnese');
    }
  };

  const handleDelete = async (anamneseId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta anamnese?')) return;
    
    try {
      await mockAnamneseAPI.anamneses.delete(anamneseId);
      success('Anamnese excluída com sucesso');
      loadAnamneses();
      loadStats();
    } catch (err) {
      error('Erro ao excluir anamnese');
    }
  };

  const handleExportPDF = async (anamneseId: string) => {
    try {
      // Simular export de PDF
      const anamnese = anamneses.find(a => a.id === anamneseId);
      if (!anamnese) return;
      
      const content = `Anamnese: ${anamnese.titulo}\nPaciente: ${anamnese.pacienteNome}\nProfissional: ${anamnese.profissional?.nome || 'N/A'}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `anamnese-${anamneseId}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
      success('Arquivo exportado com sucesso');
    } catch (err) {
      error('Erro ao exportar arquivo');
    }
  };

  const handleCreateAnamnese = () => {
    setSelectedAnamnese(null);
    setShowAnamneseModal(true);
  };

  const handleEditAnamnese = (anamnese: AnamneseCompartilhada) => {
    setSelectedAnamnese(anamnese);
    setShowAnamneseModal(true);
  };

  const handleSaveAnamnese = async (data: CreateAnamneseRequest) => {
    try {
      if (selectedAnamnese) {
        await anamneseAPI.update(selectedAnamnese.id, data);
        success('Anamnese atualizada com sucesso');
      } else {
        await anamneseAPI.create(data);
        success('Anamnese criada com sucesso');
      }
      
      loadAnamneses();
      loadStats();
      setShowAnamneseModal(false);
    } catch (err) {
      error('Erro ao salvar anamnese');
      throw err;
    }
  };

  const getCategoriaInfo = (categoria: AnamneseCategoria) => {
    return categorias.find(c => c.value === categoria) || categorias[5];
  };

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
            Biblioteca compartilhada de anamneses para toda a equipe
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
                onClick={handleCreateAnamnese}
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
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📋 ANTES: aba atual =', activeTab);
                console.log('📋 Clicando na aba ANAMNESES CADASTRADAS');
                setActiveTab('list');
                console.log('📋 DEPOIS: mudando para = list');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-sapere-orange text-sapere-brown'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{
                position: 'relative',
                zIndex: 10,
                cursor: 'pointer'
              }}
            >
              📋 Anamneses Cadastradas
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📤 ANTES: aba atual =', activeTab);
                console.log('📤 Clicando na aba UPLOAD DE ARQUIVOS');
                setActiveTab('upload');
                console.log('📤 DEPOIS: mudando para = upload');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-sapere-orange text-sapere-brown'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{
                position: 'relative',
                zIndex: 10,
                cursor: 'pointer'
              }}
            >
              📤 Upload de Arquivos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'list' ? (
            <div className="space-y-6">
              {/* Estatísticas */}
              {stats && (
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
                        <p className="text-2xl font-bold text-green-600">{stats.porVisibilidade.publica || 0}</p>
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
              )}

              {/* Busca e Filtros */}
              <div className="bg-gray-50 rounded-lg border">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Buscar por título, paciente, queixa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="btn-primary px-6"
                    >
                      Buscar
                    </button>
                  </div>
                </div>

                {/* Filtros avançados */}
                {showFilters && (
                  <div className="p-4 bg-gray-100 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Categoria
                        </label>
                        <select
                          value={filters.categoria || ''}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            categoria: e.target.value as AnamneseCategoria || undefined 
                          }))}
                          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                        >
                          <option value="">Todas as categorias</option>
                          {categorias.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Visibilidade
                        </label>
                        <select
                          value={filters.visibilidade || ''}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            visibilidade: e.target.value as AnamneseVisibilidade || undefined 
                          }))}
                          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                        >
                          <option value="">Todas as visibilidades</option>
                          {visibilidadeOptions.map(vis => (
                            <option key={vis.value} value={vis.value}>{vis.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setFilters({});
                            setSearchTerm('');
                          }}
                          className="btn-secondary w-full"
                        >
                          Limpar Filtros
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de Anamneses */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapere-orange mx-auto"></div>
                    <p className="text-gray-600 mt-4">Carregando anamneses...</p>
                  </div>
                ) : anamneses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Nenhuma anamnese encontrada
                    </h3>
                    <p className="text-gray-500">
                      Tente ajustar os filtros ou criar uma nova anamnese
                    </p>
                  </div>
                ) : (
                  anamneses.map(anamnese => {
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
                              {anamnese.visibilidade === 'publica' && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  Pública
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {anamnese.pacienteNome}
                                {anamnese.pacienteIdade && `, ${anamnese.pacienteIdade} anos`}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(anamnese.createdAt)}
                              </div>
                              {anamnese.criador && (
                                <div>
                                  Por: {anamnese.criador.name}
                                </div>
                              )}
                            </div>

                            <p className="text-gray-700 mb-3">
                              <strong>Queixa:</strong> {truncateText(anamnese.queixaPrincipal, 200)}
                            </p>

                            {anamnese.tags.length > 0 && (
                              <div className="flex items-center gap-2 mb-3">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <div className="flex gap-1 flex-wrap">
                                  {anamnese.tags.slice(0, 3).map(tag => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {anamnese.tags.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                      +{anamnese.tags.length - 3} mais
                                    </span>
                                  )}
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
                              onClick={() => handleToggleFavorito(anamnese.id)}
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
                              onClick={() => {
                                setSelectedAnamnese(anamnese);
                                setShowAnamneseModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDuplicate(anamnese.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Duplicar"
                            >
                              <Copy className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleExportPDF(anamnese.id)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Exportar PDF"
                            >
                              <Download className="h-4 w-4" />
                            </button>

                            {(user?.id === anamnese.criadoPor || user?.role === 'admin') && (
                              <>
                                <button
                                  onClick={() => handleEditAnamnese(anamnese)}
                                  className="p-2 text-sapere-brown hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => handleDelete(anamnese.id)}
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

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  
                  <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          ) : (
            <AnamneseUploadWithPatients
              onFileUploaded={(file) => {
                success(`Arquivo ${file.name} enviado com sucesso para ${file.patientName}`);
                // Aqui você pode adicionar lógica para salvar no banco de dados
              }}
            />
          )}
        </div>
      </div>

      {/* Anamnese Modal */}
      {showAnamneseModal && (
        <AnamneseModal
          anamnese={selectedAnamnese}
          templates={templates}
          professionals={professionals}
          patients={patients}
          onSave={handleSaveAnamnese}
          onClose={() => setShowAnamneseModal(false)}
        />
      )}
    </div>
  );
};

export default AnamneseCompartilhada;