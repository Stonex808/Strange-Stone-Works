export const ANNEX_CONSENT_VERSION = '2026-05-annex-v1';
export const ANNEX_CONSENT_STORAGE_KEY = `ssw:annex-consent:${ANNEX_CONSENT_VERSION}`;
export const ANNEX_CONSENT_COOKIE_NAME = 'ssw_annex_consent';
export const ANNEX_CONSENT_MAX_AGE_DAYS = 30;
export const ANNEX_CONSENT_MAX_AGE_MS = ANNEX_CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

type AnnexConsentRecord = {
  version: string;
  acceptedAt: number;
};

export function createAnnexConsentRecord(now = Date.now()): AnnexConsentRecord {
  return {
    version: ANNEX_CONSENT_VERSION,
    acceptedAt: now,
  };
}

export function serializeAnnexConsent(record: AnnexConsentRecord): string {
  return encodeURIComponent(JSON.stringify(record));
}

export function parseAnnexConsent(value: string | undefined | null): AnnexConsentRecord | null {
  if (!value) return null;

  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded) as Partial<AnnexConsentRecord>;

    if (parsed.version !== ANNEX_CONSENT_VERSION) return null;
    if (typeof parsed.acceptedAt !== 'number' || !Number.isFinite(parsed.acceptedAt)) return null;

    return {
      version: parsed.version,
      acceptedAt: parsed.acceptedAt,
    };
  } catch {
    return null;
  }
}

export function isAnnexConsentValid(value: string | undefined | null, now = Date.now()): boolean {
  const record = parseAnnexConsent(value);
  if (!record) return false;

  const age = now - record.acceptedAt;
  return age >= 0 && age <= ANNEX_CONSENT_MAX_AGE_MS;
}
