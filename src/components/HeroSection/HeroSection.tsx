import './HeroSection.css'
import arturoHero from '../../assets/arturo_hero.webp'
import ossaLogo from '../../assets/ossa_hero.webp'
import { Button } from '../shared/Button/Button'

export const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero__content">
        <div className="hero__ossa">
          <img src={ossaLogo} alt="Logo OSSA marca personal Arturo Salas" width="700" height="100" />
        </div>
        <h1 className="hero__title">DOMINA TU ARTE</h1>
        <h2 className="hero__subtitle">REFINA TU COMBATE</h2>
        <p className="hero__text">Soy Arturo Salas. Campeón Mundial UWW de Grappling. Head coach de más de 300 atletas en España. Si quieres mejorar de verdad, estás en el sitio correcto.</p>
        <Button variant="cta">Comenzar</Button>
      </div>
      
      <div className="hero__image">
        <img
          src={arturoHero}
          alt="Arturo Salas, coach de BJJ y Grappling, Campeón del Mundo UWW 2022"
          width="600"
          height="800"
        />
      </div>
    </section>
  )
}