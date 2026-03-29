// src/lib/validation/schemas.ts
// Zod validation schemas for all API inputs

import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const apiKeySchema = z
    .string()
    .min(10, 'API key must be at least 10 characters')
    .max(500, 'API key must not exceed 500 characters')
    .regex(/^[a-zA-Z0-9_\-:]+$/, 'API key contains invalid characters');

export const urlSchema = z.string().url('Invalid URL format');

export const dateSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const emailSchema = z.string().email('Invalid email format');

export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']);

// ============================================
// Integration Schemas
// ============================================

export const clockifyConnectSchema = z.object({
    organization_id: uuidSchema,
    api_key: apiKeySchema,
    workspace_id: z.string().optional(),
});

export const shopifyConnectSchema = z.object({
    organization_id: uuidSchema,
    api_key: apiKeySchema,
    shop_url: z
        .string()
        .regex(
            /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/,
            'Shop URL must be a valid Shopify domain (example.myshopify.com)'
        ),
});

export const togglConnectSchema = z.object({
    organization_id: uuidSchema,
});

export const stripeConnectSchema = z.object({
    organization_id: uuidSchema,
});

export const integrationQuerySchema = z.object({
    organization_id: uuidSchema,
});

// ============================================
// Client Schemas
// ============================================

export const createClientSchema = z.object({
    name: z
        .string()
        .min(1, 'Client name is required')
        .max(200, 'Client name must not exceed 200 characters')
        .trim(),
    agreed_monthly_retainer: z
        .number()
        .min(0, 'Retainer cannot be negative')
        .max(10000000, 'Retainer exceeds maximum allowed'),
    agreed_deliverables: z
        .string()
        .max(5000, 'Deliverables must not exceed 5000 characters')
        .optional(),
    hour_limit: z
        .number()
        .min(0, 'Hour limit cannot be negative')
        .max(10000, 'Hour limit exceeds maximum allowed')
        .nullable()
        .optional(),
    custom_hourly_rate: z
        .number()
        .min(0, 'Hourly rate cannot be negative')
        .max(10000, 'Hourly rate exceeds maximum allowed')
        .nullable()
        .optional(),
    custom_cost_rate: z
        .number()
        .min(0, 'Cost rate cannot be negative')
        .max(10000, 'Cost rate exceeds maximum allowed')
        .nullable()
        .optional(),
    custom_margin_threshold: z
        .number()
        .min(0, 'Margin threshold cannot be negative')
        .max(100, 'Margin threshold cannot exceed 100%')
        .nullable()
        .optional(),
    start_date: dateSchema,
    status: z.enum(['active', 'inactive', 'paused', 'churned']).optional(),
});

export const updateClientSchema = createClientSchema.partial();

// ============================================
// Time Entry Schemas
// ============================================

export const createTimeEntrySchema = z.object({
    client_id: uuidSchema,
    hours: z
        .number()
        .min(0, 'Hours cannot be negative')
        .max(24, 'Hours cannot exceed 24 per entry'),
    date: dateSchema,
    team_member: z
        .string()
        .min(1)
        .max(100, 'Team member name must not exceed 100 characters')
        .optional(),
    description: z
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
        .optional(),
    billable: z.boolean().optional().default(true),
    source: z
        .enum(['manual', 'toggl', 'clockify', 'harvest', 'csv'])
        .optional()
        .default('manual'),
});

export const updateTimeEntrySchema = createTimeEntrySchema.partial();

// ============================================
// Invoice Schemas
// ============================================

export const invoiceStatusSchema = z.enum([
    'draft',
    'sent',
    'pending',
    'paid',
    'overdue',
    'cancelled',
]);

export const createInvoiceSchema = z.object({
    client_id: uuidSchema,
    amount: z
        .number()
        .min(0, 'Amount cannot be negative')
        .max(100000000, 'Amount exceeds maximum allowed'),
    status: invoiceStatusSchema.optional().default('draft'),
    issue_date: dateSchema,
    due_date: dateSchema,
    invoice_number: z
        .string()
        .max(50, 'Invoice number must not exceed 50 characters')
        .optional(),
    description: z
        .string()
        .max(2000, 'Description must not exceed 2000 characters')
        .optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

// ============================================
// Settings Schemas
// ============================================

export const updateSettingsSchema = z.object({
    default_internal_hourly_rate: z
        .number()
        .min(0, 'Rate cannot be negative')
        .max(10000, 'Rate exceeds maximum allowed')
        .optional(),
    default_internal_cost_rate: z
        .number()
        .min(0, 'Rate cannot be negative')
        .max(10000, 'Rate exceeds maximum allowed')
        .optional(),
    currency: currencySchema.optional(),
    margin_warning_threshold_percent: z
        .number()
        .min(0)
        .max(100)
        .optional(),
    scope_creep_threshold_percent: z
        .number()
        .min(0)
        .max(100)
        .optional(),
    underbilling_threshold_percent: z
        .number()
        .min(0)
        .max(100)
        .optional(),
    late_payment_days_threshold: z
        .number()
        .min(0)
        .max(365)
        .optional(),
});

// ============================================
// Type exports for use in route handlers
// ============================================

export type ClockifyConnectInput = z.infer<typeof clockifyConnectSchema>;
export type ShopifyConnectInput = z.infer<typeof shopifyConnectSchema>;
export type TogglConnectInput = z.infer<typeof togglConnectSchema>;
export type StripeConnectInput = z.infer<typeof stripeConnectSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
