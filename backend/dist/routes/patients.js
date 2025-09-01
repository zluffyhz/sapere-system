"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const patientsController_1 = require("../controllers/patientsController");
const router = (0, express_1.Router)();
console.log('📋 Rotas de pacientes carregadas');
// Todas as rotas precisam de autenticação
router.use(auth_1.authenticateToken);
// GET /api/patients - Listar pacientes
router.get('/', patientsController_1.getPatients);
// GET /api/patients/stats - Estatísticas dos pacientes
router.get('/stats', patientsController_1.getPatientsStats);
// GET /api/patients/:patientId - Buscar paciente específico
router.get('/:patientId', patientsController_1.getPatient);
// POST /api/patients - Criar novo paciente
router.post('/', patientsController_1.createPatient);
// PUT /api/patients/:patientId - Atualizar paciente
router.put('/:patientId', patientsController_1.updatePatient);
// DELETE /api/patients/:patientId - Desativar paciente (soft delete)
router.delete('/:patientId', patientsController_1.deactivatePatient);
exports.default = router;
//# sourceMappingURL=patients.js.map