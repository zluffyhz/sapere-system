import { Router } from 'express';
import { 
  startSession, 
  pauseSession, 
  resumeSession, 
  completeSession, 
  getActiveSession,
  getSessionHistory 
} from '../controllers/sessionController';
import { authenticateToken, requireTherapistOrAdmin, logActivity } from '../middleware/auth';
import { canAccessSession, canStartSession, canAccessTherapistSessions } from '../middleware/sessionPermissions';

const router = Router();

// Aplicar autenticação e autorização para todas as rotas
router.use(authenticateToken);
router.use(requireTherapistOrAdmin);

// Iniciar nova sessão
router.post('/start', canStartSession, logActivity('start_session', 'session'), startSession);

// Pausar sessão ativa
router.put('/:id/pause', canAccessSession, logActivity('pause_session', 'session'), pauseSession);

// Retomar sessão pausada
router.put('/:id/resume', canAccessSession, logActivity('resume_session', 'session'), resumeSession);

// Finalizar sessão
router.put('/:id/complete', canAccessSession, logActivity('complete_session', 'session'), completeSession);

// Obter sessão ativa do terapeuta
router.get('/active/:therapist_id', canAccessTherapistSessions, getActiveSession);

// Obter histórico de sessões do terapeuta
router.get('/history/:therapist_id', canAccessTherapistSessions, getSessionHistory);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    message: 'Rotas de sessão funcionando',
    endpoints: {
      start: 'POST /api/sessions/start',
      pause: 'PUT /api/sessions/:id/pause',
      resume: 'PUT /api/sessions/:id/resume',
      complete: 'PUT /api/sessions/:id/complete',
      active: 'GET /api/sessions/active/:therapist_id',
      history: 'GET /api/sessions/history/:therapist_id'
    }
  });
});

export default router;