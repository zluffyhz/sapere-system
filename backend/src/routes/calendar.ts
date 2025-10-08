import { Router } from 'express';
import { 
  getAppointmentsByPeriod,
  moveAppointment,
  detectAppointmentConflicts,
  createQuickAppointment
} from '../controllers/calendarController';
import { authenticateToken, requireTherapistOrAdmin, logActivity } from '../middleware/auth';

const router = Router();

// Rota de teste SIMPLES sem autenticação
router.get('/test-simple', (req, res) => {
  res.json({
    message: 'Sistema de calendário funcionando!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Rota de status do sistema de calendário
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de calendário totalmente integrado com PostgreSQL',
    features: {
      'drag_and_drop': 'Habilitado com validação de conflitos',
      'real_time_conflict_detection': 'Ativo',
      'productivity_tracking': 'Integrado com timer',
      'therapist_management': 'Completo com especialidades'
    },
    endpoints: {
      'listar_agendamentos': 'GET /api/calendar/appointments?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD',
      'mover_agendamento': 'PUT /api/calendar/appointments/:id/move',
      'detectar_conflitos': 'POST /api/calendar/appointments/detect-conflicts',
      'agendamento_rapido': 'POST /api/calendar/appointments/quick'
    },
    database_status: 'PostgreSQL - Dados reais',
    version: '2.0.0'
  });
});

// Aplicar autenticação para todas as outras rotas
router.use(authenticateToken);
router.use(requireTherapistOrAdmin);

// Listar agendamentos por período
router.get('/appointments', 
  logActivity('view_calendar', 'appointment'), 
  getAppointmentsByPeriod
);

// Mover agendamento (drag-and-drop)
router.put('/appointments/:id/move', 
  logActivity('move_appointment', 'appointment'), 
  moveAppointment
);

// Detectar conflitos de horário
router.post('/appointments/detect-conflicts', 
  logActivity('detect_conflicts', 'appointment'), 
  detectAppointmentConflicts
);

// Criar agendamento rápido
router.post('/appointments/quick', 
  logActivity('create_quick_appointment', 'appointment'), 
  createQuickAppointment
);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    message: 'Rotas de calendário funcionando',
    endpoints: {
      'get_appointments': 'GET /api/calendar/appointments?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD',
      'move_appointment': 'PUT /api/calendar/appointments/:id/move',
      'detect_conflicts': 'POST /api/calendar/appointments/detect-conflicts',
      'quick_appointment': 'POST /api/calendar/appointments/quick'
    },
    query_params: {
      'get_appointments': [
        'start_date (required): YYYY-MM-DD',
        'end_date (required): YYYY-MM-DD',
        'therapist_id (optional): UUID',
        'patient_id (optional): UUID',
        'status (optional): scheduled|confirmed|cancelled',
        'view_type (optional): day|week|month'
      ]
    },
    body_params: {
      'move_appointment': [
        'new_appointment_date (required): ISO date string',
        'new_therapist_id (optional): UUID',
        'force_move (optional): boolean',
        'moved_by_user (optional): boolean'
      ],
      'detect_conflicts': [
        'appointment_date (required): ISO date string',
        'duration (required): minutes',
        'therapist_id (required): UUID',
        'patient_id (required): UUID',
        'exclude_appointment_id (optional): UUID'
      ],
      'quick_appointment': [
        'patient_id (required): UUID',
        'therapist_id (required): UUID',
        'appointment_date (required): ISO date string',
        'duration (optional): minutes (default: 60)',
        'appointment_type (optional): string',
        'notes (optional): string',
        'priority (optional): low|normal|high|urgent',
        'auto_confirm (optional): boolean'
      ]
    }
  });
});

export default router;