import { defineMiddleware } from 'astro:middleware';
import { ANNEX_CONSENT_COOKIE_NAME, isAnnexConsentValid } from '@/lib/annexGate';

const protectedAnnexPath = '/annex/archive';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname === protectedAnnexPath || pathname.startsWith(`${protectedAnnexPath}/`)) {
    const consentCookie = context.cookies.get(ANNEX_CONSENT_COOKIE_NAME)?.value;

    if (!isAnnexConsentValid(consentCookie)) {
      return context.redirect('/annex?gate=required', 302);
    }
  }

  return next();
});
