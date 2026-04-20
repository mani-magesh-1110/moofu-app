import { Router } from 'express';
import * as parkingController from '../controller/parkingController';

const router = Router();

// Public routes
router.get('/', parkingController.getAllParkings);
router.get('/:id', parkingController.getParkingById);
router.get('/search/area', parkingController.searchByArea);

export default router;
