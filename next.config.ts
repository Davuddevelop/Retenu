import type { NextConfig } from "next";

// Security headers for production
// Based on OWASP recommendations and modern best practices
const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
        key: 'X-Frame-Options',
        value: 'DENY', // More restrictive than SAMEORIGIN - prevents clickjacking
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin', // More restrictive
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    },
    {
        key: 'Content-Security-Policy',
        value: [
            "default-src 'self'",
            // Scripts: Removed unsafe-eval, keep unsafe-inline for Next.js hydration
            "script-src 'self' 'unsafe-inline' https://js.stripe.com",
            // Styles: unsafe-inline required for Tailwind/CSS-in-JS
            "style-src 'self' 'unsafe-inline'",
            // Images
            "img-src 'self' blob: data: https:",
            // Fonts
            "font-src 'self' data:",
            // Frames (for Stripe checkout)
            "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
            // API connections
            "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.clockify.me https://api.track.toggl.com wss://*.supabase.co",
            // Prevent embedding in frames
            "frame-ancestors 'none'",
            // Form submissions
            "form-action 'self'",
            // Base URI
            "base-uri 'self'",
            // Upgrade HTTP to HTTPS
            "upgrade-insecure-requests",
        ].join('; '),
    },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
