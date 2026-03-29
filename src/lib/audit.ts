// src/lib/audit.ts
// Audit logging for security-sensitive operations

import { createClient } from '@supabase/supabase-js';

// Audit action types
export type AuditAction =
    // Integration actions
    | 'integration.connect'
    | 'integration.disconnect'
    | 'integration.sync'
    | 'integration.view_credentials'
    | 'integration.update'
    // Client actions
    | 'client.create'
    | 'client.update'
    | 'client.delete'
    | 'client.view'
    // Invoice actions
    | 'invoice.create'
    | 'invoice.update'
    | 'invoice.delete'
    | 'invoice.mark_paid'
    // Time entry actions
    | 'time_entry.create'
    | 'time_entry.update'
    | 'time_entry.delete'
    | 'time_entry.bulk_import'
    // Settings actions
    | 'settings.update'
    // Auth actions
    | 'auth.login'
    | 'auth.logout'
    | 'auth.login_failed'
    | 'auth.password_reset'
    | 'auth.signup'
    // Organization actions
    | 'organization.create'
    | 'organization.update'
    | 'organization.delete';

// Resource types
export type ResourceType =
    | 'integration'
    | 'client'
    | 'invoice'
    | 'time_entry'
    | 'settings'
    | 'user'
    | 'organization';

// Audit log entry
export interface AuditLogEntry {
    organization_id?: string;
    user_id: string;
    action: AuditAction;
    resource_type: ResourceType;
    resource_id?: string;
    details?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
}

// Get Supabase admin client for audit logging
function getAuditClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        console.warn('Audit logging disabled: missing Supabase service role key');
        return null;
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Log an audit event
 * Non-blocking - errors are logged but don't fail the request
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
    try {
        const supabase = getAuditClient();

        if (!supabase) {
            // Log to console as fallback
            console.log('[AUDIT]', JSON.stringify({
                ...entry,
                timestamp: new Date().toISOString(),
            }));
            return;
        }

        await supabase.from('audit_logs').insert({
            organization_id: entry.organization_id,
            user_id: entry.user_id,
            action: entry.action,
            resource_type: entry.resource_type,
            resource_id: entry.resource_id,
            details: entry.details || {},
            ip_address: entry.ip_address,
            user_agent: entry.user_agent,
            created_at: new Date().toISOString(),
        });
    } catch (error) {
        // Log to console but don't fail the request
        console.error('Failed to write audit log:', error);
        console.log('[AUDIT_FALLBACK]', JSON.stringify({
            ...entry,
            timestamp: new Date().toISOString(),
        }));
    }
}

/**
 * Extract request metadata for audit logging
 */
export function getRequestMetadata(request: Request): {
    ip_address?: string;
    user_agent?: string;
} {
    return {
        ip_address:
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            undefined,
        user_agent: request.headers.get('user-agent') || undefined,
    };
}

/**
 * Log integration connection
 */
export async function logIntegrationConnect(
    userId: string,
    organizationId: string,
    provider: string,
    details: Record<string, unknown>,
    request: Request
): Promise<void> {
    await logAuditEvent({
        user_id: userId,
        organization_id: organizationId,
        action: 'integration.connect',
        resource_type: 'integration',
        resource_id: provider,
        details: {
            provider,
            ...details,
        },
        ...getRequestMetadata(request),
    });
}

/**
 * Log integration disconnection
 */
export async function logIntegrationDisconnect(
    userId: string,
    organizationId: string,
    provider: string,
    request: Request
): Promise<void> {
    await logAuditEvent({
        user_id: userId,
        organization_id: organizationId,
        action: 'integration.disconnect',
        resource_type: 'integration',
        resource_id: provider,
        details: { provider },
        ...getRequestMetadata(request),
    });
}

/**
 * Log failed authentication attempt
 */
export async function logFailedLogin(
    email: string,
    reason: string,
    request: Request
): Promise<void> {
    await logAuditEvent({
        user_id: 'anonymous',
        action: 'auth.login_failed',
        resource_type: 'user',
        details: {
            email: maskEmail(email),
            reason,
        },
        ...getRequestMetadata(request),
    });
}

/**
 * Mask email for logging (privacy)
 */
function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***';

    const maskedLocal =
        local.length > 2
            ? `${local[0]}***${local[local.length - 1]}`
            : '***';

    return `${maskedLocal}@${domain}`;
}

/**
 * Check if audit logging is enabled
 */
export function isAuditEnabled(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}
