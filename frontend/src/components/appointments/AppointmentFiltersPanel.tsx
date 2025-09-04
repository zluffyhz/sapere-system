// Painel de filtros avançados para agendamentos

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Filter, 
  Calendar as CalendarIcon, 
  User, 
  MapPin, 
  Search,
  Tag,
  Clock,
  RotateCcw
} from 'lucide-react';

import type { 
  AppointmentFilters, 
  AppointmentStatus, 
  Professional 
} from '@/types/appointments';

interface AppointmentFiltersPanelProps {
  filters: AppointmentFilters;
  professionals: Professional[];
  onFiltersChange: (filters: AppointmentFilters) => void;
  onClose: () => void;
}

const AppointmentFiltersPanel: React.FC<AppointmentFiltersPanelProps> = ({
  filters,
  professionals,
  onFiltersChange,
  onClose
}) => {
  const [localFilters, setLocalFilters] = useState<AppointmentFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const statusOptions: { value: AppointmentStatus; label: string; color: string }[] = [
    { value: 'agendado', label: 'Agendado', color: 'bg-yellow-500' },
    { value: 'confirmado', label: 'Confirmado', color: 'bg-blue-500' },
    { value: 'em_atendimento', label: 'Em Atendimento', color: 'bg-green-500' },
    { value: 'atendido', label: 'Atendido', color: 'bg-green-800' },
    { value: 'falta', label: 'Falta', color: 'bg-red-500' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-gray-500' }
  ];

  const roomOptions = [
    'Sala 1',
    'Sala 2', 
    'Sala 3',
    'Consultório A',
    'Consultório B',
    'Sala de Terapia Ocupacional',
    'Sala de Fonoaudiologia',
    'Sala de Psicologia'
  ];

  const handleFilterChange = (key: keyof AppointmentFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleStatusToggle = (status: AppointmentStatus) => {
    const currentStatuses = Array.isArray(localFilters.status) 
      ? localFilters.status 
      : localFilters.status 
        ? [localFilters.status] 
        : [];

    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];

    handleFilterChange('status', newStatuses.length > 0 ? newStatuses : undefined);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const clearFilters = () => {
    const emptyFilters: AppointmentFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.professionalId) count++;
    if (localFilters.patientId) count++;
    if (localFilters.status) count++;
    if (localFilters.startDate) count++;
    if (localFilters.endDate) count++;
    if (localFilters.sala) count++;
    if (localFilters.search) count++;
    if (localFilters.isRecurring !== undefined) count++;
    if (localFilters.tags?.length) count++;
    return count;
  };

  const selectedStatuses = Array.isArray(localFilters.status) 
    ? localFilters.status 
    : localFilters.status 
      ? [localFilters.status] 
      : [];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros Avançados</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-sapere-orange text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Limpar
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              Período
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={localFilters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                placeholder="Data inicial"
              />
              <input
                type="date"
                value={localFilters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                placeholder="Data final"
              />
            </div>
          </div>

          {/* Professional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <User className="h-4 w-4" />
              Profissional
            </label>
            <select
              value={localFilters.professionalId || ''}
              onChange={(e) => handleFilterChange('professionalId', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            >
              <option value="">Todos os profissionais</option>
              {professionals.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Sala
            </label>
            <select
              value={localFilters.sala || ''}
              onChange={(e) => handleFilterChange('sala', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            >
              <option value="">Todas as salas</option>
              {roomOptions.map(room => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Search className="h-4 w-4" />
              Buscar
            </label>
            <input
              type="text"
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
              placeholder="Nome do paciente, motivo..."
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => {
              const isSelected = selectedStatuses.includes(status.value);
              return (
                <button
                  key={status.value}
                  onClick={() => handleStatusToggle(status.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-sapere-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  {status.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recurring Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Agendamento
            </label>
            <select
              value={
                localFilters.isRecurring === undefined 
                  ? '' 
                  : localFilters.isRecurring 
                    ? 'true' 
                    : 'false'
              }
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange(
                  'isRecurring', 
                  value === '' ? undefined : value === 'true'
                );
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            >
              <option value="">Todos</option>
              <option value="false">Único</option>
              <option value="true">Recorrente</option>
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Tags
            </label>
            <input
              type="text"
              value={localFilters.tags?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
                handleFilterChange('tags', tags.length > 0 ? tags : undefined);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
              placeholder="primeira_consulta, retorno, terapia..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Separe as tags por vírgula
            </p>
          </div>
        </div>

        {/* Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-6 p-3 bg-sapere-orange/10 rounded-lg">
            <p className="text-sm text-sapere-brown">
              <strong>{getActiveFiltersCount()}</strong> filtro{getActiveFiltersCount() !== 1 ? 's' : ''} ativo{getActiveFiltersCount() !== 1 ? 's' : ''}:
              {localFilters.professionalId && (
                <span className="ml-2 inline-block bg-white px-2 py-1 rounded text-xs">
                  Profissional
                </span>
              )}
              {localFilters.sala && (
                <span className="ml-2 inline-block bg-white px-2 py-1 rounded text-xs">
                  Sala
                </span>
              )}
              {selectedStatuses.length > 0 && (
                <span className="ml-2 inline-block bg-white px-2 py-1 rounded text-xs">
                  Status ({selectedStatuses.length})
                </span>
              )}
              {(localFilters.startDate || localFilters.endDate) && (
                <span className="ml-2 inline-block bg-white px-2 py-1 rounded text-xs">
                  Período
                </span>
              )}
              {localFilters.search && (
                <span className="ml-2 inline-block bg-white px-2 py-1 rounded text-xs">
                  Busca
                </span>
              )}
              {localFilters.isRecurring !== undefined && (
                <span className="ml-2 inline-block bg-white px-2 py-1 rounded text-xs">
                  {localFilters.isRecurring ? 'Recorrente' : 'Único'}
                </span>
              )}
              {localFilters.tags?.length && (
                <span className="ml-2 inline-block bg-white px-2 py-1 rounded text-xs">
                  Tags ({localFilters.tags.length})
                </span>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancelar
          </button>
          
          <button
            onClick={applyFilters}
            className="btn-primary"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentFiltersPanel;