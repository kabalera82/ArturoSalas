# 03 — Footer

> Pie de página con iconos de redes sociales y links de navegación.
> Leer `00_ARQUITECTURA.md` y `01_SHARED.md` antes de este archivo.

---

## Estructura

```
footer.footer
├── ul.foot_logos     → iconos de redes sociales (footItems)
└── div.foot_links    → NavLinks con navItems
```

## footItems.ts

```ts
type FootItem = { imgSrc: string; altText: string; href: string }
```

Redes: YouTube, Facebook, TikTok, Instagram, WhatsApp, Gmail.

**CRÍTICO — URLs pendientes de corregir:**
- Los handles actuales (`@ArturoSalas`) no coinciden con los reales (`@artosbjj` según schema.org en index.html).
- El número de WhatsApp es placeholder — cuando se complete quedará expuesto en el HTML público. Considerar formulario de contacto.
- El email `arturosalas@example.com` es placeholder.

## Iconos

Se renderizan a 32×32px con `object-fit: contain`. Todos abren en `target="_blank"` con `rel="noopener noreferrer"`.

## CSS relevante

Los links del footer se ocultan en mobile y se muestran en fila en desktop:

```css
.foot_links .navlinks_list { display: none; }

@media (min-width: 768px) {
  .foot_links .navlinks_list { display: flex; }
}
```

## Dependencias

- `NavLinks` (shared)
- `navItems` de `../NavBar/navItems`
- Assets en `../../assets/`

## Pendiente

- Corregir URLs reales de redes sociales
- Mismo cambio de `href` que NavBar cuando se implemente React Router
