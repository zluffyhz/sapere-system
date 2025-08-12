"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const anamneseController_1 = require("../controllers/anamneseController");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação e sanitização em todas as rotas
router.use(auth_1.auth);
router.use(validation_1.sanitizeData);
// Rotas para anamneses
router.get('/stats', anamneseController_1.getStats);
router.get('/', anamneseController_1.listAnamneses);
router.get('/:id', (0, validation_1.validateResourceOwnership)('anamnese'), anamneseController_1.getAnamnese);
router.post('/', (0, validation_1.userRateLimit)(20, 60000), validation_1.validateCreateAnamnese, anamneseController_1.createAnamnese);
router.put('/:id', (0, validation_1.validateResourceOwnership)('anamnese'), validation_1.validateUpdateAnamnese, anamneseController_1.updateAnamnese);
router.delete('/:id', (0, validation_1.validateResourceOwnership)('anamnese'), anamneseController_1.deleteAnamnese);
exports.default = router;
//# sourceMappingURL=anamnese.js.map