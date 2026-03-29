// src/lib/encryption.ts
// AES-256-GCM encryption for sensitive data like API keys

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

export interface EncryptedData {
    ciphertext: string;  // base64 encoded
    iv: string;          // base64 encoded
    authTag: string;     // base64 encoded
    version: number;     // for key rotation support
}

/**
 * Get the master encryption key from environment
 * Uses scrypt to derive a proper 32-byte key from the master key
 */
function getMasterKey(): Buffer {
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;

    if (!masterKey) {
        throw new Error(
            'ENCRYPTION_MASTER_KEY environment variable is not set. ' +
            'Generate one with: openssl rand -base64 32'
        );
    }

    if (masterKey.length < 32) {
        throw new Error(
            'ENCRYPTION_MASTER_KEY must be at least 32 characters. ' +
            'Generate one with: openssl rand -base64 32'
        );
    }

    // Use a fixed salt for deterministic key derivation
    // In production, you could use a per-organization salt stored in the DB
    const salt = process.env.ENCRYPTION_SALT || 'obsidian-revenue-leak-v1';

    // Derive a 32-byte key using scrypt (memory-hard, resistant to brute force)
    return scryptSync(masterKey, salt, KEY_LENGTH);
}

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns an object with ciphertext, iv, authTag, and version
 */
export function encrypt(plaintext: string): EncryptedData {
    if (!plaintext) {
        throw new Error('Cannot encrypt empty string');
    }

    const key = getMasterKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
        ciphertext,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        version: 1, // Increment when rotating keys
    };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * Returns the original plaintext
 */
export function decrypt(encrypted: EncryptedData): string {
    if (!encrypted || !encrypted.ciphertext || !encrypted.iv || !encrypted.authTag) {
        throw new Error('Invalid encrypted data structure');
    }

    const key = getMasterKey();
    const iv = Buffer.from(encrypted.iv, 'base64');
    const authTag = Buffer.from(encrypted.authTag, 'base64');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let plaintext = decipher.update(encrypted.ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
}

/**
 * Check if a value is an encrypted data structure
 */
export function isEncrypted(value: unknown): value is EncryptedData {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const obj = value as Record<string, unknown>;

    return (
        typeof obj.ciphertext === 'string' &&
        typeof obj.iv === 'string' &&
        typeof obj.authTag === 'string' &&
        typeof obj.version === 'number'
    );
}

/**
 * Encrypt an API key for database storage
 * Returns a JSON string that can be stored in a JSONB column
 */
export function encryptApiKey(apiKey: string): string {
    const encrypted = encrypt(apiKey);
    return JSON.stringify(encrypted);
}

/**
 * Decrypt an API key from database storage
 * Accepts the JSON string from the database
 */
export function decryptApiKey(encryptedJson: string): string {
    try {
        const encrypted = JSON.parse(encryptedJson) as EncryptedData;
        return decrypt(encrypted);
    } catch (error) {
        // If it's not valid JSON or encrypted format, it might be legacy plaintext
        // Log this for monitoring but return as-is for backwards compatibility
        console.warn('Failed to decrypt API key - may be legacy plaintext format');
        throw new Error('Failed to decrypt API key');
    }
}

/**
 * Safely decrypt an API key, returning null if decryption fails
 * Useful for migration scenarios where data might be mixed
 */
export function safeDecryptApiKey(encryptedJson: string | null): string | null {
    if (!encryptedJson) {
        return null;
    }

    try {
        return decryptApiKey(encryptedJson);
    } catch {
        return null;
    }
}

/**
 * Mask an API key for display (shows last 4 characters)
 */
export function maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
        return '••••••••';
    }
    return `••••••••${apiKey.slice(-4)}`;
}

/**
 * Check if encryption is properly configured
 */
export function isEncryptionConfigured(): boolean {
    try {
        getMasterKey();
        return true;
    } catch {
        return false;
    }
}
