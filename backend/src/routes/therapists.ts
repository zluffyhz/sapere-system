import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  createTherapist, 
  listTherapists, 
  updateTherapist, 
  deactivateTherapist 
} from '../controllers/therapistController';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticateToken);

// POST /api/therapists - Cadastrar novo terapeuta (apenas admin)
router.post('/', createTherapist);

// GET /api/therapists - Listar terapeutas
router.get('/', listTherapists);

// PUT /api/therapists/:therapistId - Atualizar terapeuta (apenas admin)
router.put('/:therapistId', updateTherapist);

// DELETE /api/therapists/:therapistId - Desativar terapeuta (apenas admin)
router.delete('/:therapistId', deactivateTherapist);

export default router;