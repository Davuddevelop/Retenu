// src/app/api/auth/shopify/connect/route.ts
// Validates Shopify access tokens and saves them to the DB
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuthAndOrgAccess } from '@/lib/apiAuth';
import { validateBody } from '@/lib/validation/validate';
import { shopifyConnectSchema } from '@/lib/validation/schemas';
import { withRateLimit, applyRateLimitHeaders } from '@/lib/rateLimit';
import { encryptApiKey, isEncryptionConfigured } from '@/lib/encryption';
import { logIntegrationConnect } from '@/lib/audit';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}

export async function POST(request: Request) {
    // Rate limiting
    const rateLimit = await withRateLimit(request, 'api');
    if (rateLimit.limited) {
        return rateLimit.response;
    }

    // Parse and validate request body
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        );
    }

    // Validate input with Zod
    const validation = validateBody(shopifyConnectSchema, body);
    if (!validation.success) {
        return validation.error;
    }

    const { organization_id, api_key, shop_url } = validation.data;

    // Authenticate and verify organization access
    const auth = await requireAuthAndOrgAccess(organization_id);
    if (auth.error || !auth.user) {
        return auth.response!;
    }

    try {
        // Construct the Shopify admin API URL
        const shopifyApiUrl = `https://${shop_url}/admin/api/2024-01/shop.json`;

        // Validate the API key by fetching shop details
        const shopResponse = await fetch(shopifyApiUrl, {
            headers: {
                'X-Shopify-Access-Token': api_key,
                'Content-Type': 'application/json',
            },
        });

        if (!shopResponse.ok) {
            if (shopResponse.status === 401 || shopResponse.status === 403) {
                return NextResponse.json(
                    { error: 'Invalid Shopify Admin Access Token or insufficient permissions' },
                    { status: 401 }
                );
            }
            throw new Error(`Shopify API error: ${shopResponse.status}`);
        }

        const shopData = await shopResponse.json();

        const supabase = getSupabaseAdmin();

        // Encrypt API key before storing
        const encryptedApiKey = isEncryptionConfigured()
            ? encryptApiKey(api_key)
            : null;

        // Upsert integration with encrypted API key
        const { error: dbError } = await supabase
            .from('integrations')
            .upsert({
                organization_id,
                provider: 'shopify',
                api_key: encryptedApiKey ? null : api_key,
                api_key_encrypted: encryptedApiKey,
                enabled: true,
                config: {
                    shop_id: shopData.shop.id,
                    shop_name: shopData.shop.name,
                    shop_url: shopData.shop.domain,
                    shop_email: shopData.shop.email,
                    currency: shopData.shop.currency,
                    connected_at: new Date().toISOString(),
                },
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'organization_id,provider',
            });

        if (dbError) {
            console.error('Database error:', dbError);
            throw new Error('Failed to save integration details to database');
        }

        // Audit log the connection
        await logIntegrationConnect(
            auth.user.id,
            organization_id,
            'shopify',
            {
                shop_name: shopData.shop.name,
                shop_url: shopData.shop.domain,
            },
            request
        );

        const response = NextResponse.json({
            success: true,
            shop: {
                id: shopData.shop.id,
                name: shopData.shop.name,
                domain: shopData.shop.domain,
            },
        });

        return applyRateLimitHeaders(response, rateLimit.headers);
    } catch (err) {
        console.error('Shopify connect error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Connection failed' },
            { status: 500 }
        );
    }
}
