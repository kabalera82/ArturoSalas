# Code Review Report — ArturoSalas
**Date:** 2026-05-25
**Reviewer:** Senior Review Skill v2.0
**Scope:** Clean Code · Clean Architecture · Security

---

## Global Score: 5/10

| Area | Score | Status |
|---|---|---|
| Clean Code | 5/10 | WARNING |
| Clean Architecture | 4/10 | CRITICAL |
| Security | 6/10 | WARNING |
| Tests | 0/10 | CRITICAL |
| Configuration | 7/10 | WARNING |

---

## Clean Code

### Findings

- **Button bien diseñado**: variantes por prop, soporte href/onClick, sin lógica interna. Es el componente más limpio del proyecto.
- **NavLinks correcto**: reutilizable, props bien definidas, sin efectos secundarios.
- **Nombres descriptivos** en la mayoría de archivos y variables.
- **Inconsistencia de convención CSS**: NavBar usa `navbar_deco` (guión bajo simple), HeroSection y CardsSection usan BEM doble (`hero__content`, `cards-section__grid`). Dos convenciones distintas en el mismo proyecto.
- **`onClick` declarado pero no desestructurado** en `Card.tsx`: aparece en el tipo `CardProps` pero no se pasa al componente hijo ni se usa.
- **Card.css usa color hardcodeado** `background: #111` en lugar de `var(--color-fondo-card)` que ya existe en el sistema de diseño.
- **Datos placeholder idénticos** en `cardItem.ts`: 4 cards con exactamente el mismo título, descripción y videoSrc. Los videos apuntan a `/videos/video01.mp4` que no existe.
- **`@fontsource/changa` instalado pero no importado**: está en `package.json` como dependencia, pero las fuentes se cargan por Google Fonts en `index.css`. Dependencia muerta.

### Violations (archivo:línea)

- `src/components/shared/Card/Card.tsx:5-11` — `onClick` declarado en tipo pero ignorado en implementación
- `src/components/shared/Card/Card.css:6` — color hardcodeado, no usa variable CSS
- `src/components/NavBar/NavBar.css` vs `src/components/HeroSection/HeroSection.css` — convención CSS inconsistente en todo el proyecto

---

## Clean Architecture

### Findings

- **CRÍTICO — `HeroSection` viola Single Responsibility**: el componente no es solo una hero section. Contiene también `section.coach__cards` y `section.coach__presentation`. Se convirtió en un layout container. El nombre miente sobre lo que hace.
- **CRÍTICO — `CardsSection` se renderiza dos veces**: `App.tsx` importa y monta `<CardsSection />`, y `HeroSection` también lo hace. El usuario verá las cards duplicadas.
- **`HeroSection.css` aplica selector `img` global**: `img { width: 100%; height: auto; max-width: 600px; }` no está scoped — afecta a TODAS las imágenes del documento, incluidos los iconos del footer (32px) y el logo del navbar. Efecto colateral no intencional.
- **No hay separación layout/contenido**: no existe un componente `PageLayout` que envuelva navbar + main + footer. `App.tsx` hace ese trabajo directamente, lo que escala mal si hay múltiples páginas.
- **`key={index}` en listas**: CardsSection usa el índice del array como `key`. Si los datos cambian de orden React no puede reconciliar correctamente.
- **Textos hardcodeados en HeroSection**: h1, h2 y párrafo están fijos en el JSX en lugar de venir de una fuente de datos o constante.

### Violations

- `src/components/HeroSection/HeroSection.tsx` — componente con 3 responsabilidades (hero + cards + presentación coach)
- `src/App.tsx:13` + `src/components/HeroSection/HeroSection.tsx` — CardsSection duplicada
- `src/components/HeroSection/HeroSection.css:14-18` — selector `img` global con side effects

---

## Security

### Findings

- **URLs del footer son placeholders incorrectos**: `@ArturoSalas` en YouTube/Instagram/Facebook/TikTok, pero el schema.org en `index.html` indica que los handles reales son `@artosbjj`. Cuando se publique, los links llevarán a perfiles de otra persona o inexistentes.
- **WhatsApp expone número de teléfono**: `https://wa.me/1234567890` publicará el número real en el HTML cuando se complete. Considerar formulario de contacto como intermediario.
- **`og:image` y `twitter:image`** apuntan a `https://coacharturosalas.com/og-image.jpg` que probablemente no existe. En producción los compartidos en redes quedarán sin imagen.
- **`SearchAction` en schema.org** usa `?s={search_term_string}`, patrón de WordPress. Esta es una SPA sin backend de búsqueda — el schema es incorrecto.
- **`rel="noopener noreferrer"`** en links externos del footer: correcto.
- **Favicon referenciado desde `/src/assets/favicon.ico`**: en build de producción esta ruta no existe. El favicon desaparecerá en prod. Debe estar en `/public/favicon.ico`.

### Vulnerabilities

- [MEDIUM] `index.html:5` — favicon desde `/src/assets/`, ruta inválida en build de producción
- [MEDIUM] `src/components/Footer/footItems.ts:15-20` — URLs de redes sociales no coinciden con handles reales del schema.org
- [LOW] `index.html:109` — SearchAction schema.org inválido para una SPA sin búsqueda
- [LOW] Número de WhatsApp real quedará expuesto en HTML público al completarse

---

## Tests

### Findings

- **Cero tests**. No existe ningún archivo de test en todo el proyecto.
- No hay configuración de Vitest ni ningún framework de testing.
- El script `"test"` no está definido en `package.json`.
- Para un sitio en producción esto es inaceptable. Al menos Button, NavLinks y Card deberían tener tests unitarios.

---

## Configuration & Dependencies

### Findings

- **Stack moderno y adecuado**: React 19, Vite 8, TypeScript 6, pnpm. Buenas elecciones.
- **`babel-plugin-react-compiler` activo**: el React Compiler es experimental. Para un proyecto de aprendizaje está bien. Para producción requiere validación.
- **`@fontsource/changa` instalado y sin usar**: dependencia muerta. Las fuentes se cargan via Google Fonts en `index.css`.
- **`DESARROLLO.md` dentro de `src/`**: inusual. La convención es `/docs` en la raíz.
- **ESLint 10 configurado**: correcto.
- **Sin `.env.example`**: correcto para este estado del proyecto, no hay variables de entorno.

---

## Action Plan (priorizado)

### CRITICAL (resolver antes de producción)

1. **Eliminar duplicación de `CardsSection`**: sacarla de `HeroSection`. Solo debe vivir en `App.tsx` o en el layout de la home.
2. **Extraer `coach__cards` y `coach__presentation` de `HeroSection`**: crear componentes propios y montarlos directamente en `App.tsx`.
3. **Mover favicon a `/public/`** y actualizar `index.html` a `href="/favicon.ico"`.
4. **Corregir selector global `img`** en `HeroSection.css`: scopearlo con `.hero img` o `.hero__image img`.
5. **Añadir tests**: mínimo Button, NavLinks y Card con Vitest + Testing Library.

### HIGH

1. **Corregir URLs del footer**: usar handles reales (`@artosbjj`) o dejarlos vacíos hasta tenerlos.
2. **Corregir `onClick` en Card**: desestructurarlo y usarlo, o eliminarlo del tipo.
3. **Eliminar `@fontsource/changa`** de `package.json`.
4. **Unificar convención CSS**: elegir BEM doble o single underscore y aplicarlo en todo el proyecto.

### MEDIUM

1. **Reemplazar `#111`** en Card.css por `var(--color-fondo-card)`.
2. **Agregar `aria-expanded`** al botón toggle del menú mobile.
3. **Crear `PageLayout` component** para cuando haya múltiples páginas.
4. **Corregir `key={index}`** en CardsSection: usar un `id` estable.
5. **Corregir o eliminar `SearchAction`** en schema.org.

### LOW

1. **Mover `DESARROLLO.md`** a `/docs` en la raíz.
2. **Configurar CSP** antes de producción.
3. **Completar datos reales** en `cardItem.ts` cuando los videos estén disponibles.
4. **Considerar formulario de contacto** en lugar de exponer el número de WhatsApp directamente.
