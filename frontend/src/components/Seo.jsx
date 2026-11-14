import { useEffect } from 'react';

const BASE_URL = 'https://gig-ora.vercel.app';
const DEFAULT_TITLE = 'GigOra — Milestone-Based Marketplace for Technical Talent';
const DEFAULT_DESC = 'Discover Indian technical talent, agree on deliverables, and collaborate with milestone-based workflows and real-time workspaces on GigOra.';
const DEFAULT_IMAGE = `${BASE_URL}/og/default.png`;

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonical,
  ogImage = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
}) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper for meta attributes
    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta
    setMeta('name', 'description', description);
    if (noindex) {
      setMeta('name', 'robots', 'noindex, nofollow');
    } else {
      setMeta('name', 'robots', 'index, follow');
    }

    // 3. Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:type', type);
    if (canonical) {
      setMeta('property', 'og:url', canonical);
    }

    // 4. Twitter Cards
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    // 5. Canonical Link
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }
  }, [title, description, canonical, ogImage, type, noindex]);

  return null;
}
