// src/config/db.js
// Importamos mongoose para conectarnos a la base de datos MongoDB
const mongoose = require('mongoose');

// Funcion para comprobar y resolver la URL de la base de datos
const resolverDbUrl = async () => {
  const direccionUrl = process.env.DB_URL;
  if (!direccionUrl) {
    throw new Error('DB_URL no esta definida en las variables de entorno');
  }

  const user = process.env.DATABASE_USER;
  const pass = process.env.DATABASE_PASS;

  return direccionUrl
    .replace('$DATABASE_USER', encodeURIComponent(user || ''))
    .replace('$DATABASE_PASS', encodeURIComponent(pass || ''));
};

// Conexion a la base de datos MongoDB usando mongoose
const conectarDB = async () => {
  const direccionUrl = await resolverDbUrl();

  try {
    await mongoose.connect(direccionUrl);
    console.log('🎉🎉🥳🎉🎉 MongoDB connected 🎉🎉🥳🎉🎉');
  } catch (error) {
    console.error('🍑🍆 MongoDB connection error:', error);
    throw error;
  }
};

module.exports = conectarDB;
