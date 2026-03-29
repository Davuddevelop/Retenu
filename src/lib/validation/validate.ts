// src/lib/validation/validate.ts
// Validation helpers for API routes

import { ZodSchema, ZodError } from 'zod';
import { NextResponse } from 'next/server';

export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; error: NextResponse };

/**
 * Validate request body against a Zod schema
 * Returns validated data or a NextResponse error
 */
export function validateBody<T>(
    schema: ZodSchema<T>,
    body: unknown
): ValidationResult<T> {
    const result = schema.safeParse(body);

    if (!result.success) {
        return {
            success: false,
            error: formatZodError(result.error),
        };
    }

    return { success: true, data: result.data };
}

/**
 * Validate URL search params against a Zod schema
 * Converts URLSearchParams to object first
 */
export function validateQuery<T>(
    schema: ZodSchema<T>,
    params: URLSearchParams
): ValidationResult<T> {
    const obj = Object.fromEntries(params.entries());
    return validateBody(schema, obj);
}

/**
 * Format Zod errors into a user-friendly NextResponse
 */
function formatZodError(error: ZodError): NextResponse {
    const flattened = error.flatten();
    const fieldErrors = flattened.fieldErrors;
    const formErrors = flattened.formErrors;

    // Build a readable error message
    const messages: string[] = [];

    // Add form-level errors
    if (formErrors.length > 0) {
        messages.push(...formErrors);
    }

    // Add field-level errors
    for (const [field, errors] of Object.entries(fieldErrors)) {
        if (Array.isArray(errors) && errors.length > 0) {
            messages.push(`${field}: ${errors.join(', ')}`);
        }
    }

    return NextResponse.json(
        {
            error: 'Validation Error',
            message: messages.length > 0 ? messages[0] : 'Invalid input',
            details: fieldErrors,
        },
        { status: 400 }
    );
}

/**
 * Sanitize a string to prevent XSS
 * Escapes HTML special characters
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 * Validate and sanitize an object's string fields
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result = { ...obj };

    for (const key of Object.keys(result)) {
        const value = result[key];
        if (typeof value === 'string') {
            (result as Record<string, unknown>)[key] = sanitizeString(value);
        }
    }

    return result;
}
