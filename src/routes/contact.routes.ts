import { Router } from 'express';
import { ContactController } from '../controllers/ContactController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const contactController = new ContactController();

router.use(authenticateToken);

router.get('/', (req, res) => contactController.getAll(req, res));
router.get('/:id', (req, res) => contactController.getById(req, res));
router.post('/', (req, res) => contactController.create(req, res));
router.put('/:id', (req, res) => contactController.update(req, res));
router.delete('/:id', (req, res) => contactController.delete(req, res));

export default router;
