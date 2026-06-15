# 00 — Arquitectura del proyecto

> Esta guía debe leerse ANTES de tocar cualquier código. Define la estructura, el flujo de datos y el orden de desarrollo.

---

## Stack

| Herramienta | Versión | Rol |
|---|---|---|
| React | 19 | UI |
| TypeScript | 6 | Tipado estático |
| Vite | 8 | Bundler y dev server |
| React Router | 7 | Navegación entre páginas |
| pnpm | — | Gestor de paquetes |

---

## Estructura de directorios

```
src/
├── main.tsx                  punto de entrada, solo monta App
├── App.tsx                   solo el Router con rutas declaradas
├── App.css                   estilos del contenedor raíz
├── index.css                 variables CSS globales + reset
│
├── layouts/
│   └── PageLayout.tsx        NavBar + <Outlet /> + Footer
│
├── pages/
│   ├── HomePage.tsx          secciones de la home
│   ├── LuchadorPage.tsx
│   ├── NoticiasPage.tsx
│   ├── ContactoPage.tsx
│   └── TiendaPage.tsx
│
├── components/
│   ├── shared/               componentes sin lógica de negocio
│   │   ├── Button/
│   │   ├── Card/
│   │   └── NavLinks/
│   ├── NavBar/               header con navegación
│   ├── Footer/               pie de página
│   ├── HeroSection/          SOLO la sección hero de la home
│   └── CardsSection/         SOLO las cards de técnicas
│
└── assets/                   imágenes estáticas importadas por Vite
```

> Los videos van en `/public/videos/` — NO en `src/assets/`. Vite no procesa archivos grandes.

---

## Cómo funciona el Router

```
App.tsx
  └── BrowserRouter
        └── Routes
              └── Route path="/" → PageLayout
                    ├── Route index → HomePage
                    ├── Route path="luchador" → LuchadorPage
                    ├── Route path="noticias" → NoticiasPage
                    ├── Route path="contacto" → ContactoPage
                    └── Route path="tienda" → TiendaPage
```

`PageLayout` siempre está presente. `<Outlet />` es el hueco donde React Router inyecta la página activa según la URL.

---

## main.tsx — no tocar nunca

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

Solo monta `App`. Sin imports de componentes, sin lógica.

---

## App.tsx — solo el Router

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

Sin JSX de componentes de UI. Sin CSS imports de secciones. Solo rutas.

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

Todo lo que esté aquí aparece en TODAS las páginas. Solo NavBar, Outlet y Footer.

---

## pages/HomePage.tsx

```tsx
import { HeroSection } from '../components/HeroSection/HeroSection'
import { CardsSection } from '../components/CardsSection/CardsSection'
import { CoachPresentation } from '../components/CoachPresentation/CoachPresentation'

export const HomePage = () => {
  return (
    <>
      <HeroSection />
      <CardsSection />
      <CoachPresentation />
    </>
  )
}
```

Cada página es una composición de secciones. Sin lógica propia.

---

## Reglas de arquitectura

1. **`App.tsx` solo tiene rutas** — ningún componente de UI va aquí.
2. **`PageLayout` solo tiene lo común a todas las páginas** — ninguna sección de contenido.
3. **Cada sección es un componente independiente** — `HeroSection` no importa `CardsSection`.
4. **Las páginas componen secciones** — `HomePage` es la que decide qué secciones van juntas.
5. **`shared/`** es para componentes sin lógica de negocio — Button, NavLinks, Card.
6. **Los datos de cada sección viven junto a ella** — `cardItem.ts` al lado de `CardsSection`.

---

## Orden de desarrollo correcto

```
00_ARQUITECTURA.md     ← este archivo, leer primero
01_SHARED.md           ← Button, NavLinks, Card
02_NAVBAR.md           ← NavBar + navItems
03_FOOTER.md           ← Footer + footItems
04_LAYOUT.md           ← PageLayout + App.tsx + React Router
05_HOME.md             ← HomePage con todas sus secciones
06_CARDS.md            ← CardsSection detallada (videos, hover)
07_PAGES.md            ← resto de páginas (Luchador, Noticias, etc.)
```

---

## Qué estaba mal antes de esta guía

- `HeroSection` contenía `CardsSection` y `CoachPresentation` — viola SRP.
- `App.tsx` montaba `CardsSection` directamente — duplicaba el renderizado.
- No había `pages/` ni `layouts/` — todo mezclado en `App.tsx`.
- No había React Router — las rutas del navbar eran anchors `#` sin páginas reales.
- La guía de CardsSection se escribió antes de definir la arquitectura.

Estas decisiones se documentaron aquí para que no se repitan.
