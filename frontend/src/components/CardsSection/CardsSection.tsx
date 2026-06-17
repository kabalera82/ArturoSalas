import './CardsSection.css';
import { cardItems } from './cardItem'
import { Card } from '../shared/Card/Card'

export const CardsSection = () => {
  return (
    <section className="cards-section">
      <div className="cards-section__grid">
        {cardItems.map((item) => (
          <Card
            key={item.title}
            videoSrc={item.videoSrc}
            title={item.title}
            description={item.description}
            buttonLabel={item.buttonLabel}
          />
        ))}
      </div>
    </section>
  )
}