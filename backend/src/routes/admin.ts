import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  changeAdminPassword, 
  resetUserPassword, 
  listAllUsers, 
  updateUserStatus 
} from '../controllers/adminController';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticateToken);

// PUT /api/admin/change-password - Alterar senha do administrador
router.put('/change-password', changeAdminPassword);

// POST /api/admin/reset-password - Resetar senha de usuário
router.post('/reset-password', resetUserPassword);

// GET /api/admin/users - Listar todos os usuários
router.get('/users', listAllUsers);

// PUT /api/admin/users/:userId/status - Alterar status de usuário
router.put('/users/:userId/status', updateUserStatus);

export default router;