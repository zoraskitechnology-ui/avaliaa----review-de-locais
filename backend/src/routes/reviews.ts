import { Router } from 'express';
import * as reviewsController from '../controllers/reviewsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, reviewsController.createReview);
router.put('/:id', authenticate, reviewsController.updateReview);
router.delete('/:id', authenticate, reviewsController.deleteReview);
router.post('/:id/photos', authenticate, reviewsController.addPhotosToReview);

export default router;
