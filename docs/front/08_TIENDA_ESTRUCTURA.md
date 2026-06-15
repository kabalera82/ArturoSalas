# 08 — Estructura frontend: Tienda

## Archivos a crear

```
src/
│
├── context/
│   └── CartContext.tsx
│
├── hooks/
│   ├── useProducts.ts
│   └── useCart.ts
│
├── services/
│   └── productService.ts
│
├── components/
│   ├── ProductCard/
│   │   ├── ProductCard.tsx
│   │   └── ProductCard.css
│   │
│   ├── CartDrawer/
│   │   ├── CartDrawer.tsx
│   │   └── CartDrawer.css
│   │
│   └── OrderForm/
│       ├── OrderForm.tsx
│       └── OrderForm.css
│
└── pages/
    └── TiendaPage.tsx
```

## Archivos existentes que se reutilizan

| Archivo | Uso en tienda |
|---|---|
| `shared/Button/Button.tsx` | Botones de añadir, vaciar carrito, confirmar pedido |
| `shared/NavLinks/NavLinks.tsx` | Sin cambios |
| `layouts/PageLayout.tsx` | La tienda hereda NavBar + Footer automáticamente |
| `index.css` | Variables de color y fuente ya disponibles |

`shared/Card/Card.tsx` — NO se usa. Está acoplada a video.

## Orden de creación

1. `services/productService.ts` — fetch puro, sin React
2. `hooks/useProducts.ts` — useEffect + fetch
3. `context/CartContext.tsx` — estado global del carrito
4. `hooks/useCart.ts` — encapsula el contexto
5. `components/ProductCard/` — muestra un producto, usa Button
6. `pages/TiendaPage.tsx` — solo catálogo, sin carrito todavía
7. `components/CartDrawer/` — panel lateral
8. `components/OrderForm/` — formulario de pedido
9. Conectar `CartProvider` en `App.tsx` y añadir ruta `/tienda`

## Responsabilidad de cada archivo

**productService.ts** — funciones fetch contra la API del backend. Sin lógica React. Exporta tipos `Product`.

**useProducts.ts** — custom hook. Llama a `productService`, maneja estados `loading`, `error`, `products`. Contiene el `useEffect`.

**CartContext.tsx** — `createContext` + `CartProvider`. Estado: array de items. Acciones: `addItem`, `removeItem`, `clearCart`. Exporta `useCartContext`.

**useCart.ts** — custom hook que consume `CartContext`. Añade helpers: `isInCart`, `getQuantity`. Los componentes importan este hook, nunca el contexto directamente.

**ProductCard.tsx** — recibe un `Product` como prop. Muestra imagen, título, precio, categoría. Botón "Añadir" usa `useCart`. No tiene estado propio.

**CartDrawer.tsx** — panel lateral con `position: fixed`. Recibe `isOpen` y `onClose` como props. Internamente usa `useCart`. Botón "Finalizar pedido" llama a `onCheckout`.

**OrderForm.tsx** — formulario con `react-hook-form`. Campos: nombre, email, teléfono, notas. Al enviar muestra los datos del carrito y llama a `clearCart`.

**TiendaPage.tsx** — compone todo. Maneja estados de UI: `isCartOpen`, `showForm`. No tiene lógica de negocio propia.

## Estados (cumple requisito mínimo 3)

| Estado | Dónde vive | Qué representa |
|---|---|---|
| `loading` / `error` | `useProducts` | Estado de la petición a la API |
| `items: CartItem[]` | `CartContext` | Productos en el carrito |
| `isCartOpen` | `TiendaPage` | Drawer abierto o cerrado |
| `showForm` | `TiendaPage` | Vista catálogo vs formulario |

## Requisitos del proyecto cubiertos

| Requisito | Cómo |
|---|---|
| 3+ páginas con react-router-dom | `/tienda` se suma a `/` |
| 3+ estados con sentido | Ver tabla arriba |
| useEffect para petición de datos | `useProducts` |
| API | Backend Express + MongoDB Atlas (Mongoose) |
| Formulario útil | `OrderForm` con validación |
| Componentes reutilizables | `ProductCard`, `CartDrawer`, `OrderForm`, `Button` |
| Custom hook | `useProducts`, `useCart` |
| useContext | `CartContext` |
