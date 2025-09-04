import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import type { Patient, MedicalRecord } from '../types/medical-record';

export interface PDFExportOptions {
  includeAttachments?: boolean;
  includeSignature?: boolean;
  watermark?: string;
  headerInfo?: {
    clinicName: string;
    clinicAddress: string;
    clinicPhone: string;
  };
}

export class PDFExporter {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280; // A4 height minus margins
  private leftMargin: number = 20;
  // private rightMargin: number = 20;
  private pageWidth: number = 170; // A4 width minus margins

  constructor() {
    this.pdf = new jsPDF();
  }

  // Exportar registro individual
  async exportRecord(
    record: MedicalRecord, 
    patient: Patient, 
    options: PDFExportOptions = {}
  ): Promise<void> {
    this.setupFonts();
    
    // Header da clínica
    if (options.headerInfo) {
      this.addClinicHeader(options.headerInfo);
    }

    // Cabeçalho do documento
    this.addTitle('PRONTUÁRIO MÉDICO', 16);
    this.addLineBreak(10);

    // Informações do paciente
    this.addPatientInfo(patient);
    this.addLineBreak(10);

    // Informações da sessão
    this.addSessionInfo(record);
    this.addLineBreak(10);

    // Conteúdo principal
    this.addSectionTitle('EVOLUÇÃO DA SESSÃO');
    this.addText(record.content.evolution);
    this.addLineBreak(10);

    // Observações comportamentais
    if (record.content.behavioral_observations.length > 0) {
      this.addSectionTitle('OBSERVAÇÕES COMPORTAMENTAIS');
      record.content.behavioral_observations.forEach(obs => {
        this.addText(`• ${obs.category.toUpperCase()}: ${obs.description}`);
        if (obs.result) {
          this.addText(`  Resultado: ${obs.result}`, 10);
        }
        this.addLineBreak(3);
      });
      this.addLineBreak(5);
    }

    // Marcos alcançados
    if (record.content.milestones_achieved.length > 0) {
      this.addSectionTitle('MARCOS TERAPÊUTICOS ALCANÇADOS');
      record.content.milestones_achieved.forEach(milestone => {
        this.addText(`• ${milestone.description}`);
        this.addText(`  Categoria: ${milestone.category} | Idade: ${milestone.age_at_achievement}`, 10);
        if (milestone.notes) {
          this.addText(`  Observações: ${milestone.notes}`, 10);
        }
        this.addLineBreak(3);
      });
      this.addLineBreak(5);
    }

    // Metas terapêuticas
    if (record.goals.length > 0) {
      this.addSectionTitle('METAS TERAPÊUTICAS');
      record.goals.forEach(goal => {
        this.addText(`• ${goal.description}`);
        this.addText(`  Status: ${this.getGoalStatusLabel(goal.status)} | Progresso: ${goal.progress_percentage}%`, 10);
        this.addText(`  Meta: ${format(new Date(goal.target_date), 'dd/MM/yyyy')}`, 10);
        this.addLineBreak(3);
      });
      this.addLineBreak(5);
    }

    // Plano para próxima sessão
    if (record.content.next_session_plan) {
      this.addSectionTitle('PLANO PARA PRÓXIMA SESSÃO');
      this.addText(record.content.next_session_plan);
      this.addLineBreak(10);
    }

    // Orientações para família
    if (record.content.family_guidance) {
      this.addSectionTitle('ORIENTAÇÕES PARA FAMÍLIA');
      this.addText(record.content.family_guidance);
      this.addLineBreak(10);
    }

    // Assinatura digital
    if (record.digital_signature && options.includeSignature) {
      this.addSignature(record.digital_signature);
    }

    // Rodapé
    this.addFooter();

    // Salvar arquivo
    const fileName = `prontuario_${patient.name.replace(/\s+/g, '_')}_${format(new Date(record.session_date), 'ddMMyyyy')}.pdf`;
    this.pdf.save(fileName);
  }

  // Exportar múltiplos registros (relatório)
  async exportMultipleRecords(
    records: MedicalRecord[],
    patient: Patient,
    title: string = 'RELATÓRIO DE EVOLUÇÃO',
    options: PDFExportOptions = {}
  ): Promise<void> {
    this.setupFonts();
    
    // Header da clínica
    if (options.headerInfo) {
      this.addClinicHeader(options.headerInfo);
    }

    // Cabeçalho do documento
    this.addTitle(title, 16);
    this.addLineBreak(10);

    // Informações do paciente
    this.addPatientInfo(patient);
    this.addLineBreak(10);

    // Período do relatório
    if (records.length > 0) {
      const startDate = new Date(Math.min(...records.map(r => new Date(r.session_date).getTime())));
      const endDate = new Date(Math.max(...records.map(r => new Date(r.session_date).getTime())));
      
      this.addText(`Período: ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}`);
      this.addText(`Total de sessões: ${records.length}`);
      this.addLineBreak(10);
    }

    // Resumo estatístico
    this.addSummaryStats(records);
    this.addLineBreak(10);

    // Registros individuais
    records.forEach((record, index) => {
      this.checkPageBreak(50); // Verificar se há espaço suficiente
      
      this.addSectionTitle(`SESSÃO ${index + 1} - ${format(new Date(record.session_date), 'dd/MM/yyyy HH:mm')}`);
      this.addText(`Especialidade: ${record.specialty} | Terapeuta: ${record.therapist_name}`);
      this.addLineBreak(5);
      
      // Evolução resumida
      const truncatedEvolution = record.content.evolution.length > 300 
        ? record.content.evolution.substring(0, 300) + '...'
        : record.content.evolution;
      this.addText(truncatedEvolution);
      
      // Marcos desta sessão
      if (record.content.milestones_achieved.length > 0) {
        this.addText('\nMarcos alcançados:');
        record.content.milestones_achieved.forEach(milestone => {
          this.addText(`• ${milestone.description}`, 12);
        });
      }
      
      this.addLineBreak(10);
    });

    // Rodapé
    this.addFooter();

    // Salvar arquivo
    const fileName = `relatorio_${patient.name.replace(/\s+/g, '_')}_${format(new Date(), 'ddMMyyyy')}.pdf`;
    this.pdf.save(fileName);
  }

  private setupFonts(): void {
    // Configurar fontes padrão
    this.pdf.setFont('helvetica');
  }

  private addClinicHeader(headerInfo: { clinicName: string; clinicAddress: string; clinicPhone: string }): void {
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(headerInfo.clinicName, this.leftMargin, this.currentY);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.currentY += 7;
    this.pdf.text(headerInfo.clinicAddress, this.leftMargin, this.currentY);
    this.currentY += 5;
    this.pdf.text(`Telefone: ${headerInfo.clinicPhone}`, this.leftMargin, this.currentY);
    
    this.currentY += 15;
    
    // Linha separadora
    this.pdf.line(this.leftMargin, this.currentY, this.leftMargin + this.pageWidth, this.currentY);
    this.currentY += 10;
  }

  private addTitle(text: string, fontSize: number = 14): void {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    const textWidth = this.pdf.getTextWidth(text);
    const x = (this.pdf.internal.pageSize.getWidth() - textWidth) / 2;
    this.pdf.text(text, x, this.currentY);
    this.currentY += 10;
  }

  private addSectionTitle(text: string): void {
    this.checkPageBreak(15);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(text, this.leftMargin, this.currentY);
    this.currentY += 8;
  }

  private addText(text: string, fontSize: number = 10): void {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'normal');
    
    // Quebrar texto em linhas
    const lines = this.pdf.splitTextToSize(text, this.pageWidth);
    
    for (const line of lines) {
      this.checkPageBreak(7);
      this.pdf.text(line, this.leftMargin, this.currentY);
      this.currentY += 5;
    }
  }

  private addPatientInfo(patient: Patient): void {
    this.addSectionTitle('DADOS DO PACIENTE');
    this.addText(`Nome: ${patient.name}`);
    this.addText(`Data de Nascimento: ${format(new Date(patient.birth_date), 'dd/MM/yyyy')}`);
    this.addText(`CPF: ${patient.cpf}`);
    this.addText(`Gênero: ${this.getGenderLabel(patient.gender)}`);
    
    if (patient.diagnosis.length > 0) {
      this.addText(`Diagnóstico Principal: ${patient.diagnosis.find(d => d.type === 'primary')?.description || patient.diagnosis[0].description}`);
    }
  }

  private addSessionInfo(record: MedicalRecord): void {
    this.addSectionTitle('DADOS DA SESSÃO');
    this.addText(`Data/Hora: ${format(new Date(record.session_date), 'dd/MM/yyyy HH:mm')}`);
    this.addText(`Especialidade: ${record.specialty}`);
    this.addText(`Terapeuta: ${record.therapist_name}`);
    this.addText(`Tipo de Sessão: ${record.session_type}`);
    this.addText(`Duração: ${record.duration_minutes} minutos`);
    
    if (record.tags.length > 0) {
      this.addText(`Tags: ${record.tags.join(', ')}`);
    }
  }

  private addSummaryStats(records: MedicalRecord[]): void {
    this.addSectionTitle('RESUMO ESTATÍSTICO');
    
    const specialties = [...new Set(records.map(r => r.specialty))];
    const totalMilestones = records.reduce((acc, r) => acc + r.content.milestones_achieved.length, 0);
    const totalGoals = records.reduce((acc, r) => acc + r.goals.length, 0);
    const achievedGoals = records.reduce((acc, r) => acc + r.goals.filter(g => g.status === 'achieved').length, 0);
    
    this.addText(`Especialidades envolvidas: ${specialties.join(', ')}`);
    this.addText(`Total de marcos alcançados: ${totalMilestones}`);
    this.addText(`Metas trabalhadas: ${totalGoals} | Alcançadas: ${achievedGoals}`);
    
    if (totalGoals > 0) {
      const progressPercentage = Math.round((achievedGoals / totalGoals) * 100);
      this.addText(`Taxa de sucesso das metas: ${progressPercentage}%`);
    }
  }

  private addSignature(signature: any): void {
    this.checkPageBreak(30);
    this.addLineBreak(20);
    
    // Linha para assinatura
    this.pdf.line(this.leftMargin, this.currentY, this.leftMargin + 80, this.currentY);
    this.currentY += 7;
    
    this.pdf.setFontSize(10);
    this.pdf.text(`${signature.therapist_name}`, this.leftMargin, this.currentY);
    this.currentY += 5;
    this.pdf.text(`Assinado digitalmente em ${format(new Date(signature.timestamp), 'dd/MM/yyyy HH:mm')}`, this.leftMargin, this.currentY);
  }

  private addFooter(): void {
    const pageCount = this.pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      
      const footerText = `Documento gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')} - Página ${i} de ${pageCount}`;
      const textWidth = this.pdf.getTextWidth(footerText);
      const x = (this.pdf.internal.pageSize.getWidth() - textWidth) / 2;
      
      this.pdf.text(footerText, x, 290);
    }
  }

  private addLineBreak(space: number): void {
    this.currentY += space;
  }

  private checkPageBreak(neededSpace: number): void {
    if (this.currentY + neededSpace > this.pageHeight) {
      this.pdf.addPage();
      this.currentY = 20;
    }
  }

  private getGenderLabel(gender: string): string {
    const labels: { [key: string]: string } = {
      male: 'Masculino',
      female: 'Feminino',
      other: 'Outro'
    };
    return labels[gender] || 'Não informado';
  }

  private getGoalStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      not_started: 'Não Iniciada',
      in_progress: 'Em Progresso',
      achieved: 'Alcançada',
      modified: 'Modificada',
      discontinued: 'Descontinuada'
    };
    return labels[status] || status;
  }
}

// Função utilitária para exportar elemento HTML como PDF
export async function exportElementToPDF(
  elementId: string,
  filename: string = 'documento.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemento com ID '${elementId}' não encontrado`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Primeira página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Páginas adicionais se necessário
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao gerar PDF. Tente novamente.');
  }
}