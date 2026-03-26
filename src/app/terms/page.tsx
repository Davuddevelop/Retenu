// src/app/terms/page.tsx
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, AlertCircle } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <header className="border-b border-[var(--border)] bg-[var(--card)]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--foreground)] transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>
                    <h1 className="text-3xl font-bold text-[var(--foreground)]">Terms of Service</h1>
                    <p className="text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-invert max-w-none">
                    {/* Introduction */}
                    <section className="mb-12">
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-8">
                            <div className="flex items-start gap-4">
                                <FileText className="w-6 h-6 text-[var(--neutral-metric)] flex-shrink-0 mt-1" />
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Agreement to Terms</h2>
                                    <p className="text-gray-400 leading-relaxed">
                                        By accessing or using OBSIDIAN, you agree to be bound by these Terms of Service.
                                        If you do not agree to these terms, please do not use our service.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Service Description */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">1. Service Description</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            OBSIDIAN provides automated revenue leak detection and financial analytics for agencies and service businesses.
                            Our service analyzes your billing, time tracking, and invoicing data to identify:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>Underbilling and pricing discrepancies</li>
                            <li>Scope creep and hour overruns</li>
                            <li>Missing or late invoices</li>
                            <li>Low or negative margins</li>
                        </ul>
                    </section>

                    {/* Account Requirements */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">2. Account Requirements</h2>
                        <p className="text-gray-400 mb-4">To use OBSIDIAN, you must:</p>
                        <ul className="list-disc list-inside text-gray-400 space-y-2 mb-4">
                            <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                            <li>Provide accurate, current, and complete information during registration</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Be responsible for all activities under your account</li>
                        </ul>
                    </section>

                    {/* API Usage & Integrations */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-3">
                            <Shield className="w-6 h-6 text-[var(--profit)]" />
                            3. API Usage & Integrations
                        </h2>

                        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Your Responsibilities</h3>
                        <ul className="list-disc list-inside text-gray-400 space-y-2 mb-6">
                            <li>You grant us permission to access your connected services (Stripe, QuickBooks, Toggl, etc.) on your behalf</li>
                            <li>You represent that you have the right to grant us access to these services</li>
                            <li>You are responsible for maintaining valid API credentials and permissions</li>
                            <li>You agree to comply with the terms of service of all connected platforms</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Our Commitments</h3>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>We only request read-only access to your data</li>
                            <li>We never modify, delete, or write data to your connected services without explicit permission</li>
                            <li>We encrypt and secure all API credentials using industry-standard practices</li>
                            <li>You can revoke our access at any time through your account settings</li>
                        </ul>
                    </section>

                    {/* Payment Terms */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">4. Payment Terms</h2>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>Subscription fees are billed monthly or annually in advance</li>
                            <li>All fees are non-refundable except as required by law</li>
                            <li>We reserve the right to change pricing with 30 days notice</li>
                            <li>Existing subscribers will be grandfathered at their current rate</li>
                            <li>Failed payments may result in service suspension</li>
                        </ul>
                    </section>

                    {/* Acceptable Use */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">5. Acceptable Use</h2>
                        <p className="text-gray-400 mb-4">You agree NOT to:</p>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>Use the service for any illegal purpose</li>
                            <li>Attempt to reverse engineer, decompile, or hack our service</li>
                            <li>Upload viruses, malware, or malicious code</li>
                            <li>Share your account credentials with others</li>
                            <li>Scrape, crawl, or automatically collect data from our service</li>
                            <li>Interfere with or disrupt our servers or networks</li>
                            <li>Impersonate others or misrepresent your affiliation</li>
                        </ul>
                    </section>

                    {/* Data Ownership */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">6. Data Ownership & License</h2>
                        <p className="text-gray-400 mb-4">
                            <strong className="text-[var(--foreground)]">Your Data:</strong> You retain all rights to your financial data,
                            client information, and business data. We never claim ownership of your data.
                        </p>
                        <p className="text-gray-400 mb-4">
                            <strong className="text-[var(--foreground)]">License to Us:</strong> You grant us a limited license to process,
                            analyze, and display your data solely for the purpose of providing our service to you.
                        </p>
                        <p className="text-gray-400">
                            <strong className="text-[var(--foreground)]">Anonymized Analytics:</strong> We may use anonymized, aggregated data
                            for analytics and service improvement. This data cannot be traced back to you.
                        </p>
                    </section>

                    {/* Service Availability */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">7. Service Availability</h2>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-amber-400 font-semibold mb-1">Service Level Agreement</p>
                                    <p className="text-gray-400 text-sm">
                                        We strive for 99.9% uptime but cannot guarantee uninterrupted service. We are not liable for:
                                    </p>
                                </div>
                            </div>
                        </div>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>Service interruptions due to maintenance (scheduled with notice)</li>
                            <li>Third-party service outages (Stripe, QuickBooks, etc.)</li>
                            <li>Internet connectivity issues</li>
                            <li>Force majeure events beyond our control</li>
                        </ul>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">8. Limitation of Liability</h2>
                        <p className="text-gray-400 mb-4">
                            OBSIDIAN is provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by law:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>We are not liable for any indirect, incidental, or consequential damages</li>
                            <li>Our total liability shall not exceed the amount you paid us in the past 12 months</li>
                            <li>We are not responsible for business decisions made based on our analytics</li>
                            <li>We do not guarantee specific revenue recovery amounts</li>
                        </ul>
                    </section>

                    {/* Termination */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">9. Termination</h2>
                        <p className="text-gray-400 mb-4">
                            <strong className="text-[var(--foreground)]">By You:</strong> You may cancel your subscription at any time.
                            Your data will be retained for 30 days after cancellation for recovery purposes.
                        </p>
                        <p className="text-gray-400">
                            <strong className="text-[var(--foreground)]">By Us:</strong> We may suspend or terminate your account if you
                            violate these terms, fail to pay fees, or engage in fraudulent activity.
                        </p>
                    </section>

                    {/* Changes to Terms */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">10. Changes to Terms</h2>
                        <p className="text-gray-400">
                            We may modify these Terms of Service at any time. Material changes will be communicated via email
                            and in-app notifications. Continued use after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">11. Governing Law</h2>
                        <p className="text-gray-400">
                            These terms are governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved
                            through binding arbitration in accordance with the rules of the American Arbitration Association.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">12. Contact Information</h2>
                        <p className="text-gray-400 mb-4">
                            For questions about these Terms of Service, please contact:
                        </p>
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
                            <p className="text-gray-400 mb-2">
                                <strong className="text-[var(--foreground)]">Email:</strong> legal@obsidian.com
                            </p>
                            <p className="text-gray-400">
                                <strong className="text-[var(--foreground)]">Support:</strong> support@obsidian.com
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-[var(--border)] bg-[var(--card)] py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} OBSIDIAN. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/terms" className="text-sm text-gray-400 hover:text-[var(--foreground)] transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="/privacy" className="text-sm text-gray-400 hover:text-[var(--foreground)] transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/security" className="text-sm text-gray-400 hover:text-[var(--foreground)] transition-colors">
                                Security
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
