import { Router } from "express";

import userRoutes from './userRoute';
import authRoutes from './authRoute';
import mediaRoutes from './mediaRoute';
import reviewRoutes from './reviewRoute';
import recommendationRoutes from './recommendationRoute';

const router = Router();

router.use('/auth', authRoutes);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/:mediaType', mediaRoutes);

export default router;