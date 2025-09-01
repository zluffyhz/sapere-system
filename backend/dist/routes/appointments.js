"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const appointmentsController_1 = require("../controllers/appointmentsController");
const router = (0, express_1.Router)();
console.log('📅 Rotas de agendamentos carregadas');
// Todas as rotas precisam de autenticação
router.use(auth_1.authenticateToken);
// GET /api/appointments - Listar agendamentos
router.get('/', appointmentsController_1.getAppointments);
// GET /api/appointments/stats - Estatísticas dos agendamentos
router.get('/stats', appointmentsController_1.getAppointmentsStats);
// GET /api/appointments/:appointmentId - Buscar agendamento específico
router.get('/:appointmentId', appointmentsController_1.getAppointment);
// POST /api/appointments - Criar novo agendamento
router.post('/', appointmentsController_1.createAppointment);
// PUT /api/appointments/:appointmentId - Atualizar agendamento
router.put('/:appointmentId', appointmentsController_1.updateAppointment);
// DELETE /api/appointments/:appointmentId - Cancelar agendamento
router.delete('/:appointmentId', appointmentsController_1.cancelAppointment);
exports.default = router;
//# sourceMappingURL=appointments.js.map