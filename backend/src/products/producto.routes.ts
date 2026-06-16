import { Router } from 'express';
import { getProductos, getProductoById, crearProducto, updateProducto, deleteProducto } from './producto.controller';
import { isAuth } from '../shared/auth.middleware';

const router = Router();

// --- RUTAS PÚBLICAS ---
router.get('/',                 getProductos);
router.get('/:codigoArticulo',  getProductoById);

// --- RUTAS PROTEGIDAS ---
router.post('/',                isAuth, crearProducto);
router.put('/:codigoArticulo',  isAuth, updateProducto);
router.delete('/:codigoArticulo', isAuth, deleteProducto);

export default router;
