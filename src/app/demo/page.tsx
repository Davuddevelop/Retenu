// src/app/demo/page.tsx
import { redirect } from 'next/navigation';

// Demo page simply redirects to the app
// The app automatically loads demo data when not authenticated
export default function DemoPage() {
    redirect('/app');
}
