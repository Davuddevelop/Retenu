// src/app/privacy/page.tsx
import Link from 'next/link';
import { Shield, Lock, Eye, Database, CheckCircle, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
                    <h1 className="text-3xl font-bold text-[var(--foreground)]">Privacy Policy</h1>
                    <p className="text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
            </header>

            {/* Trust Indicators */}
            <div className="bg-[var(--card)] border-b border-[var(--border)]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                            <Shield className="w-5 h-5 text-[var(--profit)]" />
                            <div>
                                <p className="text-xs text-gray-500">Security</p>
                                <p className="text-sm font-semibold text-[var(--foreground)]">Supabase Hosted</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                            <Lock className="w-5 h-5 text-[var(--profit)]" />
                            <div>
                                <p className="text-xs text-gray-500">Encryption</p>
                                <p className="text-sm font-semibold text-[var(--foreground)]">AES-256</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                            <Database className="w-5 h-5 text-[var(--profit)]" />
                            <div>
                                <p className="text-xs text-gray-500">Data</p>
                                <p className="text-sm font-semibold text-[var(--foreground)]">Never Sold</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                            <Eye className="w-5 h-5 text-[var(--profit)]" />
                            <div>
                                <p className="text-xs text-gray-500">Access</p>
                                <p className="text-sm font-semibold text-[var(--foreground)]">Read-Only</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-invert max-w-none">
                    {/* Introduction */}
                    <section className="mb-12">
                        <div className="bg-gradient-to-br from-[var(--profit)]/10 to-transparent p-6 rounded-2xl border border-[var(--profit)]/20 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--profit)]/20 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-6 h-6 text-[var(--profit)]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Your Security is Our Priority</h2>
                                    <p className="text-gray-400 leading-relaxed">
                                        At OBSIDIAN, we understand that you&apos;re trusting us with sensitive financial data and API credentials.
                                        We take this responsibility extremely seriously and have built enterprise-grade security into every aspect of our platform.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">What This Policy Covers</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            This Privacy Policy explains how OBSIDIAN collects, uses, stores, and protects your information when you use our service.
                            We are committed to transparency and your right to privacy.
                        </p>
                    </section>

                    {/* API Keys & Credentials */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-3">
                            <Lock className="w-6 h-6 text-[var(--neutral-metric)]" />
                            API Keys & Credentials Security
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[var(--profit)] mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Military-Grade Encryption</h3>
                                    <p className="text-gray-400">
                                        All API keys and credentials are encrypted at rest using AES-256 encryption and in transit using TLS 1.3.
                                        Your credentials are never stored in plain text.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[var(--profit)] mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Read-Only Access</h3>
                                    <p className="text-gray-400">
                                        We only request read-only API permissions. We <strong className="text-[var(--foreground)]">never</strong> modify,
                                        delete, or write data to your connected services. We can only read to detect Leaks.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[var(--profit)] mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Secure Storage</h3>
                                    <p className="text-gray-400">
                                        API credentials are stored in isolated, encrypted databases with strict access controls.
                                        Only authorized systems can decrypt them, and all access is logged and monitored.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[var(--profit)] mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] mb-1">You&apos;re In Control</h3>
                                    <p className="text-gray-400">
                                        You can revoke access at any time. Simply disconnect the integration in your settings,
                                        and we&apos;ll immediately delete all associated credentials from our systems.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[var(--profit)] mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Security Practices</h3>
                                    <p className="text-gray-400">
                                        Your data is stored securely via Supabase (which maintains SOC 2 compliance).
                                        We follow security best practices but have not completed independent security audits yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Collection */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">What Data We Collect</h2>

                        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Account Information</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-6 space-y-2">
                            <li>Email address and name</li>
                            <li>Company name and billing information</li>
                            <li>Password (encrypted with bcrypt)</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Financial Data</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-6 space-y-2">
                            <li>Invoice data from connected platforms (Stripe, QuickBooks, etc.)</li>
                            <li>Time tracking data from connected platforms (Toggl, Clockify, etc.)</li>
                            <li>Client information and retainer agreements</li>
                            <li>Revenue metrics and margin calculations</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Usage Data</h3>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>Feature usage and interaction patterns</li>
                            <li>Error logs and performance metrics</li>
                            <li>Browser type, device information, and IP address</li>
                        </ul>
                    </section>

                    {/* How We Use Data */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">How We Use Your Data</h2>
                        <p className="text-gray-400 mb-4">We use your data exclusively to:</p>
                        <ul className="list-disc list-inside text-gray-400 space-y-2 mb-6">
                            <li>Detect Leaks and billing errors</li>
                            <li>Generate alerts and insights</li>
                            <li>Calculate financial metrics and reports</li>
                            <li>Provide customer support</li>
                            <li>Improve our service and develop new features</li>
                        </ul>
                        <div className="bg-[var(--leak)]/10 border border-[var(--leak)]/20 rounded-xl p-4">
                            <p className="text-[var(--foreground)] font-semibold">
                                We NEVER sell, rent, or share your data with third parties for marketing purposes.
                            </p>
                        </div>
                    </section>

                    {/* Data Storage & Retention */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Data Storage & Retention</h2>
                        <p className="text-gray-400 mb-4">
                            Your data is stored on secure, encrypted servers in {'{'}US/EU{'}'} data centers. We retain your data:
                        </p>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>For active accounts: as long as your account is active</li>
                            <li>For closed accounts: 30 days after account closure (for recovery purposes)</li>
                            <li>API credentials: immediately deleted upon disconnection</li>
                            <li>Aggregated analytics: indefinitely (fully anonymized)</li>
                        </ul>
                    </section>

                    {/* Your Rights */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Your Rights</h2>
                        <p className="text-gray-400 mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li><strong className="text-[var(--foreground)]">Access:</strong> Request a copy of all data we have about you</li>
                            <li><strong className="text-[var(--foreground)]">Correct:</strong> Update or correct inaccurate information</li>
                            <li><strong className="text-[var(--foreground)]">Delete:</strong> Request deletion of your data (subject to legal obligations)</li>
                            <li><strong className="text-[var(--foreground)]">Export:</strong> Download your data in a portable format</li>
                            <li><strong className="text-[var(--foreground)]">Opt-out:</strong> Unsubscribe from marketing communications</li>
                        </ul>
                    </section>

                    {/* Data Practices */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Our Data Practices</h2>
                        <p className="text-gray-400 mb-4">What we commit to:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                                <h3 className="font-semibold text-[var(--foreground)] mb-2">Data Ownership</h3>
                                <p className="text-sm text-gray-400">Your data belongs to you. Export or delete anytime.</p>
                            </div>
                            <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                                <h3 className="font-semibold text-[var(--foreground)] mb-2">No Data Sales</h3>
                                <p className="text-sm text-gray-400">We never sell or share your data with third parties.</p>
                            </div>
                            <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                                <h3 className="font-semibold text-[var(--foreground)] mb-2">Secure Storage</h3>
                                <p className="text-sm text-gray-400">Data hosted on Supabase with encryption at rest.</p>
                            </div>
                            <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                                <h3 className="font-semibold text-[var(--foreground)] mb-2">Security First</h3>
                                <p className="text-sm text-gray-400">We follow industry best practices for data protection.</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Questions or Concerns?</h2>
                        <p className="text-gray-400 mb-4">
                            If you have any questions about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
                            <p className="text-gray-400 mb-2">
                                <strong className="text-[var(--foreground)]">Email:</strong> privacy@obsidian.com
                            </p>
                            <p className="text-gray-400 mb-2">
                                <strong className="text-[var(--foreground)]">Security:</strong> security@obsidian.com
                            </p>
                            <p className="text-gray-400">
                                <strong className="text-[var(--foreground)]">Response Time:</strong> We respond to all privacy inquiries within 48 hours
                            </p>
                        </div>
                    </section>

                    {/* Changes to Policy */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Changes to This Policy</h2>
                        <p className="text-gray-400">
                            We may update this Privacy Policy from time to time. We will notify you of any material changes by
                            email and by posting a notice in the app. Continued use of OBSIDIAN after changes constitutes
                            acceptance of the updated policy.
                        </p>
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
