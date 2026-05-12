export const prerender = false;

import type { APIRoute } from 'astro';
import {
  ANNEX_CONSENT_COOKIE_NAME,
  ANNEX_CONSENT_MAX_AGE_MS,
  createAnnexConsentRecord,
  serializeAnnexConsent,
} from '@/lib/annexGate';

const protectedAnnexPath = '/annex/archive';
const consentCookiePath = '/annex';

function safeNextPath(value: string | null) {
  if (!value) return protectedAnnexPath;
  return value === protectedAnnexPath || value.startsWith(`${protectedAnnexPath}/`) ? value : protectedAnnexPath;
}

export const GET: APIRoute = async ({ cookies, redirect, url }) => {
  const intent = url.searchParams.get('intent');

  if (intent === 'exit') {
    cookies.delete(ANNEX_CONSENT_COOKIE_NAME, { path: consentCookiePath });
    return redirect('/', 303);
  }

  if (intent !== 'enter') {
    return redirect('/annex?gate=required', 303);
  }

  cookies.set(ANNEX_CONSENT_COOKIE_NAME, serializeAnnexConsent(createAnnexConsentRecord()), {
    httpOnly: true,
    maxAge: ANNEX_CONSENT_MAX_AGE_MS / 1000,
    path: consentCookiePath,
    sameSite: 'lax',
    secure: url.protocol === 'https:',
  });

  return redirect(safeNextPath(url.searchParams.get('next')), 303);
};
