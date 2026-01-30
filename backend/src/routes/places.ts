import { Router } from 'express';
import * as placesController from '../controllers/placesController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, placesController.getAllPlaces);
router.get('/search', optionalAuth, placesController.searchPlaces);
router.get('/:id', optionalAuth, placesController.getPlaceById);
router.post('/', authenticate, placesController.createPlace);
router.get('/:id/reviews', optionalAuth, placesController.getPlaceReviews);

export default router;
