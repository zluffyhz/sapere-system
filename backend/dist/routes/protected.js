"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const patientsController_1 = __importDefault(require("../controllers/patientsController"));
const appointmentsController_1 = __importDefault(require("../controllers/appointmentsController"));
const dashboardController_1 = __importDefault(require("../controllers/dashboardController"));
const router = (0, express_1.Router)();
// Exemplo de rotas protegidas por diferentes roles
// 🔒 APENAS ADMIN
router.get('/admin/users', auth_1.authenticateToken, auth_1.requireAdmin, (0, auth_1.logActivity)('view', 'user_list'), (req, res) => {
    res.json({
        message: 'Lista de usuários - Apenas Admin',
        user_role: req.user?.role
    });
});
router.post('/admin/users', auth_1.authenticateToken, auth_1.requireAdmin, (0, auth_1.logActivity)('create', 'user'), (req, res) => {
    res.json({
        message: 'Criar usuário - Apenas Admin',
        user_role: req.user?.role
    });
});
router.delete('/admin/users/:id', auth_1.authenticateToken, auth_1.requireAdmin, (0, auth_1.logActivity)('delete', 'user'), (req, res) => {
    res.json({
        message: `Deletar usuário ${req.params.id} - Apenas Admin`,
        user_role: req.user?.role
    });
});
// 🩺 APENAS THERAPIST
router.get('/therapist/schedule', auth_1.authenticateToken, auth_1.requireTherapist, (0, auth_1.logActivity)('view', 'schedule'), (req, res) => {
    res.json({
        message: 'Agenda do terapeuta - Apenas Therapist',
        user_role: req.user?.role
    });
});
router.post('/therapist/records', auth_1.authenticateToken, auth_1.requireTherapist, (0, auth_1.logActivity)('create', 'record'), (req, res) => {
    res.json({
        message: 'Criar prontuário - Apenas Therapist',
        user_role: req.user?.role
    });
});
// 👨‍👩‍👧‍👦 APENAS GUARDIAN (RESPONSIBLE)
router.get('/guardian/children', auth_1.authenticateToken, auth_1.requireGuardian, (0, auth_1.logActivity)('view', 'children_list'), (req, res) => {
    res.json({
        message: 'Lista de filhos - Apenas Guardian',
        user_role: req.user?.role
    });
});
// 🩺 THERAPIST OU ADMIN - Rotas de Pacientes
router.get('/clinical/patients', auth_1.authenticateToken, auth_1.requireTherapistOrAdmin, (0, auth_1.logActivity)('view', 'patient_list'), patientsController_1.default.getPatients);
router.get('/clinical/patients/stats', auth_1.authenticateToken, auth_1.requireTherapistOrAdmin, (0, auth_1.logActivity)('view', 'patient_stats'), patientsController_1.default.getPatientsStats);
router.post('/clinical/patients', auth_1.authenticateToken, auth_1.requireTherapistOrAdmin, (0, auth_1.logActivity)('create', 'patient'), patientsController_1.default.createPatient);
router.put('/clinical/patients/:patientId', auth_1.authenticateToken, auth_1.requireTherapistOrAdmin, (0, auth_1.logActivity)('update', 'patient'), patientsController_1.default.updatePatient);
router.delete('/clinical/patients/:patientId', auth_1.authenticateToken, auth_1.requireAdmin, (0, auth_1.logActivity)('deactivate', 'patient'), patientsController_1.default.deactivatePatient);
// Rotas de Agendamentos
router.get('/clinical/appointments', auth_1.authenticateToken, auth_1.requireAnyRole, (0, auth_1.logActivity)('view', 'appointment_list'), appointmentsController_1.default.getAppointments);
router.get('/clinical/appointments/stats', auth_1.authenticateToken, auth_1.requireAnyRole, (0, auth_1.logActivity)('view', 'appointment_stats'), appointmentsController_1.default.getAppointmentsStats);
router.post('/clinical/appointments', auth_1.authenticateToken, auth_1.requireTherapistOrAdmin, (0, auth_1.logActivity)('create', 'appointment'), appointmentsController_1.default.createAppointment);
router.get('/clinical/appointments/:appointmentId', auth_1.authenticateToken, auth_1.requireAnyRole, (0, auth_1.logActivity)('view', 'appointment'), appointmentsController_1.default.getAppointment);
router.put('/clinical/appointments/:appointmentId', auth_1.authenticateToken, auth_1.requireTherapistOrAdmin, (0, auth_1.logActivity)('update', 'appointment'), appointmentsController_1.default.updateAppointment);
router.post('/clinical/appointments/:appointmentId/confirm', auth_1.authenticateToken, auth_1.requireAnyRole, (0, auth_1.logActivity)('confirm', 'appointment'), appointmentsController_1.default.confirmAppointment);
router.post('/clinical/appointments/:appointmentId/cancel', auth_1.authenticateToken, auth_1.requireAnyRole, (0, auth_1.logActivity)('cancel', 'appointment'), appointmentsController_1.default.cancelAppointment);
router.post('/clinical/appointments/:appointmentId/complete', auth_1.authenticateToken, auth_1.requireTherapist, (0, auth_1.logActivity)('complete', 'appointment'), appointmentsController_1.default.completeAppointment);
// 🌟 QUALQUER ROLE AUTENTICADO
router.get('/profile', auth_1.authenticateToken, auth_1.requireAnyRole, (req, res) => {
    res.json({
        message: 'Perfil do usuário - Qualquer role',
        user_role: req.user?.role
    });
});
router.get('/dashboard', auth_1.authenticateToken, auth_1.requireAnyRole, (0, auth_1.logActivity)('view', 'dashboard'), dashboardController_1.default.getDashboard);
router.get('/dashboard/calendar', auth_1.authenticateToken, auth_1.requireAnyRole, (0, auth_1.logActivity)('view', 'calendar_dashboard'), dashboardController_1.default.getCalendarDashboard);
// 🔐 ACESSO CONTROLADO POR PACIENTE
router.get('/patients/:patientId', auth_1.authenticateToken, auth_1.canAccessPatient, (0, auth_1.logActivity)('view', 'patient'), patientsController_1.default.getPatient);
router.get('/patients/:patientId/records', auth_1.authenticateToken, auth_1.canAccessPatient, (0, auth_1.logActivity)('view', 'patient_records'), (req, res) => {
    res.json({
        message: `Prontuários do paciente ${req.params.patientId}`,
        user_role: req.user?.role,
        note: 'Admin e Therapist veem todos, Guardian apenas os seus'
    });
});
router.get('/patients/:patientId/appointments', auth_1.authenticateToken, auth_1.canAccessPatient, (0, auth_1.logActivity)('view', 'patient_appointments'), (req, res) => {
    res.json({
        message: `Agendamentos do paciente ${req.params.patientId}`,
        user_role: req.user?.role,
        note: 'Admin e Therapist veem todos, Guardian apenas os seus'
    });
});
// 📊 ROTAS COM DIFERENTES PERMISSÕES BASEADAS NO ROLE
router.get('/reports/general', auth_1.authenticateToken, (req, res) => {
    const userRole = req.user?.role;
    let data = {};
    switch (userRole) {
        case 'admin':
            data = {
                message: 'Relatório completo - Admin',
                includes: ['Todos os pacientes', 'Todos os terapeutas', 'Estatísticas completas']
            };
            break;
        case 'therapist':
            data = {
                message: 'Relatório parcial - Therapist',
                includes: ['Apenas seus pacientes', 'Suas estatísticas']
            };
            break;
        case 'responsible':
            data = {
                message: 'Relatório limitado - Guardian',
                includes: ['Apenas seus filhos', 'Progresso dos filhos']
            };
            break;
        default:
            return res.status(403).json({ error: 'Role não reconhecido' });
    }
    res.json(data);
});
// 🧪 ROTA PARA TESTAR ROLES
router.get('/test/roles', auth_1.authenticateToken, (req, res) => {
    const user = req.user;
    res.json({
        message: 'Teste de roles realizado com sucesso',
        your_info: {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
            status: user?.status
        },
        permissions: {
            can_manage_users: user?.role === 'admin',
            can_create_records: user?.role === 'therapist' || user?.role === 'admin',
            can_view_own_children: user?.role === 'responsible',
            can_access_dashboard: true,
            can_manage_clinic_settings: user?.role === 'admin'
        },
        available_endpoints: getAvailableEndpoints(user?.role || 'responsible')
    });
});
// Função helper para listar endpoints disponíveis baseados no role
function getAvailableEndpoints(role) {
    const endpoints = [
        'GET /api/protected/dashboard',
        'GET /api/protected/profile',
        'GET /api/protected/test/roles'
    ];
    if (role === 'admin') {
        endpoints.push('GET /api/protected/admin/users', 'POST /api/protected/admin/users', 'DELETE /api/protected/admin/users/:id', 'GET /api/protected/clinical/patients', 'POST /api/protected/clinical/appointments');
    }
    if (role === 'therapist') {
        endpoints.push('GET /api/protected/therapist/schedule', 'POST /api/protected/therapist/records', 'GET /api/protected/clinical/patients', 'POST /api/protected/clinical/appointments');
    }
    if (role === 'responsible') {
        endpoints.push('GET /api/protected/guardian/children');
    }
    // Todos podem acessar dados de pacientes (com restrições)
    endpoints.push('GET /api/protected/patients/:patientId', 'GET /api/protected/patients/:patientId/records', 'GET /api/protected/patients/:patientId/appointments');
    return endpoints;
}
exports.default = router;
//# sourceMappingURL=protected.js.map