import type { APIRoute } from 'astro';
import { createCheckout } from '@/lib/commerce';

type CheckoutBody = {
  lines?: Array<{ merchandiseId?: unknown; quantity?: unknown }>;
};

const variantIdPattern = /^gid:\/\/shopify\/ProductVariant\/[A-Za-z0-9_-]+$/;

export const POST: APIRoute = async ({ request }) => {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return Response.json({ error: 'Expected a JSON checkout payload.' }, { status: 415 });
  }

  let body: CheckoutBody;
  try {
    body = await request.json() as CheckoutBody;
  } catch {
    return Response.json({ error: 'Malformed JSON checkout payload.' }, { status: 400 });
  }

  const lines = Array.isArray(body.lines) ? body.lines : [];
  const sanitizedLines = lines
    .slice(0, 25)
    .map((line) => ({ merchandiseId: String(line.merchandiseId || ''), quantity: Number(line.quantity) || 1 }))
    .filter((line) => variantIdPattern.test(line.merchandiseId));

  if (!sanitizedLines.length) {
    return Response.json({ error: 'Cart is empty or contains invalid variants.' }, { status: 400 });
  }

  const checkout = await createCheckout(sanitizedLines);
  return Response.json(checkout);
};
