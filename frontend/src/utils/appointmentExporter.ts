import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import type { Appointment, AppointmentFilters } from '../types/appointments';

export interface ExportOptions {
  title?: string;
  clinicInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  includeStatistics?: boolean;
}

export class AppointmentExporter {
  
  // Exportar para PDF
  static async exportToPDF(
    appointments: Appointment[], 
    filters: AppointmentFilters,
    options: ExportOptions = {}
  ): Promise<void> {
    const pdf = new jsPDF();
    let currentY = 20;
    const leftMargin = 20;
    const pageWidth = 170;
    const pageHeight = 280;

    // Função para verificar quebra de página
    const checkPageBreak = (neededSpace: number) => {
      if (currentY + neededSpace > pageHeight) {
        pdf.addPage();
        currentY = 20;
      }
    };

    // Header da clínica
    if (options.clinicInfo) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(options.clinicInfo.name, leftMargin, currentY);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      currentY += 7;
      pdf.text(options.clinicInfo.address, leftMargin, currentY);
      currentY += 5;
      pdf.text(`Tel: ${options.clinicInfo.phone} | Email: ${options.clinicInfo.email}`, leftMargin, currentY);
      currentY += 15;
      
      // Linha separadora
      pdf.line(leftMargin, currentY, leftMargin + pageWidth, currentY);
      currentY += 10;
    }

    // Título do relatório
    const title = options.title || 'RELATÓRIO DE AGENDAMENTOS';
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    const titleWidth = pdf.getTextWidth(title);
    const titleX = (pdf.internal.pageSize.getWidth() - titleWidth) / 2;
    pdf.text(title, titleX, currentY);
    currentY += 15;

    // Período e filtros
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    if (filters.startDate || filters.endDate) {
      const startDate = filters.startDate ? format(new Date(filters.startDate), 'dd/MM/yyyy') : 'Início';
      const endDate = filters.endDate ? format(new Date(filters.endDate), 'dd/MM/yyyy') : 'Presente';
      pdf.text(`Período: ${startDate} até ${endDate}`, leftMargin, currentY);
      currentY += 5;
    }

    if (filters.professionalId) {
      pdf.text(`Filtro por profissional aplicado`, leftMargin, currentY);
      currentY += 5;
    }

    if (filters.status) {
      pdf.text(`Status filtrado: ${filters.status}`, leftMargin, currentY);
      currentY += 5;
    }

    pdf.text(`Total de agendamentos: ${appointments.length}`, leftMargin, currentY);
    currentY += 15;

    // Estatísticas se solicitadas
    if (options.includeStatistics && appointments.length > 0) {
      checkPageBreak(40);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ESTATÍSTICAS', leftMargin, currentY);
      currentY += 10;

      const stats = this.calculateStats(appointments);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      Object.entries(stats.byStatus).forEach(([status, count]) => {
        pdf.text(`${status}: ${count} agendamentos`, leftMargin + 5, currentY);
        currentY += 5;
      });
      
      currentY += 5;
      pdf.text(`Profissionais envolvidos: ${stats.uniqueProfessionals}`, leftMargin, currentY);
      currentY += 5;
      pdf.text(`Pacientes únicos: ${stats.uniquePatients}`, leftMargin, currentY);
      currentY += 15;
    }

    // Lista de agendamentos
    if (appointments.length > 0) {
      checkPageBreak(20);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AGENDAMENTOS', leftMargin, currentY);
      currentY += 10;

      appointments.forEach((appointment, index) => {
        checkPageBreak(25);
        
        // Número do agendamento
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}.`, leftMargin, currentY);
        
        // Dados do agendamento
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${appointment.patient?.nome || 'N/A'}`, leftMargin + 10, currentY);
        currentY += 5;
        
        const dateStr = format(parseISO(appointment.inicio), 'dd/MM/yyyy');
        const timeStr = `${format(parseISO(appointment.inicio), 'HH:mm')} - ${format(parseISO(appointment.fim), 'HH:mm')}`;
        pdf.text(`Data: ${dateStr} | Horário: ${timeStr}`, leftMargin + 10, currentY);
        currentY += 5;
        
        pdf.text(`Profissional: ${appointment.professional?.nome || 'N/A'}`, leftMargin + 10, currentY);
        currentY += 5;
        
        pdf.text(`Status: ${appointment.status} | Sala: ${appointment.sala || 'N/A'}`, leftMargin + 10, currentY);
        currentY += 5;
        
        if (appointment.motivo) {
          const motivoLines = pdf.splitTextToSize(`Motivo: ${appointment.motivo}`, pageWidth - 10);
          motivoLines.forEach((line: string) => {
            checkPageBreak(5);
            pdf.text(line, leftMargin + 10, currentY);
            currentY += 5;
          });
        }
        
        currentY += 3;
      });
    }

    // Rodapé
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      const footerText = `Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')} - Página ${i} de ${pageCount}`;
      const textWidth = pdf.getTextWidth(footerText);
      const x = (pdf.internal.pageSize.getWidth() - textWidth) / 2;
      
      pdf.text(footerText, x, 290);
    }

    // Salvar arquivo
    const fileName = `agendamentos_${format(new Date(), 'ddMMyyyy_HHmm')}.pdf`;
    pdf.save(fileName);
  }

  // Exportar para Excel
  static async exportToExcel(
    appointments: Appointment[], 
    filters: AppointmentFilters,
    options: ExportOptions = {}
  ): Promise<void> {
    // Preparar dados para Excel
    const data = appointments.map((appointment, index) => ({
      'Nº': index + 1,
      'Data': format(parseISO(appointment.inicio), 'dd/MM/yyyy'),
      'Horário Início': format(parseISO(appointment.inicio), 'HH:mm'),
      'Horário Fim': format(parseISO(appointment.fim), 'HH:mm'),
      'Paciente': appointment.patient?.nome || 'N/A',
      'Profissional': appointment.professional?.nome || 'N/A',
      'Especialidade': appointment.professional?.especialidade || 'N/A',
      'Status': appointment.status,
      'Sala': appointment.sala || 'N/A',
      'Motivo': appointment.motivo || 'N/A',
      'Confirmado': appointment.confirmationSent ? 'Sim' : 'Não',
      'Observações': appointment.notas || ''
    }));

    // Criar workbook
    const workbook = XLSX.utils.book_new();
    
    // Planilha principal com dados
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Configurar larguras das colunas
    const columnWidths = [
      { wch: 5 },   // Nº
      { wch: 12 },  // Data
      { wch: 10 },  // Horário Início
      { wch: 10 },  // Horário Fim
      { wch: 25 },  // Paciente
      { wch: 25 },  // Profissional
      { wch: 15 },  // Especialidade
      { wch: 12 },  // Status
      { wch: 8 },   // Sala
      { wch: 30 },  // Motivo
      { wch: 10 },  // Confirmado
      { wch: 30 }   // Observações
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agendamentos');

    // Adicionar planilha de estatísticas se solicitada
    if (options.includeStatistics && appointments.length > 0) {
      const stats = this.calculateStats(appointments);
      
      const statsData = [
        { Métrica: 'Total de Agendamentos', Valor: appointments.length },
        { Métrica: 'Profissionais Únicos', Valor: stats.uniqueProfessionals },
        { Métrica: 'Pacientes Únicos', Valor: stats.uniquePatients },
        { Métrica: '', Valor: '' }, // Linha vazia
        { Métrica: 'Estatísticas por Status:', Valor: '' },
        ...Object.entries(stats.byStatus).map(([status, count]) => ({
          Métrica: status,
          Valor: count
        }))
      ];

      const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
      statsWorksheet['!cols'] = [{ wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estatísticas');
    }

    // Adicionar informações do filtro
    const filterData = [
      { Campo: 'Data Geração', Valor: format(new Date(), 'dd/MM/yyyy HH:mm') },
      { Campo: 'Período Início', Valor: filters.startDate ? format(new Date(filters.startDate), 'dd/MM/yyyy') : 'N/A' },
      { Campo: 'Período Fim', Valor: filters.endDate ? format(new Date(filters.endDate), 'dd/MM/yyyy') : 'N/A' },
      { Campo: 'Status Filtrado', Valor: filters.status || 'Todos' },
      { Campo: 'Profissional', Valor: filters.professionalId ? 'Filtrado' : 'Todos' }
    ];

    const filterWorksheet = XLSX.utils.json_to_sheet(filterData);
    filterWorksheet['!cols'] = [{ wch: 20 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, filterWorksheet, 'Filtros');

    // Salvar arquivo
    const fileName = `agendamentos_${format(new Date(), 'ddMMyyyy_HHmm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  // Exportar para CSV
  static async exportToCSV(
    appointments: Appointment[], 
    _filters: AppointmentFilters,
    _options: ExportOptions = {}
  ): Promise<void> {
    const headers = [
      'Data',
      'Horário Início', 
      'Horário Fim',
      'Paciente',
      'Profissional',
      'Especialidade',
      'Status',
      'Sala',
      'Motivo',
      'Confirmado',
      'Observações'
    ];

    const csvData = [
      headers.join(','),
      ...appointments.map(appointment => [
        format(parseISO(appointment.inicio), 'dd/MM/yyyy'),
        format(parseISO(appointment.inicio), 'HH:mm'),
        format(parseISO(appointment.fim), 'HH:mm'),
        `"${appointment.patient?.nome || 'N/A'}"`,
        `"${appointment.professional?.nome || 'N/A'}"`,
        `"${appointment.professional?.especialidade || 'N/A'}"`,
        appointment.status,
        appointment.sala || 'N/A',
        `"${appointment.motivo || 'N/A'}"`,
        appointment.confirmationSent ? 'Sim' : 'Não',
        `"${appointment.notas || ''}"`
      ].join(','))
    ];

    const csvContent = csvData.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `agendamentos_${format(new Date(), 'ddMMyyyy_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Calcular estatísticas
  private static calculateStats(appointments: Appointment[]) {
    const byStatus = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueProfessionals = new Set(appointments.map(a => a.professionalId)).size;
    const uniquePatients = new Set(appointments.map(a => a.patientId)).size;

    return {
      byStatus,
      uniqueProfessionals,
      uniquePatients
    };
  }
}