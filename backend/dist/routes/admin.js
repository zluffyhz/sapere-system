"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(auth_1.authenticateToken);
// PUT /api/admin/change-password - Alterar senha do administrador
router.put('/change-password', adminController_1.changeAdminPassword);
// POST /api/admin/reset-password - Resetar senha de usuário
router.post('/reset-password', adminController_1.resetUserPassword);
// GET /api/admin/users - Listar todos os usuários
router.get('/users', adminController_1.listAllUsers);
// PUT /api/admin/users/:userId/status - Alterar status de usuário
router.put('/users/:userId/status', adminController_1.updateUserStatus);
exports.default = router;
//# sourceMappingURL=admin.js.map