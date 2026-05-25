# 04 — Layout y Router

> Cómo montar React Router y PageLayout para tener múltiples páginas con NavBar y Footer compartidos.
> Leer `00_ARQUITECTURA.md` antes de este archivo.

---

## Instalar React Router

```bash
pnpm add react-router-dom
```

---

## layouts/PageLayout.tsx

```tsx
import { Outlet } from 'react-router-dom'
import { NavBar } from '../components/NavBar/NavBar'
import { Footer } from '../components/Footer/Footer'

export const PageLayout = () => {
  return (
    <div className="app">
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

`<Outlet />` es el hueco donde React Router inyecta la página activa. NavBar y Footer siempre están presentes.

---

## App.tsx — versión final

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PageLayout } from './layouts/PageLayout'
import { HomePage } from './pages/HomePage'
import { LuchadorPage } from './pages/LuchadorPage'
import { NoticiasPage } from './pages/NoticiasPage'
import { ContactoPage } from './pages/ContactoPage'
import { TiendaPage } from './pages/TiendaPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          <Route index element={<HomePage />} />
          <Route path="luchador" element={<LuchadorPage />} />
          <Route path="noticias" element={<NoticiasPage />} />
          <Route path="contacto" element={<ContactoPage />} />
          <Route path="tienda" element={<TiendaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

**Regla:** `App.tsx` no importa componentes de UI, no tiene JSX de secciones. Solo rutas.

---

## main.tsx — no cambia

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## Actualizar NavBar con Link

Cuando el Router esté montado, los `<a href="#">` del NavLinks deben ser `<Link to="">` de react-router-dom para que la navegación sea SPA (sin recarga de página).

En `navItems.ts` cambiar anchors por rutas:

```ts
export const navItems = [
  { label: 'Inicio',    href: '/' },
  { label: 'Luchador',  href: '/luchador' },
  { label: 'Noticias',  href: '/noticias' },
  { label: 'Contacto',  href: '/contacto' },
  { label: 'Tienda',    href: '/tienda' },
]
```

Y en `NavLinks.tsx` reemplazar `<a>` por `<Link>`:

```tsx
import { Link } from 'react-router-dom'

// antes:
<a className={...} href={item.href} onClick={onLinkClick}>{item.label}</a>

// después:
<Link className={...} to={item.href} onClick={onLinkClick}>{item.label}</Link>
```

---

## Flujo visual

```
URL: /luchador

App.tsx
  └── BrowserRouter
        └── Routes
              └── Route "/"  →  PageLayout
                    ├── NavBar          ← siempre presente
                    ├── Outlet
                    │     └── LuchadorPage   ← inyectada por el Router
                    └── Footer          ← siempre presente
```
