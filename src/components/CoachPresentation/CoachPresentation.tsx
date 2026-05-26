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
      <div className="coach-presentation__palmarés">
        <h2 className="coach-presentation__title">Palmarés Destacado</h2>
        <ul className="coach-presentation__list">
          <li>Campeón Mundial de Grappling UWW (Gi y No-Gi, 2017)</li>
          <li>Triple Campeón Europeo de Grappling (2017, 2022)</li>
          <li>Multicampeón Internacional IBJJF (Open Europeo, Londres y España)</li>
          <li>Campeón Abu Dhabi Grand Slam (EAU, 2018)</li>
        </ul>
      </div>
    </section>
  )
}
