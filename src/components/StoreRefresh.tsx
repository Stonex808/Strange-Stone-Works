import { useEffect, useState } from 'react';
import type { CommerceProduct } from '@/lib/commerce';

export default function StoreRefresh() {
  const [message, setMessage] = useState('Catalog rendered at build time.');

  useEffect(() => {
    let active = true;
    fetch('/api/products.json')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('refresh unavailable')))
      .then((products: CommerceProduct[]) => {
        if (active) setMessage(`Live refresh checked ${products.length} products just now.`);
      })
      .catch(() => {
        if (active) setMessage('Build-time catalog is active; live refresh is unavailable in this environment.');
      });

    return () => { active = false; };
  }, []);

  return <p className="text-xs text-text/60">{message}</p>;
}
