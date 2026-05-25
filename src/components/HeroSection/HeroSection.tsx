import arturoHero from '../../assets/arturo_hero.webp'
import { Button } from '../shared/Button/Button'

export const HeroSection = () => {

  return (
    <section className="hero">
      <div className="hero__content">
        <div className="hero__ossa">
          <img src="..." alt="Logo OSSA marca personal Arturo Salas" />
        </div>
        <h1 className="hero__title">DOMINA TU ARTE</h1>
        <h2 className="hero__subtitle">REFINA TU COMBATE</h2>
        <p className="hero__text">Coach de BJJ y Grappling en España. 20 años en el tatami para que tú no pierdas tiempo en lo que no funciona.</p>
        <Button />
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