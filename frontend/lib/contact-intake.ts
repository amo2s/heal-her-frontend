/**
 * ============================================================================
 * Heal Her Inquiries — Shared Contact Intake Contract & Mirrored Sanitizer
 * ============================================================================
 * Isomorphic TypeScript domain contracts and deterministic validation helpers
 * mirroring backend/services/inquiries/internal/security/sanitizer.go with
 * zero external dependencies.
 */

// ============================================================================
// 1. STRICT TYPED DOMAIN CONTRACTS
// ============================================================================

/**
 * The 5 user-editable contact form field keys.
 */
export type ContactFieldKey = "name" | "org" | "email" | "subject" | "message";

/**
 * Incoming public intake payload from client to Next.js BFF and Go backend.
 */
export interface ContactIntakePayload {
  name: string;
  org: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}

/**
 * Exact character (Unicode code-point / rune) bounds mirroring Go sanitizer.go.
 */
export const ContactFieldLimits = {
  name: { min: 2, max: 120 },
  org: { min: 2, max: 150 },
  email: { min: 5, max: 254 },
  subject: { min: 3, max: 200 },
  message: { min: 10, max: 5000 },
} as const;

/**
 * Client and BFF timing thresholds.
 */
export const ContactTimingConfig = {
  /** Minimum milliseconds expected between form mount and submission by a human */
  minElapsedMs: 2500,
  /** Client-side fetch timeout ceiling (longer than BFF timeout to catch structured errors) */
  clientTimeoutMs: 15000,
  /** BFF proxy timeout ceiling to upstream Hugging Face Go service */
  bffTimeoutMs: 12000,
} as const;

/**
 * Normalized success contract returned on HTTP 201 Created.
 */
export interface ContactReceipt {
  status: "success";
  inquiryId: string;
  referenceCode: string;
  ticketStatus: string;
  message: string;
}

/**
 * Machine-readable error codes emitted by the Next.js Contact BFF.
 */
export type ContactErrorCode =
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "INVALID_REQUEST"
  | "FORBIDDEN_ORIGIN"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

/**
 * Normalized error contract returned on all non-2xx outcomes.
 */
export interface ContactErrorResponse {
  status: "error";
  code: ContactErrorCode;
  message: string;
  fieldErrors?: Partial<Record<ContactFieldKey, string>>;
  retryAfterSeconds?: number;
  fallbackAvailable: boolean;
}

// ============================================================================
// 2. MIRRORED VALIDATION & SANITIZATION UTILITIES
// ============================================================================

/**
 * Measures string length in Unicode code points (runes), guaranteeing exact parity
 * with Go's `utf8.RuneCountInString` for international text, accents, and emojis.
 */
export function countRunes(str: string): number {
  return Array.from(str).length;
}

/**
 * Normalizes single-line fields (name, org, subject):
 * Replaces \r and \n with space, strips null bytes and non-printable control characters,
 * collapses redundant whitespace runs into a single space, and trims ends.
 */
export function sanitizeSingleLineField(raw: string): string {
  if (!raw) return "";

  let cleaned = "";
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    // Null byte (0)
    if (code === 0) continue;
    // Replace CRLF with space
    if (code === 13 || code === 10) {
      cleaned += " ";
      continue;
    }
    // Delete ASCII control characters (< 32 except space) or DEL (127)
    if ((code < 32 && code !== 32) || code === 127) {
      continue;
    }
    cleaned += raw[i];
  }

  // Collapse consecutive whitespace to single space and trim
  return cleaned.replace(/\s+/g, " ").trim();
}

/**
 * Normalizes multi-line message fields:
 * Converts \r\n and \r to \n, strips null bytes and non-printable ASCII control characters
 * while preserving tabs (\t) and newlines (\n), and trims outer whitespace.
 */
export function sanitizeMessageField(raw: string): string {
  if (!raw) return "";

  // Normalize all line breaks to \n
  const normalizedBreaks = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  let cleaned = "";
  for (let i = 0; i < normalizedBreaks.length; i++) {
    const code = normalizedBreaks.charCodeAt(i);
    // Strip null bytes
    if (code === 0) continue;
    // Explicitly preserve newline (10) and tab (9)
    if (code === 10 || code === 9) {
      cleaned += normalizedBreaks[i];
      continue;
    }
    // Strip other control characters (< 32) or DEL (127)
    if ((code < 32 && code !== 32) || code === 127) {
      continue;
    }
    cleaned += normalizedBreaks[i];
  }

  return cleaned.trim();
}

/**
 * Enforces RFC 5322 compliance, lowercase normalization, zero CRLF/null bytes,
 * and blocks display-name smuggling (e.g. `Evil <user@domain.com>`).
 */
export function validateEmail(raw: string): { normalized: string; error?: string } {
  const trimmed = (raw || "").trim();
  const runeLen = countRunes(trimmed);

  if (runeLen < ContactFieldLimits.email.min || runeLen > ContactFieldLimits.email.max) {
    return {
      normalized: "",
      error: `Email must be between ${ContactFieldLimits.email.min} and ${ContactFieldLimits.email.max} characters`,
    };
  }

  // Reject internal whitespace, nulls, CRLF, and quote/angle bracket smuggling characters
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    if (
      code === 0 ||
      code === 13 ||
      code === 10 ||
      /\s/.test(trimmed[i]) ||
      trimmed[i] === "<" ||
      trimmed[i] === ">" ||
      trimmed[i] === '"' ||
      trimmed[i] === "'"
    ) {
      return {
        normalized: "",
        error: "Email contains invalid characters or whitespace",
      };
    }
  }

  const atParts = trimmed.split("@");
  if (atParts.length !== 2 || !atParts[0] || !atParts[1]) {
    return {
      normalized: "",
      error: "Invalid email address structure",
    };
  }

  const [localPart, domainPart] = atParts;
  if (countRunes(localPart) > 64) {
    return {
      normalized: "",
      error: "Email local part cannot exceed 64 characters",
    };
  }

  if (
    !domainPart.includes(".") ||
    domainPart.startsWith(".") ||
    domainPart.endsWith(".")
  ) {
    return {
      normalized: "",
      error: "Email domain must contain a valid domain and TLD",
    };
  }

  const labels = domainPart.split(".");
  for (const label of labels) {
    if (!label) {
      return {
        normalized: "",
        error: "Email domain contains empty label",
      };
    }
  }

  const tld = labels[labels.length - 1];
  if (!/^[a-zA-Z]{2,}$/.test(tld)) {
    return {
      normalized: "",
      error: "Email top-level domain is invalid",
    };
  }

  return { normalized: trimmed.toLowerCase() };
}

/**
 * Validates and normalizes all user-submitted form fields against Go limits.
 */
export function validateContactInput(raw: {
  name?: unknown;
  org?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
}): {
  isValid: boolean;
  sanitized: ContactIntakePayload;
  fieldErrors: Partial<Record<ContactFieldKey, string>>;
} {
  const fieldErrors: Partial<Record<ContactFieldKey, string>> = {};

  // 1. Name
  const rawName = typeof raw.name === "string" ? raw.name : "";
  const cleanName = sanitizeSingleLineField(rawName);
  const nameLen = countRunes(cleanName);
  if (nameLen < ContactFieldLimits.name.min || nameLen > ContactFieldLimits.name.max) {
    fieldErrors.name = `Full name must be between ${ContactFieldLimits.name.min} and ${ContactFieldLimits.name.max} characters`;
  }

  // 2. Organization
  const rawOrg = typeof raw.org === "string" ? raw.org : "";
  const cleanOrg = sanitizeSingleLineField(rawOrg);
  const orgLen = countRunes(cleanOrg);
  if (orgLen < ContactFieldLimits.org.min || orgLen > ContactFieldLimits.org.max) {
    fieldErrors.org = `Organization must be between ${ContactFieldLimits.org.min} and ${ContactFieldLimits.org.max} characters`;
  }

  // 3. Email
  const rawEmail = typeof raw.email === "string" ? raw.email : "";
  const { normalized: cleanEmail, error: emailErr } = validateEmail(rawEmail);
  if (emailErr) {
    fieldErrors.email = emailErr;
  }

  // 4. Subject
  const rawSubject = typeof raw.subject === "string" ? raw.subject : "";
  const cleanSubject = sanitizeSingleLineField(rawSubject);
  const subjectLen = countRunes(cleanSubject);
  if (subjectLen < ContactFieldLimits.subject.min || subjectLen > ContactFieldLimits.subject.max) {
    fieldErrors.subject = `Subject must be between ${ContactFieldLimits.subject.min} and ${ContactFieldLimits.subject.max} characters`;
  }

  // 5. Message
  const rawMessage = typeof raw.message === "string" ? raw.message : "";
  const cleanMessage = sanitizeMessageField(rawMessage);
  const messageLen = countRunes(cleanMessage);
  if (messageLen < ContactFieldLimits.message.min || messageLen > ContactFieldLimits.message.max) {
    fieldErrors.message = `Message must be between ${ContactFieldLimits.message.min} and ${ContactFieldLimits.message.max.toLocaleString()} characters`;
  }

  // Optional honeypot
  const website = typeof raw.website === "string" ? raw.website.trim() : "";

  const isValid = Object.keys(fieldErrors).length === 0;

  return {
    isValid,
    sanitized: {
      name: cleanName,
      org: cleanOrg,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      website,
    },
    fieldErrors,
  };
}

/**
 * Maps raw backend 422 field error keys to ContactFieldKey.
 * Handles alias discrepancies (e.g. full_name -> name, organization -> org, body -> message).
 */
export function mapBackendFieldErrors(
  backendErrors?: Record<string, string>
): Partial<Record<ContactFieldKey, string>> {
  if (!backendErrors || typeof backendErrors !== "object") {
    return {};
  }

  const mapped: Partial<Record<ContactFieldKey, string>> = {};

  const keyMap: Record<string, ContactFieldKey> = {
    name: "name",
    full_name: "name",
    org: "org",
    organization: "org",
    email: "email",
    subject: "subject",
    message: "message",
    body: "message",
  };

  for (const [key, msg] of Object.entries(backendErrors)) {
    const normalizedKey = key.toLowerCase().trim();
    const targetKey = keyMap[normalizedKey];
    if (targetKey && typeof msg === "string") {
      mapped[targetKey] = msg;
    }
  }

  return mapped;
}
