import "./Card.css";
import { Button } from "../Button/Button";
import { useRef } from "react";

type CardProps = {
  videoSrc: string;
  title: string;
  description: string;
  buttonLabel: string;
  onClick?: () => void;
}

export const Card = ({ videoSrc, title, description, buttonLabel}: CardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      className="card"
      onMouseEnter={() => videoRef.current?.play()}
      onMouseLeave={() => {
        videoRef.current?.pause();
        videoRef.current!.currentTime = 0;
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        loop
        playsInline
        width="350"
        height="400"
      />
      <div className="card__body">
        <h3 className="card__title">{title}</h3>
        <p className="card__description">{description}</p>
        <Button variant='cta'>{buttonLabel}</Button>
      </div>
    </div>
  );
}