# 06 — CardsSection

> Cards con video que se reproduce al hacer hover.
> Leer `00_ARQUITECTURA.md`, `01_SHARED.md` y `05_HOME.md` antes de este archivo.

---

## Dónde vive

`CardsSection` es una sección de la home. Se monta en `pages/HomePage.tsx`, no en `App.tsx` ni en `HeroSection`.

---

## Por qué video descargado y no iframe

Un iframe de TikTok, YouTube o Instagram no es controlable desde JavaScript. No se puede hacer autoplay en hover con un iframe — la plataforma controla el video.

Para autoplay en hover se necesita el elemento `<video>` nativo, que expone `.play()` y `.pause()`. Los videos deben estar descargados en `/public/videos/`.

Se usa `/public/` y no `src/assets/` porque Vite no procesa archivos grandes — los sirve directamente desde `/public/`.

---

## Archivos

```
src/components/CardsSection/
├── CardsSection.tsx     contenedor: título + grid de Cards
├── CardsSection.css     estilos del grid
└── cardItem.ts          tipo CardItem + array de datos

src/components/shared/Card/
├── Card.tsx             componente de cada card
└── Card.css             estilos de la card

public/videos/
├── tecnica1.mp4
└── ...
```

---

## cardItem.ts

```ts
export type CardItem = {
  videoSrc: string;      // '/videos/tecnica1.mp4'
  title: string;
  description: string;
  buttonLabel: string;
}

export const cardItems: CardItem[] = [
  {
    videoSrc: '/videos/tecnica1.mp4',
    title: 'Técnica 1',
    description: 'Descripción de la técnica.',
    buttonLabel: 'Ver técnica',
  },
]
```

---

## Card.tsx

```tsx
import './Card.css'
import { Button } from '../Button/Button'
import { useRef } from 'react'

type CardProps = {
  videoSrc: string
  title: string
  description: string
  buttonLabel: string
  onClick?: () => void
}

export const Card = ({ videoSrc, title, description, buttonLabel, onClick }: CardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div
      className="card"
      onMouseEnter={() => videoRef.current?.play()}
      onMouseLeave={() => {
        videoRef.current?.pause()
        videoRef.current!.currentTime = 0
      }}
    >
      <video ref={videoRef} src={videoSrc} muted loop playsInline width="400" height="700" />
      <div className="card__body">
        <h3 className="card__title">{title}</h3>
        <p className="card__description">{description}</p>
        <Button variant="cta" onClick={onClick}>{buttonLabel}</Button>
      </div>
    </div>
  )
}
```

Atributos del `<video>`:
- `muted` — obligatorio para autoplay en todos los navegadores
- `loop` — se repite mientras el cursor esté encima
- `playsInline` — evita reproductor nativo a pantalla completa en iOS

`useRef<HTMLVideoElement>` da acceso a `.play()`, `.pause()` y `.currentTime`. Sin el tipo genérico TypeScript no conoce esos métodos.

---

## CardsSection.tsx

```tsx
import './CardsSection.css'
import { Card } from '../shared/Card/Card'
import { cardItems } from './cardItem'

export const CardsSection = () => {
  return (
    <section className="cards-section">
      <h2 className="cards-section__title">Técnicas Destacadas</h2>
      <div className="cards-section__grid">
        {cardItems.map((item, index) => (
          <Card
            key={index}
            videoSrc={item.videoSrc}
            title={item.title}
            description={item.description}
            buttonLabel={item.buttonLabel}
          />
        ))}
      </div>
    </section>
  )
}
```

---

## CSS del grid

`auto-fit` + `minmax` hace el grid responsive sin media queries:

```css
.cards-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}
```

En móvil: 1 columna. En tablet: 2. En desktop: 3-4.

---

## Pasos para añadir un video real

1. Descargar el video de TikTok (SnapTik, SSSTik u otro)
2. Convertir a `.mp4` si no lo está
3. Colocar en `public/videos/`
4. Añadir entrada en `cardItem.ts` con `videoSrc: '/videos/nombrearchivo.mp4'`

---

## Limitación en móvil

En iOS y Android no hay cursor — el hover no existe. En touch, el usuario toca la card. Para manejarlo se puede añadir `onClick` al div de la card que también dispare el play.
