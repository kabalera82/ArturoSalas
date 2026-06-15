# Guía: cómo arreglar el Footer

## Mapa de archivos

Estos son los únicos archivos que tocan el footer:

```
src/
├── assets/                              → imágenes procesadas por Vite
│   ├── facebook.webp
│   ├── tiktok.webp
│   ├── instagram.webp
│   ├── whatsap.webp
│   └── gmail.webp
├── App.tsx                              → usa <Footer />, no le pasa nada
└── components/
    └── Footer/
        ├── footItems.ts                 → los datos (array de ítems) + el tipo FootItem
        └── Footer.tsx                   → el componente que renderiza el footer
```

`footItems.ts` tiene DOS cosas: el **tipo** (`FootItem`) y los **datos** (`footItems[]`).
`Footer.tsx` importa ambas cosas desde ahí. No hay un archivo de tipado separado — todo está junto en `footItems.ts` y está bien así.

---

## Cómo funcionan las rutas de imágenes en Vite

En Vite hay dos lugares para poner imágenes y **no son intercambiables**:

### `src/assets/` — imágenes procesadas por Vite

Vite las optimiza (hash en el nombre, cache, etc.). Para usarlas **hay que importarlas**:

```ts
import gmailImg from '../../assets/gmail.webp';
```

Después usás la variable importada como `src`. El string `/assets/gmail.webp` **no funciona** — Vite no sirve `src/` como carpeta pública.

### `public/` — imágenes estáticas, sin procesar

Se sirven directas desde la raíz. Se referencian con un string:

```ts
{ imgSrc: '/utils/gmail.png' }   // archivo en public/utils/gmail.png
```

No hace falta importar nada.

---

**Las imágenes de este proyecto están en `src/assets/`**, así que `footItems.ts` las importa al principio del archivo.

---

## Qué está roto y por qué

### Error 1 — El tipo de las props está mal

**Archivo:** `src/components/Footer/Footer.tsx`

Definiste `FootItem` como el tipo de UN SOLO ítem:

```ts
// Footer.tsx — esto está MAL, es una copia innecesaria
type FootItem = {
    imgSrc: string;
    altText: string;
    href: string;
}
```

Y después usaste ese tipo como si fueran las props del componente:

```tsx
// Footer.tsx — esto está MAL
export const Footer = ({items}: FootItem) => {
```

Dos problemas:
1. `FootItem` no tiene ningún campo `items`, por eso TypeScript explota.
2. Aunque lo tuviera, el tipo de la prop tendría que ser `FootItem[]` (array), no `FootItem` (uno solo).

---

### Error 2 — `FootItem` ya existe en `footItems.ts`, no lo copies

**Archivo:** `src/components/Footer/footItems.ts`

```ts
// footItems.ts — esto ya existe y está exportado
export type FootItem = {
    imgSrc: string;
    altText: string;
    href: string;
}

export const footItems: FootItem[] = [
    { imgSrc: '/assets/images/facebook.webp', altText: 'Facebook', href: '...' },
    // ...
]
```

No hace falta redefinir `FootItem` en `Footer.tsx`. Si lo necesitaras, lo importarías:

```tsx
import { footItems, FootItem } from './footItems';
//       ^datos        ^tipo
```

---

### Error 3 — `<li>` suelto sin `<ul>`

**Archivo:** `src/components/Footer/Footer.tsx`

```tsx
// MAL — <li> sin padre <ul>
<div className='foot_logos'>
    {items.map((item) => (
        <li className='footlinks_item'>
            <a></a>
        </li>
    ))}
</div>
```

Un `<li>` siempre va dentro de `<ul>` o `<ol>`. Cambiá el `<div>` por `<ul>`:

```tsx
// BIEN
<ul className='foot_logos'>
    {footItems.map((item) => (
        <li className='footlinks_item' key={item.href}>
            ...
        </li>
    ))}
</ul>
```

---

### Error 4 — El `<a>` está vacío

**Archivo:** `src/components/Footer/Footer.tsx`

```tsx
// MAL — no hace nada
<a></a>
```

Necesita `href` y el `<img>` adentro:

```tsx
// BIEN
<a href={item.href} target="_blank" rel="noopener noreferrer">
    <img src={item.imgSrc} alt={item.altText} />
</a>
```

- `target="_blank"` → abre en pestaña nueva
- `rel="noopener noreferrer"` → seguridad obligatoria cuando usás `target="_blank"`
- `alt={item.altText}` → accesibilidad (describe la imagen)

---

### Error 5 — Falta `key` en el `.map()`

**Archivo:** `src/components/Footer/Footer.tsx`

Cada elemento raíz de un `.map()` necesita una prop `key` única. Sin ella React tira warnings y puede renderizar mal.

```tsx
// BIEN — href es único, sirve como key
footItems.map((item) => (
    <li key={item.href}>
```

---

## ¿La prop `items` la dejo o la saco?

**Archivo:** `src/components/Footer/Footer.tsx` y `src/App.tsx`

Mirá `App.tsx`:

```tsx
// App.tsx — así está ahora
<Footer />
```

Ya te llama sin props. El footer de este sitio siempre muestra los mismos 5 iconos — nunca cambian según quién llame al componente. La prop no tiene sentido.

**Sin prop:** el componente importa `footItems` directamente. Simple.
**Con prop:** el padre le pasa los datos. Útil solo si el footer pudiera mostrar distintos ítems en distintas páginas — no es el caso.

Conclusión: **sin prop**.

---

## Código final de cada archivo

### `src/components/Footer/footItems.ts`

Las imágenes están en `src/assets/`, así que hay que importarlas arriba del archivo y usar las variables en el array:

```ts
import facebookImg from '../../assets/facebook.webp';
import tiktokImg from '../../assets/tiktok.webp';
import instagramImg from '../../assets/instagram.webp';
import whatsappImg from '../../assets/whatsap.webp';
import gmailImg from '../../assets/gmail.webp';

export type FootItem = {
    imgSrc: string;
    altText: string;
    href: string;
}

export const footItems: FootItem[] = [
    { imgSrc: facebookImg,   altText: 'Facebook',   href: 'https://www.facebook.com/ArturoSalas' },
    { imgSrc: tiktokImg,     altText: 'TikTok',     href: 'https://www.tiktok.com/@ArturoSalas' },
    { imgSrc: instagramImg,  altText: 'Instagram',  href: 'https://www.instagram.com/ArturoSalas' },
    { imgSrc: whatsappImg,   altText: 'WhatsApp',   href: 'https://wa.me/1234567890' },
    { imgSrc: gmailImg,      altText: 'Gmail',      href: 'mailto:arturosalas@example.com' },
]
```

La ruta `../../assets/` sale de contar carpetas desde `Footer/footItems.ts` hacia arriba:
`Footer/` → `components/` → `src/` → `assets/`

### `src/components/Footer/Footer.tsx` — esto es lo que reescribís

```tsx
import './Footer.css';
import { NavLinks } from '../shared/NavLinks/NavLinks';
import { navItems } from '../NavBar/navItems';
import { footItems } from './footItems';

export const Footer = () => {
    return (
        <footer className='footer'>
            <ul className='foot_logos'>
                {footItems.map((item) => (
                    <li className='footlinks_item' key={item.href}>
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                            <img src={item.imgSrc} alt={item.altText} />
                        </a>
                    </li>
                ))}
            </ul>
            <div className='foot_links'>
                <NavLinks items={navItems} activeHref='#inicio' onLinkClick={() => {}} />
            </div>
        </footer>
    );
}
```

### `src/App.tsx` — no cambia nada

```tsx
import { Footer } from './components/Footer/Footer';

// Dentro del JSX:
<Footer />
```

---

## Resumen de errores

| # | Archivo | Problema | Causa |
|---|---------|----------|-------|
| 1 | `Footer.tsx` | TypeScript se queja de `items` | Tipo de props era `FootItem` (un ítem) en vez de `{ items: FootItem[] }` |
| 2 | `Footer.tsx` | Tipo duplicado | `FootItem` ya estaba en `footItems.ts`, no hace falta redefinirlo |
| 3 | `Footer.tsx` | `<li>` sin `<ul>` | HTML inválido; cambiar `<div>` por `<ul>` |
| 4 | `Footer.tsx` | `<a>` vacío | Faltaba `href`, `target`, y el `<img>` adentro |
| 5 | `Footer.tsx` | Warning de React | Faltaba `key` en el `.map()` |
