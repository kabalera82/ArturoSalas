import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './src/shared/db';
import userRouter from './src/users/auth.routes';
import productoRouter from './src/products/producto.routes';

const app = express();

// --- MIDDLEWARES ---
app.use(express.json());

// --- CORS ---
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origen no permitido → ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- RUTAS ---
app.use('/api/users',    userRouter);
app.use('/api/productos', productoRouter);

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    api: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
  });
});

// --- CONTROL DE ERRORES ---
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// --- SERVIDOR ---
const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor levantado en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar la aplicacion por error de DB:', error);
    process.exit(1);
  }
};

startServer();


/**
 Productos — tienes:
  getProductos, getProductoById, crearProducto, updateProducto, deleteProducto

  Faltan:

  searchProductos — búsqueda por texto (ya tienes el índice text en el modelo, sin usar)
  getProductosByCategoria — filtrar por categoría, es la navegación principal de cualquier tienda
  getProductosByMarca — filtro por marca
  updateStock — PATCH específico para stock, sin tocar el resto del producto
  getProductosDestacados — productos con tag o flag especial para home/banners
  Usuarios — tienes:
  register, login, me, getAllUsers, updateUser, deleteUser

  Faltan:

  getUserById — consultar un usuario concreto (admin o perfil público)
  updatePassword — cambio de contraseña separado del update general, necesita verificar la contraseña actual
  addAddress / removeAddress — gestión de direcciones de envío, es un subdocumento en el modelo y necesita su propia lógica
  updateStatus — PATCH solo para el campo status (activar, banear), es una acción de admin
  forgotPassword / resetPassword — recuperación por email, necesita token temporal


  PORT=3000
  DB_URL=mongodb://$DATABASE_USER:$DATABASE_PASS@ac-tdlfvfd-shard-00-00.ih89jnt.mongodb.net:27017,ac-tdlfvfd-shard-00-01.ih89jnt.mongodb.net:27017,ac-tdlfvfd-shard-00-02.ih89jnt.mongodb.net:27017/?ssl=true&replicaSet=atlas-nj3hov-shard-0&authSource=admin&appName=tienda
  DATABASE_USER=kabalera
  DATABASE_PASS=04AcjWCMYasMud5h
  JWT_SECRET=La_Super_Contraseña_Super_Secreta
  ALLOWED_ORIGINS=http://localhost:5173
  CLOUDINARY_API_KEY=794227363875353
  CLOUDINARY_API_SECRET=s3uNk3whexMV9SEvsmJ6iOHKvVI
  CLOUDINARY_CLOUD_NAME=dw6qgshkz
 */