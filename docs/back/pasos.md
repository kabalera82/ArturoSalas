# Guía — Backend con TypeScript, Express y MongoDB (Feature Slice)

Stack: Node.js + TypeScript · Express 5 · MongoDB Atlas + Mongoose · dotenv · JWT

---

## Por qué Feature Slice

La organización por capas (models/, controllers/, routes/) escala mal: para tocar una sola entidad hay que saltar entre tres carpetas. Feature Slice agrupa todo lo de una entidad en su propio directorio. Si se añade o elimina una entidad, se toca un solo lugar.

```
Por capas (escala mal)          Feature Slice (escala bien)
─────────────────────────────   ─────────────────────────────
src/                            src/
├── models/                     ├── productos/
│   ├── Producto.ts             │   ├── producto.model.ts
│   └── Usuario.ts              │   ├── producto.controller.ts
├── controllers/                │   └── producto.routes.ts
│   ├── productoController.ts   ├── usuarios/
│   └── usuarioController.ts    │   ├── usuario.model.ts
└── routes/                     │   ├── usuario.controller.ts
    ├── productoRoutes.ts        │   └── usuario.routes.ts
    └── usuarioRoutes.ts         └── middleware/
                                     └── auth.middleware.ts
```

---

## Estructura final del proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts
│   ├── productos/
│   │   ├── producto.model.ts
│   │   ├── producto.controller.ts
│   │   └── producto.routes.ts
│   ├── usuarios/
│   │   ├── usuario.model.ts
│   │   ├── usuario.controller.ts
│   │   └── usuario.routes.ts
│   └── middleware/
│       └── auth.middleware.ts
├── docs/
│   └── pasos.md
├── index.ts
├── tsconfig.json
├── .env
└── package.json
```

---

## Paso 1 — Inicializar proyecto

```bash
pnpm init
```

---

## Paso 2 — Instalar dependencias

```bash
# Producción
pnpm add express mongoose bcryptjs jsonwebtoken dotenv

# Desarrollo
pnpm add -D typescript ts-node-dev @types/express @types/node @types/jsonwebtoken @types/bcryptjs
```

> `@types/node` es obligatorio en proyectos TypeScript con Node: sin él VS Code no reconoce `process.env`, `__dirname`, etc.

---

## Paso 3 — Configurar TypeScript

`tsconfig.json`:

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
  },
  "include": ["src", "index.ts"],
  "exclude": ["node_modules", "dist"]
}
```

`package.json` — scripts:

```json
"scripts": {
  "dev": "ts-node-dev --respawn index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

---

## Paso 4 — Variables de entorno

`.env`:

```
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/arturosalas
PORT=3000
JWT_SECRET=una_clave_secreta_larga_y_aleatoria
```

> `.env` ya está en `.gitignore`. Nunca se sube al repo.

---

## Paso 5 — Conexión a MongoDB Atlas

### Crear la base de datos en Atlas

1. [cloud.mongodb.com](https://cloud.mongodb.com) → Create a deployment → **M0** (gratuito)
2. Crear usuario de base de datos (usuario + contraseña)
3. Network Access → Add IP Address → `0.0.0.0/0`
4. Connect → Drivers → copiar la Connection String y pegarla en `.env`

### `src/config/db.ts`

```ts
import mongoose from 'mongoose'

export const conectarDB = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGO_URI as string)
  console.log('MongoDB conectado')
}
```

---

## Paso 6 — Middleware de autenticación

Vive en `src/middleware/` porque es transversal: lo usan varios slices.

### `src/middleware/auth.middleware.ts`

```ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  id: string
  rol: string
}

export const proteger = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ mensaje: 'No autorizado — falta token' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload
    ;(req as any).usuario = decoded
    next()
  } catch {
    res.status(401).json({ mensaje: 'Token inválido' })
  }
}
```

---

## Paso 7 — Slice: Productos

Los tres archivos del slice viven juntos en `src/productos/`.

### `src/productos/producto.model.ts`

```ts
import { Schema, model, Document } from 'mongoose'

export interface IProducto extends Document {
  titulo: string
  descripcion?: string
  precio: number
  categoria?: string
  imagen?: string
  stock: number
  activo: boolean
}

const productoSchema = new Schema<IProducto>({
  titulo:      { type: String, required: true },
  descripcion: { type: String },
  precio:      { type: Number, required: true },
  categoria:   { type: String },
  imagen:      { type: String },
  stock:       { type: Number, default: 0 },
  activo:      { type: Boolean, default: true },
}, { timestamps: true })

export default model<IProducto>('Producto', productoSchema)
```

### `src/productos/producto.controller.ts`

```ts
import { Request, Response } from 'express'
import Producto from './producto.model'

export const obtenerProductos = async (req: Request, res: Response): Promise<void> => {
  const productos = await Producto.find({ activo: true })
  res.json(productos)
}

export const obtenerProductoPorId = async (req: Request, res: Response): Promise<void> => {
  const producto = await Producto.findById(req.params.id)

  if (!producto) {
    res.status(404).json({ mensaje: 'Producto no encontrado' })
    return
  }

  res.json(producto)
}

export const crearProducto = async (req: Request, res: Response): Promise<void> => {
  const producto = await Producto.create(req.body)
  res.status(201).json(producto)
}
```

### `src/productos/producto.routes.ts`

```ts
import { Router } from 'express'
import { obtenerProductos, obtenerProductoPorId, crearProducto } from './producto.controller'
import { proteger } from '../middleware/auth.middleware'

const router = Router()

router.get('/', obtenerProductos)
router.get('/:id', obtenerProductoPorId)
router.post('/', proteger, crearProducto)

export default router
```

---

## Paso 8 — Slice: Usuarios

### `src/usuarios/usuario.model.ts`

```ts
import { Schema, model, Document } from 'mongoose'

export interface IUsuario extends Document {
  nombre: string
  email: string
  password: string
  rol: 'admin' | 'usuario'
}

const usuarioSchema = new Schema<IUsuario>({
  nombre:   { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol:      { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
}, { timestamps: true })

export default model<IUsuario>('Usuario', usuarioSchema)
```

### `src/usuarios/usuario.controller.ts`

```ts
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Usuario from './usuario.model'

const generarToken = (id: string, rol: string): string =>
  jwt.sign({ id, rol }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

export const registrar = async (req: Request, res: Response): Promise<void> => {
  const { nombre, email, password } = req.body

  const existe = await Usuario.findOne({ email })
  if (existe) {
    res.status(400).json({ mensaje: 'El email ya está registrado' })
    return
  }

  const hash = await bcrypt.hash(password, 10)
  const usuario = await Usuario.create({ nombre, email, password: hash })

  res.status(201).json({
    id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    token: generarToken(String(usuario._id), usuario.rol),
  })
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  const usuario = await Usuario.findOne({ email })

  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    res.status(401).json({ mensaje: 'Credenciales incorrectas' })
    return
  }

  res.json({
    id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    token: generarToken(String(usuario._id), usuario.rol),
  })
}

export const perfil = async (req: Request, res: Response): Promise<void> => {
  const usuario = await Usuario.findById((req as any).usuario.id).select('-password')
  res.json(usuario)
}
```

`select('-password')` excluye el hash de la respuesta.

### `src/usuarios/usuario.routes.ts`

```ts
import { Router } from 'express'
import { registrar, login, perfil } from './usuario.controller'
import { proteger } from '../middleware/auth.middleware'

const router = Router()

router.post('/registro', registrar)
router.post('/login', login)
router.get('/perfil', proteger, perfil)

export default router
```

---

## Paso 9 — Entry point

`index.ts` solo conecta piezas. No tiene lógica de negocio.

```ts
import express from 'express'
import dotenv from 'dotenv'
import { conectarDB } from './src/config/db'
import productoRoutes from './src/productos/producto.routes'
import usuarioRoutes from './src/usuarios/usuario.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())

app.use('/api/productos', productoRoutes)
app.use('/api/usuarios', usuarioRoutes)

conectarDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`))
})
```

---

## Paso 10 — Arrancar en desarrollo

```bash
pnpm dev
```

---

## Endpoints disponibles

| Método | Ruta                      | Auth | Descripción                    |
|--------|---------------------------|------|--------------------------------|
| GET    | /api/productos            | No   | Lista todos los productos      |
| GET    | /api/productos/:id        | No   | Un producto por ID             |
| POST   | /api/productos            | Sí   | Crear producto                 |
| POST   | /api/usuarios/registro    | No   | Registrar usuario              |
| POST   | /api/usuarios/login       | No   | Login → devuelve JWT           |
| GET    | /api/usuarios/perfil      | Sí   | Perfil del usuario autenticado |

Para los endpoints con Auth:
```
Authorization: Bearer <token>
```

---

## Añadir un nuevo slice

Agregar una entidad nueva (ej. `pedidos`) es mecánico:

```
src/pedidos/
├── pedido.model.ts       → schema + interfaz
├── pedido.controller.ts  → lógica de negocio
└── pedido.routes.ts      → endpoints
```

Luego en `index.ts`:
```ts
import pedidoRoutes from './src/pedidos/pedido.routes'
app.use('/api/pedidos', pedidoRoutes)
```

Una entidad = una carpeta. Sin tocar nada de los otros slices.

---

## Flujo completo

```
Request
  └── index.ts                app.use monta los slices
        └── *.routes.ts       define método + path + middleware
              └── auth.middleware.ts  (si aplica) verifica JWT
                    └── *.controller.ts  llama al modelo, construye la respuesta
                          └── *.model.ts  Mongoose consulta MongoDB Atlas
                                └── Response JSON
```
