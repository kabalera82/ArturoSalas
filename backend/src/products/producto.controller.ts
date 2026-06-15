import {Request, Response, NextFunction} from 'express';
import { ProductoModel } from './producto.model';


// --- Obtener todos los productos ---

export const getProductos = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const productos = await ProductoModel.find();
        res.status(200).json({ success: true, data: productos });
    } catch (error) {
        next(error);
    }
}

// --- Crear Producto ---
export const crearProducto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validación básica de campos requeridos
        const { codigoArticulo, name, price, description, stock, category, subcategoria, marca, imagenes, tags } = req.body;
        // Crear instancia
        const nuevoProducto = new ProductoModel({
            codigoArticulo,
            name,
            price,
            description,
            stock,
            category,
            subcategoria,
            marca,
            imagenes,
            tags
        });    
        // guardamos en la base de datos
        const productoGuardado = await nuevoProducto.save();
        
        // Respondemos con el producto creado
        res.status(201).json({
            success:true,
            message: "Producto creado exitosamente",
            data: productoGuardado
        });

    } catch (error) {
        next(error); // Pasamos el error al middleware de manejo de errores

    }

}
