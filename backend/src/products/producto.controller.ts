import {Request, Response, NextFunction} from 'express';
import { ProductoModelo } from './producto.model';


// --- Obtener todos los productos ---

export const getProductos = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const productos = await ProductoModelo.find();
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
        const nuevoProducto = new ProductoModelo({
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

// --- GET un producto por ID ---
export const getProductoById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { codigoArticulo } = req.params;
        const producto = await ProductoModelo.findOne({ codigoArticulo });
        if(!producto){
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.status(200).json({ success: true, data: producto });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo producto', detail: (error as Error).message });
    }
};

// --- UPDATE un producto ---
export const updateProducto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { codigoArticulo } = req.params;
        const producto = await ProductoModelo.findOneAndUpdate(
            { codigoArticulo },
            req.body,
            { new: true, runValidators: true }
        );
        if (!producto) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.status(200).json({ success: true, data: producto });
    } catch (error) {
        next(error);
    }
};

// --- DELETE un producto ---
export const deleteProducto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { codigoArticulo } = req.params;
        const producto = await ProductoModelo.findOneAndDelete({ codigoArticulo });
        if (!producto) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.status(200).json({ success: true, message: 'Producto eliminado' });
    } catch (error) {
        next(error);
    }
};


