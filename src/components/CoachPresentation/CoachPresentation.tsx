import './CoachPresentation.css'
import arturoChampion from '../../assets/champion_image.webp'

export const CoachPresentation = () => {
  return (
    <section className="coach-presentation">
      <div className="coach-presentation__image">
        <img
          src={arturoChampion}
          alt="Arturo Salas, Campeón del Mundo UWW 2022"
          width="600"
          height="800"
        />
      </div>
    </section>
  )
}
