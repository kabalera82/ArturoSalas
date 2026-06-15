require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./src/shared/db');
const app = express();


// --- INSTANCIA EXPRESS ---
app.use(express.json());

// --- CORS ---
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'];

app.use(cors ({
  origin: (origin, cb) => {
    if(!origin || allowedOrigins.includes(origin)) cb (null, true);
    else cb(new Error(`CORS bloqueado: ${origin}`))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// --- MIDDLEWARES ---
app.use(express.json());

// --- RUTAS ---
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    api: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
  })
})

// --- CONTROL DE ERRORES ---
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// --- SERVIDOR ---
const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🍺🍺🍺🍺 Servidor levantado en http://localhost:${PORT} 🍺🍺🍺🍺`);
    });
  } catch (error) {
    console.error('No se pudo iniciar la aplicacion por error de DB:', error);
    // Si no conecta, terminamos el process
    process.exit(1);
  }
};

// --- ARRANQUE DEL SERVIDOR ---
startServer();