# Guía desde cero: proyecto Vite limpio con NavBar en React + TypeScript + CSS

Esta guía está pensada para un junior que acaba de crear un proyecto con Vite y necesita entender **qué borrar**, **qué crear**, **dónde va cada cosa** y **por qué**.

No vamos a dejar basura del template inicial. El objetivo es arrancar con una base limpia y un componente `NavBar` bien organizado.

---

## 0. Punto de partida: qué trae Vite por defecto

Cuando creás un proyecto con Vite + React + TypeScript, suele venir algo parecido a esto:

```txt
arturosalas/
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
│   └── vite.svg
└── src/
    ├── assets/
    │   └── react.svg
    ├── App.css
    ├── App.tsx
    ├── index.css
    └── main.tsx
```

Ese template sirve para demostrar que Vite funciona, pero para nuestro proyecto real sobra casi todo el ejemplo.

### Qué NO necesitamos del template

| Archivo/carpeta | Qué tiene | Qué hacemos |
|---|---|---|
| `src/assets/react.svg` | Logo de React del demo | Borrar |
| `public/vite.svg` | Logo de Vite del demo | Borrar si existe |
| `src/App.css` | Estilos del demo | Borrar |
| Código demo de `src/App.tsx` | Counter, logos, links de Vite | Reemplazar |
| CSS demo de `src/index.css` | Variables y layout del demo | Reemplazar |

Esto es importante: **limpiar el template no es estética, es arquitectura**. Si dejás código muerto, assets muertos y estilos muertos, después nadie sabe qué es parte del producto y qué es basura del scaffold.

---

## 1. Limpieza inicial del proyecto Vite

Desde la raíz del proyecto:

```txt
C:\Users\Marcos\Marcos\Programacion\Web\ArturoSalas
```

Podés limpiar lo innecesario así en PowerShell:

```powershell
Remove-Item -LiteralPath .\src\assets -Recurse -Force
Remove-Item -LiteralPath .\src\App.css -Force
Remove-Item -LiteralPath .\public\vite.svg -Force -ErrorAction SilentlyContinue
```

> Ojo: si algún archivo no existe, no pasa nada. La idea es que no queden assets ni estilos del demo.

Después vamos a reemplazar el contenido de:

```txt
src/App.tsx
src/index.css
```

---

## 2. Árbol ASCII final del proyecto limpio

La estructura final debería quedar así:

```txt
arturosalas/
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    └── components/
        └── NavBar/
            ├── NavBar.tsx
            ├── NavBar.css
            ├── navItems.ts
            └── index.ts
```

### Por qué esta estructura está bien

- `main.tsx`: punto de entrada de React.
- `App.tsx`: compone la página principal.
- `index.css`: estilos globales mínimos.
- `components/NavBar`: componente aislado, con su UI, estilos y datos.

No hay `assets` porque este ejemplo no usa imágenes.
No hay `App.css` porque no necesitamos estilos específicos de `App` todavía.
No hay logos de Vite ni React porque son del demo, no del producto.

---

## 3. Crear la carpeta del NavBar

Ruta:

```txt
src/components/NavBar
```

Creá estos archivos:

```txt
src/components/NavBar/NavBar.tsx
src/components/NavBar/NavBar.css
src/components/NavBar/navItems.ts
src/components/NavBar/index.ts
```

Cada archivo tiene una responsabilidad clara:

| Archivo | Responsabilidad |
|---|---|
| `navItems.ts` | Datos del menú |
| `NavBar.tsx` | Componente React |
| `NavBar.css` | Estilos del componente |
| `index.ts` | Export público del componente |

Ponete las pilas con esto: si un componente chico ya nace desordenado, cuando crezca va a ser una locura cósmica.

---

## 4. Archivo `navItems.ts`

Ruta:

```txt
src/components/NavBar/navItems.ts
```

Contenido:

```ts
export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Sobre mí', href: '#sobre-mi' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Contacto', href: '#contacto' },
];
```

### Qué estamos haciendo

Estamos separando los datos del menú fuera del componente.

Esto:

```ts
{ label: 'Proyectos', href: '#proyectos' }
```

significa:

- Mostrar el texto `Proyectos`.
- Navegar a una sección con `id="proyectos"`.

### Por qué está bien

Porque si mañana agregás otro link, tocás un solo lugar.

Mal:

```tsx
<a href="#inicio">Inicio</a>
<a href="#sobre-mi">Sobre mí</a>
<a href="#proyectos">Proyectos</a>
<a href="#contacto">Contacto</a>
```

Bien:

```tsx
{navItems.map((item) => (
  <a key={item.href} href={item.href}>{item.label}</a>
))}
```

La UI renderiza datos. No los duplica a mano.

---

## 5. Archivo `NavBar.tsx`

Ruta:

```txt
src/components/NavBar/NavBar.tsx
```

Contenido:

```tsx
import { useState } from 'react';
import './NavBar.css';
import { navItems } from './navItems';

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((currentValue) => !currentValue);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar">
      <a className="navbar__brand" href="#inicio" aria-label="Ir al inicio">
        Arturo Salas
      </a>

      <button
        className="navbar__toggle"
        type="button"
        aria-label="Abrir o cerrar menú de navegación"
        aria-expanded={isMenuOpen}
        aria-controls="main-navigation"
        onClick={toggleMenu}
      >
        <span className="navbar__toggle-line" />
        <span className="navbar__toggle-line" />
        <span className="navbar__toggle-line" />
      </button>

      <nav
        id="main-navigation"
        className={`navbar__menu ${isMenuOpen ? 'navbar__menu--open' : ''}`}
        aria-label="Navegación principal"
      >
        <ul className="navbar__list">
          {navItems.map((item) => (
            <li className="navbar__item" key={item.href}>
              <a className="navbar__link" href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

### Revisión del componente

Este `NavBar` está bien para un proyecto Vite desde cero porque:

- No depende de assets del template.
- No usa `App.css`.
- Importa su propio CSS.
- Tiene estado mínimo: `isMenuOpen`.
- Usa HTML semántico: `header`, `nav`, `ul`, `li`, `a`, `button`.
- Usa accesibilidad básica: `aria-expanded`, `aria-controls`, `aria-label`.
- Cierra el menú al tocar un link en mobile.

### Por qué usamos `button` y no `div`

Porque esto:

```tsx
<button type="button">
```

es accesible por defecto con teclado.

Esto:

```tsx
<div onClick={toggleMenu}>
```

es una mala práctica para acciones interactivas. No lo hagas. HTML ya te da la herramienta correcta.

---

## 6. Archivo `NavBar.css`

Ruta:

```txt
src/components/NavBar/NavBar.css
```

Contenido:

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.navbar__brand {
  color: #111827;
  font-size: 1.125rem;
  font-weight: 700;
  text-decoration: none;
}

.navbar__toggle {
  display: inline-flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  border: 0;
  background-color: transparent;
  cursor: pointer;
}

.navbar__toggle-line {
  width: 1.5rem;
  height: 0.125rem;
  background-color: #111827;
  border-radius: 999px;
}

.navbar__menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: none;
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.navbar__menu--open {
  display: block;
}

.navbar__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.navbar__link {
  display: inline-flex;
  color: #374151;
  font-weight: 500;
  text-decoration: none;
}

.navbar__link:hover,
.navbar__link:focus-visible {
  color: #111827;
}

.navbar__link:focus-visible,
.navbar__toggle:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 4px;
}

@media (min-width: 768px) {
  .navbar {
    padding-inline: 2rem;
  }

  .navbar__toggle {
    display: none;
  }

  .navbar__menu {
    position: static;
    display: block;
    padding: 0;
    border-bottom: 0;
  }

  .navbar__list {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
  }
}
```

### Revisión del CSS

Este CSS está adaptado a un Vite limpio porque no depende de variables raras del template como:

```css
--accent
--border
--social-bg
```

Usa valores concretos para que el junior vea claramente qué está pasando.

### Mobile first

Primero definimos mobile:

```css
.navbar__menu {
  display: none;
}

.navbar__menu--open {
  display: block;
}
```

Después desktop:

```css
@media (min-width: 768px) {
  .navbar__menu {
    display: block;
  }
}
```

Eso significa: en mobile el menú se abre con botón; en desktop está visible siempre.

---

## 7. Archivo `index.ts`

Ruta:

```txt
src/components/NavBar/index.ts
```

Contenido:

```ts
export { NavBar } from './NavBar';
```

### Para qué sirve

Permite importar así:

```tsx
import { NavBar } from './components/NavBar';
```

En vez de así:

```tsx
import { NavBar } from './components/NavBar/NavBar';
```

Esto es una API pública simple para la carpeta del componente.

---

## 8. Archivo `App.tsx` limpio

Ruta:

```txt
src/App.tsx
```

Reemplazá todo el contenido del template por esto:

```tsx
import { NavBar } from './components/NavBar';

function App() {
  return (
    <>
      <NavBar />

      <main className="page">
        <section className="page__section page__section--hero" id="inicio">
          <p className="page__eyebrow">Portfolio</p>
          <h1>Arturo Salas</h1>
          <p>
            Desarrollo experiencias web modernas con React, TypeScript y una
            base sólida de arquitectura frontend.
          </p>
        </section>

        <section className="page__section" id="sobre-mi">
          <h2>Sobre mí</h2>
          <p>
            Esta sección sirve para presentar quién sos, qué hacés y qué valor
            aportás como profesional.
          </p>
        </section>

        <section className="page__section" id="proyectos">
          <h2>Proyectos</h2>
          <p>
            Acá podés listar proyectos destacados, casos de estudio o trabajos
            relevantes.
          </p>
        </section>

        <section className="page__section" id="contacto">
          <h2>Contacto</h2>
          <p>
            Acá podés agregar email, redes sociales o un formulario de contacto.
          </p>
        </section>
      </main>
    </>
  );
}

export default App;
```

### Qué se limpió de `App.tsx`

Sacamos todo esto porque era demo:

```tsx
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
```

También sacamos:

- contador;
- logos;
- links a documentación de Vite;
- secciones del template;
- clases que dependían de `App.css` del demo.

Fantástico. Ahora `App.tsx` hace lo que tiene que hacer: componer la página.

---

## 9. Archivo `main.tsx`

Ruta:

```txt
src/main.tsx
```

Contenido recomendado:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### Qué revisar

La línea importante es:

```tsx
import './index.css';
```

Ese archivo carga estilos globales para toda la app.

También mantenemos:

```tsx
import App from './App';
```

No hace falta escribir `./App.tsx`. TypeScript/Vite resuelve la extensión.

---

## 10. Archivo `index.css` limpio

Ruta:

```txt
src/index.css
```

Reemplazá todo el CSS del template por esto:

```css
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  color: #111827;
  background-color: #f9fafb;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
}

button,
a {
  font: inherit;
}

.page {
  width: min(100% - 2rem, 1100px);
  margin-inline: auto;
}

.page__section {
  padding-block: 5rem;
  border-bottom: 1px solid #e5e7eb;
}

.page__section--hero {
  min-height: calc(100vh - 4.5rem);
  display: grid;
  align-content: center;
}

.page__eyebrow {
  margin: 0 0 1rem;
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  max-width: 760px;
  margin-bottom: 1rem;
  font-size: clamp(2.5rem, 8vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.05em;
}

h2 {
  margin-bottom: 1rem;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

p {
  max-width: 680px;
  color: #4b5563;
  font-size: 1.125rem;
  line-height: 1.7;
}
```

### Qué hace este CSS global

- Quita márgenes por defecto del `body`.
- Define una fuente base.
- Agrega `scroll-behavior: smooth` para que los links del NavBar naveguen suave.
- Define estilos básicos de secciones.
- No depende de estilos basura del template.

---

## 11. Checklist de limpieza real

Antes de seguir, revisá esto:

- [ ] `src/assets` fue borrado si solo tenía logos del demo.
- [ ] `public/vite.svg` fue borrado si existía.
- [ ] `src/App.css` fue borrado.
- [ ] `src/App.tsx` ya no importa `useState`.
- [ ] `src/App.tsx` ya no importa logos.
- [ ] `src/App.tsx` ya no importa `App.css`.
- [ ] `src/index.css` ya no tiene estilos del template.
- [ ] `src/components/NavBar` existe.
- [ ] `NavBar.tsx` importa `NavBar.css`.
- [ ] `App.tsx` importa `NavBar` desde `./components/NavBar`.

Si algo de esa lista falla, no avances. Arreglalo. El código limpio no aparece por accidente.

---

## 12. Relación entre `href` e `id`

Esta parte es clave.

En `navItems.ts` tenés:

```ts
{ label: 'Contacto', href: '#contacto' }
```

Entonces en `App.tsx` necesitás:

```tsx
<section id="contacto">
```

Si el `href` dice `#contacto`, pero la sección dice `id="contact"`, no va a funcionar como esperás.

No es React. No es Vite. Es HTML básico. CONCEPTOS antes que frameworks.

---

## 13. Qué aprendiste con este NavBar

Este ejercicio enseña más que hacer una barrita arriba:

1. Cómo limpiar un proyecto Vite recién creado.
2. Cómo separar datos, componente y estilos.
3. Cómo usar TypeScript para modelar datos simples.
4. Cómo crear un componente reusable.
5. Cómo usar HTML semántico.
6. Cómo aplicar accesibilidad básica.
7. Cómo mantener una estructura de carpetas legible.

Ese es el punto. No queremos juniors que copien y peguen. Queremos juniors que entiendan cómo se construye una base limpia.
