import { Router } from "express";

import userRoutes from './userRoute';
import authRoutes from './authRoute';
import mediaRoutes from './mediaRoute';
import reviewRoutes from './reviewRoute';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/:mediaType', mediaRoutes);

export default router;