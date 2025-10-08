import { Client } from 'pg';
import { ConflictDetection, DragConstraints, TimeSlot, ConflictResolution } from '../types/database';

interface ValidationRule {
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  check: (params: ValidationParams) => Promise<boolean>;
  message: string;
  suggested_resolution?: string;
}

interface ValidationParams {
  client: Client;
  appointment_date: Date;
  duration: number;
  therapist_id: string;
  patient_id: string;
  appointment_id?: string;
  constraints?: DragConstraints;
}

class ConflictValidationService {
  private validationRules: ValidationRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    // Regra 1: Verificar horário de trabalho do terapeuta
    this.validationRules.push({
      name: 'working_hours',
      severity: 'high',
      check: this.checkWorkingHours.bind(this),
      message: 'Agendamento fora do horário de trabalho do terapeuta',
      suggested_resolution: 'Mover para horário de trabalho'
    });

    // Regra 2: Verificar sobreposição de agendamentos
    this.validationRules.push({
      name: 'appointment_overlap',
      severity: 'critical',
      check: this.checkAppointmentOverlap.bind(this),
      message: 'Conflito de horário com outro agendamento',
      suggested_resolution: 'Reagendar um dos agendamentos'
    });

    // Regra 3: Verificar tempo de buffer entre agendamentos
    this.validationRules.push({
      name: 'buffer_time',
      severity: 'medium',
      check: this.checkBufferTime.bind(this),
      message: 'Tempo de intervalo insuficiente entre agendamentos',
      suggested_resolution: 'Ajustar horários com intervalo mínimo'
    });

    // Regra 4: Verificar limite de agendamentos por dia
    this.validationRules.push({
      name: 'daily_limit',
      severity: 'medium',
      check: this.checkDailyLimit.bind(this),
      message: 'Limite diário de agendamentos excedido',
      suggested_resolution: 'Reagendar para outro dia'
    });

    // Regra 5: Verificar duplo agendamento do paciente
    this.validationRules.push({
      name: 'patient_double_booking',
      severity: 'critical',
      check: this.checkPatientDoubleBooking.bind(this),
      message: 'Paciente já possui agendamento neste horário',
      suggested_resolution: 'Cancelar ou reagendar um dos agendamentos'
    });

    // Regra 6: Verificar sessão ativa
    this.validationRules.push({
      name: 'active_session',
      severity: 'high',
      check: this.checkActiveSession.bind(this),
      message: 'Terapeuta possui sessão ativa em andamento',
      suggested_resolution: 'Finalizar sessão ativa antes de agendar'
    });

    // Regra 7: Verificar restrições de drag-and-drop
    this.validationRules.push({
      name: 'drag_constraints',
      severity: 'medium',
      check: this.checkDragConstraints.bind(this),
      message: 'Movimento não permitido pelas restrições configuradas',
      suggested_resolution: 'Mover para horário/terapeuta permitido'
    });
  }

  async validateAppointment(params: ValidationParams): Promise<{
    isValid: boolean;
    conflicts: ConflictDetection[];
    warnings: ConflictDetection[];
  }> {
    const conflicts: ConflictDetection[] = [];
    const warnings: ConflictDetection[] = [];

    for (const rule of this.validationRules) {
      try {
        const hasConflict = await rule.check(params);
        
        if (hasConflict) {
          const conflict: ConflictDetection = {
            appointment_id: params.appointment_id || 'new',
            conflicting_appointment_id: 'validation',
            conflict_type: rule.name as any,
            overlap_start: params.appointment_date,
            overlap_end: new Date(params.appointment_date.getTime() + (params.duration * 60000)),
            severity: rule.severity,
            suggested_resolution: (rule.suggested_resolution || 'manual') as ConflictResolution,
            alternative_slots: []
          };

          if (rule.severity === 'critical' || rule.severity === 'high') {
            conflicts.push(conflict);
          } else {
            warnings.push(conflict);
          }
        }
      } catch (error) {
        console.error(`Erro ao validar regra ${rule.name}:`, error);
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings
    };
  }

  // Regra: Verificar horário de trabalho do terapeuta
  private async checkWorkingHours(params: ValidationParams): Promise<boolean> {
    const { client, appointment_date, therapist_id, constraints } = params;
    
    try {
      // Buscar horários disponíveis do terapeuta
      const therapistQuery = `
        SELECT available_hours FROM therapists WHERE id = $1
      `;
      const result = await client.query(therapistQuery, [therapist_id]);
      
      if (result.rows.length === 0) return true; // Terapeuta não encontrado = conflito
      
      const availableHours = result.rows[0].available_hours;
      const dayOfWeek = appointment_date.getDay(); // 0 = domingo, 1 = segunda
      const appointmentTime = appointment_date.toTimeString().substring(0, 5);
      
      // Mapear dia da semana
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayOfWeek];
      
      // Verificar se há horários configurados para este dia
      if (!availableHours[dayName] || availableHours[dayName].length === 0) {
        return true; // Sem horários configurados = conflito
      }
      
      // Verificar se o horário está dentro de algum slot disponível
      const isWithinWorkingHours = availableHours[dayName].some((slot: any) => {
        return appointmentTime >= slot.start && appointmentTime <= slot.end;
      });
      
      // Verificar constraints adicionais
      if (constraints?.min_time && appointmentTime < constraints.min_time) {
        return true;
      }
      
      if (constraints?.max_time && appointmentTime > constraints.max_time) {
        return true;
      }
      
      return !isWithinWorkingHours;
    } catch (error) {
      console.error('Erro ao verificar horário de trabalho:', error);
      return false;
    }
  }

  // Regra: Verificar sobreposição de agendamentos
  private async checkAppointmentOverlap(params: ValidationParams): Promise<boolean> {
    const { client, appointment_date, duration, therapist_id, appointment_id } = params;
    
    try {
      const endTime = new Date(appointment_date.getTime() + (duration * 60000));
      
      let query = `
        SELECT COUNT(*) as count
        FROM appointments 
        WHERE therapist_id = $1 
          AND status NOT IN ('cancelled', 'completed')
          AND (
            (appointment_date < $3 AND appointment_date + INTERVAL '1 minute' * duration > $2)
            OR
            (appointment_date < $3 AND appointment_date + INTERVAL '1 minute' * duration > $3)
            OR
            (appointment_date >= $2 AND appointment_date < $3)
          )
      `;
      
      const queryParams = [therapist_id, appointment_date, endTime];
      
      if (appointment_id) {
        query += ' AND id != $4';
        queryParams.push(appointment_id);
      }
      
      const result = await client.query(query, queryParams);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Erro ao verificar sobreposição:', error);
      return false;
    }
  }

  // Regra: Verificar tempo de buffer
  private async checkBufferTime(params: ValidationParams): Promise<boolean> {
    const { client, appointment_date, duration, therapist_id, appointment_id, constraints } = params;
    
    try {
      const bufferTime = constraints?.buffer_time || 15; // 15 minutos padrão
      const startWithBuffer = new Date(appointment_date.getTime() - (bufferTime * 60000));
      const endTime = new Date(appointment_date.getTime() + (duration * 60000));
      const endWithBuffer = new Date(endTime.getTime() + (bufferTime * 60000));
      
      let query = `
        SELECT COUNT(*) as count
        FROM appointments 
        WHERE therapist_id = $1 
          AND status NOT IN ('cancelled', 'completed')
          AND (
            (appointment_date + INTERVAL '1 minute' * duration > $2 AND appointment_date < $3)
          )
      `;
      
      const queryParams = [therapist_id, startWithBuffer, endWithBuffer];
      
      if (appointment_id) {
        query += ' AND id != $4';
        queryParams.push(appointment_id);
      }
      
      const result = await client.query(query, queryParams);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Erro ao verificar buffer time:', error);
      return false;
    }
  }

  // Regra: Verificar limite diário
  private async checkDailyLimit(params: ValidationParams): Promise<boolean> {
    const { client, appointment_date, therapist_id, appointment_id } = params;
    
    try {
      // Buscar limite máximo do terapeuta
      const therapistQuery = `
        SELECT max_daily_appointments FROM therapists WHERE id = $1
      `;
      const therapistResult = await client.query(therapistQuery, [therapist_id]);
      
      if (therapistResult.rows.length === 0) return false;
      
      const maxDaily = therapistResult.rows[0].max_daily_appointments || 8;
      
      // Contar agendamentos do dia
      const startOfDay = new Date(appointment_date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(appointment_date);
      endOfDay.setHours(23, 59, 59, 999);
      
      let countQuery = `
        SELECT COUNT(*) as count
        FROM appointments 
        WHERE therapist_id = $1 
          AND appointment_date >= $2 
          AND appointment_date <= $3
          AND status NOT IN ('cancelled', 'completed')
      `;
      
      const queryParams = [therapist_id, startOfDay, endOfDay];
      
      if (appointment_id) {
        countQuery += ' AND id != $4';
        queryParams.push(appointment_id);
      }
      
      const result = await client.query(countQuery, queryParams);
      return parseInt(result.rows[0].count) >= maxDaily;
    } catch (error) {
      console.error('Erro ao verificar limite diário:', error);
      return false;
    }
  }

  // Regra: Verificar duplo agendamento do paciente
  private async checkPatientDoubleBooking(params: ValidationParams): Promise<boolean> {
    const { client, appointment_date, duration, patient_id, appointment_id } = params;
    
    try {
      const endTime = new Date(appointment_date.getTime() + (duration * 60000));
      
      let query = `
        SELECT COUNT(*) as count
        FROM appointments 
        WHERE patient_id = $1 
          AND status NOT IN ('cancelled', 'completed')
          AND (
            (appointment_date < $3 AND appointment_date + INTERVAL '1 minute' * duration > $2)
            OR
            (appointment_date < $3 AND appointment_date + INTERVAL '1 minute' * duration > $3)
            OR
            (appointment_date >= $2 AND appointment_date < $3)
          )
      `;
      
      const queryParams = [patient_id, appointment_date, endTime];
      
      if (appointment_id) {
        query += ' AND id != $4';
        queryParams.push(appointment_id);
      }
      
      const result = await client.query(query, queryParams);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Erro ao verificar duplo agendamento:', error);
      return false;
    }
  }

  // Regra: Verificar sessão ativa
  private async checkActiveSession(params: ValidationParams): Promise<boolean> {
    const { client, therapist_id } = params;
    
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM sessions 
        WHERE therapist_id = $1 AND status IN ('active', 'paused')
      `;
      
      const result = await client.query(query, [therapist_id]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Erro ao verificar sessão ativa:', error);
      return false;
    }
  }

  // Regra: Verificar restrições de drag-and-drop
  private async checkDragConstraints(params: ValidationParams): Promise<boolean> {
    const { constraints, appointment_date, duration, therapist_id } = params;
    
    if (!constraints) return false;
    
    try {
      // Verificar dias permitidos
      if (constraints.allowed_days && constraints.allowed_days.length > 0) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = appointment_date.getDay();
        const dayName = dayNames[dayOfWeek];
        
        if (!constraints.allowed_days.includes(dayName)) {
          return true;
        }
      }
      
      // Verificar duração mínima/máxima
      if (constraints.min_duration && duration < constraints.min_duration) {
        return true;
      }
      
      if (constraints.max_duration && duration > constraints.max_duration) {
        return true;
      }
      
      // Verificar terapeutas permitidos
      if (constraints.allowed_therapists && constraints.allowed_therapists.length > 0) {
        if (!constraints.allowed_therapists.includes(therapist_id)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar restrições de drag:', error);
      return false;
    }
  }

  // Gerar horários alternativos
  async generateAlternativeSlots(params: ValidationParams): Promise<TimeSlot[]> {
    const { client, duration, therapist_id, appointment_date } = params;
    const alternatives: TimeSlot[] = [];
    
    try {
      // Buscar próximos 7 dias de horários disponíveis
      const baseDate = new Date(appointment_date);
      
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const checkDate = new Date(baseDate);
        checkDate.setDate(baseDate.getDate() + dayOffset);
        
        // Gerar slots de 30 em 30 minutos das 8h às 18h
        for (let hour = 8; hour < 18; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const slotTime = new Date(checkDate);
            slotTime.setHours(hour, minute, 0, 0);
            
            // Verificar se este slot está livre
            const validation = await this.validateAppointment({
              ...params,
              appointment_date: slotTime
            });
            
            if (validation.isValid) {
              alternatives.push({
                start: slotTime.toTimeString().substring(0, 5),
                end: new Date(slotTime.getTime() + (duration * 60000)).toTimeString().substring(0, 5)
              });
            }
            
            // Limitar a 10 sugestões
            if (alternatives.length >= 10) {
              return alternatives;
            }
          }
        }
      }
      
      return alternatives;
    } catch (error) {
      console.error('Erro ao gerar horários alternativos:', error);
      return [];
    }
  }
}

export default new ConflictValidationService();