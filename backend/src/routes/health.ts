import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Attendance Management System API is healthy' });
});

export default router;
