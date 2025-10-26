import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';

const router = Router();

// Define el endpoint: POST /api/auth/login
router.post('/login', login);

export default router;