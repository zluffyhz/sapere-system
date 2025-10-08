import { Router } from 'express';
import { authenticateToken, requireTherapistOrAdmin } from '../middleware/auth';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients
} from '../controllers/patientController';

const router = Router();

// Aplicar autenticação para todas as rotas
router.use(authenticateToken);
router.use(requireTherapistOrAdmin);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    message: 'API de pacientes funcionando!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    features: {
      'list_patients': 'Listagem de pacientes com estatísticas',
      'create_patient': 'Criação de novos pacientes',
      'update_patient': 'Atualização de dados do paciente',
      'search_patients': 'Busca com filtros e paginação',
      'patient_stats': 'Estatísticas de sessões e documentos'
    },
    endpoints: {
      'list': 'GET /api/patients',
      'get_by_id': 'GET /api/patients/:id',
      'create': 'POST /api/patients',
      'update': 'PUT /api/patients/:id',
      'delete': 'DELETE /api/patients/:id',
      'search': 'GET /api/patients/search'
    }
  });
});

// Buscar pacientes (com filtros)
router.get('/search', searchPatients);

// Listar todos os pacientes
router.get('/', getPatients);

// Buscar paciente por ID
router.get('/:id', getPatientById);

// Criar novo paciente
router.post('/', createPatient);

// Atualizar paciente
router.put('/:id', updatePatient);

// Desativar paciente
router.delete('/:id', deletePatient);

export default router;