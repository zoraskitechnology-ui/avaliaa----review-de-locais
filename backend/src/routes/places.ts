import { Router } from 'express';
import * as placesController from '../controllers/placesController';
import { supabase } from '../config/supabase';
import { AuthRequest, authenticate, optionalAuth } from '../middleware/auth';
import * as geminiService from '../services/geminiService';

const router = Router();

router.get('/', optionalAuth, placesController.getAllPlaces);
router.get('/search', optionalAuth, placesController.searchPlaces);
router.get('/:id', optionalAuth, placesController.getPlaceById);
router.post('/', authenticate, placesController.createPlace);
router.get('/:id/reviews', optionalAuth, placesController.getPlaceReviews);

export default router;
