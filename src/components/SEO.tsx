import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, canonical, image }) => {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to get or create meta tag
    const setMetaTag = (attribute: 'name' | 'property', value: string, content: string) => {
      let meta = document.querySelector(`meta[${attribute}="${value}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, value);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update meta description
    setMetaTag('name', 'description', description);

    // Update Open Graph preview tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);

    const currentUrl = `https://lavanyanatural.in${location.pathname}`;
    setMetaTag('property', 'og:url', currentUrl);

    // Update Twitter preview tags
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:url', currentUrl);

    // Update Image Preview Tags if provided
    if (image) {
      const absoluteImage = image.startsWith('http')
        ? image
        : `https://lavanyanatural.in${image.startsWith('/') ? '' : '/'}${encodeURI(image)}`;

      setMetaTag('property', 'og:image', absoluteImage);
      setMetaTag('property', 'og:image:secure_url', absoluteImage);
      setMetaTag('name', 'twitter:image', absoluteImage);
      setMetaTag('name', 'thumbnail', absoluteImage);

      let linkImage = document.querySelector('link[rel="image_src"]');
      if (!linkImage) {
        linkImage = document.createElement('link');
        linkImage.setAttribute('rel', 'image_src');
        document.head.appendChild(linkImage);
      }
      linkImage.setAttribute('href', absoluteImage);
    }

    // Update Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) {
      linkCanonical.setAttribute('href', canonical || currentUrl);
    }
  }, [title, description, canonical, image, location.pathname]);

  return null;
};
