# Backend Tienda de Lucha — TypeScript + Node.js + Express

Stack: TypeScript · Express · MongoDB (Mongoose) · JWT · bcrypt
Arquitectura: **Feature Slices** — cada dominio es una carpeta autónoma con su modelo, controlador y rutas.

---

## Fase 1 — Inicialización

```bash
pnpm init
pnpm add express mongoose dotenv cors bcrypt jsonwebtoken
pnpm add -D typescript ts-node-dev ts-node @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken
pnpm exec tsc --init
```

**`tsconfig.json`** — ajusta estas opciones:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**`package.json`** — scripts:

```json
{
  "scripts": {
    "dev":   "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed":  "ts-node --transpile-only src/seeds/seed.ts"
  }
}
```

**`.env`**

```env
PORT=3000
DB_URL=mongodb+srv://$DATABASE_USER:$DATABASE_PASS@cluster.mongodb.net/tienda-lucha
DATABASE_USER=usuario
DATABASE_PASS=password
JWT_SECRET=genera_uno_con_crypto_randomBytes_32
ALLOWED_ORIGINS=http://localhost:5173
```

> Las credenciales van separadas en `DATABASE_USER`/`DATABASE_PASS` y se inyectan en `DB_URL` mediante los placeholders `$DATABASE_USER`/`$DATABASE_PASS`. `resolverDbUrl` las codifica con `encodeURIComponent`, así que un password con caracteres especiales (`@`, `/`, `:`) no rompe la URL.

**`.gitignore`**

```
node_modules/
dist/
.env
.env.*
```

---

## Fase 2 — Estructura de Directorios (Slice)

En lugar de agrupar por tipo técnico (controllers/, models/, routes/), agrupamos por **dominio**. Cada slice contiene todo lo necesario para esa funcionalidad. El código compartido entre slices va en `shared/`.

```
src/
├── shared/                  ← código que usan varios slices
│   ├── db.js                  conexión a MongoDB (JS hasta migrar a TS)
│   ├── token.utils.ts         firmar y verificar JWT
│   └── auth.middleware.ts     isAuth + isAdmin
│
├── auth/                    ← slice de autenticación
│   ├── user.model.ts          esquema + modelo de Usuario
│   ├── auth.controller.ts     register + login
│   └── auth.routes.ts         POST /register, POST /login
│
├── products/                ← slice de productos
│   ├── product.model.ts       esquema + modelo de Producto
│   ├── products.controller.ts CRUD de productos
│   └── products.routes.ts     GET/POST/PUT/DELETE /products
│
├── seeds/                   ← scripts de datos de prueba
│   ├── users.seed.ts
│   ├── products.seed.ts
│   └── seed.ts
│
└── index.ts                 ← punto de entrada final: monta slices
```

> Regla: un slice no importa de otro slice. Si dos slices necesitan algo, va a `shared/`.

---

---

## Fase 3 — Shared: Conexión a BD (`src/shared/db.js`)

Lo primero que se implementa: sin conexión no hay nada que verificar.

```js
// src/shared/db.js

// importamos mongoose para gestionar la conexión con MongoDB
const mongoose = require('mongoose');

// ------------ RESOLVER URL -----------------------------------------------

// construimos la URL de conexión inyectando las credenciales desde el .env
// las credenciales van codificadas para que caracteres especiales no rompan la URL
const resolverDbUrl = async () => {
  // leemos la URL base con los placeholders $DATABASE_USER y $DATABASE_PASS
  const direccionUrl = process.env.DB_URL;

  // si no está definida lanzamos error — no tiene sentido continuar sin ella
  if (!direccionUrl) {
    throw new Error('DB_URL no está definida en las variables de entorno');
  }

  // leemos usuario y password por separado para codificarlos con encodeURIComponent
  const user = process.env.DATABASE_USER;
  const pass = process.env.DATABASE_PASS;

  // sustituimos los placeholders por los valores reales y devolvemos la URL lista
  return direccionUrl
    .replace('$DATABASE_USER', encodeURIComponent(user || ''))
    .replace('$DATABASE_PASS', encodeURIComponent(pass || ''));
};

// ------------ CONEXIÓN ---------------------------------------------------

// función principal de conexión — la llamará index.js al arrancar
const conectarDB = async () => {
  // resolvemos la URL antes de conectar
  const url = await resolverDbUrl();

  try {
    // conectamos a MongoDB con la URL resuelta
    await mongoose.connect(url);
    console.log('MongoDB conectado');
  } catch (error) {
    // logueamos el error pero lo relanzamos — index.js decide qué hacer con él
    console.error('Error de conexión a MongoDB:', error);
    throw error;
  }
};

// ------------ EXPORTAMOS -------------------------------------------------

// exportamos la función para que index.js pueda llamarla al arrancar
module.exports = conectarDB;
```

---

## Fase 4 — Servidor mínimo + verificación en navegador (`index.js`)

Con la BD lista, levantamos el servidor mínimo. El único objetivo en esta fase es confirmar que servidor y BD arrancan. El endpoint `GET /health` permite verlo en el navegador sin Postman.

```js
// index.js

// cargamos las variables de entorno desde el archivo .env
require('dotenv').config();

// importamos express para crear el servidor HTTP
const express = require('express');
// importamos cors para permitir peticiones desde el frontend
const cors = require('cors');
// importamos mongoose para leer el estado de la conexión en /health
const mongoose = require('mongoose');
// importamos nuestra función de conexión a la base de datos
const connectDB = require('./src/shared/db');

// ------------ INSTANCIA EXPRESS ------------------------------------------

// creamos la instancia principal de express
const app = express();

// ------------ CORS -------------------------------------------------------

// leemos los orígenes permitidos desde el .env — si no están definidos usamos localhost:5173
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'];

// configuramos cors para permitir solo los orígenes de la lista
app.use(cors({
  origin: (origin, cb) => {
    // permitimos peticiones sin origin (curl, Postman) y las de la lista
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`CORS bloqueado: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ------------ MIDDLEWARES ------------------------------------------------

// habilitamos el parsing de JSON en el body de las peticiones
app.use(express.json());

// ------------ RUTAS DE VERIFICACIÓN --------------------------------------

// ruta de health check — permite comprobar servidor y BD desde el navegador
// http://localhost:3000/health debe devolver { status: 'ok', db: 'connected' }
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    // readyState 1 significa conectado en mongoose
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ------------ MANEJO DE ERRORES ------------------------------------------

// capturamos cualquier ruta que no coincida y devolvemos 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// manejador global de errores
// los 4 argumentos son obligatorios para que Express lo reconozca como middleware de error
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ------------ SERVIDOR ---------------------------------------------------

// leemos el puerto desde el .env o usamos 3000 por defecto
const PORT = Number(process.env.PORT) || 3000;

// levantamos el servidor solo después de conectar a la base de datos
// si la BD falla no tiene sentido arrancar — terminamos el proceso
const startServer = async () => {
  try {
    // conectamos a MongoDB primero
    await connectDB();
    // solo si conecta levantamos express
    app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    // salimos con código de error para que el proceso padre sepa que falló
    process.exit(1);
  }
};

// ------------ ARRANQUE ---------------------------------------------------

// llamamos a la función principal
startServer();
```

**Comprobación:**

```bash
node index.js
```

Abre `http://localhost:3000/health` en el navegador. Debe devolver:

```json
{ "status": "ok", "db": "connected" }
```

Si `db` es `"disconnected"`, revisar `.env`.

> A partir de aquí se construyen los slices. Cuando estén listos se migra a `src/index.ts` (Fase 9) que los monta.

---

---

## Fase 5 — Shared: JWT Utils (`src/shared/token.utils.ts`)

```typescript
// src/shared/token.utils.ts

// importamos jsonwebtoken para firmar y verificar tokens
import jwt from 'jsonwebtoken';

// ------------ TIPOS ------------------------------------------------------

// definimos la forma del payload que viaja dentro del JWT
// id, username y rol son los datos mínimos para identificar al usuario en cada petición
export interface TokenPayload {
  id:       string;
  username: string;
  rol:      string;
}

// extendemos el tipo Request de Express para añadir req.user en todos los controladores
// va aquí porque TokenPayload ES exactamente el tipo de req.user — mismo archivo, sin carpetas extra
// regla: shared no importa de slices — por eso req.user es TokenPayload y no UserDocument
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// ------------ FIRMAR TOKEN -----------------------------------------------

// generamos un JWT firmado con la clave secreta del .env — caduca en 8 horas
// el ! le dice a TypeScript que confiamos en que JWT_SECRET está definida
export const generateToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' });

// ------------ VERIFICAR TOKEN --------------------------------------------

// verificamos el JWT y devolvemos el payload decodificado
// si el token es inválido o ha caducado jwt.verify lanza un error
export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
```

---

## Fase 6 — Slice Auth

### `src/auth/user.model.ts`

```typescript
// src/auth/user.model.ts

// importamos las utilidades de mongoose para definir esquemas y el modelo
import { Schema, model, HydratedDocument } from 'mongoose';
// importamos bcryptjs para hashear el password antes de guardar
import bcrypt from 'bcryptjs';

// ------------ ENUMS ------------------------------------------------------

// roles posibles — usamos enum para evitar strings sueltos en el código
export enum UserRole {
  USER    = 'user',
  ADMIN   = 'admin',
  PREMIUM = 'premium',
}

// estados posibles del usuario — PENDING hasta que verifique el email
export enum UserStatus {
  PENDING = 'pendiente',
  ACTIVE  = 'activo',
  BANNED  = 'baneado',
}

// ------------ INTERFACES -------------------------------------------------

// forma de una dirección de envío — subesquema embebido en el perfil
export interface IShippingAddress {
  calle:            string;
  ciudad:           string;
  provincia:        string;
  codigoPostal:     string;
  pais:             string;
  esPredeterminada: boolean;
}

// forma del perfil del usuario — subesquema embebido en IUser
export interface IUserProfile {
  firstName:  string;
  lastName:   string;
  phone?:     string;
  avatarUrl?: string;
  addresses:  IShippingAddress[];
}

// interfaz principal del usuario — NO extiende Document
// mongoose añade _id y métodos al hidratar — mantenerla plana evita conflictos de tipado
export interface IUser {
  username:  string;
  email:     string;
  password?: string; // opcional para poder excluirlo en consultas con .select('-password')
  role:      UserRole;
  status:    UserStatus;
  profile:   IUserProfile;
  metadata: {
    lastLogin?:    Date;
    emailVerified: boolean;
  };
}

// tipo del documento ya hidratado — incluye _id como ObjectId y métodos de mongoose
export type UserDocument = HydratedDocument<IUser>;

// ------------ SUBESQUEMAS ------------------------------------------------

// subesquema de dirección — _id: true para poder actualizar o borrar una dirección concreta
const ShippingAddressSchema = new Schema<IShippingAddress>({
  calle:            { type: String, required: true, trim: true },
  ciudad:           { type: String, required: true, trim: true },
  provincia:        { type: String, required: true, trim: true },
  codigoPostal:     { type: String, required: true, trim: true },
  pais:             { type: String, required: true, trim: true },
  esPredeterminada: { type: Boolean, default: false },
}, { _id: true });

// subesquema de perfil — _id: false porque es parte del usuario, no un documento independiente
const UserProfileSchema = new Schema<IUserProfile>({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  phone:     { type: String, trim: true },
  avatarUrl: { type: String, default: 'https://placehold.co/150' },
  addresses: [ShippingAddressSchema],
}, { _id: false });

// ------------ ESQUEMA PRINCIPAL ------------------------------------------

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: true,   // unique: true ya crea el índice — no hace falta UserSchema.index()
    trim: true,
    lowercase: true,
    minlength: [3, 'El username debe tener al menos 3 caracteres'],
  },
  email: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Introduce un correo válido'],
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  // Object.values(UserRole) genera ['user', 'admin', 'premium'] — el enum es la única fuente de verdad
  role:   { type: String, enum: Object.values(UserRole),   default: UserRole.USER },
  status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING },
  profile: { type: UserProfileSchema, required: true },
  metadata: {
    lastLogin:     { type: Date },
    emailVerified: { type: Boolean, default: false },
  },
}, { timestamps: true, versionKey: false });

// ------------ HOOKS ------------------------------------------------------

// hasheamos el password antes de guardar — solo si ha cambiado
// sin esta comprobación hashearíamos dos veces al actualizar otros campos del usuario
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// eliminamos el password al serializar a JSON — nunca sale en las respuestas de la API
userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password;
    return ret;
  },
});

// ------------ MODELO -----------------------------------------------------

// creamos y exportamos el modelo — mongoose usará la colección 'users' en MongoDB
export const User = model<IUser>('User', userSchema);
```

### `src/auth/auth.controller.ts`

```typescript
// src/auth/auth.controller.ts

// importamos los tipos de express para tipar los parámetros
import { Request, Response } from 'express';
// importamos bcryptjs para comparar el password en el login
import bcrypt from 'bcryptjs';
// importamos el modelo para consultar y guardar usuarios
import { User } from './user.model';
// importamos la utilidad para generar el JWT al hacer login
import { generateToken } from '../shared/token.utils';

// ------------ REGISTER ---------------------------------------------------

// POST /api/auth/register — crea un usuario nuevo
// recibe: username, email, password, profile (firstName, lastName obligatorios)
// el hash del password lo hace el hook pre('save') del modelo — no se hashea aquí
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // extraemos los campos del body — profile es el subesquema de perfil
    const { username, email, password, profile } = req.body;

    // comprobamos duplicados antes de intentar guardar — evitamos el error de unique de mongo
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      res.status(400).json({ error: 'Usuario o email ya registrado' });
      return;
    }

    // creamos y guardamos — el hook pre('save') hasheará el password automáticamente
    const user = await new User({ username, email, password, profile }).save();

    // toJSON del modelo ya elimina el password — no hace falta quitarlo manualmente
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error en el registro', detail: (error as Error).message });
  }
};

// ------------ LOGIN ------------------------------------------------------

// POST /api/auth/login — valida credenciales y devuelve un JWT
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // validamos que vengan los dos campos antes de tocar la BD
    if (!username || !password) {
      res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      return;
    }

    // buscamos el usuario incluyendo el password — toJSON lo oculta pero select lo recupera
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // comparamos el password recibido con el hash guardado en BD
    const valid = await bcrypt.compare(password, user.password!);
    if (!valid) {
      res.status(401).json({ error: 'Contraseña incorrecta' });
      return;
    }

    // actualizamos la fecha del último login antes de responder
    user.metadata.lastLogin = new Date();
    await user.save();

    // generamos el JWT — user._id es ObjectId, lo convertimos a string
    const token = generateToken({
      id:       user._id.toString(),
      username: user.username,
      rol:      user.role,
    });

    // devolvemos el token y los datos básicos — el password nunca sale en la respuesta
    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, role: user.role, status: user.status },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el login', detail: (error as Error).message });
  }
};

// ------------ ME ---------------------------------------------------------

// GET /api/auth/me — devuelve el usuario completo del token activo
// req.user solo tiene el payload del JWT (id, username, rol)
// si necesitamos el documento completo lo consultamos aquí con ese id
export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    // consultamos el usuario completo usando el id del payload — excluimos el password
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(user);
  } catch {
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
};
```

### `src/auth/auth.routes.ts`

```typescript
// src/auth/auth.routes.ts

// importamos Router para definir las rutas del slice de forma aislada
import { Router } from 'express';
// importamos los controladores de este slice
import { register, login, me } from './auth.controller';
// importamos isAuth de shared — el único import permitido desde shared
import { isAuth } from '../shared/auth.middleware';

// creamos el router del slice de autenticación
const router = Router();

// ------------ RUTAS PÚBLICAS ---------------------------------------------

// POST /api/auth/register — crea un usuario nuevo
router.post('/register', register);

// POST /api/auth/login — valida credenciales y devuelve un JWT
router.post('/login', login);

// ------------ RUTAS PROTEGIDAS -------------------------------------------

// GET /api/auth/me — devuelve el usuario completo del token activo
// isAuth verifica el JWT y pone el payload en req.user antes de llegar al controlador
router.get('/me', isAuth, me);

// exportamos el router para montarlo en index.ts
export default router;
```

---

## Fase 7 — Shared: Middleware de Autenticación (`src/shared/auth.middleware.ts`)

Va en `shared/` porque el slice `products` lo usa para proteger sus rutas.

**Decisión de arquitectura importante**: el middleware NO consulta la base de datos. Solo verifica el JWT y pone el payload en `req.user`. ¿Por qué?

La regla de Feature Slices dice que `shared/` no puede importar de un slice. Si `auth.middleware.ts` importara `User` de `../auth/user.model`, estaría rompiendo esa regla. Hacerlo también crearía un acoplamiento innecesario: el middleware verificaría que el usuario todavía existe en BD en cada petición, lo que implica una query extra que la mayoría de rutas no necesita. Si el controlador necesita el usuario completo, lo consulta él mismo.

```typescript
// src/shared/auth.middleware.ts

// importamos los tipos de express para tipar los parámetros
import { Request, Response, NextFunction } from 'express';
// importamos verifyToken de shared — nunca importamos de un slice desde shared
import { verifyToken } from './token.utils';

// ------------ IS AUTH ----------------------------------------------------

// verifica el JWT y pone el payload decodificado en req.user
// NO hace query a la BD — si el controlador necesita el usuario completo lo consulta él mismo
// el tipo de req.user es TokenPayload, declarado en token.utils.ts donde vive TokenPayload
export const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  // leemos el token del header Authorization quitando el prefijo 'Bearer '
  const token = req.headers.authorization?.replace('Bearer ', '');

  // si no viene token rechazamos la petición antes de intentar verificar nada
  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  try {
    // verificamos el token — lanza error si es inválido o ha caducado
    // ponemos el payload en req.user — disponible para todos los middlewares y controladores siguientes
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// ------------ IS ADMIN ---------------------------------------------------

// verifica que el rol del payload es admin — siempre va después de isAuth, nunca solo
// lee req.user.rol directamente del JWT — sin query adicional a BD
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.rol !== 'admin') {
    res.status(403).json({ error: 'Solo administradores' });
    return;
  }
  next();
};
```

---

## Fase 8 — Slice Products

### `src/products/product.model.ts`

```typescript
// src/products/product.model.ts

// importamos las utilidades de mongoose para definir el esquema y el modelo
import { Schema, model, HydratedDocument } from 'mongoose';

// ------------ INTERFAZ ---------------------------------------------------

// definimos la forma de un producto en la base de datos
// los campos opcionales (description, image) coinciden con el esquema — no son required
export interface IProduct {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: 'camiseta' | 'mascara' | 'pantalon' | 'accesorio';
  image?: string;
  // active permite hacer soft delete — nunca borramos productos los desactivamos
  active: boolean;
}

// tipo del documento ya hidratado — es lo que devuelven las consultas
export type ProductDocument = HydratedDocument<IProduct>;

// ------------ ESQUEMA ----------------------------------------------------

// definimos la estructura y validaciones de la colección en MongoDB
const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    // min: 0 evita precios negativos
    price: { type: Number, required: true, min: 0 },
    // stock empieza en 0 por defecto si no se especifica
    stock: { type: Number, required: true, min: 0, default: 0 },
    // enum limita las categorías a los valores definidos en la interfaz
    category: { type: String, required: true, enum: ['camiseta', 'mascara', 'pantalon', 'accesorio'] },
    image: { type: String },
    // los productos nuevos están activos por defecto
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// ------------ MODELO -----------------------------------------------------

// creamos y exportamos el modelo — mongoose creará la colección 'products'
export const Product = model<IProduct>('Product', productSchema);
```

### `src/products/products.controller.ts`

```typescript
// src/products/products.controller.ts

// importamos los tipos de express para tipar los parámetros
import { Request, Response } from 'express';
// importamos el modelo para consultar la base de datos
import { Product } from './product.model';

// ------------ GET ALL ----------------------------------------------------

// GET /api/products — devuelve solo los productos activos
// los desactivados (soft delete) no se muestran al público
export const getProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    // filtramos por active: true para excluir los eliminados
    const products = await Product.find({ active: true });
    res.status(200).json(products);
  } catch {
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
};

// ------------ GET BY ID --------------------------------------------------

// GET /api/products/:id — devuelve un producto por su id de MongoDB
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    // buscamos por el id que viene en los parámetros de la URL
    const product = await Product.findById(req.params.id);
    // si no existe devolvemos 404
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.status(200).json(product);
  } catch {
    res.status(500).json({ error: 'Error obteniendo producto' });
  }
};

// ------------ CREATE -----------------------------------------------------

// POST /api/products — crea un producto nuevo (solo admins)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    // creamos y guardamos el producto con los datos del body
    const product = await new Product(req.body).save();
    // devolvemos 201 Created con el producto creado
    res.status(201).json(product);
  } catch (error) {
    // el esquema lanza error si los datos no cumplen las validaciones
    res.status(400).json({ error: 'Datos inválidos', detail: (error as Error).message });
  }
};

// ------------ UPDATE -----------------------------------------------------

// PUT /api/products/:id — actualiza un producto (solo admins)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // devuelve el documento actualizado no el anterior
      runValidators: true, // aplica las validaciones del esquema en el update
    });
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Datos inválidos', detail: (error as Error).message });
  }
};

// ------------ DELETE (SOFT) ----------------------------------------------

// DELETE /api/products/:id — desactiva un producto (solo admins)
// no borramos de BD — ponemos active: false para mantener el historial
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { active: false }, // soft delete — el producto sigue en BD pero no se muestra
      { new: true }
    );
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.status(200).json({ message: 'Producto desactivado' });
  } catch {
    res.status(500).json({ error: 'Error eliminando producto' });
  }
};
```

### `src/products/products.routes.ts`

```typescript
// src/products/products.routes.ts

// importamos Router para definir las rutas de este slice de forma aislada
import { Router } from 'express';
// importamos los middlewares de autenticación y autorización
import { isAuth, isAdmin } from '../shared/auth.middleware';
// importamos todos los controladores del slice de productos
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from './products.controller';

// creamos el router del slice de productos
const router = Router();

// ------------ RUTAS PÚBLICAS ---------------------------------------------

// GET /api/products — cualquiera puede ver el catálogo
router.get('/', getProducts);

// GET /api/products/:id — cualquiera puede ver un producto
router.get('/:id', getProductById);

// ------------ RUTAS PROTEGIDAS (admin) -----------------------------------

// isAuth verifica el JWT — isAdmin verifica que el usuario tiene rol admin
// ambos middlewares deben ir antes del controlador

// POST /api/products — solo admins pueden crear productos
router.post('/', isAuth, isAdmin, createProduct);

// PUT /api/products/:id — solo admins pueden editar productos
router.put('/:id', isAuth, isAdmin, updateProduct);

// DELETE /api/products/:id — solo admins pueden desactivar productos
router.delete('/:id', isAuth, isAdmin, deleteProduct);

// exportamos el router para montarlo en index.ts
export default router;
```

---

## Fase 9 — Servidor final (`src/index.ts`)

Todos los slices están listos. Montamos el servidor TypeScript definitivo y eliminamos `index.js`.

```typescript
// src/index.ts

// cargamos las variables de entorno al inicio antes que cualquier otra importación
import 'dotenv/config';
// importamos express para crear el servidor HTTP
import express from 'express';
// importamos cors para permitir peticiones desde el frontend
import cors from 'cors';
// importamos nuestra función de conexión a la base de datos
import { connectDB } from './shared/db';
// importamos los routers de cada slice
import authRoutes from './auth/auth.routes';
import productsRoutes from './products/products.routes';

// ------------ INSTANCIA EXPRESS ------------------------------------------

// creamos la instancia principal de express
const app = express();

// ------------ CORS -------------------------------------------------------

// leemos los orígenes permitidos desde el .env — si no están definidos usamos localhost:5173
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'];

// configuramos cors para permitir solo los orígenes de la lista
app.use(
  cors({
    origin: (origin, cb) => {
      // permitimos peticiones sin origin (curl, Postman) y las de la lista
      if (!origin || allowedOrigins.includes(origin)) cb(null, true);
      else cb(new Error(`CORS bloqueado: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ------------ MIDDLEWARES ------------------------------------------------

// habilitamos el parsing de JSON en el body de las peticiones
app.use(express.json());

// ------------ MONTAJE DE SLICES ------------------------------------------

// montamos cada slice en su prefijo de ruta correspondiente
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);

// ------------ MANEJO DE ERRORES ------------------------------------------

// capturamos cualquier ruta que no coincida y devolvemos 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// manejador global de errores — los 4 argumentos son obligatorios
// solo mostramos el detalle del error en desarrollo nunca en producción
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.message);
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    error: 'Error interno del servidor',
    ...(isDev && { detail: err.message }),
  });
});

// ------------ SERVIDOR ---------------------------------------------------

// leemos el puerto desde el .env o usamos 3000 por defecto
const PORT = process.env.PORT ?? 3000;

// levantamos el servidor solo después de conectar a la base de datos
// si la BD falla terminamos el proceso con código de error
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  });
```

> En este punto también migrar `src/shared/db.js` a `src/shared/db.ts` y actualizar el import en `index.ts`.

---

## Fase 10 — Seeds (`src/seeds/`)

Pueblan la BD para desarrollo. Dos archivos de datos + un script de ejecución. Para añadir o quitar registros solo se tocan los archivos de datos, nunca el script.

> `insertMany` se salta el hook `pre('save')`. Los passwords hay que hashearlos manualmente antes de insertar.

### `src/seeds/users.seed.ts`

```typescript
// src/seeds/users.seed.ts

// ------------ TIPO -------------------------------------------------------

// definimos la forma de cada usuario de prueba
// coincide con IUser pero sin _id ni timestamps — los genera mongoose
export interface UserSeedData {
  username: string;
  email: string;
  password: string;
  rol: 'user' | 'admin';
}

// ------------ DATOS ------------------------------------------------------

// lista de usuarios de prueba — un admin y tres usuarios normales
// los passwords se hashean en seed.ts antes de insertar
export const usersData: UserSeedData[] = [
  { username: 'admin',        email: 'admin@tienda-lucha.com', password: 'Admin1234',   rol: 'admin' },
  { username: 'luchador_k82', email: 'kali@tienda-lucha.com',  password: 'Cliente1234', rol: 'user'  },
  { username: 'rey_del_ring', email: 'rey@tienda-lucha.com',   password: 'Cliente1234', rol: 'user'  },
  { username: 'tigre_veloz',  email: 'tigre@tienda-lucha.com', password: 'Cliente1234', rol: 'user'  },
];
```

### `src/seeds/products.seed.ts`

```typescript
// src/seeds/products.seed.ts

// ------------ TIPO -------------------------------------------------------

// definimos la forma de cada producto de prueba
// coincide con IProduct pero sin _id ni timestamps
export interface ProductSeedData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: 'camiseta' | 'mascara' | 'pantalon' | 'accesorio';
  active: boolean;
}

// ------------ DATOS ------------------------------------------------------

// lista de productos de prueba organizados por categoría
export const productsData: ProductSeedData[] = [
  // CAMISETAS
  { name: 'Camiseta El Toro Rojo',       description: 'Camiseta oficial. 100% algodón. Estampado de alta resistencia.',                  price: 24.99,  stock: 50,  category: 'camiseta',  active: true },
  { name: 'Camiseta Rey del Cielo',      description: 'Diseño exclusivo del campeón aéreo. Tela técnica transpirable.',                  price: 27.99,  stock: 35,  category: 'camiseta',  active: true },
  { name: 'Camiseta La Serpiente Negra', description: 'Edición limitada. Impresión full body con el diseño de escamas del enmascarado.', price: 34.99,  stock: 15,  category: 'camiseta',  active: true },
  // MÁSCARAS
  { name: 'Máscara El Toro Rojo',        description: 'Réplica oficial. Piel sintética de alta calidad. Talla única ajustable.',        price: 59.99,  stock: 20,  category: 'mascara',   active: true },
  { name: 'Máscara Dragón Dorado',       description: 'Estilo tradicional mexicano. Lentejuelas doradas cosidas a mano. Certificada.',   price: 79.99,  stock: 10,  category: 'mascara',   active: true },
  { name: 'Máscara La Muerte Blanca',    description: 'Máscara de entrenamiento. Látex profesional. Usable en combate real.',           price: 49.99,  stock: 25,  category: 'mascara',   active: true },
  // PANTALONES
  { name: 'Short de Combate El Toro',    description: 'Short oficial. Elástico de cuatro vías. Cintura reforzada. Tallas S-XXL.',        price: 39.99,  stock: 40,  category: 'pantalon',  active: true },
  { name: 'Malla de Compresión Pro',     description: 'Grado competición. Tejido bi-direccional. Sin restricción de movimiento.',        price: 44.99,  stock: 30,  category: 'pantalon',  active: true },
  { name: 'Calzón de Lucha Clásico',     description: 'El calzón tradicional de lucha libre. Lycra brillante con ribetes dorados.',      price: 34.99,  stock: 20,  category: 'pantalon',  active: true },
  // ACCESORIOS
  { name: 'Réplica Cinturón Mundial',    description: 'Metal bañado en oro. Piel genuina. Placa personalizable.',                        price: 149.99, stock: 8,   category: 'accesorio', active: true },
  { name: 'Muñequeras de Combate x2',    description: 'Elásticas, 15 cm. Absorción de impactos. Grip antideslizante.',                   price: 12.99,  stock: 100, category: 'accesorio', active: true },
  { name: 'Rodilleras Lucha Libre Pro',  description: 'Neopreno reforzado articulado. Protección grado competición sin perder movilidad.', price: 29.99, stock: 45, category: 'accesorio', active: true },
  { name: 'Bolsa de Deporte Luchador',   description: 'Lona 40L. Compartimento para botas y malla ventilada interior.',                  price: 34.99,  stock: 30,  category: 'accesorio', active: true },
];
```

### `src/seeds/seed.ts`

```typescript
// src/seeds/seed.ts

// cargamos las variables de entorno antes que cualquier otra importación
import 'dotenv/config';
// importamos mongoose para conectar y desconectar manualmente
import mongoose from 'mongoose';
// importamos bcrypt para hashear los passwords manualmente
// insertMany no dispara el hook pre('save') del modelo
import bcrypt from 'bcrypt';
// importamos la función que resuelve la URL de conexión
import { resolverDbUrl } from '../shared/db';
// importamos los modelos para limpiar e insertar sus colecciones
import { User } from '../auth/user.model';
import { Product } from '../products/product.model';
// importamos los datos de prueba
import { usersData } from './users.seed';
import { productsData } from './products.seed';

// ------------ SEED -------------------------------------------------------

const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Conectando...');
    // conectamos directamente con la URL resuelta — sin pasar por connectDB
    await mongoose.connect(await resolverDbUrl());

    // vaciamos las colecciones antes de insertar
    // el catch ignora el error si la colección no existe aún (primera ejecución)
    await User.collection.drop().catch(() => {});
    await Product.collection.drop().catch(() => {});

    // hasheamos los passwords manualmente porque insertMany no dispara pre('save')
    const hashedUsers = await Promise.all(
      usersData.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 10) }))
    );

    // insertamos los usuarios hasheados
    const users = await User.insertMany(hashedUsers);
    console.log(`${users.length} usuarios insertados.`);

    // insertamos los productos — no necesitan hash
    const products = await Product.insertMany(productsData);
    console.log(`${products.length} productos insertados.`);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  } finally {
    // siempre desconectamos al terminar haya habido error o no
    await mongoose.disconnect();
    console.log('Listo.');
  }
};

// ------------ ARRANQUE ---------------------------------------------------

// ejecutamos el seed directamente
seedDatabase();
```

```bash
pnpm seed
```

---

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | No | Estado servidor + BD |
| POST | `/api/auth/register` | No | Registro |
| POST | `/api/auth/login` | No | Login → JWT |
| GET | `/api/products` | No | Catálogo activo |
| GET | `/api/products/:id` | No | Producto por ID |
| POST | `/api/products` | Admin | Crear producto |
| PUT | `/api/products/:id` | Admin | Editar producto |
| DELETE | `/api/products/:id` | Admin | Desactivar producto |

---

## Generar JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
