// src/lib/database.types.ts
// Auto-generated types for Supabase - run `npx supabase gen types typescript` to update
/* eslint-disable @typescript-eslint/no-empty-object-type */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            organizations: {
                Row: {
                    id: string;
                    name: string;
                    owner_id: string;
                    demo_mode: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    owner_id: string;
                    demo_mode?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    owner_id?: string;
                    demo_mode?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            financial_settings: {
                Row: {
                    id: string;
                    organization_id: string;
                    default_internal_hourly_rate: number;
                    default_internal_cost_rate: number;
                    currency: string;
                    margin_warning_threshold_percent: number;
                    scope_creep_threshold_percent: number;
                    underbilling_threshold_percent: number;
                    late_payment_days_threshold: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    organization_id: string;
                    default_internal_hourly_rate?: number;
                    default_internal_cost_rate?: number;
                    currency?: string;
                    margin_warning_threshold_percent?: number;
                    scope_creep_threshold_percent?: number;
                    underbilling_threshold_percent?: number;
                    late_payment_days_threshold?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    organization_id?: string;
                    default_internal_hourly_rate?: number;
                    default_internal_cost_rate?: number;
                    currency?: string;
                    margin_warning_threshold_percent?: number;
                    scope_creep_threshold_percent?: number;
                    underbilling_threshold_percent?: number;
                    late_payment_days_threshold?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            clients: {
                Row: {
                    id: string;
                    organization_id: string;
                    name: string;
                    agreed_monthly_retainer: number;
                    agreed_deliverables: string;
                    hour_limit: number | null;
                    custom_hourly_rate: number | null;
                    custom_cost_rate: number | null;
                    custom_margin_threshold: number | null;
                    start_date: string;
                    status: 'active' | 'inactive' | 'paused' | 'churned';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    organization_id: string;
                    name: string;
                    agreed_monthly_retainer: number;
                    agreed_deliverables?: string;
                    hour_limit?: number | null;
                    custom_hourly_rate?: number | null;
                    custom_cost_rate?: number | null;
                    custom_margin_threshold?: number | null;
                    start_date?: string;
                    status?: 'active' | 'inactive' | 'paused' | 'churned';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    organization_id?: string;
                    name?: string;
                    agreed_monthly_retainer?: number;
                    agreed_deliverables?: string;
                    hour_limit?: number | null;
                    custom_hourly_rate?: number | null;
                    custom_cost_rate?: number | null;
                    custom_margin_threshold?: number | null;
                    start_date?: string;
                    status?: 'active' | 'inactive' | 'paused' | 'churned';
                    created_at?: string;
                    updated_at?: string;
                };
            };
            contracts: {
                Row: {
                    id: string;
                    client_id: string;
                    organization_id: string;
                    internal_hourly_rate: number;
                    internal_cost_rate: number;
                    start_date: string;
                    end_date: string | null;
                    status: 'active' | 'inactive' | 'expired';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    organization_id: string;
                    internal_hourly_rate: number;
                    internal_cost_rate: number;
                    start_date: string;
                    end_date?: string | null;
                    status?: 'active' | 'inactive' | 'expired';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    organization_id?: string;
                    internal_hourly_rate?: number;
                    internal_cost_rate?: number;
                    start_date?: string;
                    end_date?: string | null;
                    status?: 'active' | 'inactive' | 'expired';
                    created_at?: string;
                };
            };
            invoices: {
                Row: {
                    id: string;
                    client_id: string;
                    organization_id: string;
                    amount: number;
                    status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
                    issue_date: string;
                    due_date: string;
                    paid_date: string | null;
                    stripe_invoice_id: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    organization_id: string;
                    amount: number;
                    status?: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
                    issue_date: string;
                    due_date: string;
                    paid_date?: string | null;
                    stripe_invoice_id?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    organization_id?: string;
                    amount?: number;
                    status?: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
                    issue_date?: string;
                    due_date?: string;
                    paid_date?: string | null;
                    stripe_invoice_id?: string | null;
                    created_at?: string;
                };
            };
            time_entries: {
                Row: {
                    id: string;
                    client_id: string;
                    organization_id: string;
                    hours: number;
                    date: string;
                    team_member: string;
                    description: string;
                    billable: boolean;
                    external_id: string | null;
                    source: 'manual' | 'toggl' | 'clockify' | 'harvest' | 'csv';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    organization_id: string;
                    hours: number;
                    date: string;
                    team_member?: string;
                    description?: string;
                    billable?: boolean;
                    external_id?: string | null;
                    source?: 'manual' | 'toggl' | 'clockify' | 'harvest' | 'csv';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    organization_id?: string;
                    hours?: number;
                    date?: string;
                    team_member?: string;
                    description?: string;
                    billable?: boolean;
                    external_id?: string | null;
                    source?: 'manual' | 'toggl' | 'clockify' | 'harvest' | 'csv';
                    created_at?: string;
                };
            };
            integrations: {
                Row: {
                    id: string;
                    organization_id: string;
                    provider: 'stripe' | 'toggl' | 'clockify' | 'harvest' | 'quickbooks' | 'xero' | 'shopify';
                    access_token: string | null;
                    refresh_token: string | null;
                    api_key: string | null;
                    workspace_id: string | null;
                    enabled: boolean;
                    last_sync_at: string | null;
                    config: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    organization_id: string;
                    provider: 'stripe' | 'toggl' | 'clockify' | 'harvest' | 'quickbooks' | 'xero' | 'shopify';
                    access_token?: string | null;
                    refresh_token?: string | null;
                    api_key?: string | null;
                    workspace_id?: string | null;
                    enabled?: boolean;
                    last_sync_at?: string | null;
                    config?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    organization_id?: string;
                    provider?: 'stripe' | 'toggl' | 'clockify' | 'harvest' | 'quickbooks' | 'xero' | 'shopify';
                    access_token?: string | null;
                    refresh_token?: string | null;
                    api_key?: string | null;
                    workspace_id?: string | null;
                    enabled?: boolean;
                    last_sync_at?: string | null;
                    config?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            alerts: {
                Row: {
                    id: string;
                    client_id: string;
                    organization_id: string;
                    alert_type: 'underbilling' | 'scope_creep' | 'missing_invoice' | 'late_payment' | 'low_margin' | 'negative_margin';
                    severity: 'critical' | 'high' | 'medium' | 'low';
                    estimated_leakage: number;
                    message: string;
                    details: string;
                    status: 'active' | 'resolved' | 'ignored';
                    created_at: string;
                    resolved_at: string | null;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    organization_id: string;
                    alert_type: 'underbilling' | 'scope_creep' | 'missing_invoice' | 'late_payment' | 'low_margin' | 'negative_margin';
                    severity?: 'critical' | 'high' | 'medium' | 'low';
                    estimated_leakage?: number;
                    message: string;
                    details?: string;
                    status?: 'active' | 'resolved' | 'ignored';
                    created_at?: string;
                    resolved_at?: string | null;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    organization_id?: string;
                    alert_type?: 'underbilling' | 'scope_creep' | 'missing_invoice' | 'late_payment' | 'low_margin' | 'negative_margin';
                    severity?: 'critical' | 'high' | 'medium' | 'low';
                    estimated_leakage?: number;
                    message?: string;
                    details?: string;
                    status?: 'active' | 'resolved' | 'ignored';
                    created_at?: string;
                    resolved_at?: string | null;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
