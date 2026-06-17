import './HomePage.css'
import { HeroSection } from '../../components/HeroSection/HeroSection'
import { CardsSection } from '../../components/CardsSection/CardsSection'
import { videoItems } from './homeItem'

export const HomePage = () => {
  return (
    <div className="home">
      <video className="home__video-bg" src={videoItems[0].videoSrc} autoPlay loop muted playsInline />
      <HeroSection />
      <CardsSection />
    </div>
  )
}