import { Router } from 'express';
import { auth } from '../middleware/auth';
import { 
  validateCreateAnamnese, 
  validateUpdateAnamnese, 
  validateResourceOwnership,
  sanitizeData,
  userRateLimit
} from '../middleware/validation';
import {
  createAnamnese,
  listAnamneses,
  getAnamnese,
  updateAnamnese,
  deleteAnamnese,
  getStats
} from '../controllers/anamneseController';

const router = Router();

// Aplicar middleware de autenticação e sanitização em todas as rotas
router.use(auth);
router.use(sanitizeData);

// Rotas para anamneses
router.get('/stats', getStats);
router.get('/', listAnamneses);
router.get('/:id', validateResourceOwnership('anamnese'), getAnamnese);
router.post('/', userRateLimit(20, 60000), validateCreateAnamnese, createAnamnese);
router.put('/:id', validateResourceOwnership('anamnese'), validateUpdateAnamnese, updateAnamnese);
router.delete('/:id', validateResourceOwnership('anamnese'), deleteAnamnese);

export default router;