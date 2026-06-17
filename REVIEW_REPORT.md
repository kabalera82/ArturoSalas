# Code Review Report — ArturoSalas

**Date:** 2026-06-16
**Reviewer:** Senior Review Skill v2.0
**Scope:** Clean Code · Clean Architecture · Security

---

## Global Score: 5.5/10

| Area | Score | Status |
|---|---|---|
| Clean Code | 6/10 | WARNING |
| Clean Architecture | 6/10 | WARNING |
| Security | 4/10 | CRITICAL |
| Tests | 0/10 | CRITICAL |
| Configuration | 5/10 | WARNING |

---

## Clean Code

### Findings

- La mayoría del frontend tiene naming correcto, tipos bien definidos y componentes con responsabilidad única.
- El patrón de separar datos en archivos `.ts` (cardItem.ts, navItems.ts, footItems.ts) es correcto.
- El backend tiene controladores bien estructurados con manejo de errores consistente.
- **ShopPage.tsx es código roto**: usa `data` y `cart` sin declararlos con `useState`, referencia `<Header>` y `<Guitar>` que no existen y no están importados. No compila ni ejecuta.
- `addToCart` muta directamente el parámetro (`item.quantity = 1`) — violación de inmutabilidad.
- `MIN_ITEMS`/`MAX_ITEMS` declarados dentro del componente — se recrean en cada render, deben ser constantes a nivel de módulo.
- `CoachPresentation.tsx` está completamente implementado pero no se usa en ningún sitio.
- `Card.tsx` declara `onClick` en sus props pero no lo usa en la implementación.
- `NavLinks.tsx` redefine el tipo `NavItem` localmente en lugar de importarlo de `navItems.ts` — duplicación de tipo.

### Violations (file:line)

- `ShopPage.tsx:6-116` — estado (`data`, `cart`) usado sin declarar; componentes `<Header>` y `<Guitar>` no importados; parámetro `item` sin tipo
- `ShopPage.tsx:37` — `item.quantity = 1` muta el argumento de entrada
- `ShopPage.tsx:8-9` — constantes dentro del cuerpo del componente
- `ShopPage.tsx:1` — `React` importado pero innecesario con el transform JSX de React 17+
- `ShopPage.tsx:2` — `cardItems` importado pero nunca usado
- `Card.tsx:10` — prop `onClick` declarada pero ignorada
- `NavLinks.tsx:3` — tipo `NavItem` redefinido localmente

---

## Clean Architecture

### Findings

- El frontend sigue una separación razonable: componentes compartidos, páginas, layouts, contexto.
- El backend distingue correctamente entre rutas, controladores y modelos.
- **HomePage.tsx tiene un import roto** después de mover el archivo de `pages/` a `pages/home/`: `'../components/...'` resuelve a `src/pages/components/` que no existe. Debe ser `'../../components/...'`. La ruta `/` crashea.
- `cloudinary.utils.ts` tiene nombre de función `createImgBook` y usa `folder: "libreria"` — código copiado de otro proyecto y nunca adaptado.
- `db.js` es CommonJS puro en un proyecto TypeScript — inconsistencia de módulos.
- `file.middleware.ts` y `cloudinary.utils.ts` ambos configuran Cloudinary de forma independiente — configuración duplicada, riesgo de desincronización.
- El frontend no tiene capa de servicios: la llamada HTTP está directamente en `LoginPanel.tsx` y en `ShopPage.tsx`. Si hay más páginas que hacen fetch, la lógica de red estará dispersa en componentes.
- No existe una capa `services/` ni un cliente HTTP centralizado (axios con base URL, interceptores de token, etc.).

### Violations

- `HomePage.tsx:2-3` — import `'../components/HeroSection/HeroSection'` incorrecto desde `pages/home/`
- `LoginPanel.tsx:22` — URL hardcodeada `http://localhost:3000/api/users/login`
- `ShopPage.tsx:17` — URL hardcodeada `http://localhost:3000/api/productos`
- `cloudinary.utils.ts:1,17,34` — `export {}` + `module.exports` + nombre de función de otro proyecto
- `file.middleware.ts:1,22` — mismo patrón CJS/ESM híbrido; configura Cloudinary duplicando `cloudinary.utils.ts`
- `db.js` — CommonJS en proyecto TypeScript

---

## Security

### Findings

- JWT con expiración de 8h y secret desde env — correcto.
- Contraseñas hasheadas con bcrypt en el pre-save hook — correcto.
- `resetPasswordToken` y `resetPasswordExpires` tienen `select: false` — correcto.
- `toJSON` elimina el campo `password` de las respuestas — correcto.
- CORS configurado desde variable de entorno — correcto.
- **IDOR en updatePassword**: cualquier usuario autenticado puede cambiar la contraseña de otro usuario conociendo su `id`. No hay verificación de que `req.user.id === id`.
- **IDOR en addAddress/removeAddress**: igual, cualquier usuario autenticado puede modificar las direcciones de cualquier otro.
- **User enumeration en login**: devuelve 404 para "usuario no encontrado" y 401 para "contraseña incorrecta". Un atacante puede enumerar qué usuarios existen. Ambas respuestas deben devolver 401 con el mismo mensaje genérico.
- **Mass assignment en updateProducto**: `findOneAndUpdate(id, req.body, ...)` acepta cualquier campo del body sin filtrar — se puede sobreescribir `codigoArticulo`, `stock`, `imagenes` o cualquier campo interno.
- **CORS roto para rutas PATCH**: `index.ts` solo permite methods `['GET', 'POST', 'PUT', 'DELETE']`. Las rutas `PATCH /:id/password`, `PATCH /:id/status` y `PATCH /:codigoArticulo/stock` serán bloqueadas por CORS en el navegador.
- Sin rate limiting en el endpoint de login — vulnerable a fuerza bruta.
- Sin validación de esquema en el endpoint de registro — si falta `profile.firstName` o `profile.lastName`, Mongoose devuelve 500 en lugar de 400.

### Vulnerabilities

- [CRITICAL] IDOR — `PATCH /api/users/:id/password`: cualquier usuario autenticado puede cambiar la contraseña de otro (`auth.controller.ts:154`)
- [CRITICAL] IDOR — `POST /api/users/:id/addresses` y `DELETE /api/users/:id/addresses/:addressId`: sin verificación de propiedad (`auth.controller.ts:187,211`)
- [CRITICAL] Mass assignment — `PUT /api/productos/:codigoArticulo`: `req.body` pasado directamente a `findOneAndUpdate` (`producto.controller.ts:71`)
- [CRITICAL] CORS incompleto — `PATCH` no incluido en `methods` (`index.ts:17`)
- [HIGH] User enumeration — login devuelve códigos distintos según si el usuario existe (`auth.controller.ts:44,48`)
- [HIGH] Sin rate limiting en `POST /api/users/login`
- [MEDIUM] Sin validación de entrada en `register` — fallo de schema devuelve 500 (`auth.controller.ts:20`)

---

## Tests

### Findings

- Cero tests en frontend y backend.
- No existe ningún archivo de test ni configuración de testing.
- El seed tiene contraseñas en texto claro en el repositorio (`Admin1234!`) — aceptable para desarrollo pero debe estar en `.env` o documentado como solo-dev.

---

## Configuration & Dependencies

### Findings

- Frontend usa React 19, TypeScript 6, Vite 8 — stack muy actualizado.
- Backend tiene `bcrypt` y `bcryptjs` como dependencias simultáneas — solo se usa `bcryptjs`. `bcrypt` es una dependencia muerta.
- No existe `.env.example` — no hay documentación de qué variables de entorno son necesarias.
- `backend/tsconfig.json` tiene `"module": "commonjs"` y `"allowJs": true` — habilita el JS/TS mezclado que produce los híbridos CJS/ESM en `db.js`, `cloudinary.utils.ts` y `file.middleware.ts`.
- `frontend/tsconfig.app.json` tiene `noUnusedLocals: true` y `noUnusedParameters: true` — pero ShopPage.tsx importa `cardItems` sin usar. O no se está compilando este archivo, o el compilador no está corriendo.
- No hay `@types/multer` en devDependencies del backend a pesar de usar multer con TypeScript — el cast `(req as any).files` en `producto.controller.ts:104` es consecuencia directa de esto.

---

## Action Plan (prioritized)

### CRITICAL (debe resolverse antes de producción)

1. **Corregir IDOR en updatePassword y gestión de direcciones**: verificar `req.user.id === req.params.id` antes de permitir la operación
2. **Corregir mass assignment en updateProducto**: crear una lista blanca de campos permitidos y construir el objeto de update explícitamente
3. **Agregar PATCH a la lista de methods en CORS** (`index.ts:17`)
4. **Corregir user enumeration en login**: devolver siempre 401 con `{ error: 'Credenciales incorrectas' }` sin distinguir usuario/contraseña
5. **Reconstruir ShopPage.tsx**: agregar los `useState` faltantes, crear o importar los componentes `Header` y `Guitar`, tipar todos los parámetros
6. **Corregir import en HomePage.tsx**: `'../components/...'` → `'../../components/...'`

### HIGH

7. **Agregar rate limiting** al endpoint de login (express-rate-limit o similar)
8. **Centralizar llamadas HTTP** en una capa `services/`: crear `api.ts` con cliente base, interceptor de token, y exportar funciones tipadas. Eliminar fetch directos de componentes
9. **Crear .env.example** documentando todas las variables: `DB_URL`, `DATABASE_USER`, `DATABASE_PASS`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `ALLOWED_ORIGINS`, `PORT`
10. **Eliminar bcrypt** de dependencies (solo mantener bcryptjs)
11. **Reescribir db.js como db.ts** con ESM nativo; eliminar `allowJs: true` del tsconfig del backend
12. **Reescribir cloudinary.utils.ts y file.middleware.ts** como módulos ESM puros; unificar la configuración de Cloudinary en un solo punto; renombrar `createImgBook` a algo apropiado para este proyecto

### MEDIUM

13. **Validar input en register**: verificar presencia de `profile.firstName` y `profile.lastName` antes de llamar a Mongoose y devolver 400 en lugar de 500
14. **Agregar @types/multer** y eliminar el cast `(req as any).files`
15. **Eliminar CoachPresentation.tsx** o integrarlo en HomePage si se necesita
16. **Eliminar prop `onClick` de Card** si no se va a implementar, o implementarlo
17. **Importar `NavItem` en NavLinks** desde `navItems.ts` en lugar de redefinirlo

### LOW

18. **Agregar tests**: al menos un test de integración para login y un test unitario para addToCart
19. **Agregar paginación** a `getProductos` y `getAllUsers`
20. **Mover `MIN_ITEMS`/`MAX_ITEMS`** fuera del cuerpo del componente en ShopPage
