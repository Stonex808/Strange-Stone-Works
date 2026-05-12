import { defineMiddleware } from 'astro:middleware';
import { ANNEX_CONSENT_COOKIE_NAME, isAnnexConsentValid } from '@/lib/annexGate';

const protectedAnnexPath = '/annex/archive';

function isProtectedAnnexPath(pathname: string) {
  return pathname === protectedAnnexPath || pathname.startsWith(`${protectedAnnexPath}/`);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (isProtectedAnnexPath(pathname)) {
    const consentCookie = context.cookies.get(ANNEX_CONSENT_COOKIE_NAME)?.value;

    if (!isAnnexConsentValid(consentCookie)) {
      const redirectUrl = new URL('/annex', context.url);
      redirectUrl.searchParams.set('gate', consentCookie ? 'expired' : 'required');
      redirectUrl.searchParams.set('next', `${pathname}${context.url.search}`);

      return context.redirect(redirectUrl.pathname + redirectUrl.search, 302);
    }
  }

  return next();
});
