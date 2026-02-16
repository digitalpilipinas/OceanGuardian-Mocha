/**
 * Password hashing utilities for Cloudflare Workers
 *
 * Uses Web Crypto API (PBKDF2 with SHA-256) which is natively
 * available in the Workers runtime — no npm dependencies needed.
 */

const ITERATIONS = 100_000;
const SALT_LENGTH = 16; // 128-bit salt
const KEY_LENGTH = 32; // 256-bit derived key

/**
 * Hash a password using PBKDF2-SHA256.
 * Returns a string in the format: `salt_hex:hash_hex`
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        KEY_LENGTH * 8
    );

    const saltHex = bufferToHex(salt);
    const hashHex = bufferToHex(new Uint8Array(derivedBits));

    return `${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored hash string.
 */
export async function verifyPassword(
    password: string,
    storedHash: string
): Promise<boolean> {
    const [saltHex, expectedHashHex] = storedHash.split(":");
    if (!saltHex || !expectedHashHex) return false;

    const salt = hexToBuffer(saltHex);

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        KEY_LENGTH * 8
    );

    const computedHex = bufferToHex(new Uint8Array(derivedBits));
    return timingSafeEqual(computedHex, expectedHashHex);
}

/** Convert Uint8Array to hex string */
function bufferToHex(buffer: Uint8Array): string {
    return Array.from(buffer)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/** Convert hex string to Uint8Array */
function hexToBuffer(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

/** Constant-time string comparison to prevent timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}
