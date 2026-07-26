import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/lavanya.naturalcare?igsh=MXhmeTFwMzJlam4yMA==',
  facebook: 'https://www.facebook.com/share/1HGWM8Lm4X/',
  youtube: 'https://youtube.com/@lavanyanaturalcare?si=mGKJ-pZDoEP9Dk1y',
  linkedin: 'https://www.linkedin.com/in/lavanya-naturalcare-6ab686423'
};

export const socialAccounts = [
  {
    name: 'Instagram',
    icon: Instagram,
    href: SOCIAL_LINKS.instagram,
    handle: '@lavanya.naturalcare',
    description: 'Follow us for daily handcrafted soap videos, skincare tips, and natural botanical updates.'
  },
  {
    name: 'Facebook',
    icon: Facebook,
    href: SOCIAL_LINKS.facebook,
    handle: 'Lavanya Natural Care',
    description: 'Join our community on Facebook to learn about our cold process manufacturing and new releases.'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    href: SOCIAL_LINKS.youtube,
    handle: '@lavanyanaturalcare',
    description: 'Watch behind-the-scenes soapmaking, ingredient guides, and botanical crafting tutorials.'
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    href: SOCIAL_LINKS.linkedin,
    handle: 'Lavanya Natural Care',
    description: 'Connect with Lavanya Natural Care for business inquiries, brand philosophy, and updates.'
  }
];
