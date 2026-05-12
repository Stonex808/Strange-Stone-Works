import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import GlowButton from './GlowButton';
import {
  ANNEX_CONSENT_MAX_AGE_DAYS,
  ANNEX_CONSENT_STORAGE_KEY,
  ANNEX_CONSENT_VERSION,
  createAnnexConsentRecord,
  isAnnexConsentValid,
  serializeAnnexConsent,
} from '@/lib/annexGate';

type GateStatus = 'checking' | 'ready' | 'accepted' | 'blocked' | 'submitting';

type ModalGateProps = {
  hasServerConsent?: boolean;
  gateReason?: string;
};

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

const protectedArchivePath = '/annex/archive';

function readStoredConsent(): string | null {
  try {
    return window.localStorage.getItem(ANNEX_CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredConsent(): boolean {
  try {
    window.localStorage.setItem(ANNEX_CONSENT_STORAGE_KEY, serializeAnnexConsent(createAnnexConsentRecord()));
    return true;
  } catch {
    return false;
  }
}

function clearStoredConsent() {
  try {
    window.localStorage.removeItem(ANNEX_CONSENT_STORAGE_KEY);
  } catch {
    // Storage may be blocked. The server-side exit action still clears the cookie.
  }
}

function getSafeNextPath(): string {
  const next = new URLSearchParams(window.location.search).get('next');
  return next === protectedArchivePath || next?.startsWith(`${protectedArchivePath}/`) ? next : protectedArchivePath;
}

export default function ModalGate({ hasServerConsent = false, gateReason }: ModalGateProps) {
  const [status, setStatus] = useState<GateStatus>('checking');
  const [message, setMessage] = useState('Review the warning and choose Enter or Exit.');
  const [nextPath, setNextPath] = useState(protectedArchivePath);

  const versionLabel = useMemo(() => ANNEX_CONSENT_VERSION.replaceAll('-', ' '), []);
  const canSubmit = status !== 'checking' && status !== 'submitting';

  useEffect(() => {
    setNextPath(getSafeNextPath());

    if (hasServerConsent || isAnnexConsentValid(readStoredConsent())) {
      setStatus('accepted');
      setMessage('A current consent record was found. You may continue to the archive or exit and clear consent.');
      return;
    }

    if (gateReason === 'required') {
      setStatus('blocked');
      setMessage('Consent is required before the protected archive can be rendered. Please review and choose Enter or Exit.');
      return;
    }

    if (gateReason === 'expired') {
      setStatus('blocked');
      setMessage('Your previous annex consent expired or used an older version. Please review the notice again.');
      return;
    }

    setStatus('ready');
  }, [gateReason, hasServerConsent]);

  const handleSubmit: FormSubmitHandler = (event) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.value;

    if (intent === 'exit') {
      clearStoredConsent();
      setStatus('submitting');
      setMessage('Exiting annex and clearing local consent…');
      return;
    }

    const storageSaved = writeStoredConsent();
    setStatus('submitting');
    setMessage(
      storageSaved
        ? 'Consent saved locally. Creating the protected session…'
        : 'LocalStorage is blocked, so the server will use a same-site cookie fallback.',
    );
  };

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
          <dd>HttpOnly cookie if localStorage is blocked</dd>
        </div>
      </dl>

      <p className="mt-5 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning" role="status" aria-live="polite">
        {status === 'checking' ? 'Checking consent status…' : message}
      </p>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" method="get" action="/annex/consent" onSubmit={handleSubmit}>
        <input type="hidden" name="next" value={nextPath} />
        <GlowButton className="bg-glow/20" type="submit" name="intent" value="enter" disabled={!canSubmit}>
          Enter Archive
        </GlowButton>
        {status === 'accepted' ? (
          <a
            className="rounded-md border border-glow bg-panel px-4 py-2 text-center font-ui uppercase tracking-wider text-highlight shadow-ember transition duration-300 hover:bg-glow/10"
            href={nextPath}
          >
            Continue to Archive
          </a>
        ) : null}
        <GlowButton className="bg-warning/20" type="submit" name="intent" value="exit" disabled={!canSubmit}>
          Exit
        </GlowButton>
      </form>

      {status === 'blocked' ? (
        <p className="mt-4 text-sm text-text/70">
          Safe fallback active: protected content stays unavailable until current consent can be stored in a same-site
          cookie by the server.
        </p>
      ) : null}
    </section>
  );
}
