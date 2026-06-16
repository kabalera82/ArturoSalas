
import { Router } from 'express';
import { register, login, me, getAllUsers, updateUser, deleteUser } from './auth.controller';
import { isAuth } from '../shared/auth.middleware';

const router = Router();

// --- RUTAS PÚBLICAS ---

router.post('/register', register);
router.post('/login',    login);

// --- RUTAS PROTEGIDAS --- 

router.get('/me',       isAuth, me);
router.get('/',         isAuth, getAllUsers);
router.put('/:id',      isAuth, updateUser);
router.delete('/:id',   isAuth, deleteUser);

export default router;
