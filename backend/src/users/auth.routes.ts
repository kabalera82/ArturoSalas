
import { Router } from 'express';
import { register, login, me } from './auth.controller';
import { isAuth } from '../shared/auth.middleware';

const router = Router();

// --- RUTAS PÚBLICAS ---

router.post('/register', register);
router.post('/login',    login);

// --- RUTAS PROTEGIDAS --- 

// GET /api/auth/me — 
router.get('/me', isAuth, me);

export default router;
