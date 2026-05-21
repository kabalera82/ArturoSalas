# NavBar

Header de navegación principal de la aplicación.

## Comportamiento

| Pantalla              | Comportamiento                                              |
|-----------------------|-------------------------------------------------------------|
| Mobile (< 1024px)     | Muestra botón hamburguesa — al hacer click despliega el menú |
| Desktop (≥ 1024px)    | Menú siempre visible en línea horizontal, botón oculto      |

## Estructura

```
<header.navbar>
  <div.navbar_deco>        ← Logo + subtítulo
  <button.navbar_toggle>   ← Botón hamburguesa (solo mobile)
  <nav.navbar_menu>        ← Contenedor del menú
    <NavLinks />           ← Componente compartido de links
```

## Archivos

| Archivo       | Propósito                                                      |
|---------------|----------------------------------------------------------------|
| `NavBar.tsx`  | Lógica del toggle y estructura JSX                             |
| `NavBar.css`  | Estilos del navbar. Los overrides de `.navlinks_*` en desktop van aquí |
| `navItems.ts` | Array de links que se pasan a `NavLinks`                       |

## Dependencias

- `NavLinks` — `../shared/NavLinks`
- `navItems` — `./navItems`
- `menu.png` — ícono SVG/PNG del botón hamburguesa
