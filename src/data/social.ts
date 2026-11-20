import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/onznatural',
  facebook: 'https://www.facebook.com/onznatural',
  youtube: 'https://youtube.com/@onznatural',
  linkedin: 'https://www.linkedin.com/company/onznatural'
};

export const socialAccounts = [
  {
    name: 'Instagram',
    icon: Instagram,
    href: SOCIAL_LINKS.instagram,
    handle: '@onznatural',
    description: 'Follow ONZNATURAL for artisanal cold-process formulation, botanical science, and skin rituals.'
  },
  {
    name: 'Facebook',
    icon: Facebook,
    href: SOCIAL_LINKS.facebook,
    handle: 'ONZNATURAL',
    description: 'Join our community to discover small-batch botanical updates, customer stories, and launches.'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    href: SOCIAL_LINKS.youtube,
    handle: '@onznatural',
    description: 'Watch cold-process saponification, botanical ingredient studies, and mindful skincare guides.'
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    href: SOCIAL_LINKS.linkedin,
    handle: 'ONZNATURAL',
    description: 'Connect with ONZNATURAL for brand heritage, artisanal quality standards, and partnerships.'
  }
];
