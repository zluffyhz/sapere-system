// Painel de ações rápidas e relatórios

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  X, 
  Download, 
  FileText, 
  BarChart3, 
  Calendar as CalendarIcon, 
  Clock,
  TrendingUp,
  Activity,
  AlertCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

import type { Appointment, AppointmentStats } from '@/types/appointments';

interface QuickActionsPanelProps {
  appointments: Appointment[];
  stats: AppointmentStats | null;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
  onClose: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  appointments,
  stats,
  onExport,
  onClose
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  };

  const getTodayStats = () => {
    const today = new Date();
    const todayAppointments = appointments.filter(apt => {
      const appointmentDate = parseISO(apt.inicio);
      return appointmentDate.toDateString() === today.toDateString();
    });

    const byStatus = {
      total: todayAppointments.length,
      agendado: todayAppointments.filter(apt => apt.status === 'agendado').length,
      confirmado: todayAppointments.filter(apt => apt.status === 'confirmado').length,
      em_atendimento: todayAppointments.filter(apt => apt.status === 'em_atendimento').length,
      atendido: todayAppointments.filter(apt => apt.status === 'atendido').length,
      falta: todayAppointments.filter(apt => apt.status === 'falta').length,
      cancelado: todayAppointments.filter(apt => apt.status === 'cancelado').length
    };

    return {
      ...byStatus,
      completionRate: byStatus.total > 0 ? (byStatus.atendido / byStatus.total) * 100 : 0,
      noShowRate: byStatus.total > 0 ? (byStatus.falta / byStatus.total) * 100 : 0
    };
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => {
        const appointmentDate = parseISO(apt.inicio);
        return appointmentDate > now && apt.status !== 'cancelado';
      })
      .sort((a, b) => parseISO(a.inicio).getTime() - parseISO(b.inicio).getTime())
      .slice(0, 5);
  };

  const getPendingActions = () => {
    const now = new Date();
    const actions = [];

    // Appointments needing confirmation
    const needingConfirmation = appointments.filter(apt => {
      const appointmentDate = parseISO(apt.inicio);
      return apt.status === 'agendado' && 
             appointmentDate > now && 
             appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000; // Within 24 hours
    });

    if (needingConfirmation.length > 0) {
      actions.push({
        type: 'confirmation',
        count: needingConfirmation.length,
        message: `${needingConfirmation.length} agendamento${needingConfirmation.length !== 1 ? 's' : ''} precisam de confirmação`,
        icon: AlertCircle,
        color: 'text-yellow-600'
      });
    }

    // Appointments ready to start
    const readyToStart = appointments.filter(apt => {
      const appointmentDate = parseISO(apt.inicio);
      const now = new Date();
      return apt.status === 'confirmado' && 
             appointmentDate <= now && 
             appointmentDate.getTime() > now.getTime() - 15 * 60 * 1000; // Started less than 15 min ago
    });

    if (readyToStart.length > 0) {
      actions.push({
        type: 'start',
        count: readyToStart.length,
        message: `${readyToStart.length} atendimento${readyToStart.length !== 1 ? 's' : ''} prontos para iniciar`,
        icon: Activity,
        color: 'text-green-600'
      });
    }

    // Overdue appointments
    const overdue = appointments.filter(apt => {
      const appointmentEnd = parseISO(apt.fim);
      const now = new Date();
      return apt.status === 'em_atendimento' && appointmentEnd < now;
    });

    if (overdue.length > 0) {
      actions.push({
        type: 'overdue',
        count: overdue.length,
        message: `${overdue.length} atendimento${overdue.length !== 1 ? 's' : ''} em atraso`,
        icon: XCircle,
        color: 'text-red-600'
      });
    }

    return actions;
  };

  const todayStats = getTodayStats();
  const upcomingAppointments = getUpcomingAppointments();
  const pendingActions = getPendingActions();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-30"
        onClick={onClose}
      ></div>
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl border-l border-gray-200 z-40 overflow-y-auto">
        <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ações Rápidas
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Today's Statistics */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            Hoje
          </h4>
          
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Total de Agendamentos</span>
                <span className="text-lg font-bold text-sapere-brown">{todayStats.total}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmados:</span>
                  <span className="font-medium text-blue-600">{todayStats.confirmado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Atendidos:</span>
                  <span className="font-medium text-green-600">{todayStats.atendido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Em atendimento:</span>
                  <span className="font-medium text-yellow-600">{todayStats.em_atendimento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Faltas:</span>
                  <span className="font-medium text-red-600">{todayStats.falta}</span>
                </div>
              </div>
            </div>

            {todayStats.total > 0 && (
              <div className="bg-sapere-orange/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-sapere-brown">Taxa de Conclusão</span>
                  <span className="font-bold text-sapere-brown">
                    {todayStats.completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-sapere-orange h-2 rounded-full transition-all"
                    style={{ width: `${todayStats.completionRate}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pending Actions */}
        {pendingActions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Ações Pendentes
            </h4>
            
            <div className="space-y-2">
              {pendingActions.map((action, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                    <span className="text-sm text-gray-700">{action.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Próximos Agendamentos
          </h4>
          
          {upcomingAppointments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum agendamento próximo
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {appointment.patient?.nome}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(parseISO(appointment.inicio), 'HH:mm')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {appointment.professional?.nome}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(parseISO(appointment.inicio), 'EEEE, d MMM', { locale: ptBR })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overall Statistics */}
        {stats && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Estatísticas Gerais
            </h4>
            
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total</div>
                    <div className="font-bold text-gray-900">{stats.total}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Taxa Conclusão</div>
                    <div className="font-bold text-green-600">
                      {(stats.completionRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Taxa de Falta</div>
                    <div className="font-bold text-red-600">
                      {(stats.noShowRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Duração Média</div>
                    <div className="font-bold text-blue-600">
                      {stats.averageDuration}min
                    </div>
                  </div>
                </div>
              </div>

              {/* Peak Hours */}
              {stats.peakHours.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-700 mb-2">Horários de Pico</h5>
                  <div className="space-y-1">
                    {stats.peakHours.slice(0, 3).map(peak => (
                      <div key={peak.hour} className="flex justify-between text-xs">
                        <span className="text-gray-600">{peak.hour}h</span>
                        <span className="font-medium">{peak.count} agendamentos</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export Actions */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
            <Download className="h-4 w-4" />
            Exportar Dados
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Formato
              </label>
              <select
                value={selectedExportFormat}
                onChange={(e) => setSelectedExportFormat(e.target.value as 'pdf' | 'excel' | 'csv')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <button
              onClick={() => handleExport(selectedExportFormat)}
              disabled={isExporting}
              className="w-full btn-primary text-sm flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar {selectedExportFormat.toUpperCase()}
                </>
              )}
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="btn-secondary text-sm flex items-center justify-center gap-1"
              >
                <FileText className="h-3 w-3" />
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={isExporting}
                className="btn-secondary text-sm flex items-center justify-center gap-1"
              >
                <BarChart3 className="h-3 w-3" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-sapere-orange/10 rounded-lg p-3">
          <h5 className="text-sm font-semibold text-sapere-brown mb-2">Resumo Rápido</h5>
          <div className="text-xs text-sapere-brown space-y-1">
            <div className="flex justify-between">
              <span>Agendamentos hoje:</span>
              <span className="font-medium">{todayStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Próximos:</span>
              <span className="font-medium">{upcomingAppointments.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Ações pendentes:</span>
              <span className="font-medium">{pendingActions.reduce((sum, action) => sum + action.count, 0)}</span>
            </div>
            {stats && (
              <div className="flex justify-between pt-1 border-t border-sapere-orange/20">
                <span>Total geral:</span>
                <span className="font-medium">{stats.total}</span>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default QuickActionsPanel;