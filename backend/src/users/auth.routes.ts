import { Router } from 'express';
import {
  register,
  login,
  me,
  getAllUsers,
  getUserById,
  updateUser,
  updatePassword,
  updateStatus,
  deleteUser,
  addAddress,
  removeAddress,
  forgotPassword,
  resetPassword,
} from './auth.controller';
import { isAuth, isAdmin } from '../shared/auth.middleware';

const router = Router();

// --- RUTAS PÚBLICAS ---

router.post('/register',        register);
router.post('/login',           login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

// --- RUTAS PROTEGIDAS ---

router.get('/me',                         isAuth,          me);
router.get('/',                           isAuth, isAdmin, getAllUsers);
router.get('/:id',                        isAuth, isAdmin, getUserById);
router.put('/:id',                        isAuth, isAdmin, updateUser);
router.patch('/:id/password',             isAuth,          updatePassword);
router.patch('/:id/status',               isAuth, isAdmin, updateStatus);
router.post('/:id/addresses',             isAuth,          addAddress);
router.delete('/:id/addresses/:addressId',isAuth,          removeAddress);
router.delete('/:id',                     isAuth, isAdmin, deleteUser);

export default router;
