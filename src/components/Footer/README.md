# Footer

Pie de página con redes sociales y links de navegación secundarios.

## Estructura esperada

```
<footer>
  <div>  ← Redes sociales (footItems)
  <NavLinks />  ← Links de navegación reutilizados
```

## Archivos

| Archivo        | Propósito                                  |
|----------------|--------------------------------------------|
| `Footer.tsx`   | Estructura del footer                      |
| `Footer.css`   | Estilos del footer                         |
| `footItems.ts` | Array de iconos y links de redes sociales  |

## Dependencias

- `NavLinks` — `../shared/NavLinks`
- `navItems` — `../NavBar/navItems`
- `footItems` — `./footItems`

## Nota sobre footItems

Actualmente todos los `imgSrc` apuntan a `instagram.webp`.
Cada red social debería tener su propio ícono.
