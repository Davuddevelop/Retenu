// src/lib/rateLimit.ts
// Rate limiting for API routes using Upstash Redis or in-memory fallback

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Rate limit configurations
const RATE_LIMITS = {
    // Auth endpoints: strictest (prevent brute force)
    auth: { requests: 5, window: '1m' as const },
    // General API endpoints: moderate
    api: { requests: 60, window: '1m' as const },
    // Integration sync: relaxed but still limited
    sync: { requests: 10, window: '1m' as const },
    // Webhook endpoints: higher limit
    webhook: { requests: 100, window: '1m' as const },
};

type RateLimitType = keyof typeof RATE_LIMITS;

// Initialize Upstash Redis if configured
let redis: Redis | null = null;
const rateLimiters: Partial<Record<RateLimitType, Ratelimit>> = {};

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        // Create rate limiters for each type
        for (const [type, config] of Object.entries(RATE_LIMITS)) {
            rateLimiters[type as RateLimitType] = new Ratelimit({
                redis,
                limiter: Ratelimit.slidingWindow(config.requests, config.window),
                analytics: true,
                prefix: `ratelimit:${type}`,
            });
        }
    } catch (error) {
        console.warn('Failed to initialize Upstash Redis:', error);
    }
}

// In-memory fallback for development
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of inMemoryStore.entries()) {
        if (value.resetTime < now) {
            inMemoryStore.delete(key);
        }
    }
}, 60000); // Clean up every minute

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: number;
    limit: number;
}

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
    identifier: string,
    type: RateLimitType = 'api'
): Promise<RateLimitResult> {
    const config = RATE_LIMITS[type];

    // Use Upstash if available
    if (rateLimiters[type]) {
        try {
            const result = await rateLimiters[type]!.limit(identifier);
            return {
                success: result.success,
                remaining: result.remaining,
                reset: result.reset,
                limit: config.requests,
            };
        } catch (error) {
            console.error('Upstash rate limit error:', error);
            // Fall through to in-memory
        }
    }

    // In-memory fallback
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const key = `${type}:${identifier}`;
    const data = inMemoryStore.get(key);

    if (!data || data.resetTime < now) {
        // New window
        inMemoryStore.set(key, {
            count: 1,
            resetTime: now + windowMs,
        });
        return {
            success: true,
            remaining: config.requests - 1,
            reset: now + windowMs,
            limit: config.requests,
        };
    }

    if (data.count >= config.requests) {
        // Rate limited
        return {
            success: false,
            remaining: 0,
            reset: data.resetTime,
            limit: config.requests,
        };
    }

    // Increment counter
    data.count++;
    return {
        success: true,
        remaining: config.requests - data.count,
        reset: data.resetTime,
        limit: config.requests,
    };
}

/**
 * Rate limit middleware for API routes
 * Returns response if rate limited, headers to add if not
 */
export async function withRateLimit(
    request: Request,
    type: RateLimitType = 'api'
): Promise<{
    limited: boolean;
    response?: NextResponse;
    headers: Record<string, string>;
}> {
    // Get identifier (IP address or user ID)
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

    const result = await checkRateLimit(ip, type);

    const headers = {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
    };

    if (!result.success) {
        const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

        return {
            limited: true,
            response: NextResponse.json(
                {
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        ...headers,
                        'Retry-After': retryAfter.toString(),
                    },
                }
            ),
            headers,
        };
    }

    return {
        limited: false,
        headers,
    };
}

/**
 * Apply rate limit headers to a response
 */
export function applyRateLimitHeaders(
    response: NextResponse,
    headers: Record<string, string>
): NextResponse {
    for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
    }
    return response;
}

/**
 * Check if rate limiting is configured (Upstash)
 */
export function isRateLimitConfigured(): boolean {
    return redis !== null;
}
