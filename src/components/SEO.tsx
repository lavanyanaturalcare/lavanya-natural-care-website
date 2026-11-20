import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  schema?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({ title, description, canonical, image, schema }) => {
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

    const currentUrl = `https://onznatural.com${location.pathname}`;
    setMetaTag('property', 'og:url', currentUrl);

    // Update Twitter preview tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', '@onznatural');
    setMetaTag('name', 'twitter:creator', '@onznatural');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:url', currentUrl);

    // Image Preview Tags
    const previewImage = image || '/images/products/kesuda-palash-soap.webp';
    const absoluteImage = previewImage.startsWith('http')
      ? previewImage
      : `https://onznatural.com${previewImage.startsWith('/') ? '' : '/'}${encodeURI(previewImage)}`;

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

    // Update Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) {
      linkCanonical.setAttribute('href', canonical || currentUrl);
    }

    // Dynamic JSON-LD Schema
    const existingScript = document.getElementById('page-jsonld-schema');
    if (existingScript) {
      existingScript.remove();
    }

    if (schema) {
      const script = document.createElement('script');
      script.id = 'page-jsonld-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      const scriptToRemove = document.getElementById('page-jsonld-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, description, canonical, image, schema, location.pathname]);

  return null;
};
