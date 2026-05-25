import facebookImg from '../../assets/facebook.webp';
import tiktokImg from '../../assets/tiktok.webp';
import instagramImg from '../../assets/instagram.webp';
import whatsappImg from '../../assets/whatsap.webp';
import gmailImg from '../../assets/gmail.webp';
import youtubeImg from '../../assets/youtube.webp';

export type FootItem = {
    imgSrc: string;
    altText: string;
    href: string;
}

export const footItems: FootItem[] = [
    {imgSrc: youtubeImg,    altText: 'YouTube',     href: 'https://www.youtube.com/@ArturoSalas' },
    { imgSrc: facebookImg,   altText: 'Facebook',   href: 'https://www.facebook.com/ArturoSalas' },
    { imgSrc: tiktokImg,     altText: 'TikTok',     href: 'https://www.tiktok.com/@ArturoSalas' },
    { imgSrc: instagramImg,  altText: 'Instagram',  href: 'https://www.instagram.com/ArturoSalas' },
    { imgSrc: whatsappImg,   altText: 'WhatsApp',   href: 'https://wa.me/1234567890' },
    { imgSrc: gmailImg,      altText: 'Gmail',      href: 'mailto:arturosalas@example.com' },
]