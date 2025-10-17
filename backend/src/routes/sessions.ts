import { Router } from 'express';
import {
  startSession,
  pauseSession,
  resumeSession,
  completeSession,
  endSession,
  updateSessionEvolution,
  getActiveSession,
  getSessionHistory,
  getPatientSessions
} from '../controllers/sessionController';
import { authenticateToken, requireTherapistOrAdmin, logActivity } from '../middleware/auth';

const router = Router();

// Aplicar autenticação para todas as rotas
router.use(authenticateToken);

// Iniciar nova sessão
router.post('/start', startSession);

// Buscar sessão ativa
router.get('/active', getActiveSession);
router.get('/active/:therapist_id', getActiveSession);

// Atualizar evolução durante a sessão (salvar rascunho)
router.patch('/:id/evolution', updateSessionEvolution);

// Finalizar sessão
router.post('/:id/end', endSession);

// Pausar sessão ativa (opcional)
router.put('/:id/pause', pauseSession);

// Retomar sessão pausada (opcional)
router.put('/:id/resume', resumeSession);

// Finalizar sessão (compatibilidade com rota antiga)
router.put('/:id/complete', completeSession);

// Histórico de sessões de um paciente
router.get('/patient/:patientId', getPatientSessions);

// Obter histórico de sessões do terapeuta (compatibilidade)
router.get('/history/:therapist_id', getSessionHistory);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    message: 'Rotas de sessão funcionando',
    version: '2.0 - Sistema de Consulta com Timer',
    endpoints: {
      start: 'POST /api/sessions/start',
      active: 'GET /api/sessions/active',
      updateEvolution: 'PATCH /api/sessions/:id/evolution',
      end: 'POST /api/sessions/:id/end',
      pause: 'PUT /api/sessions/:id/pause',
      resume: 'PUT /api/sessions/:id/resume',
      complete: 'PUT /api/sessions/:id/complete',
      patientHistory: 'GET /api/sessions/patient/:patientId',
      history: 'GET /api/sessions/history/:therapist_id'
    }
  });
});

export default router;