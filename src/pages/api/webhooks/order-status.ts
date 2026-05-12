import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';

function verifyShopifyHmac(rawBody: string, signature: string | null) {
  const secret = import.meta.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;

  const digest = createHmac('sha256', String(secret)).update(rawBody, 'utf8').digest('base64');
  const expected = Buffer.from(digest, 'utf8');
  const received = Buffer.from(signature, 'utf8');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text();
  if (!verifyShopifyHmac(rawBody, request.headers.get('x-shopify-hmac-sha256'))) {
    return Response.json({ error: 'Invalid Shopify webhook signature.' }, { status: 401 });
  }

  let payload: { id?: number | string; name?: string; financial_status?: string; fulfillment_status?: string | null };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return Response.json({ error: 'Malformed Shopify webhook JSON.' }, { status: 400 });
  }

  const orderStatus = {
    provider: 'shopify',
    orderId: String(payload.id || payload.name || 'unknown'),
    financialStatus: String(payload.financial_status || 'pending'),
    fulfillmentStatus: String(payload.fulfillment_status || 'unfulfilled'),
    receivedAt: new Date().toISOString()
  };

  console.info('order_status_webhook', orderStatus);
  return Response.json({ ok: true, orderStatus });
};
