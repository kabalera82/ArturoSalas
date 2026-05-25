# Code Review Report — ArturoSalas Landing Page
**Date:** 2026-05-25
**Reviewer:** Senior Review Skill v2.0
**Scope:** Clean Code · Clean Architecture · Security

---

## Global Score: 5.5/10

| Area | Score | Status |
|---|---|---|
| Clean Code | 6/10 | WARNING |
| Clean Architecture | 6.5/10 | WARNING |
| Security | 7/10 | WARNING |
| Tests | 0/10 | CRITICAL |
| Configuration | 5/10 | WARNING |

---

## Clean Code

### Findings

- Componentes pequeños y enfocados. Buena separación de datos y render.
- CSS con custom properties bien definidas en `:root`. Sistema de design tokens aplicado consistentemente.
- Nomenclatura BEM-like coherente en clases CSS.
- TypeScript con `noUnusedLocals`, `noUnusedParameters` activados. Buena señal.

### Violations (file:line)

**WARNING — Importación duplicada de Google Fonts**
`src/index.css:1-2`
```css
@import url('...Bebas+Neue&family=Changa:wght@800...');
@import url('...Changa:wght@800...');  ← Changa ya está en la línea anterior
```
El segundo `@import` es redundante. Genera una request HTTP extra innecesaria.

**WARNING — Tipo `NavItem` definido dos veces**
`src/components/NavBar/navItems.ts:1` y `src/components/shared/NavLinks/NavLinks.tsx:3`
```ts
// navItems.ts
export type NavItem = { label: string; href: string };

// NavLinks.tsx — copia local, sin importar el tipo existente
type NavItem = { label: string; href: string };
```
El componente compartido redeclara localmente un tipo que ya existe y podría importar. Si la estructura cambia, habrá que actualizarlo en dos lugares.

**WARNING — Props sin sentido en Footer**
`src/components/Footer/Footer.tsx:19`
```tsx
<NavLinks items={navItems} activeHref='#inicio' onLinkClick={() => {}} />
```
`activeHref` y `onLinkClick` no tienen utilidad en un footer estático. El propio `FIXES.md` del proyecto lo identifica como pendiente. Pasan props que el componente ignora semánticamente (el footer no tiene estado de link activo ni cierra un menú).

**WARNING — `App.css` existe pero no debería**
`src/App.css` contiene únicamente 6 líneas de layout para `.app`. El `FIXES.md` del propio proyecto lo marca para eliminar. Los estilos de layout de `.app` pueden vivir en `index.css` o directamente en `App.css` si el archivo tiene sentido, pero tener un archivo CSS de 6 líneas es ruido.

**LOW — Typo en nombre de asset**
`src/assets/whatsap.webp` — le falta una `p`. El nombre correcto es `whatsapp`. El error se propaga a `footItems.ts:5` donde el import dice `whatsap.webp`. Funciona, pero es deuda técnica visible.

**LOW — Clase CSS sin estilos definidos**
`src/components/Footer/Footer.tsx:11` usa `className='footlinks_link'` en el `<a>`, pero esa clase no existe en `Footer.css` ni en `NavLinks.css`. Los estilos del enlace solo aplican a la imagen hija mediante `.foot_logos img`. La clase es un cadáver.

---

## Clean Architecture

### Findings

- El patrón de componentes compartidos en `shared/` es correcto para este tamaño.
- La separación de datos (`.ts`) y render (`.tsx`) es buena práctica bien ejecutada.
- El patrón de override CSS contextual (padre controla al hijo via `.parent .child`) está bien aplicado en NavBar.css y Footer.css.

### Violations

**WARNING — Acoplamiento cruzado entre Footer y NavBar**
`src/components/Footer/Footer.tsx:3`
```ts
import { navItems } from '../NavBar/navItems';
```
El `Footer` importa datos del directorio de `NavBar`. Esto crea acoplamiento entre dos componentes de primer nivel. Si `navItems.ts` se mueve o renombra, `Footer.tsx` rompe. El propio proyecto lo identifica en `FIXES.md` como pendiente (`src/data/navItems.ts`).

**WARNING — Directorios vacíos ("ghost structure")**
Existen en el repositorio directorios sin ningún archivo:
- `src/props/`
- `src/types/`
- `src/features/`
- `src/components/utils/`

Git no versiona directorios vacíos, pero están presentes en el árbol de trabajo. Generan confusión sobre la estructura esperada del proyecto. O se pueblan o se eliminan.

**LOW — Sin barrel files (`index.ts`) en componentes**
Los imports referencian el archivo directamente:
```ts
import { NavBar } from './components/NavBar/NavBar';
import { Footer } from './components/Footer/Footer';
```
La guía del propio proyecto (`guianav.md`) documenta el patrón `index.ts`, pero no se implementó. Con `index.ts` sería:
```ts
import { NavBar } from './components/NavBar';
```
No es crítico a este tamaño, pero es inconsistente con la documentación interna.

**LOW — READMEs por componente**
`NavBar/README.md`, `Footer/README.md`, `shared/README.md` — el `FIXES.md` del proyecto los identifica como no estándar para proyectos pequeños. Duplican información que ya está en `docs/components.md`. Dos fuentes de verdad para la misma información.

---

## Security

### Findings

- `target="_blank"` correctamente acompañado de `rel="noopener noreferrer"` en todos los enlaces externos del Footer.
- Sin manejo de datos de usuario, sin formularios, sin autenticación — superficie de ataque mínima para una landing estática.

### Vulnerabilities

**[HIGH] — `lang="en"` incorrecto en documento español**
`index.html:2`
```html
<html lang="en">
```
El contenido del sitio es en español. `lang="en"` es incorrecto. Afecta lectores de pantalla (pronunciación incorrecta), SEO, y herramientas de traducción automática. Debe ser `lang="es"`.

**[MEDIUM] — Datos placeholder en producción**
`src/components/Footer/footItems.ts:18-19`
```ts
{ href: 'https://wa.me/1234567890' }         // número de teléfono falso
{ href: 'mailto:arturosalas@example.com' }    // email de dominio de ejemplo
```
Son datos de desarrollo expuestos en el bundle de producción. Un usuario que haga clic en WhatsApp o Gmail llegará a destinos que no corresponden al cliente real.

**[MEDIUM] — Self-hosted font instalada pero cargando desde CDN externo**
`package.json:12` — `@fontsource/changa` está en `dependencies` (font auto-hospedada).
`src/index.css:1-2` — Las fonts se cargan desde `fonts.googleapis.com` (CDN externo).

El paquete `@fontsource/changa` nunca se importa. Consecuencias:
1. **Privacidad**: Google recibe la IP del visitante en cada carga.
2. **Performance**: Dependencia de red externa, puede fallar o ser bloqueada.
3. **Dependencia muerta**: Se instala, se versiona, ocupa espacio en `node_modules`, pero no aporta nada.

**[LOW] — Favicon referenciado pero posiblemente ausente**
`index.html:5`
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```
No existe `public/favicon.svg` en el árbol del proyecto. Generará un 404 silencioso en el navegador.

**[LOW] — Título de la página sin personalizar**
`index.html:7`
```html
<title>arturosalas</title>
```
Es el nombre del paquete npm, no el título del sitio. Debería ser algo como "Arturo Salas — Entrenador de BJJ" para SEO y accesibilidad.

---

## Tests

### Findings

**CRÍTICO — Cero tests.**

No existe ningún archivo de test. No hay runner configurado (Vitest no está instalado, no aparece en `package.json`). No hay `test` script en los scripts del proyecto.

Para un componente como `NavBar` con estado (`isMenuOpen`), comportamiento interactivo (toggle, close) y lógica responsive, hay casos de test obvios que no están cubiertos:

- ¿El menú empieza cerrado?
- ¿`toggleMenu` lo abre?
- ¿`closeMenu` lo cierra desde cualquier estado?
- ¿El botón hamburguesa llama a `toggleMenu`?
- ¿Los links del NavBar llaman a `closeMenu`?

Para `Button` (componente polimórfico):
- ¿Renderiza `<a>` cuando recibe `href`?
- ¿Renderiza `<button>` sin `href`?
- ¿Aplica la clase `btn--${variant}` correctamente?

---

## Configuration & Dependencies

### Findings

**CRITICAL — Configuración de React Compiler potencialmente duplicada**
`vite.config.ts:6-11`
```ts
plugins: [
  react(),                                        // transforma JSX con esbuild
  babel({ presets: [reactCompilerPreset()] })     // pasa el código por Babel DESPUÉS
]
```
`@vitejs/plugin-react` ya transforma JSX. Añadir `@rolldown/plugin-babel` como plugin separado pasa el código por Babel como segunda capa. El resultado esperado del React Compiler puede ser correcto, pero la arquitectura es frágil: dos herramientas distintas transformando el mismo código en cadena, sin configuración explícita de qué archivos procesa cada una.

La forma recomendada es configurar el compilador dentro de `@vitejs/plugin-react`:
```ts
react({
  babel: {
    plugins: ['babel-plugin-react-compiler'],
  },
})
```

Adicionalmente, `@rolldown/plugin-babel` es un plugin diseñado para Rolldown (bundler experimental en Rust), no para Vite/Rollup. Usarlo en Vite puede funcionar accidentalmente pero no está soportado.

**WARNING — `@fontsource/changa` instalado pero nunca importado**
`package.json:12` — Está en `dependencies` (no `devDependencies`), lo que significa que se considera parte del bundle de producción. Pero `src/index.css` carga Changa desde Google CDN. La dependencia ocupa espacio, se instala, se lockea en `pnpm-lock.yaml`, y no aporta nada.

**WARNING — Archivos de desarrollo en `public/utils/`**
```
public/utils/ChatGPT Image May 20, 2026, 09_42_11 PM.png
public/utils/ChatGPT Image May 21, 2026, 09_31_22 AM.png
public/utils/FIXES.md
public/utils/Gemini_Generated_Image_4x18324x18324x18.png
```
Estos archivos son artefactos del proceso de desarrollo (imágenes generadas por IA, notas). Se incluirán en el build de producción tal cual. La carpeta `public/` es servida estáticamente — todo lo que esté ahí es accesible públicamente en el servidor.

**LOW — Bug en patrón glob de `.editorconfig`**
`.editorconfig:8`
```ini
[*.{*.json}]
indent_size = 2
```
El glob `*.{*.json}` es inválido. No matchea ningún archivo. La intención era `[*.json]`. Esta regla nunca se aplica.

**LOW — `public/utils/` mal nombrada**
El `FIXES.md` del propio proyecto lo identifica: la carpeta se llama `utils` pero contiene imágenes. Debería llamarse `public/images/`.

---

## Action Plan (prioritized — para implementación futura, no por esta revisión)

### CRITICAL (must fix before production)

1. **Reemplazar datos placeholder en `footItems.ts`** — teléfono y email reales del cliente. Sin esto el sitio no puede salir a producción.
2. **Corregir `lang="en"` a `lang="es"` en `index.html`** — impacto en accesibilidad y SEO.
3. **Eliminar archivos de desarrollo de `public/utils/`** — se publican en el servidor de producción y son innecesarios.

### HIGH

4. **Reemplazar Google CDN por `@fontsource/changa`** — importar las fuentes desde el paquete ya instalado en `index.css`:
   ```css
   @import '@fontsource/changa/800.css';
   ```
   Eliminar los dos `@import url(https://fonts.googleapis.com/...)`.
5. **Corregir configuración de Vite/React Compiler** — mover `reactCompilerPreset` dentro de `@vitejs/plugin-react` y eliminar `@rolldown/plugin-babel`.
6. **Instalar Vitest y añadir tests básicos** para `NavBar` (toggle/close) y `Button` (polimorfismo).

### MEDIUM

7. **Mover `navItems.ts` a `src/data/navItems.ts`** — eliminar el acoplamiento Footer → NavBar/navItems.
8. **Limpiar Footer.tsx** — quitar `activeHref='#inicio'` y `onLinkClick={() => {}}` que no tienen sentido semántico en el footer.
9. **Eliminar tipo `NavItem` local en `NavLinks.tsx`** — importarlo desde `navItems.ts` o definirlo en un tipo compartido.
10. **Eliminar o poblar directorios vacíos** — `src/props/`, `src/types/`, `src/features/`, `src/components/utils/`.
11. **Añadir `favicon.svg`** en `public/` o cambiar la referencia en `index.html`.
12. **Personalizar `<title>`** en `index.html`.

### LOW

13. **Eliminar importación duplicada de Changa** en `index.css:2` (redundante con la línea 1).
14. **Renombrar `public/utils/` a `public/images/`**.
15. **Corregir glob en `.editorconfig`** — `[*.{*.json}]` → `[*.json]`.
16. **Renombrar `src/assets/whatsap.webp`** → `whatsapp.webp` y actualizar el import.
17. **Añadir `index.ts` barrel files** en cada componente para consistencia con la guía documentada.
18. **Eliminar READMEs por componente** o consolidarlos en `docs/components.md` (ya existe).
19. **Eliminar o vaciar `App.css`** — mover las 6 líneas de `.app` a `index.css`.
