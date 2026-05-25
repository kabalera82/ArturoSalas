# Footer

Pie de página con iconos de redes sociales y links de navegación en fila.

## Estructura

```
footer.footer
├── ul.foot_logos          → iconos sociales (footItems)
└── div.foot_links         → NavLinks con los navItems
```

## Layout

El footer usa `display: flex; flex-direction: row` con `margin-top: auto`, lo que lo empuja al fondo de la página dentro del flex container `.app` (`min-height: 100vh`).

Los links de navegación se muestran en fila sobreescribiendo `.navlinks_list` desde `.foot_links`:

```css
.foot_links .navlinks_list {
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 0.25rem;
}
```

## Iconos — footItems.ts

```ts
type FootItem = { imgSrc: string; altText: string; href: string }
```

Redes: YouTube, Facebook, TikTok, Instagram, WhatsApp, Gmail.

Los iconos se renderizan a **32×32 px** (`object-fit: contain`) vía:

```css
.foot_logos img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
```

Todos los enlaces abren en `target="_blank"` con `rel="noopener noreferrer"`.

## Dependencias

- `NavLinks` (shared)
- `navItems` de `../NavBar/navItems`
- Assets en `../../assets/`
