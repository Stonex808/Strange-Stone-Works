import type { APIRoute } from 'astro';
import { getProducts } from '@/lib/commerce';

export const GET: APIRoute = async () => {
  const products = await getProducts();
  return new Response(JSON.stringify(products), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60'
    }
  });
};
