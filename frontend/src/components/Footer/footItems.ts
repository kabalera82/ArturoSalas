import facebookImg from '../../assets/facebook.webp';
import instagramImg from '../../assets/instagram.webp';
import linkedinImg from '../../assets/linkedin.webp';
import threadsImg from '../../assets/threads.webp';
import tiktokImg from '../../assets/tiktok.webp';
import whatsappImg from '../../assets/whatsapp.webp';
import youtubeImg from '../../assets/youtube.webp';


export type FootItem = {
    imgSrc: string;
    altText: string;
    href: string;
}

export const footItems: FootItem[] = [
    { imgSrc: facebookImg,   altText: 'Facebook',   href: 'https://www.facebook.com/ArturoSalas' },
    { imgSrc: instagramImg,  altText: 'Instagram',  href: 'https://www.instagram.com/ArturoSalas' },
    { imgSrc: linkedinImg,   altText: 'LinkedIn',   href: 'https://www.linkedin.com/in/ArturoSalas' },
    { imgSrc: threadsImg,      altText: 'Threads',     href: 'https://www.threads.net/@ArturoSalas' },
    { imgSrc: tiktokImg,     altText: 'TikTok',     href: 'https://www.tiktok.com/@ArturoSalas' },
    { imgSrc: whatsappImg,   altText: 'WhatsApp',   href: 'https://wa.me/1234567890' },
    { imgSrc: youtubeImg,   altText: 'YouTube',     href: 'https://www.youtube.com/@ArturoSalas' }
]