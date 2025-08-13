"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const therapistController_1 = require("../controllers/therapistController");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(auth_1.authenticateToken);
// POST /api/therapists - Cadastrar novo terapeuta (apenas admin)
router.post('/', therapistController_1.createTherapist);
// GET /api/therapists - Listar terapeutas
router.get('/', therapistController_1.listTherapists);
// PUT /api/therapists/:therapistId - Atualizar terapeuta (apenas admin)
router.put('/:therapistId', therapistController_1.updateTherapist);
// DELETE /api/therapists/:therapistId - Desativar terapeuta (apenas admin)
router.delete('/:therapistId', therapistController_1.deactivateTherapist);
exports.default = router;
//# sourceMappingURL=therapists.js.map