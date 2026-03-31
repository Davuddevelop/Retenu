// src/app/demo/page.tsx
// Demo page - middleware handles cookie setting and redirect
// This page should never be reached (middleware redirects first)
// But we keep it as a fallback

import { redirect } from 'next/navigation';

export default function DemoPage() {
    // Middleware should have already set guest_mode cookie and redirected
    // This is just a fallback in case middleware didn't handle it
    redirect('/app');
}
