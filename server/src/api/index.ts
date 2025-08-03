import { Router } from 'express';
import authRoutes from '@/api/routes/auth';

const router = Router();

router.use('/authenticate', authRoutes);

export default router;