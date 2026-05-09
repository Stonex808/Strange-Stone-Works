const MAX_TEXT_LENGTH = 2_000;
const MAX_METADATA_KEYS = 20;
export const CSRF_COOKIE = '__Host-ssw-csrf';
export const CSRF_HEADER = 'x-csrf-token';
const TOKEN_BYTES = 32;

export type FieldError = {
  field: string;
  message: string;
};

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: FieldError[] };

export type ContactForm = {
  name: string;
  email: string;
  message: string;
  topic?: string;
};

export type NewsletterForm = {
  email: string;
  source?: string;
};

export type CheckoutMetadata = {
  email: string;
  productId: string;
  quantity: number;
  notes?: string;
  metadata: Record<string, string>;
};

export type AntiAutomationFields = {
  honeypot?: string | null;
  submittedAt?: string | number | null;
  turnstileToken?: string | null;
  hcaptchaToken?: string | null;
};

export type MutationGuardOptions = {
  csrfSecret: string;
  requireHumanToken?: boolean;
  minimumSubmitSeconds?: number;
};

const emailPattern = /^[^\s@<>]{1,128}@[^\s@<>]{1,128}\.[^\s@<>]{2,24}$/;
const safeIdentifierPattern = /^[a-zA-Z0-9._:-]{1,120}$/;
const promptInjectionPattern = /\b(ignore|override|forget|reveal|leak|bypass|disable)\b.{0,80}\b(system|developer|instruction|prompt|secret|policy|rules?)\b/i;
const htmlOrScriptPattern = /<\/?[a-z][\s\S]*>|javascript:|data:text\/html|on\w+\s*=/i;
const commandInjectionPattern = /(?:\||&&|;|`|\$\(|>\s*\/|<\s*\/)/;

export function sanitizeText(input: unknown, maxLength = MAX_TEXT_LENGTH): string {
  return String(input ?? '')
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function validateContactForm(input: FormData | Record<string, unknown>): ValidationResult<ContactForm> {
  const data = readForm(input);
  const errors = validateAntiAutomationFields(data);
  const name = sanitizeText(data.name, 120);
  const email = sanitizeEmail(data.email);
  const message = sanitizeText(data.message, MAX_TEXT_LENGTH);
  const topic = optionalIdentifier(data.topic);

  requireText(errors, 'name', name, 2, 120);
  requireEmail(errors, 'email', email);
  requireText(errors, 'message', message, 10, MAX_TEXT_LENGTH);
  rejectHostileText(errors, 'message', message);

  if (data.topic && !topic) {
    errors.push({ field: 'topic', message: 'Topic may only contain letters, numbers, dots, colons, underscores, and hyphens.' });
  }

  return errors.length ? { ok: false, errors } : { ok: true, data: { name, email, message, ...(topic ? { topic } : {}) } };
}

export function validateNewsletterForm(input: FormData | Record<string, unknown>): ValidationResult<NewsletterForm> {
  const data = readForm(input);
  const errors = validateAntiAutomationFields(data);
  const email = sanitizeEmail(data.email);
  const source = optionalIdentifier(data.source);

  requireEmail(errors, 'email', email);
  if (data.source && !source) {
    errors.push({ field: 'source', message: 'Source must be a safe identifier.' });
  }

  return errors.length ? { ok: false, errors } : { ok: true, data: { email, ...(source ? { source } : {}) } };
}

export function validateCheckoutMetadata(input: FormData | Record<string, unknown>): ValidationResult<CheckoutMetadata> {
  const data = readForm(input);
  const errors = validateAntiAutomationFields(data);
  const email = sanitizeEmail(data.email);
  const productId = optionalIdentifier(data.productId) ?? '';
  const quantity = Number.parseInt(String(data.quantity ?? '1'), 10);
  const notes = sanitizeText(data.notes, 500);
  const metadata = sanitizeMetadata(data.metadata, errors);

  requireEmail(errors, 'email', email);
  requireText(errors, 'productId', productId, 1, 120);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    errors.push({ field: 'quantity', message: 'Quantity must be an integer between 1 and 10.' });
  }
  if (notes) {
    rejectHostileText(errors, 'notes', notes);
  }

  return errors.length
    ? { ok: false, errors }
    : { ok: true, data: { email, productId, quantity, ...(notes ? { notes } : {}), metadata } };
}

export async function createCsrfCookieHeaders(secret: string): Promise<Headers> {
  assertSecret(secret);
  const token = randomToken();
  const signature = await signToken(token, secret);
  const headers = new Headers();
  // Signed double-submit cookies are intentionally readable so browser form code can echo the token in CSRF_HEADER.
  headers.append('Set-Cookie', `${CSRF_COOKIE}=${token}.${signature}; Path=/; Secure; SameSite=Strict; Max-Age=7200`);
  headers.set('Cache-Control', 'no-store');
  return headers;
}

export async function verifyCsrfRequest(request: Request, secret: string): Promise<boolean> {
  assertSecret(secret);
  if (!isMutationMethod(request.method)) {
    return true;
  }

  const cookieValue = parseCookie(request.headers.get('cookie') ?? '', CSRF_COOKIE);
  const headerToken = request.headers.get(CSRF_HEADER) ?? '';
  if (!cookieValue || !headerToken) {
    return false;
  }

  const [cookieToken, cookieSignature] = cookieValue.split('.');
  if (!cookieToken || !cookieSignature || cookieToken !== headerToken) {
    return false;
  }

  const expected = await signToken(cookieToken, secret);
  return constantTimeEqual(cookieSignature, expected);
}

export async function enforceMutationRequest(
  request: Request,
  fields: AntiAutomationFields,
  options: MutationGuardOptions,
): Promise<ValidationResult<{ csrfVerified: true; humanToken?: string }>> {
  const errors = validateAntiAutomationFields(fields, options.minimumSubmitSeconds);
  const csrfVerified = await verifyCsrfRequest(request, options.csrfSecret);
  if (!csrfVerified) {
    errors.push({ field: 'csrf', message: 'Security token is missing or expired. Refresh and try again.' });
  }

  const humanToken = sanitizeText(fields.turnstileToken || fields.hcaptchaToken || '', 2048);
  if (options.requireHumanToken && !humanToken) {
    errors.push({ field: 'humanToken', message: 'Human verification is required for this submission.' });
  }

  return errors.length
    ? { ok: false, errors }
    : { ok: true, data: { csrfVerified: true, ...(humanToken ? { humanToken } : {}) } };
}

export class MemoryRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string): boolean {
    const now = Date.now();
    const start = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((timestamp) => timestamp >= start);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }

    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}

function readForm(input: FormData | Record<string, unknown>): Record<string, unknown> {
  if (input instanceof FormData) {
    return Object.fromEntries(input.entries());
  }

  return input;
}

function validateAntiAutomationFields(input: Record<string, unknown> | AntiAutomationFields, minimumSubmitSeconds = 3): FieldError[] {
  const errors: FieldError[] = [];
  const honeypot = sanitizeText(input.honeypot, 120);
  if (honeypot) {
    errors.push({ field: 'honeypot', message: 'Submission rejected.' });
  }

  const submittedAt = Number(input.submittedAt ?? 0);
  if (submittedAt > 0 && Date.now() - submittedAt < minimumSubmitSeconds * 1000) {
    errors.push({ field: 'submittedAt', message: 'Submission was too fast. Please try again.' });
  }

  return errors;
}

function sanitizeEmail(value: unknown): string {
  return sanitizeText(value, 254).toLowerCase();
}

function optionalIdentifier(value: unknown): string | undefined {
  const text = sanitizeText(value, 120);
  return text && safeIdentifierPattern.test(text) ? text : undefined;
}

function requireText(errors: FieldError[], field: string, value: string, min: number, max: number): void {
  if (value.length < min || value.length > max) {
    errors.push({ field, message: `${field} must be between ${min} and ${max} characters.` });
  }
}

function requireEmail(errors: FieldError[], field: string, value: string): void {
  if (!emailPattern.test(value)) {
    errors.push({ field, message: 'Enter a valid email address.' });
  }
}

function rejectHostileText(errors: FieldError[], field: string, value: string): void {
  if (htmlOrScriptPattern.test(value) || commandInjectionPattern.test(value) || promptInjectionPattern.test(value)) {
    errors.push({ field, message: 'Remove scripts, markup, command syntax, or instruction-override language.' });
  }
}

function sanitizeMetadata(value: unknown, errors: FieldError[]): Record<string, string> {
  if (!value) {
    return {};
  }

  let source: unknown = value;
  if (typeof value === 'string') {
    try {
      source = JSON.parse(value);
    } catch {
      errors.push({ field: 'metadata', message: 'Metadata must be valid JSON.' });
      return {};
    }
  }

  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    errors.push({ field: 'metadata', message: 'Metadata must be a plain object.' });
    return {};
  }

  const entries = Object.entries(source as Record<string, unknown>).slice(0, MAX_METADATA_KEYS);
  return Object.fromEntries(
    entries
      .map(([key, rawValue]) => [optionalIdentifier(key), sanitizeText(rawValue, 300)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[0] && entry[1])),
  );
}

function isMutationMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

function parseCookie(header: string, name: string): string | undefined {
  return header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function randomToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function signToken(token: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(token));
  return base64Url(new Uint8Array(signature));
}

function base64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

function assertSecret(secret: string): void {
  if (!secret || secret.length < 32) {
    throw new Error('CSRF secret must be at least 32 characters.');
  }
}
