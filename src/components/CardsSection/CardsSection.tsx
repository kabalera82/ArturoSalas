import './CardsSection.css';
import { cardItems } from './cardItem'
import { Card } from '../shared/Card/Card'

export const CardsSection = () => {
  return (
    <section className="cards-section">
      <div className="cards-section__grid">
        {cardItems.map((item, index) => (
          <Card
            key={index}
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