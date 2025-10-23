import { Router } from 'express';
import { OpportunityController } from '../controllers/OpportunityController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new OpportunityController();

router.use(authenticateToken);

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/forecast', (req, res) => controller.getForecast(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
