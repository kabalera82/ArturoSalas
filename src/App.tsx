import './App.css'
import { NavBar } from './components/NavBar/NavBar'
import { Footer } from './components/Footer/Footer'
import { HeroSection } from './components/HeroSection/HeroSection'

function App() {
  return (
    <div className="app">
      <NavBar />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
