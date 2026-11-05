import dns from "dns";
import { BadRequestError } from "./errors";

// Comprehensive map of common email domain typos to their correct counterpart
const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  // Gmail typos
  "gmil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaik.com": "gmail.com",
  "gmeil.com": "gmail.com",
  "gml.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmai.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.comm": "gmail.com",
  "gmail.cpm": "gmail.com",

  // Yahoo typos
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yaho.co": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yaho.cm": "yahoo.com",
  "ymail.co": "ymail.com",
  "yaho.comm": "yahoo.com",

  // Hotmail typos
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",

  // Outlook typos
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlock.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",

  // iCloud typos
  "icld.com": "icloud.com",
  "iclod.com": "icloud.com",
  "icloud.co": "icloud.com",
  "icloud.con": "icloud.com",
};

// Common Top-Level Domain (TLD) typos
const COMMON_TLD_TYPOS: Record<string, string> = {
  "con": "com",
  "cmo": "com",
  "cm": "com",
  "comm": "com",
  "coom": "com",
  "ocm": "com",
  "cpm": "com",
  "ner": "net",
  "ney": "net",
  "nett": "net",
  "ogr": "org",
  "orgg": "org",
};

const RFC_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates an email address for:
 * 1. Correct syntactic structure.
 * 2. Common domain provider typos (e.g. gmil.com -> gmail.com).
 * 3. Common TLD typos (e.g. .con -> .com).
 * 4. Verifiable DNS MX records for custom/uncommon domains.
 *
 * Returns normalized (trimmed, lowercase) email address.
 */
export async function validateAndNormalizeEmail(
  rawEmail: string | undefined | null,
  contextLabel = "Email address"
): Promise<string> {
  if (!rawEmail || typeof rawEmail !== "string" || !rawEmail.trim()) {
    throw new BadRequestError(`${contextLabel} is required.`);
  }

  const email = rawEmail.trim().toLowerCase();

  // 1. Structure check
  if (!RFC_EMAIL_REGEX.test(email)) {
    throw new BadRequestError(`${contextLabel} "${rawEmail}" has an invalid email format.`);
  }

  const parts = email.split("@");
  if (parts.length !== 2) {
    throw new BadRequestError(`${contextLabel} "${rawEmail}" has an invalid email format.`);
  }

  const [localPart, domain] = parts;

  // 2. Check for known provider typos (e.g. @gmil.com, @yaho.com)
  if (COMMON_DOMAIN_TYPOS[domain]) {
    const suggestedDomain = COMMON_DOMAIN_TYPOS[domain];
    const suggestedEmail = `${localPart}@${suggestedDomain}`;
    throw new BadRequestError(
      `Invalid email "${rawEmail}". It looks like a typo ("@${domain}"). Did you mean "${suggestedEmail}"?`
    );
  }

  // 3. Check for known TLD typos (e.g. user@domain.con)
  const lastDotIndex = domain.lastIndexOf(".");
  if (lastDotIndex > 0) {
    const tld = domain.substring(lastDotIndex + 1);
    if (COMMON_TLD_TYPOS[tld]) {
      const suggestedTld = COMMON_TLD_TYPOS[tld];
      const suggestedDomain = domain.substring(0, lastDotIndex + 1) + suggestedTld;
      const suggestedEmail = `${localPart}@${suggestedDomain}`;
      throw new BadRequestError(
        `Invalid email domain in "${rawEmail}". Did you mean "${suggestedEmail}"?`
      );
    }
  }

  // 4. DNS MX lookup with quick 2s timeout for non-standard domains
  // Common valid domains skip DNS to maintain near-zero latency
  const trustedMajorDomains = new Set([
    "gmail.com",
    "yahoo.com",
    "yahoo.co.uk",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "icloud.com",
    "aol.com",
    "protonmail.com",
    "proton.me",
    "zoho.com",
    "yopmail.com",
    "mail.com",
  ]);

  if (!trustedMajorDomains.has(domain)) {
    try {
      const mxPromise = dns.promises.resolveMx(domain);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
      const mxRecords = await Promise.race([mxPromise, timeoutPromise]);

      if (mxRecords && Array.isArray(mxRecords) && mxRecords.length === 0) {
        throw new BadRequestError(
          `The domain "@${domain}" does not support receiving emails. Please check for typos.`
        );
      }
    } catch (err: any) {
      if (err?.code === "ENOTFOUND" || err?.code === "ENODATA") {
        throw new BadRequestError(
          `The email domain "@${domain}" does not exist. Please check your spelling.`
        );
      }
      // If network timeout, allow the request to proceed so external DNS latency doesn't block legitimate buyers
    }
  }

  return email;
}
