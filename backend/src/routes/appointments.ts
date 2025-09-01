import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAppointmentsStats
} from '../controllers/appointmentsController';

const router = Router();

console.log('📅 Rotas de agendamentos carregadas');

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// GET /api/appointments - Listar agendamentos
router.get('/', getAppointments);

// GET /api/appointments/stats - Estatísticas dos agendamentos
router.get('/stats', getAppointmentsStats);

// GET /api/appointments/:appointmentId - Buscar agendamento específico
router.get('/:appointmentId', getAppointment);

// POST /api/appointments - Criar novo agendamento
router.post('/', createAppointment);

// PUT /api/appointments/:appointmentId - Atualizar agendamento
router.put('/:appointmentId', updateAppointment);

// DELETE /api/appointments/:appointmentId - Cancelar agendamento
router.delete('/:appointmentId', cancelAppointment);

export default router;