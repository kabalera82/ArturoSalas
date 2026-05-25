# FIXES — Estructura y componentes

---

## 1. Estructura estándar

```
ArturoSalas/
├── public/
│   └── images/               ← renombrar desde "utils"
├── src/
│   ├── main.tsx
│   ├── index.css             ← variables globales + reset
│   ├── App.tsx
│   ├── assets/               ← assets importados por código (bundled)
│   ├── data/                 ← datos estáticos compartidos
│   │   └── navItems.ts       ← mover desde NavBar/
│   └── components/
│       ├── NavBar/
│       │   ├── NavBar.tsx
│       │   └── NavBar.css
│       ├── Footer/
│       │   ├── Footer.tsx
│       │   └── Footer.css
│       └── shared/
│           ├── NavLinks/
│           │   ├── NavLinks.tsx
│           │   └── NavLinks.css
│           └── Button/
│               ├── Button.tsx
│               └── Button.css
├── docs/
│   └── FIXES.md
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. Problemas encontrados

| # | Archivo/Carpeta | Problema | Acción |
|---|---|---|---|
| 1 | `src/components/NavBar/navItems.ts` | Dato compartido viviendo en una carpeta de componente específico | Mover a `src/data/navItems.ts` y actualizar imports |
| 2 | `guia.md` (raíz) | Documentación suelta en la raíz del proyecto | Mover a `docs/guia.md` |
| 3 | `App.css` | Archivo vacío | Eliminar y quitar el import en `App.tsx` |
| 4 | `public/utils/` | El nombre "utils" no describe imágenes | Renombrar a `public/images/` |
| 5 | `README.md` en componentes | No es estándar tener README por componente en proyectos pequeños | Eliminar los de `NavBar/`, `Footer/`, `shared/` |

---

## 3. NavLinks en Nav vs Footer: comportamiento diferenciado por contexto CSS

### El problema

`NavLinks` se usa en dos contextos con estilos y comportamiento distintos:

- **NavBar**: interactivo, responsive (mobile/desktop), estado activo, cierra el menú al hacer clic
- **Footer**: estático, siempre horizontal, sin estado activo, sin handler de clic

### La solución correcta: contexto CSS

No toques `NavLinks.tsx`. Ya lo hace bien el NavBar: los estilos específicos del contexto los define el padre, no el hijo.

El NavBar ya aplica este patrón en `NavBar.css`:

```css
/* NavBar.css — sobreescribe NavLinks dentro del contexto del nav */
.navbar_menu .navlinks_list { ... }
.navbar_menu .navlinks_link { ... }
```

El Footer hace lo mismo en `Footer.css`:

```css
/* Footer.css — sobreescribe NavLinks dentro del contexto del footer */
.footer .navlinks_list {
  flex-direction: row;
  gap: 0;
  padding: 0;
}

.footer .navlinks_item + .navlinks_item {
  border-left: 1px solid var(--color-gris);
  padding-left: 1rem;
}

.footer .navlinks_link {
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-family: var(--font-display);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: 0;
  color: var(--color-blanco);
  opacity: 0.7;
}

.footer .navlinks_link:hover {
  opacity: 1;
  color: var(--color-secundario);
}
```

### Limpiar Footer.tsx

Quitá los props que no tienen sentido en un footer (`activeHref` y `onLinkClick`):

```tsx
// ANTES — con props que no aplican
<NavLinks items={navItems} activeHref='#inicio' onLinkClick={() => {}} />

// DESPUÉS — limpio
<NavLinks items={navItems} />
```

`activeHref` y `onLinkClick` son opcionales en `NavLinks`, así que no rompés nada.

### Resultado

- `NavLinks.tsx` no cambia. Zero.
- Cada padre controla el aspecto de sus hijos vía CSS contextual.
- La regla: **el hijo define la base, el padre define el contexto**.
