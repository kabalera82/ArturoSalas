# 05 — HomePage

> Composición de secciones de la página principal.
> Leer `00_ARQUITECTURA.md` y `04_LAYOUT.md` antes de este archivo.

---

## Regla fundamental

`HomePage` es el único lugar que sabe qué secciones aparecen en la home y en qué orden.
Ninguna sección importa a otra sección.

---

## pages/HomePage.tsx — estado actual

```tsx
import { HeroSection } from '../components/HeroSection/HeroSection'
import { CardsSection } from '../components/CardsSection/CardsSection'
import { CoachPresentation } from '../components/CoachPresentation/ChoachPresentation'

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


---

## Secciones de la home

### HeroSection — `src/components/HeroSection/`

Logo OSSA, título, subtítulo, texto y CTA. Imagen de Arturo en el tatami. Solo esto.

### CardsSection — `src/components/CardsSection/`

Cards de técnicas con video hover. Ver `06_CARDS.md`.

### CoachPresentation — `src/components/CoachPresentation/`

Imagen de Arturo con el título de campeón del mundo. Sección de presentación visual del coach.

```
src/components/CoachPresentation/
├── ChoachPresentation.tsx   ← typo en nombre, pendiente renombrar
└── CoachPresentation.css
```

---

## Qué había mal antes

`HeroSection.tsx` contenía directamente:

```tsx
// MAL — viola SRP
<section className="coach__cards">
  <CardsSection />
</section>
<section className="coach__presentation">
  <img src={arturoChampion} ... />
</section>
```

Y `App.tsx` también montaba `<CardsSection />` causando doble renderizado.

Corrección: `HeroSection` solo tiene el hero. `HomePage` compone las tres secciones.

---

## Pendiente

- Renombrar `ChoachPresentation.tsx` → `CoachPresentation.tsx` y actualizar el import en `HomePage.tsx`
- Añadir contenido real a `CoachPresentation` (texto de palmarés, logros, etc.)
