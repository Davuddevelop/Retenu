// src/app/security/page.tsx
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Server, AlertTriangle, CheckCircle, Key, Database, FileCheck } from 'lucide-react';

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <header className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--foreground)] transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--profit)] to-emerald-400 flex items-center justify-center">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-[var(--foreground)]">Security at RevenueLeak</h1>
                            <p className="text-gray-400 mt-2">Enterprise-grade security protecting your financial data</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Trust Banner */}
            <div className="bg-gradient-to-r from-[var(--profit)]/10 to-transparent border-b border-[var(--border)]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-lg text-gray-300 max-w-3xl">
                        We understand that you&apos;re entrusting us with your most sensitive business data. Security isn&apos;t an afterthought—it&apos;s
                        built into every layer of our infrastructure. Here&apos;s exactly how we protect your information.
                    </p>
                </div>
            </div>

            {/* Certifications */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Security Certifications & Compliance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {[
                        { name: 'Data Ownership', desc: 'Your data, your control', icon: <Eye className="w-6 h-6" /> },
                        { name: 'Secure Hosting', desc: 'Supabase infrastructure', icon: <Lock className="w-6 h-6" /> },
                        { name: 'Encrypted Storage', desc: 'Data encrypted at rest', icon: <Key className="w-6 h-6" /> },
                        { name: 'Beta Product', desc: 'Security improving with each release', icon: <FileCheck className="w-6 h-6" /> },
                    ].map((cert) => (
                        <div key={cert.name} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <div className="w-12 h-12 rounded-xl bg-[var(--profit)]/20 flex items-center justify-center text-[var(--profit)] mb-4">
                                {cert.icon}
                            </div>
                            <h3 className="font-bold text-[var(--foreground)] mb-1">{cert.name}</h3>
                            <p className="text-sm text-gray-400">{cert.desc}</p>
                        </div>
                    ))}
                </div>

                {/* API Key Security */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[var(--leak)]/20 flex items-center justify-center">
                            <Key className="w-6 h-6 text-[var(--leak)]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">API Key & Credential Security</h2>
                            <p className="text-gray-400">How we protect your most sensitive data</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle className="w-5 h-5 text-[var(--profit)] mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] mb-2">AES-256 Encryption</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        All API keys are encrypted at rest using military-grade AES-256 encryption.
                                        Even our own engineers cannot view your credentials in plain text.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle className="w-5 h-5 text-[var(--profit)] mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] mb-2">Secure Key Management</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Encryption keys are stored in a separate Hardware Security Module (HSM)
                                        with strict access controls and regular rotation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle className="w-5 h-5 text-[var(--profit)] mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] mb-2">Read-Only Access</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        We only request read-only API scopes. We cannot and will not modify,
                                        delete, or write any data to your connected services.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle className="w-5 h-5 text-[var(--profit)] mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] mb-2">Immediate Revocation</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Disconnect any integration instantly. We immediately delete all
                                        associated credentials from our systems.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Infrastructure Security */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[var(--neutral-metric)]/20 flex items-center justify-center">
                            <Server className="w-6 h-6 text-[var(--neutral-metric)]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">Infrastructure Security</h2>
                            <p className="text-gray-400">Multiple layers of protection</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                title: 'TLS 1.3 Encryption',
                                description: 'All data in transit is encrypted using the latest TLS 1.3 protocol with perfect forward secrecy.',
                            },
                            {
                                title: 'DDoS Protection',
                                description: 'Enterprise-grade DDoS mitigation protects against attacks up to 100 Gbps.',
                            },
                            {
                                title: 'Web Application Firewall',
                                description: 'Advanced WAF blocks SQL injection, XSS, and other OWASP Top 10 vulnerabilities.',
                            },
                            {
                                title: 'Intrusion Detection',
                                description: 'Real-time monitoring and automated threat detection across all systems.',
                            },
                            {
                                title: 'Regular Penetration Testing',
                                description: 'Quarterly security audits by independent third-party firms to identify vulnerabilities.',
                            },
                            {
                                title: 'Isolated Database',
                                description: 'Databases run in isolated environments with no public internet access.',
                            },
                        ].map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                                <CheckCircle className="w-5 h-5 text-[var(--profit)] mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)] mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Access Control */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Eye className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">Access Control & Monitoring</h2>
                            <p className="text-gray-400">Who can access your data and how we track it</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <h3 className="font-semibold text-[var(--foreground)] mb-3">Role-Based Access</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Strict least-privilege access controls. Engineers can only access production data with approval and logging.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--profit)]"></div>
                                    Multi-factor authentication required
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--profit)]"></div>
                                    Time-limited access grants
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--profit)]"></div>
                                    Automatic session expiration
                                </li>
                            </ul>
                        </div>

                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <h3 className="font-semibold text-[var(--foreground)] mb-3">Audit Logging</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Every access to sensitive data is logged with who, what, when, and why. Logs are immutable and retained for 7 years.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--profit)]"></div>
                                    Real-time alerting
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--profit)]"></div>
                                    Tamper-proof logging
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--profit)]"></div>
                                    Automated anomaly detection
                                </li>
                            </ul>
                        </div>

                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <h3 className="font-semibold text-[var(--foreground)] mb-3">Background Checks</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                All employees with data access undergo comprehensive background checks and security training.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--profit)]"></div>
                                    Criminal history verification
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--profit)]"></div>
                                    Annual security training
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--profit)]"></div>
                                    NDA requirements
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Data Protection */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Database className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">Data Protection & Backup</h2>
                            <p className="text-gray-400">Ensuring your data is always safe and recoverable</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <h3 className="font-semibold text-[var(--foreground)] mb-3">Automated Backups</h3>
                            <p className="text-sm text-gray-400">
                                Full database backups every 6 hours, retained for 30 days. Point-in-time recovery available within 5 minutes.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <h3 className="font-semibold text-[var(--foreground)] mb-3">Geographic Redundancy</h3>
                            <p className="text-sm text-gray-400">
                                Data replicated across multiple availability zones and regions for 99.99% durability and disaster recovery.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Incident Response */}
                <section className="mb-16">
                    <div className="bg-gradient-to-br from-[var(--leak)]/10 to-transparent p-8 rounded-2xl border border-[var(--leak)]/20">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-8 h-8 text-[var(--leak)] flex-shrink-0" />
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">Security Incident Response</h2>
                                <p className="text-gray-400 mb-4">
                                    In the unlikely event of a security incident, we have a documented response plan:
                                </p>
                                <ul className="space-y-2 text-gray-400">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--leak)]"></div>
                                        Immediate containment and investigation
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--leak)]"></div>
                                        Notification within 72 hours of discovery
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--leak)]"></div>
                                        Transparent communication and remediation
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--leak)]"></div>
                                        Post-incident review and improvements
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Report Security Issues */}
                <section>
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Report a Security Issue</h2>
                        <p className="text-gray-400 mb-6">
                            We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Security Email</p>
                                <a href="mailto:security@revenueleak.com" className="text-[var(--neutral-metric)] hover:underline">
                                    security@revenueleak.com
                                </a>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Response Time</p>
                                <p className="text-gray-400">Within 24 hours</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-6">
                            We offer a bug bounty program for responsible disclosure. Visit our security page for details.
                        </p>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="border-t border-[var(--border)] bg-[var(--card)] py-8 mt-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} RevenueLeak. All rights reserved.
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
