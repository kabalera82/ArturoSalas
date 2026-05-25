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

## 8. Relación entre `href` e `id`

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

## 9. Checklist de limpieza

- [ ] `src/assets` fue borrado si solo tenía logos del demo
- [ ] `public/vite.svg` fue borrado si existía
- [ ] `src/App.css` fue borrado
- [ ] `src/App.tsx` ya no importa `useState`, logos ni `App.css`
- [ ] `src/index.css` ya no tiene estilos del template
- [ ] `src/components/NavBar` existe con sus 4 archivos
- [ ] `App.tsx` importa `NavBar` desde `./components/NavBar`
