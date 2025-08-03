import { Router } from 'express';
import authRoutes from '@/api/routes/auth';
import convertRoutes from '@/api/routes/convert';

const router = Router();

router.use('/authenticate', authRoutes);

router.use('/convert', convertRoutes);

export default router;