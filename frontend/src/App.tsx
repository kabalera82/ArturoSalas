import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PageLayout } from './layouts/PageLayout'
import { HomePage } from './pages/HomePage'
import { AuthProvider } from './context/AuthContext'

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PageLayout />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

