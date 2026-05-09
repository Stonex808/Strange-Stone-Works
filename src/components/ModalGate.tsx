import { useEffect, useMemo, useState } from 'react';
import GlowButton from './GlowButton';
import {
  ANNEX_CONSENT_COOKIE_NAME,
  ANNEX_CONSENT_MAX_AGE_DAYS,
  ANNEX_CONSENT_MAX_AGE_MS,
  ANNEX_CONSENT_STORAGE_KEY,
  ANNEX_CONSENT_VERSION,
  createAnnexConsentRecord,
  isAnnexConsentValid,
  serializeAnnexConsent,
} from '@/lib/annexGate';

type GateStatus = 'checking' | 'ready' | 'accepted' | 'blocked';

function getCookieValue(name: string): string | null {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? cookie.slice(name.length + 1) : null;
}

function persistConsent(): { ok: boolean; message: string } {
  const record = createAnnexConsentRecord();
  const serialized = serializeAnnexConsent(record);
  let storageSaved = false;
  let cookieSaved = false;

  try {
    window.localStorage.setItem(ANNEX_CONSENT_STORAGE_KEY, serialized);
    storageSaved = true;
  } catch {
    storageSaved = false;
  }

  try {
    document.cookie = `${ANNEX_CONSENT_COOKIE_NAME}=${serialized}; max-age=${ANNEX_CONSENT_MAX_AGE_MS / 1000}; path=/annex; SameSite=Lax`;
    cookieSaved = isAnnexConsentValid(getCookieValue(ANNEX_CONSENT_COOKIE_NAME));
  } catch {
    cookieSaved = false;
  }

  if (cookieSaved) {
    return {
      ok: true,
      message: storageSaved
        ? 'Consent recorded locally. Opening the protected archive…'
        : 'LocalStorage is blocked, so consent was recorded with a same-site cookie only.',
    };
  }

  return {
    ok: false,
    message:
      'Consent could not be saved. Enable same-site cookies for this site to access the protected archive. No content was unlocked.',
  };
}

function clearConsent() {
  try {
    window.localStorage.removeItem(ANNEX_CONSENT_STORAGE_KEY);
  } catch {
    // Storage may be blocked; the cookie clear below is the safe fallback.
  }

  document.cookie = `${ANNEX_CONSENT_COOKIE_NAME}=; max-age=0; path=/annex; SameSite=Lax`;
}

export default function ModalGate() {
  const [status, setStatus] = useState<GateStatus>('checking');
  const [message, setMessage] = useState('Review the warning and choose Enter or Exit.');

  const versionLabel = useMemo(() => ANNEX_CONSENT_VERSION.replaceAll('-', ' '), []);

  useEffect(() => {
    const cookieConsent = getCookieValue(ANNEX_CONSENT_COOKIE_NAME);
    let localConsent: string | null = null;

    try {
      localConsent = window.localStorage.getItem(ANNEX_CONSENT_STORAGE_KEY);
    } catch {
      localConsent = null;
    }

    if (isAnnexConsentValid(cookieConsent) || isAnnexConsentValid(localConsent)) {
      setStatus('accepted');
      setMessage('A current consent record was found. You may continue to the archive or exit and clear consent.');
      return;
    }

    const gateReason = new URLSearchParams(window.location.search).get('gate');
    if (gateReason === 'required') {
      setMessage('Consent is required before the protected archive can be rendered. Please review and choose Enter or Exit.');
    }

    setStatus('ready');
  }, []);

  function handleEnter() {
    const result = persistConsent();
    setMessage(result.message);

    if (!result.ok) {
      setStatus('blocked');
      return;
    }

    setStatus('accepted');
    window.setTimeout(() => {
      window.location.assign('/annex/archive');
    }, 350);
  }

  function handleExit() {
    clearConsent();
    window.location.assign('/');
  }

  return (
    <section className="forge-panel glow-border mx-auto mt-8 max-w-3xl p-6 text-left sm:p-8" aria-labelledby="annex-gate-title">
      <p className="font-ui text-sm uppercase tracking-[0.35em] text-warning">Restricted Annex</p>
      <h2 id="annex-gate-title" className="mt-2 font-heading text-4xl text-highlight sm:text-5xl">
        18+ Consent Gate
      </h2>

      <div className="mt-5 space-y-4 text-base leading-7 text-text/90">
        <p>
          This annex may contain mature themes, uncensored theoretical writing, satire, symbolic systems, and fictional or
          speculative material intended only for adults who are at least 18 years old.
        </p>
        <p>
          Legal disclaimer: the archive is provided for expressive, educational, artistic, and research-oriented discussion.
          It is not legal, medical, financial, or professional advice, and it does not encourage unlawful conduct.
        </p>
        <p>
          Jurisdiction note: laws and content standards vary by location. By entering, you confirm that accessing this
          material is lawful where you are and that you accept responsibility for complying with your local rules.
        </p>
      </div>

      <dl className="mt-6 grid gap-3 rounded-lg border border-border bg-black/20 p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-ui uppercase tracking-widest text-highlight/80">Version</dt>
          <dd>{versionLabel}</dd>
        </div>
        <div>
          <dt className="font-ui uppercase tracking-widest text-highlight/80">Expires</dt>
          <dd>{ANNEX_CONSENT_MAX_AGE_DAYS} days after consent</dd>
        </div>
        <div>
          <dt className="font-ui uppercase tracking-widest text-highlight/80">Fallback</dt>
          <dd>Cookie is required if localStorage is blocked</dd>
        </div>
      </dl>

      <p className="mt-5 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning" role="status">
        {status === 'checking' ? 'Checking consent status…' : message}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <GlowButton className="bg-glow/20" onClick={handleEnter} disabled={status === 'checking'}>
          Enter Archive
        </GlowButton>
        {status === 'accepted' ? (
          <a
            className="rounded-md border border-glow bg-panel px-4 py-2 text-center font-ui uppercase tracking-wider text-highlight shadow-ember transition duration-300 hover:bg-glow/10"
            href="/annex/archive"
          >
            Continue to Archive
          </a>
        ) : null}
        <GlowButton className="bg-warning/20" onClick={handleExit} disabled={status === 'checking'}>
          Exit
        </GlowButton>
      </div>

      {status === 'blocked' ? (
        <p className="mt-4 text-sm text-text/70">
          Safe fallback activated: protected content stays unavailable until consent can be stored in a same-site cookie.
        </p>
      ) : null}
    </section>
  );
}
