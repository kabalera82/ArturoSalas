import { Outlet } from 'react-router-dom'
import { NavBar } from '../components/NavBar/NavBar'
import { Footer } from '../components/Footer/Footer'

export const PageLayout = () => {
  return (
    <div className="app">
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}