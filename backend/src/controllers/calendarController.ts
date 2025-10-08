import { Request, Response } from 'express';
import { Client } from 'pg';
import { Appointment, ConflictDetection, CalendarEvent, DragConstraints, AppointmentPriority } from '../types/database';
import { AuthRequest } from '../middleware/auth';

const getDbClient = () => {
  return new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
};

interface CalendarQueryParams {
  start_date: string;
  end_date: string;
  therapist_id?: string;
  patient_id?: string;
  status?: string;
  view_type?: 'day' | 'week' | 'month';
}

// Listar agendamentos por período
export const getAppointmentsByPeriod = async (req: AuthRequest, res: Response) => {
  const client = getDbClient();
  
  try {
    const {
      start_date,
      end_date,
      therapist_id,
      patient_id,
      status,
      view_type = 'week'
    } = req.query as unknown as CalendarQueryParams;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'start_date e end_date são obrigatórios',
        code: 'MISSING_DATE_PARAMS'
      });
    }

    await client.connect();

    // Construir query dinâmica baseada nos filtros
    let whereConditions = ['a.appointment_date BETWEEN $1 AND $2'];
    const queryParams: any[] = [start_date, end_date];
    let paramCounter = 2;

    if (therapist_id) {
      paramCounter++;
      whereConditions.push(`a.therapist_id = $${paramCounter}`);
      queryParams.push(therapist_id);
    }

    if (patient_id) {
      paramCounter++;
      whereConditions.push(`a.patient_id = $${paramCounter}`);
      queryParams.push(patient_id);
    }

    if (status) {
      paramCounter++;
      whereConditions.push(`a.status = $${paramCounter}`);
      queryParams.push(status);
    }

    const query = `
      SELECT 
        a.id,
        a.patient_id,
        a.therapist_id,
        a.appointment_date,
        a.duration,
        a.status,
        a.appointment_type,
        a.session_number,
        a.notes,
        a.confirmed_by_patient,
        a.is_draggable,
        a.color_code,
        a.priority,
        a.auto_reschedule,
        p.name as patient_name,
        p.phone as patient_phone,
        t.user_id as therapist_user_id,
        u.name as therapist_name,
        CASE 
          WHEN s.id IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END as has_active_session
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN therapists t ON a.therapist_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN sessions s ON a.id = s.appointment_id AND s.status IN ('active', 'paused')
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY a.appointment_date ASC
    `;

    const result = await client.query(query, queryParams);
    
    // Transformar em formato de eventos do calendário
    const appointments = result.rows.map(row => ({
      id: row.id,
      patient_id: row.patient_id,
      therapist_id: row.therapist_id,
      appointment_date: row.appointment_date,
      duration: row.duration,
      status: row.status,
      appointment_type: row.appointment_type,
      session_number: row.session_number,
      notes: row.notes,
      confirmed_by_patient: row.confirmed_by_patient,
      is_draggable: row.is_draggable || true,
      color_code: row.color_code || getDefaultColor(row.status, row.priority),
      priority: row.priority || 'normal',
      auto_reschedule: row.auto_reschedule || false,
      patient_name: row.patient_name,
      patient_phone: row.patient_phone,
      therapist_name: row.therapist_name,
      has_active_session: row.has_active_session,
      // Dados para o calendário
      title: `${row.patient_name} - ${row.appointment_type || 'Consulta'}`,
      start_time: row.appointment_date,
      end_time: new Date(new Date(row.appointment_date).getTime() + (row.duration * 60000)),
    }));

    res.json({
      success: true,
      appointments,
      summary: {
        total: appointments.length,
        by_status: appointments.reduce((acc: any, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        }, {}),
        period: { start_date, end_date },
        view_type
      }
    });

  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({
      error: 'Erro ao buscar agendamentos',
      code: 'FETCH_APPOINTMENTS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Função auxiliar para cor padrão
function getDefaultColor(status: string, priority?: string): string {
  const statusColors = {
    'scheduled': '#3B82F6',  // Azul
    'confirmed': '#10B981',  // Verde
    'in_progress': '#F59E0B', // Amarelo
    'completed': '#6B7280',  // Cinza
    'cancelled': '#EF4444',  // Vermelho
    'no_show': '#DC2626',    // Vermelho escuro
    'rescheduled': '#8B5CF6' // Roxo
  };

  const priorityColors = {
    'urgent': '#DC2626',     // Vermelho
    'high': '#F59E0B',       // Amarelo
    'normal': '#3B82F6',     // Azul
    'low': '#6B7280'         // Cinza
  };

  // Prioridade sobrescreve status para cores críticas
  if (priority === 'urgent' || priority === 'high') {
    return priorityColors[priority];
  }

  return statusColors[status] || statusColors['scheduled'];
}

// Mover agendamento (drag-and-drop)
export const moveAppointment = async (req: AuthRequest, res: Response) => {
  const client = getDbClient();
  const { id } = req.params;
  
  try {
    const {
      new_appointment_date,
      new_therapist_id,
      force_move = false,
      moved_by_user = true
    } = req.body;

    if (!new_appointment_date) {
      return res.status(400).json({
        error: 'new_appointment_date é obrigatório',
        code: 'MISSING_NEW_DATE'
      });
    }

    await client.connect();

    // Buscar agendamento atual
    const currentResult = await client.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Agendamento não encontrado',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    const currentAppointment = currentResult.rows[0];
    const finalTherapistId = new_therapist_id || currentAppointment.therapist_id;

    // Verificar se o agendamento pode ser movido
    if (currentAppointment.is_draggable === false && !force_move) {
      return res.status(403).json({
        error: 'Este agendamento não pode ser movido',
        code: 'APPOINTMENT_NOT_DRAGGABLE'
      });
    }

    // Detectar conflitos
    const conflicts = await detectConflicts(client, {
      appointment_id: id,
      appointment_date: new Date(new_appointment_date),
      duration: currentAppointment.duration,
      therapist_id: finalTherapistId,
      patient_id: currentAppointment.patient_id
    });

    if (conflicts.length > 0 && !force_move) {
      return res.status(409).json({
        error: 'Conflitos detectados',
        code: 'APPOINTMENT_CONFLICTS',
        conflicts: conflicts,
        can_force: true
      });
    }

    // Mover o agendamento
    const updateQuery = `
      UPDATE appointments 
      SET appointment_date = $1,
          therapist_id = $2,
          updated_at = NOW(),
          updated_by = $3
      WHERE id = $4
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      new_appointment_date,
      finalTherapistId,
      req.user?.id,
      id
    ]);

    const updatedAppointment = result.rows[0];

    // Log da movimentação
    console.log(`Agendamento movido: ${id} -> ${new_appointment_date} (${moved_by_user ? 'usuário' : 'sistema'})`);

    res.json({
      success: true,
      appointment: updatedAppointment,
      conflicts_resolved: conflicts.length,
      moved_at: new Date(),
      moved_by: req.user?.name || 'Sistema'
    });

  } catch (error) {
    console.error('Erro ao mover agendamento:', error);
    res.status(500).json({
      error: 'Erro ao mover agendamento',
      code: 'MOVE_APPOINTMENT_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Detectar conflitos de horário
export const detectAppointmentConflicts = async (req: AuthRequest, res: Response) => {
  const client = getDbClient();
  
  try {
    const {
      appointment_date,
      duration,
      therapist_id,
      patient_id,
      exclude_appointment_id
    } = req.body;

    if (!appointment_date || !duration || !therapist_id || !patient_id) {
      return res.status(400).json({
        error: 'appointment_date, duration, therapist_id e patient_id são obrigatórios',
        code: 'MISSING_CONFLICT_PARAMS'
      });
    }

    await client.connect();

    const conflicts = await detectConflicts(client, {
      appointment_date: new Date(appointment_date),
      duration,
      therapist_id,
      patient_id,
      exclude_appointment_id
    });

    res.json({
      success: true,
      has_conflicts: conflicts.length > 0,
      conflicts: conflicts,
      total_conflicts: conflicts.length
    });

  } catch (error) {
    console.error('Erro ao detectar conflitos:', error);
    res.status(500).json({
      error: 'Erro ao detectar conflitos',
      code: 'DETECT_CONFLICTS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Função auxiliar para detectar conflitos
async function detectConflicts(client: Client, params: {
  appointment_id?: string;
  appointment_date: Date;
  duration: number;
  therapist_id: string;
  patient_id: string;
  exclude_appointment_id?: string;
}): Promise<ConflictDetection[]> {
  const {
    appointment_id,
    appointment_date,
    duration,
    therapist_id,
    patient_id,
    exclude_appointment_id
  } = params;

  const endTime = new Date(appointment_date.getTime() + (duration * 60000));
  const conflicts: ConflictDetection[] = [];

  // Query para detectar conflitos de terapeuta
  let therapistConflictQuery = `
    SELECT id, appointment_date, duration, patient_id
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

  const params_list = [therapist_id, appointment_date, endTime];
  
  if (exclude_appointment_id) {
    therapistConflictQuery += ' AND id != $4';
    params_list.push(exclude_appointment_id);
  }

  const therapistConflicts = await client.query(therapistConflictQuery, params_list);

  // Processar conflitos de terapeuta
  for (const conflict of therapistConflicts.rows) {
    const conflictEnd = new Date(new Date(conflict.appointment_date).getTime() + (conflict.duration * 60000));
    
    conflicts.push({
      appointment_id: appointment_id || 'new',
      conflicting_appointment_id: conflict.id,
      conflict_type: 'therapist_unavailable',
      overlap_start: new Date(Math.max(appointment_date.getTime(), new Date(conflict.appointment_date).getTime())),
      overlap_end: new Date(Math.min(endTime.getTime(), conflictEnd.getTime())),
      severity: 'high',
      suggested_resolution: 'reschedule_current',
      alternative_slots: [] // TODO: Implementar sugestões de horários
    });
  }

  // Query para detectar conflitos de paciente (duplo agendamento)
  let patientConflictQuery = `
    SELECT id, appointment_date, duration, therapist_id
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

  const patient_params = [patient_id, appointment_date, endTime];
  
  if (exclude_appointment_id) {
    patientConflictQuery += ' AND id != $4';
    patient_params.push(exclude_appointment_id);
  }

  const patientConflicts = await client.query(patientConflictQuery, patient_params);

  // Processar conflitos de paciente
  for (const conflict of patientConflicts.rows) {
    const conflictEnd = new Date(new Date(conflict.appointment_date).getTime() + (conflict.duration * 60000));
    
    conflicts.push({
      appointment_id: appointment_id || 'new',
      conflicting_appointment_id: conflict.id,
      conflict_type: 'patient_double_booking',
      overlap_start: new Date(Math.max(appointment_date.getTime(), new Date(conflict.appointment_date).getTime())),
      overlap_end: new Date(Math.min(endTime.getTime(), conflictEnd.getTime())),
      severity: 'critical',
      suggested_resolution: 'notify_only',
      alternative_slots: []
    });
  }

  return conflicts;
}

// Criar agendamento rápido
export const createQuickAppointment = async (req: AuthRequest, res: Response) => {
  const client = getDbClient();
  
  try {
    const {
      patient_id,
      therapist_id,
      appointment_date,
      duration = 60,
      appointment_type = 'Consulta',
      notes,
      priority = 'normal',
      auto_confirm = false
    } = req.body;

    if (!patient_id || !therapist_id || !appointment_date) {
      return res.status(400).json({
        error: 'patient_id, therapist_id e appointment_date são obrigatórios',
        code: 'MISSING_QUICK_APPOINTMENT_PARAMS'
      });
    }

    await client.connect();

    // Detectar conflitos primeiro
    const conflicts = await detectConflicts(client, {
      appointment_date: new Date(appointment_date),
      duration,
      therapist_id,
      patient_id
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: 'Conflitos detectados para agendamento rápido',
        code: 'QUICK_APPOINTMENT_CONFLICTS',
        conflicts: conflicts
      });
    }

    // Criar agendamento
    const insertQuery = `
      INSERT INTO appointments (
        patient_id, therapist_id, appointment_date, duration,
        timezone, status, confirmed_by_patient, confirmation_attempts,
        appointment_type, notes, is_draggable, priority, auto_reschedule,
        created_at, updated_at, created_by
      ) VALUES (
        $1, $2, $3, $4, 'America/Sao_Paulo', 
        $5, $6, 0, $7, $8, true, $9, false,
        NOW(), NOW(), $10
      ) RETURNING *
    `;

    const status = auto_confirm ? 'confirmed' : 'scheduled';
    const result = await client.query(insertQuery, [
      patient_id,
      therapist_id,
      appointment_date,
      duration,
      status,
      auto_confirm,
      appointment_type,
      notes,
      priority,
      req.user?.id
    ]);

    const newAppointment = result.rows[0];

    console.log(`Agendamento rápido criado: ${newAppointment.id}`);

    res.status(201).json({
      success: true,
      appointment: newAppointment,
      created_at: new Date(),
      auto_confirmed: auto_confirm
    });

  } catch (error) {
    console.error('Erro ao criar agendamento rápido:', error);
    res.status(500).json({
      error: 'Erro ao criar agendamento rápido',
      code: 'CREATE_QUICK_APPOINTMENT_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};