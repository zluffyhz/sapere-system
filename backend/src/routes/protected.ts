import { Router } from 'express';
import { 
  authenticateToken, 
  requireAdmin, 
  requireTherapist, 
  requireGuardian,
  requireTherapistOrAdmin,
  requireAnyRole,
  canAccessPatient,
  logActivity,
  AuthRequest 
} from '../middleware/auth';
import patientsController from '../controllers/patientsController';
import appointmentsController from '../controllers/appointmentsController';
import dashboardController from '../controllers/dashboardController';

const router = Router();

// Exemplo de rotas protegidas por diferentes roles

// 🔒 APENAS ADMIN
router.get('/admin/users', 
  authenticateToken, 
  requireAdmin,
  logActivity('view', 'user_list'),
  (req: AuthRequest, res) => {
    res.json({ 
      message: 'Lista de usuários - Apenas Admin',
      user_role: req.user?.role 
    });
  }
);

router.post('/admin/users', 
  authenticateToken, 
  requireAdmin,
  logActivity('create', 'user'),
  (req: AuthRequest, res) => {
    res.json({ 
      message: 'Criar usuário - Apenas Admin',
      user_role: req.user?.role 
    });
  }
);

router.delete('/admin/users/:id', 
  authenticateToken, 
  requireAdmin,
  logActivity('delete', 'user'),
  (req: AuthRequest, res) => {
    res.json({ 
      message: `Deletar usuário ${req.params.id} - Apenas Admin`,
      user_role: req.user?.role 
    });
  }
);

// 🩺 APENAS THERAPIST
router.get('/therapist/schedule', 
  authenticateToken, 
  requireTherapist,
  logActivity('view', 'schedule'),
  (req: AuthRequest, res) => {
    res.json({ 
      message: 'Agenda do terapeuta - Apenas Therapist',
      user_role: req.user?.role 
    });
  }
);

router.post('/therapist/records', 
  authenticateToken, 
  requireTherapist,
  logActivity('create', 'record'),
  (req: AuthRequest, res) => {
    res.json({ 
      message: 'Criar prontuário - Apenas Therapist',
      user_role: req.user?.role 
    });
  }
);

// 👨‍👩‍👧‍👦 APENAS GUARDIAN (RESPONSIBLE)
router.get('/guardian/children', 
  authenticateToken, 
  requireGuardian,
  logActivity('view', 'children_list'),
  (req: AuthRequest, res) => {
    res.json({ 
      message: 'Lista de filhos - Apenas Guardian',
      user_role: req.user?.role 
    });
  }
);

// 🩺 THERAPIST OU ADMIN - Rotas de Pacientes
router.get('/clinical/patients', 
  authenticateToken, 
  requireTherapistOrAdmin,
  logActivity('view', 'patient_list'),
  patientsController.getPatients
);

router.get('/clinical/patients/stats', 
  authenticateToken, 
  requireTherapistOrAdmin,
  logActivity('view', 'patient_stats'),
  patientsController.getPatientsStats
);

router.post('/clinical/patients', 
  authenticateToken, 
  requireTherapistOrAdmin,
  logActivity('create', 'patient'),
  patientsController.createPatient
);

router.put('/clinical/patients/:patientId', 
  authenticateToken, 
  requireTherapistOrAdmin,
  logActivity('update', 'patient'),
  patientsController.updatePatient
);

router.delete('/clinical/patients/:patientId', 
  authenticateToken, 
  requireAdmin,
  logActivity('deactivate', 'patient'),
  patientsController.deactivatePatient
);

// Rotas de Agendamentos
router.get('/clinical/appointments', 
  authenticateToken, 
  requireAnyRole,
  logActivity('view', 'appointment_list'),
  appointmentsController.getAppointments
);

router.get('/clinical/appointments/stats', 
  authenticateToken, 
  requireAnyRole,
  logActivity('view', 'appointment_stats'),
  appointmentsController.getAppointmentsStats
);

router.post('/clinical/appointments', 
  authenticateToken, 
  requireTherapistOrAdmin,
  logActivity('create', 'appointment'),
  appointmentsController.createAppointment
);

router.get('/clinical/appointments/:appointmentId', 
  authenticateToken, 
  requireAnyRole,
  logActivity('view', 'appointment'),
  appointmentsController.getAppointment
);

router.put('/clinical/appointments/:appointmentId', 
  authenticateToken, 
  requireTherapistOrAdmin,
  logActivity('update', 'appointment'),
  appointmentsController.updateAppointment
);

router.post('/clinical/appointments/:appointmentId/confirm', 
  authenticateToken, 
  requireAnyRole,
  logActivity('confirm', 'appointment'),
  appointmentsController.confirmAppointment
);

router.post('/clinical/appointments/:appointmentId/cancel', 
  authenticateToken, 
  requireAnyRole,
  logActivity('cancel', 'appointment'),
  appointmentsController.cancelAppointment
);

router.post('/clinical/appointments/:appointmentId/complete', 
  authenticateToken, 
  requireTherapist,
  logActivity('complete', 'appointment'),
  appointmentsController.completeAppointment
);

// 🌟 QUALQUER ROLE AUTENTICADO
router.get('/profile', 
  authenticateToken, 
  requireAnyRole,
  (req: AuthRequest, res) => {
    res.json({ 
      message: 'Perfil do usuário - Qualquer role',
      user_role: req.user?.role 
    });
  }
);

router.get('/dashboard', 
  authenticateToken, 
  requireAnyRole,
  logActivity('view', 'dashboard'),
  dashboardController.getDashboard
);

router.get('/dashboard/calendar', 
  authenticateToken, 
  requireAnyRole,
  logActivity('view', 'calendar_dashboard'),
  dashboardController.getCalendarDashboard
);

// 🔐 ACESSO CONTROLADO POR PACIENTE
router.get('/patients/:patientId', 
  authenticateToken, 
  canAccessPatient,
  logActivity('view', 'patient'),
  patientsController.getPatient
);

router.get('/patients/:patientId/records', 
  authenticateToken, 
  canAccessPatient,
  logActivity('view', 'patient_records'),
  (req: AuthRequest, res) => {
    res.json({ 
      message: `Prontuários do paciente ${req.params.patientId}`,
      user_role: req.user?.role,
      note: 'Admin e Therapist veem todos, Guardian apenas os seus'
    });
  }
);

router.get('/patients/:patientId/appointments', 
  authenticateToken, 
  canAccessPatient,
  logActivity('view', 'patient_appointments'),
  (req: AuthRequest, res) => {
    res.json({ 
      message: `Agendamentos do paciente ${req.params.patientId}`,
      user_role: req.user?.role,
      note: 'Admin e Therapist veem todos, Guardian apenas os seus'
    });
  }
);

// 📊 ROTAS COM DIFERENTES PERMISSÕES BASEADAS NO ROLE
router.get('/reports/general', 
  authenticateToken, 
  (req: AuthRequest, res) => {
    const userRole = req.user?.role;
    let data: any = {};

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
  }
);

// 🧪 ROTA PARA TESTAR ROLES
router.get('/test/roles', 
  authenticateToken, 
  (req: AuthRequest, res) => {
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
  }
);

// Função helper para listar endpoints disponíveis baseados no role
function getAvailableEndpoints(role: string): string[] {
  const endpoints = [
    'GET /api/protected/dashboard',
    'GET /api/protected/profile',
    'GET /api/protected/test/roles'
  ];

  if (role === 'admin') {
    endpoints.push(
      'GET /api/protected/admin/users',
      'POST /api/protected/admin/users',
      'DELETE /api/protected/admin/users/:id',
      'GET /api/protected/clinical/patients',
      'POST /api/protected/clinical/appointments'
    );
  }

  if (role === 'therapist') {
    endpoints.push(
      'GET /api/protected/therapist/schedule',
      'POST /api/protected/therapist/records',
      'GET /api/protected/clinical/patients',
      'POST /api/protected/clinical/appointments'
    );
  }

  if (role === 'responsible') {
    endpoints.push(
      'GET /api/protected/guardian/children'
    );
  }

  // Todos podem acessar dados de pacientes (com restrições)
  endpoints.push(
    'GET /api/protected/patients/:patientId',
    'GET /api/protected/patients/:patientId/records',
    'GET /api/protected/patients/:patientId/appointments'
  );

  return endpoints;
}

export default router;