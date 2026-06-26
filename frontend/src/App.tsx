import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { PageLayout } from './components/PageLayout'
import { HomePage } from './pages/home/HomePage'
import { ShopPage } from './pages/shop/ShopPage'
import { AccountPage } from './pages/account/AccountPage'
import { AuthProvider } from './context/AuthProvider'
import { CartProvider } from './context/CartProvider'

export const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PageLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/cuenta" element={<AccountPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

