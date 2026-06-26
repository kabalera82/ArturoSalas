import './HeroSection.css';
import arturoHero from '../../../assets/arturo_hero.webp';
import ossaLogo from '../../../assets/ossa_hero.webp';
import { Button } from '../../../components/shared/Button/Button';

export const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero__content">
        <div className="hero__ossa">
          <img src={ossaLogo} alt="Logo OSSA marca personal Arturo Salas" width="700" height="100" />
        </div>
        <h1 className="hero__title">DOMINA TU ARTE</h1>
        <h2 className="hero__subtitle">REFINA TU COMBATE</h2>
        <p className="hero__text">
          20 años separando lo que funciona de lo que no. Dos décadas refinando la técnica en el tatami. Lo que no servía, lo dejé en el camino. Así gané un campeonato del mundo. No te lo cuento para impresionarte; lo cuento porque sé exactamente qué se necesita para llegar a la cima, y sé cómo usar esa experiencia para ayudarte a ti. Más de 300 personas han pasado por mis clases. Cada una con sus miedos, sus objetivos y su ritmo. Ese es el camino que recorreré contigo.
        </p>
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
  );
};
