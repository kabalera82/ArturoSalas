# 08 — Tienda con carrito

> Guía completa para implementar `/tienda` con catálogo de productos, carrito de compra y formulario de pedido.
> Prerrequisitos: `00_ARQUITECTURA.md`, `04_LAYOUT.md`, `07_PAGES.md`.

---

## Estado actual del proyecto

### Lo que ya existe y es reutilizable

| Elemento | Archivo | Cómo se reutiliza en tienda |
|---|---|---|
| `Button` | `shared/Button/Button.tsx` | Botones "Añadir al carrito", "Ver carrito", "Confirmar pedido" |
| `Card` | `shared/Card/Card.tsx` | **No aplica** — Card está pensada para video. Crear `ProductCard` |
| `NavBar` + `Footer` | `layouts/PageLayout.tsx` | Ya incluidos. La tienda hereda el layout |
| Variables CSS | `index.css` | Colores, fuentes y breakpoints ya definidos |
| `PageLayout` + Router | `App.tsx` | Solo añadir la ruta `/tienda` |

### Lo que falta

- Ruta `/tienda` en `App.tsx`
- `TiendaPage.tsx`
- Componente `ProductCard`
- Componente `CartDrawer` (carrito lateral)
- Hook `useCart` (lógica del carrito)
- Context `CartContext` (estado global del carrito)
- Servicio `productService.ts` (fetch a la API)
- Hook `useProducts` (petición con `useEffect`)
- Formulario de pedido o contacto de compra

---

## Arquitectura de la tienda

```
src/
├── context/
│   └── CartContext.tsx          → Estado global del carrito (useContext)
│
├── hooks/
│   ├── useCart.ts               → Lógica: add, remove, clear, total
│   └── useProducts.ts           → Fetch de productos con useEffect
│
├── services/
│   └── productService.ts        → Funciones fetch contra la API
│
├── components/
│   ├── ProductCard/
│   │   ├── ProductCard.tsx      → Card de producto (imagen, precio, botón)
│   │   └── ProductCard.css
│   ├── CartDrawer/
│   │   ├── CartDrawer.tsx       → Panel lateral con items del carrito
│   │   └── CartDrawer.css
│   └── OrderForm/
│       ├── OrderForm.tsx        → Formulario de pedido (react-hook-form)
│       └── OrderForm.css
│
└── pages/
    └── TiendaPage.tsx           → Compone todo: catálogo + drawer + formulario
```

---

## Paso 1 — API de productos

### Opción A: API pública (recomendado para empezar)

Usar **Fake Store API** (`https://fakestoreapi.com`) — gratuita, sin clave, devuelve productos con imagen, precio y categoría.

```
GET https://fakestoreapi.com/products          → todos los productos
GET https://fakestoreapi.com/products/1        → producto por id
GET https://fakestoreapi.com/products/categories → categorías
```

Ejemplo de respuesta:
```json
{
  "id": 1,
  "title": "Fjallraven - Foldsack No. 1 Backpack",
  "price": 109.95,
  "description": "Your perfect pack...",
  "category": "men's clothing",
  "image": "https://fakestoreapi.com/img/81fAn..."
}
```

### Opción B: JSON propio (productos reales de Arturo)

Crear `public/data/products.json` con los productos/cursos reales:

```json
[
  {
    "id": 1,
    "title": "Curso BJJ Principiantes",
    "price": 49.99,
    "description": "Fundamentos de Brazilian Jiu-Jitsu desde cero.",
    "category": "cursos",
    "image": "/images/curso-principiantes.webp"
  },
  {
    "id": 2,
    "title": "Pack Gi Competition",
    "price": 129.99,
    "description": "Kimono de competición homologado IBJJF.",
    "category": "equipamiento",
    "image": "/images/gi-competition.webp"
  }
]
```

Fetch contra `public/data/products.json` es idéntico al de cualquier API externa — misma implementación, cero dependencias.

---

## Paso 2 — Servicio de datos

```ts
// src/services/productService.ts

export type Product = {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
}

const BASE_URL = 'https://fakestoreapi.com'
// Para JSON propio: const BASE_URL = '/data'

export const getProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${BASE_URL}/products`)
  if (!res.ok) throw new Error('Error al cargar productos')
  return res.json()
}

export const getProductById = async (id: number): Promise<Product> => {
  const res = await fetch(`${BASE_URL}/products/${id}`)
  if (!res.ok) throw new Error(`Producto ${id} no encontrado`)
  return res.json()
}
```

El servicio NO conoce React. Solo fetch puro. Los hooks consumen el servicio.

---

## Paso 3 — Custom hook `useProducts`

Aquí cumplimos el requisito de `useEffect` y custom hook:

```ts
// src/hooks/useProducts.ts
import { useState, useEffect } from 'react'
import { getProducts, type Product } from '../services/productService'

type State = {
  products: Product[]
  loading: boolean
  error: string | null
}

export const useProducts = () => {
  const [state, setState] = useState<State>({
    products: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    getProducts()
      .then((data) => {
        if (!cancelled) setState({ products: data, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) setState({ products: [], loading: false, error: err.message })
      })

    return () => { cancelled = true }
  }, [])

  return state
}
```

El flag `cancelled` evita actualizar estado si el componente se desmontó antes de que llegue la respuesta.

---

## Paso 4 — Context del carrito

Aquí cumplimos el requisito de `useContext`:

```tsx
// src/context/CartContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Product } from '../services/productService'

export type CartItem = Product & { quantity: number }

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (id: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCartContext = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartContext debe usarse dentro de CartProvider')
  return ctx
}
```

---

## Paso 5 — Custom hook `useCart`

Encapsula la interacción con el contexto para que los componentes no importen directamente del contexto:

```ts
// src/hooks/useCart.ts
import { useCartContext } from '../context/CartContext'
import type { Product } from '../services/productService'

export const useCart = () => {
  const { items, addItem, removeItem, clearCart, total, count } = useCartContext()

  const isInCart = (id: number) => items.some((i) => i.id === id)

  const getQuantity = (id: number) => items.find((i) => i.id === id)?.quantity ?? 0

  return { items, addItem, removeItem, clearCart, total, count, isInCart, getQuantity }
}
```

---

## Paso 6 — Componente ProductCard

Reutiliza `Button` del shared. No reutiliza `Card` porque esa está acoplada a video.

```tsx
// src/components/ProductCard/ProductCard.tsx
import { Button } from '../shared/Button/Button'
import { useCart } from '../../hooks/useCart'
import type { Product } from '../../services/productService'
import './ProductCard.css'

type Props = {
  product: Product
}

export const ProductCard = ({ product }: Props) => {
  const { addItem, isInCart } = useCart()

  return (
    <article className="product-card">
      <img
        src={product.image}
        alt={product.title}
        className="product-card__image"
        loading="lazy"
      />
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__title">{product.title}</h3>
        <p className="product-card__price">{product.price.toFixed(2)} €</p>
      </div>
      <Button
        variant={isInCart(product.id) ? 'outline' : 'primary'}
        onClick={() => addItem(product)}
      >
        {isInCart(product.id) ? 'Añadido' : 'Añadir al carrito'}
      </Button>
    </article>
  )
}
```

---

## Paso 7 — CartDrawer

Panel lateral que se abre/cierra. El estado `isOpen` vive en `TiendaPage`.

```tsx
// src/components/CartDrawer/CartDrawer.tsx
import { useCart } from '../../hooks/useCart'
import { Button } from '../shared/Button/Button'
import './CartDrawer.css'

type Props = {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export const CartDrawer = ({ isOpen, onClose, onCheckout }: Props) => {
  const { items, removeItem, total, clearCart } = useCart()

  return (
    <aside className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`}>
      <div className="cart-drawer__header">
        <h2>Carrito</h2>
        <button onClick={onClose} className="cart-drawer__close">✕</button>
      </div>

      {items.length === 0 ? (
        <p className="cart-drawer__empty">El carrito está vacío.</p>
      ) : (
        <>
          <ul className="cart-drawer__list">
            {items.map((item) => (
              <li key={item.id} className="cart-drawer__item">
                <img src={item.image} alt={item.title} />
                <div>
                  <p>{item.title}</p>
                  <p>{item.price.toFixed(2)} € × {item.quantity}</p>
                </div>
                <button onClick={() => removeItem(item.id)}>✕</button>
              </li>
            ))}
          </ul>
          <p className="cart-drawer__total">Total: {total.toFixed(2)} €</p>
          <Button variant="primary" onClick={onCheckout}>Finalizar pedido</Button>
          <Button variant="outline" onClick={clearCart}>Vaciar carrito</Button>
        </>
      )}
    </aside>
  )
}
```

---

## Paso 8 — Formulario de pedido

Cumple el requisito de formulario. Usar `react-hook-form`:

```bash
npm install react-hook-form
```

```tsx
// src/components/OrderForm/OrderForm.tsx
import { useForm } from 'react-hook-form'
import { Button } from '../shared/Button/Button'
import { useCart } from '../../hooks/useCart'
import './OrderForm.css'

type FormValues = {
  name: string
  email: string
  phone: string
  notes: string
}

type Props = {
  onSuccess: () => void
}

export const OrderForm = ({ onSuccess }: Props) => {
  const { items, total, clearCart } = useCart()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    // Aquí se enviaría el pedido a una API real (Formspree, EmailJS, backend propio)
    console.log('Pedido:', { ...data, items, total })
    clearCart()
    onSuccess()
  }

  return (
    <form className="order-form" onSubmit={handleSubmit(onSubmit)}>
      <h2>Datos del pedido</h2>

      <div className="order-form__field">
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        {errors.name && <span className="order-form__error">{errors.name.message}</span>}
      </div>

      <div className="order-form__field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: 'El email es obligatorio',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
          })}
        />
        {errors.email && <span className="order-form__error">{errors.email.message}</span>}
      </div>

      <div className="order-form__field">
        <label htmlFor="phone">Teléfono</label>
        <input id="phone" type="tel" {...register('phone')} />
      </div>

      <div className="order-form__field">
        <label htmlFor="notes">Notas</label>
        <textarea id="notes" {...register('notes')} rows={3} />
      </div>

      <Button variant="primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Confirmar pedido'}
      </Button>
    </form>
  )
}
```

---

## Paso 9 — TiendaPage

Compone todo. Maneja los estados de UI (`isCartOpen`, `showForm`).

```tsx
// src/pages/TiendaPage.tsx
import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { ProductCard } from '../components/ProductCard/ProductCard'
import { CartDrawer } from '../components/CartDrawer/CartDrawer'
import { OrderForm } from '../components/OrderForm/OrderForm'
import { Button } from '../components/shared/Button/Button'
import './TiendaPage.css'

export const TiendaPage = () => {
  const { products, loading, error } = useProducts()
  const { count } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)

  if (loading) return <p className="tienda__status">Cargando productos...</p>
  if (error) return <p className="tienda__status tienda__status--error">{error}</p>

  return (
    <section className="tienda">
      <div className="tienda__header">
        <h1>Tienda</h1>
        <Button variant="outline" onClick={() => setIsCartOpen(true)}>
          Carrito ({count})
        </Button>
      </div>

      {showForm ? (
        <OrderForm onSuccess={() => setShowForm(false)} />
      ) : (
        <ul className="tienda__grid">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false)
          setShowForm(true)
        }}
      />
    </section>
  )
}
```

---

## Paso 10 — Conectar todo en App.tsx

### Añadir CartProvider

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PageLayout } from './layouts/PageLayout'
import { HomePage } from './pages/HomePage'
import { TiendaPage } from './pages/TiendaPage'
import { CartProvider } from './context/CartContext'

export const App = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PageLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tienda" element={<TiendaPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
```

El `CartProvider` envuelve el `BrowserRouter` para que el contexto sea accesible en cualquier página, incluida la NavBar (si se quiere mostrar el contador de items en el navbar).

### Actualizar navItems.ts

El link de Tienda ya existe en el array, solo verificar que el `href` sea `/tienda`:

```ts
{ label: 'Tienda', href: '/tienda' }
```

---

## Estados utilizados (cumple requisito mínimo 3)

| Estado | Dónde | Qué representa |
|---|---|---|
| `loading` / `error` | `useProducts` | Estado de la petición a la API |
| `items: CartItem[]` | `CartContext` | Items en el carrito |
| `isCartOpen` | `TiendaPage` | Drawer abierto/cerrado |
| `showForm` | `TiendaPage` | Vista catálogo vs formulario |

---

## Checklist de requisitos cubiertos por la tienda

| Requisito | Cómo se cumple |
|---|---|
| Full responsive | CSS Grid con `auto-fill` en tienda, drawer con position fixed |
| 3+ páginas con react-router-dom | `/`, `/tienda`, más las que se añadan |
| 3+ estados con sentido | loading, items del carrito, drawer open, showForm |
| useEffect para petición de datos | `useProducts` → `useEffect` + `fetch` |
| API pública o propia | Fake Store API o `public/data/products.json` |
| Formulario útil | `OrderForm` con validación via react-hook-form |
| Componentes reutilizables | `Button`, `ProductCard`, `CartDrawer`, `OrderForm` |
| Sin re-renders innecesarios | Context solo en raíz; `ProductCard` recibe producto como prop |
| Custom hook | `useProducts`, `useCart` |
| useContext | `CartContext` + `useCartContext` |

---

## Orden de implementación recomendado

1. `src/services/productService.ts` — sin React, se puede probar con Postman
2. `src/hooks/useProducts.ts` — probar en un componente temporal
3. `src/context/CartContext.tsx` + añadir `CartProvider` a `App.tsx`
4. `src/hooks/useCart.ts`
5. `src/components/ProductCard/` — ver productos en pantalla
6. `src/pages/TiendaPage.tsx` con solo el catálogo (sin drawer ni formulario)
7. `src/components/CartDrawer/` — añadir al carrito funciona
8. `npm install react-hook-form` → `src/components/OrderForm/`
9. Añadir ruta `/tienda` en `App.tsx`
10. Ajustar CSS responsive

---

## Nota sobre re-renders

`CartContext` usa `useState` directamente. Si el árbol crece y se perciben re-renders, el siguiente paso sería `useReducer` en lugar de `useState` para el array de items. Por ahora no es necesario.

`ProductCard` no debe importar `CartContext` directamente — lo hace a través de `useCart`. Si en el futuro se necesita memoizar, envolver con `React.memo` es suficiente.
