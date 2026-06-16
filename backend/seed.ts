import 'dotenv/config';
import mongoose from 'mongoose';
import { User, UserRole, UserStatus } from './src/users/user.model';
import { ProductoModelo, Categoria } from './src/products/producto.model';

const DB_URL = (process.env.DB_URL ?? '')
  .replace('$DATABASE_USER', encodeURIComponent(process.env.DATABASE_USER ?? ''))
  .replace('$DATABASE_PASS', encodeURIComponent(process.env.DATABASE_PASS ?? ''));

// ─── USUARIOS ────────────────────────────────────────────────────────────────

const usuarios = [
  {
    username: 'admin',
    email: 'admin@arturosalas.com',
    password: 'Admin1234!',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    profile: {
      firstName: 'Arturo',
      lastName: 'Salas',
      phone: '+34 600 000 001',
      addresses: [
        {
          calle: 'Calle Mayor 1',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España',
          esPredeterminada: true,
        },
      ],
    },
    metadata: { emailVerified: true },
  },
  {
    username: 'cliente',
    email: 'cliente@example.com',
    password: 'Cliente1234!',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    profile: {
      firstName: 'Carlos',
      lastName: 'Martínez',
      phone: '+34 600 000 002',
      addresses: [
        {
          calle: 'Avenida Libertad 45',
          ciudad: 'Barcelona',
          provincia: 'Barcelona',
          codigoPostal: '08001',
          pais: 'España',
          esPredeterminada: true,
        },
      ],
    },
    metadata: { emailVerified: true },
  },
  {
    username: 'invitado',
    email: 'invitado@example.com',
    password: 'Invitado1234!',
    role: UserRole.USER,
    status: UserStatus.PENDING,
    profile: {
      firstName: 'Invitado',
      lastName: 'Demo',
      addresses: [],
    },
    metadata: { emailVerified: false },
  },
];

// ─── PRODUCTOS ────────────────────────────────────────────────────────────────

const productos = [
  {
    codigoArticulo: 1001,
    name: 'Guantes de boxeo Venum Contender',
    price: 49.99,
    description: 'Guantes de boxeo profesionales con relleno de espuma multicapa. Ideales para entrenamiento y sparring.',
    stock: 25,
    category: Categoria.PROTECCIONES,
    subcategoria: 'Guantes de boxeo',
    marca: 'Venum',
    imagenes: ['https://res.cloudinary.com/dw6qgshkz/image/upload/v1769602366/nodisponible.jpg'],
    tags: ['destacado', 'boxeo', 'MMA'],
  },
  {
    codigoArticulo: 1002,
    name: 'Rashguard de compresión BJJ',
    price: 34.99,
    description: 'Rashguard de manga larga con tejido de alto rendimiento. Perfecto para BJJ y grappling.',
    stock: 40,
    category: Categoria.ROPA_ENTRENAMIENTO,
    subcategoria: 'Rashguards',
    marca: 'Tatami',
    imagenes: ['https://res.cloudinary.com/dw6qgshkz/image/upload/v1769602366/nodisponible.jpg'],
    tags: ['BJJ', 'grappling'],
  },
  {
    codigoArticulo: 1003,
    name: 'Botas de boxeo Adidas Box Hog 4',
    price: 89.99,
    description: 'Botas de boxeo con suela antideslizante y tobillera reforzada para máximo soporte.',
    stock: 15,
    category: Categoria.CALZADO,
    subcategoria: 'Botas de boxeo',
    marca: 'Adidas',
    imagenes: ['https://res.cloudinary.com/dw6qgshkz/image/upload/v1769602366/nodisponible.jpg'],
    tags: ['destacado', 'boxeo'],
  },
  {
    codigoArticulo: 1004,
    name: 'Casco de boxeo RDX Pro',
    price: 59.99,
    description: 'Casco con protección completa: frente, mejillas y mentón. Certificado para sparring.',
    stock: 20,
    category: Categoria.PROTECCIONES,
    subcategoria: 'Cascos',
    marca: 'RDX',
    imagenes: ['https://res.cloudinary.com/dw6qgshkz/image/upload/v1769602366/nodisponible.jpg'],
    tags: ['boxeo', 'sparring', 'kickboxing'],
  },
  {
    codigoArticulo: 1005,
    name: 'Shorts MMA Venum Challenger',
    price: 39.99,
    description: 'Shorts de combate con panel elástico lateral y cierre velcro. Libertad de movimiento total.',
    stock: 50,
    category: Categoria.ROPA_ENTRENAMIENTO,
    subcategoria: 'Shorts MMA',
    marca: 'Venum',
    imagenes: ['https://res.cloudinary.com/dw6qgshkz/image/upload/v1769602366/nodisponible.jpg'],
    tags: ['MMA', 'kickboxing'],
  },
  {
    codigoArticulo: 1006,
    name: 'Sudadera con capucha Artur Salas Team',
    price: 44.99,
    description: 'Sudadera oficial del equipo. Algodón grueso 320g/m², interior suave y logo bordado.',
    stock: 30,
    category: Categoria.ROPA_CALLE,
    subcategoria: 'Sudaderas',
    marca: 'Artur Salas',
    imagenes: ['https://res.cloudinary.com/dw6qgshkz/image/upload/v1769602366/nodisponible.jpg'],
    tags: ['destacado', 'lifestyle'],
  },
  {
    codigoArticulo: 1007,
    name: 'Espinilleras Muay Thai Fairtex SP5',
    price: 54.99,
    description: 'Espinilleras de cuero sintético con relleno de espuma de alta densidad. Talla única ajustable.',
    stock: 18,
    category: Categoria.PROTECCIONES,
    subcategoria: 'Espinilleras',
    marca: 'Fairtex',
    imagenes: ['https://res.cloudinary.com/dw6qgshkz/image/upload/v1769602366/nodisponible.jpg'],
    tags: ['muay thai', 'kickboxing'],
  },
  {
    codigoArticulo: 1008,
    name: 'Mochila de deporte Artur Salas Pro',
    price: 69.99,
    description: 'Mochila 45L con compartimento para ropa mojada, portaguantes y bolsillo lateral para botella.',
    stock: 12,
    category: Categoria.ACCESORIOS,
    subcategoria: 'Mochilas',
    marca: 'Artur Salas',
    imagenes: ['https://res.cloudinary.com/dw6qgshkz/image/upload/v1769602366/nodisponible.jpg'],
    tags: ['destacado', 'lifestyle'],
  },
  {
    codigoArticulo: 1009,
    name: 'Vendas de boxeo Fighter 4.5m',
    price: 9.99,
    description: 'Vendas elásticas de 4.5 metros para protección de muñecas y nudillos. Pack de 2 unidades.',
    stock: 100,
    category: Categoria.PROTECCIONES,
    subcategoria: 'Vendas',
    marca: 'Fighter',
    imagenes: ['https://res.cloudinary.com/dw6qgshkz/image/upload/v1769602366/nodisponible.jpg'],
    tags: ['boxeo', 'MMA', 'kickboxing'],
  },
  {
    codigoArticulo: 1010,
    name: 'Camiseta técnica Artur Salas Training',
    price: 24.99,
    description: 'Camiseta técnica de entrenamiento con tecnología DryFit. Transpirable y de secado rápido.',
    stock: 60,
    category: Categoria.ROPA_ENTRENAMIENTO,
    subcategoria: 'Camisetas técnicas',
    marca: 'Artur Salas',
    imagenes: ['https://res.cloudinary.com/dw6qgshkz/image/upload/v1769602366/nodisponible.jpg'],
    tags: ['lifestyle'],
  },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function seed() {
  if (!DB_URL) {
    console.error('DB_URL no definida en .env');
    process.exit(1);
  }

  await mongoose.connect(DB_URL);
  console.log('Conectado a MongoDB');

  await User.deleteMany({});
  await ProductoModelo.deleteMany({});
  console.log('Colecciones limpiadas');

  for (const u of usuarios) {
    await new User(u).save();
  }
  console.log(`${usuarios.length} usuarios insertados`);

  await ProductoModelo.insertMany(productos);
  console.log(`${productos.length} productos insertados`);

  await mongoose.disconnect();
  console.log('Seed completado');
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
