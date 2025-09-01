import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deactivatePatient,
  getPatientsStats
} from '../controllers/patientsController';

const router = Router();

console.log('📋 Rotas de pacientes carregadas');

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// GET /api/patients - Listar pacientes
router.get('/', getPatients);

// GET /api/patients/stats - Estatísticas dos pacientes
router.get('/stats', getPatientsStats);

// GET /api/patients/:patientId - Buscar paciente específico
router.get('/:patientId', getPatient);

// POST /api/patients - Criar novo paciente
router.post('/', createPatient);

// PUT /api/patients/:patientId - Atualizar paciente
router.put('/:patientId', updatePatient);

// DELETE /api/patients/:patientId - Desativar paciente (soft delete)
router.delete('/:patientId', deactivatePatient);

export default router;