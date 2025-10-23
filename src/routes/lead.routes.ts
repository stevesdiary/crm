import { Router } from 'express';
import { LeadController } from '../controllers/LeadController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const leadController = new LeadController();

router.use(authenticateToken);

router.get('/', (req, res) => leadController.getAll(req, res));
router.get('/:id', (req, res) => leadController.getById(req, res));
router.post('/', (req, res) => leadController.create(req, res));
router.put('/:id', (req, res) => leadController.update(req, res));
router.delete('/:id', (req, res) => leadController.delete(req, res));

export default router;
