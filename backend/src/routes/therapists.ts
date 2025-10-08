import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  createTherapist, 
  listTherapists, 
  updateTherapist, 
  deactivateTherapist,
  getTherapistById,
  getTherapistStats,
  getTherapistSchedule,
  generateProductivityReport
} from '../controllers/therapistController';
import {
  listSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
  assignSpecialtyToTherapist,
  removeSpecialtyFromTherapist,
  getTherapistSpecialties,
  getTherapistsBySpecialty
} from '../controllers/specialtyController';

const router = Router();

// Rota de teste SIMPLES sem autenticação
router.get('/test', (req, res) => {
  res.json({
    message: 'Sistema de terapeutas funcionando!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      'listar_terapeutas': 'GET /api/therapists/',
      'criar_terapeuta': 'POST /api/therapists/',
      'buscar_terapeuta': 'GET /api/therapists/:therapistId',
      'atualizar_terapeuta': 'PUT /api/therapists/:therapistId',
      'estatísticas': 'GET /api/therapists/:therapistId/stats'
    }
  });
});

// Todas as rotas exigem autenticação (exceto /test)
router.use(authenticateToken);

// Rotas de terapeutas
router.post('/', createTherapist);
router.get('/', listTherapists);
router.get('/:therapistId', getTherapistById);
router.put('/:therapistId', updateTherapist);
router.delete('/:therapistId', deactivateTherapist);

// Rotas de estatísticas e produtividade
router.get('/:therapistId/stats', getTherapistStats);
router.get('/:therapistId/schedule', getTherapistSchedule);
router.post('/:therapistId/reports', generateProductivityReport);

// Rotas de especialidades
router.get('/specialties/list', listSpecialties);
router.post('/specialties', createSpecialty);
router.put('/specialties/:specialtyId', updateSpecialty);
router.delete('/specialties/:specialtyId', deleteSpecialty);

// Rotas de associação terapeuta-especialidade
router.get('/:therapistId/specialties', getTherapistSpecialties);
router.post('/:therapistId/specialties/:specialtyId', assignSpecialtyToTherapist);
router.delete('/:therapistId/specialties/:specialtyId', removeSpecialtyFromTherapist);
router.get('/specialties/:specialtyId/therapists', getTherapistsBySpecialty);

export default router;