import { Client } from 'pg';
import { ConflictDetection, Communication } from '../types/database';

interface NotificationTemplate {
  type: string;
  subject: string;
  message: string;
}

interface NotificationParams {
  user_id?: string;
  patient_id?: string;
  appointment_id?: string;
  type: 'sms' | 'email' | 'whatsapp' | 'push';
  template: string;
  data: any;
  schedule_for?: Date;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

class NotificationService {
  private templates: { [key: string]: NotificationTemplate } = {};

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    this.templates = {
      'appointment_moved': {
        type: 'appointment_moved',
        subject: 'Agendamento Reagendado - {patient_name}',
        message: 'Seu agendamento com {therapist_name} foi reagendado para {new_date} às {new_time}. Motivo: {reason}'
      },
      'conflict_detected': {
        type: 'conflict_detected',
        subject: 'Conflito de Agendamento Detectado',
        message: 'Foi detectado um conflito no agendamento de {patient_name} marcado para {appointment_date}. Ação necessária.'
      },
      'auto_rescheduled': {
        type: 'auto_rescheduled',
        subject: 'Agendamento Reagendado Automaticamente',
        message: 'O agendamento de {patient_name} foi reagendado automaticamente de {old_date} para {new_date} devido a um conflito.'
      },
      'appointment_reminder': {
        type: 'appointment_reminder',
        subject: 'Lembrete: Agendamento Hoje',
        message: 'Lembrete: você tem um agendamento hoje às {appointment_time} com {therapist_name}.'
      },
      'session_completed': {
        type: 'session_completed',
        subject: 'Sessão Finalizada',
        message: 'A sessão com {patient_name} foi finalizada. Duração: {duration}. Próximo agendamento: {next_appointment}'
      },
      'therapist_unavailable': {
        type: 'therapist_unavailable',
        subject: 'Terapeuta Indisponível',
        message: '{therapist_name} não está disponível no horário solicitado. Horários alternativos: {alternatives}'
      }
    };
  }

  // Enviar notificação de conflito
  async notifyConflict(params: {
    conflicts: ConflictDetection[];
    appointment_id: string;
    therapist_id?: string;
    patient_id?: string;
  }): Promise<void> {
    const { conflicts, appointment_id, therapist_id, patient_id } = params;
    const client = this.getDbClient();

    try {
      await client.connect();

      for (const conflict of conflicts) {
        // Buscar dados do agendamento
        const appointmentQuery = `
          SELECT a.*, p.name as patient_name, p.phone as patient_phone,
                 u.name as therapist_name, u.email as therapist_email
          FROM appointments a
          LEFT JOIN patients p ON a.patient_id = p.id
          LEFT JOIN therapists t ON a.therapist_id = t.id
          LEFT JOIN users u ON t.user_id = u.id
          WHERE a.id = $1
        `;
        
        const appointmentResult = await client.query(appointmentQuery, [appointment_id]);
        
        if (appointmentResult.rows.length === 0) continue;
        
        const appointment = appointmentResult.rows[0];

        // Notificar terapeuta por email
        if (appointment.therapist_email) {
          await this.sendNotification({
            user_id: appointment.therapist_id,
            type: 'email',
            template: 'conflict_detected',
            data: {
              patient_name: appointment.patient_name,
              appointment_date: appointment.appointment_date,
              conflict_type: conflict.conflict_type,
              severity: conflict.severity
            },
            priority: conflict.severity === 'critical' ? 'urgent' : 'high'
          });
        }

        // Notificar paciente se crítico
        if (conflict.severity === 'critical' && appointment.patient_phone) {
          await this.sendNotification({
            patient_id: appointment.patient_id,
            type: 'sms',
            template: 'conflict_detected',
            data: {
              patient_name: appointment.patient_name,
              appointment_date: appointment.appointment_date,
              therapist_name: appointment.therapist_name
            },
            priority: 'urgent'
          });
        }
      }
    } catch (error) {
      console.error('Erro ao notificar conflitos:', error);
    } finally {
      await client.end();
    }
  }

  // Notificar movimento de agendamento
  async notifyAppointmentMove(params: {
    appointment_id: string;
    old_date: Date;
    new_date: Date;
    moved_by: string;
    reason?: string;
  }): Promise<void> {
    const { appointment_id, old_date, new_date, moved_by, reason } = params;
    const client = this.getDbClient();

    try {
      await client.connect();

      // Buscar dados do agendamento
      const appointmentQuery = `
        SELECT a.*, p.name as patient_name, p.phone as patient_phone, p.email as patient_email,
               u.name as therapist_name, u.email as therapist_email, u.phone as therapist_phone
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN therapists t ON a.therapist_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE a.id = $1
      `;
      
      const result = await client.query(appointmentQuery, [appointment_id]);
      
      if (result.rows.length === 0) return;
      
      const appointment = result.rows[0];

      // Notificar paciente
      if (appointment.patient_phone) {
        await this.sendNotification({
          patient_id: appointment.patient_id,
          type: 'sms',
          template: 'appointment_moved',
          data: {
            patient_name: appointment.patient_name,
            therapist_name: appointment.therapist_name,
            new_date: new_date.toLocaleDateString('pt-BR'),
            new_time: new_date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            reason: reason || 'Reagendamento necessário'
          },
          priority: 'high'
        });
      }

      // Notificar terapeuta por email
      if (appointment.therapist_email) {
        await this.sendNotification({
          user_id: appointment.therapist_user_id,
          type: 'email',
          template: 'appointment_moved',
          data: {
            patient_name: appointment.patient_name,
            therapist_name: appointment.therapist_name,
            new_date: new_date.toLocaleDateString('pt-BR'),
            new_time: new_date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            old_date: old_date.toLocaleDateString('pt-BR'),
            old_time: old_date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            moved_by: moved_by,
            reason: reason || 'Reagendamento necessário'
          },
          priority: 'normal'
        });
      }

      console.log(`Notificações enviadas para movimento do agendamento ${appointment_id}`);
    } catch (error) {
      console.error('Erro ao notificar movimento:', error);
    } finally {
      await client.end();
    }
  }

  // Notificar sessão finalizada
  async notifySessionCompleted(params: {
    session_id: string;
    duration: number;
    notes?: string;
  }): Promise<void> {
    const { session_id, duration, notes } = params;
    const client = this.getDbClient();

    try {
      await client.connect();

      // Buscar dados da sessão
      const sessionQuery = `
        SELECT s.*, p.name as patient_name, p.phone as patient_phone,
               u.name as therapist_name, u.email as therapist_email,
               a.appointment_date as next_appointment
        FROM sessions s
        LEFT JOIN patients p ON s.patient_id = p.id
        LEFT JOIN therapists t ON s.therapist_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN appointments a ON a.patient_id = s.patient_id 
          AND a.therapist_id = s.therapist_id 
          AND a.appointment_date > NOW()
          AND a.status IN ('scheduled', 'confirmed')
        WHERE s.id = $1
        ORDER BY a.appointment_date ASC
        LIMIT 1
      `;
      
      const result = await client.query(sessionQuery, [session_id]);
      
      if (result.rows.length === 0) return;
      
      const session = result.rows[0];
      const durationFormatted = this.formatDuration(duration);

      // Notificar terapeuta
      if (session.therapist_email) {
        await this.sendNotification({
          user_id: session.therapist_user_id,
          type: 'email',
          template: 'session_completed',
          data: {
            patient_name: session.patient_name,
            duration: durationFormatted,
            notes: notes || 'Nenhuma observação',
            next_appointment: session.next_appointment 
              ? new Date(session.next_appointment).toLocaleDateString('pt-BR') 
              : 'Não agendado'
          },
          priority: 'normal'
        });
      }

      console.log(`Notificação de sessão finalizada enviada: ${session_id}`);
    } catch (error) {
      console.error('Erro ao notificar sessão finalizada:', error);
    } finally {
      await client.end();
    }
  }

  // Enviar lembretes automáticos
  async sendAutomaticReminders(): Promise<void> {
    const client = this.getDbClient();

    try {
      await client.connect();

      // Buscar agendamentos para hoje que ainda não receberam lembrete
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const nextDay = new Date(tomorrow);
      nextDay.setDate(tomorrow.getDate() + 1);

      const query = `
        SELECT a.*, p.name as patient_name, p.phone as patient_phone,
               u.name as therapist_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN therapists t ON a.therapist_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE a.appointment_date >= $1 
          AND a.appointment_date < $2
          AND a.status = 'confirmed'
          AND a.reminder_sent_at IS NULL
      `;

      const result = await client.query(query, [tomorrow, nextDay]);

      for (const appointment of result.rows) {
        // Enviar lembrete por SMS
        if (appointment.patient_phone) {
          await this.sendNotification({
            patient_id: appointment.patient_id,
            appointment_id: appointment.id,
            type: 'sms',
            template: 'appointment_reminder',
            data: {
              patient_name: appointment.patient_name,
              therapist_name: appointment.therapist_name,
              appointment_time: new Date(appointment.appointment_date).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })
            },
            priority: 'normal'
          });

          // Marcar lembrete como enviado
          await client.query(
            'UPDATE appointments SET reminder_sent_at = NOW(), reminder_count = reminder_count + 1 WHERE id = $1',
            [appointment.id]
          );
        }
      }

      console.log(`Lembretes automáticos enviados: ${result.rows.length}`);
    } catch (error) {
      console.error('Erro ao enviar lembretes automáticos:', error);
    } finally {
      await client.end();
    }
  }

  // Método privado para enviar notificação
  private async sendNotification(params: NotificationParams): Promise<void> {
    const client = this.getDbClient();

    try {
      await client.connect();

      const template = this.templates[params.template];
      if (!template) {
        console.error(`Template não encontrado: ${params.template}`);
        return;
      }

      // Processar template
      let subject = template.subject;
      let message = template.message;

      // Substituir placeholders
      for (const [key, value] of Object.entries(params.data)) {
        const placeholder = `{${key}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
        message = message.replace(new RegExp(placeholder, 'g'), String(value));
      }

      // Inserir na tabela de comunicações
      const insertQuery = `
        INSERT INTO communications (
          patient_id, user_id, type, status, subject, message,
          scheduled_for, attempts, max_attempts, created_at, updated_at
        ) VALUES (
          $1, $2, $3, 'pending', $4, $5, 
          $6, 0, 3, NOW(), NOW()
        ) RETURNING id
      `;

      const result = await client.query(insertQuery, [
        params.patient_id || null,
        params.user_id || null,
        params.type,
        subject,
        message,
        params.schedule_for || new Date()
      ]);

      console.log(`Notificação criada: ${result.rows[0].id} (${params.type})`);

      // Aqui você integraria com serviços reais de envio (Twilio, SendGrid, etc.)
      // Por enquanto, apenas logamos
      this.simulateExternalService(params.type, message);

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    } finally {
      await client.end();
    }
  }

  // Simulação de serviços externos
  private simulateExternalService(type: string, message: string): void {
    console.log(`📱 [${type.toUpperCase()}] ${message}`);
    
    // Em produção, você integraria com:
    // - SMS: Twilio, AWS SNS
    // - Email: SendGrid, AWS SES
    // - WhatsApp: WhatsApp Business API
    // - Push: Firebase Cloud Messaging
  }

  // Formatar duração em formato legível
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  private getDbClient() {
    return new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
}

export default new NotificationService();