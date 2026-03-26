// src/app/app/time-entries/upload/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
// Router available for future navigation needs
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react';
import { dataStore } from '../../../lib/dataStore';
import { Client } from '../../../lib/types';

interface ParsedRow {
    date: string;
    client: string;
    team_member: string;
    hours: number;
    billable: boolean;
    description?: string;
    status: 'valid' | 'error' | 'warning';
    error?: string;
    matchedClientId?: string;
}

export default function UploadTimeEntriesPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

    useEffect(() => {
        setClients(dataStore.getClients());
    }, []);

    const parseCSV = (text: string): ParsedRow[] => {
        const lines = text.trim().split('\n');
        if (lines.length < 2) return [];

        // Parse header
        const header = lines[0].toLowerCase().split(',').map(h => h.trim());
        const dateIndex = header.findIndex(h => h === 'date');
        const clientIndex = header.findIndex(h => h === 'client' || h === 'client_name');
        const teamMemberIndex = header.findIndex(h => h === 'team_member' || h === 'member' || h === 'name' || h === 'employee');
        const hoursIndex = header.findIndex(h => h === 'hours' || h === 'duration' || h === 'time');
        const billableIndex = header.findIndex(h => h === 'billable');
        const descriptionIndex = header.findIndex(h => h === 'description' || h === 'notes' || h === 'task');

        const rows: ParsedRow[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Parse CSV line (handles quoted values)
            const values = parseCSVLine(line);

            const date = dateIndex >= 0 ? values[dateIndex]?.trim() : '';
            const client = clientIndex >= 0 ? values[clientIndex]?.trim() : '';
            const team_member = teamMemberIndex >= 0 ? values[teamMemberIndex]?.trim() : 'Unknown';
            const hoursStr = hoursIndex >= 0 ? values[hoursIndex]?.trim() : '';
            const hours = parseFloat(hoursStr) || 0;
            const billableStr = billableIndex >= 0 ? values[billableIndex]?.trim().toLowerCase() : 'true';
            const billable = billableStr !== 'false' && billableStr !== 'no' && billableStr !== '0';
            const description = descriptionIndex >= 0 ? values[descriptionIndex]?.trim() : '';

            // Validate row
            let status: 'valid' | 'error' | 'warning' = 'valid';
            let error: string | undefined;
            let matchedClientId: string | undefined;

            // Check date format
            const dateMatch = date.match(/^\d{4}-\d{2}-\d{2}$/) || date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
            if (!dateMatch) {
                status = 'error';
                error = 'Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY';
            }

            // Check hours
            if (!error && (isNaN(hours) || hours <= 0)) {
                status = 'error';
                error = 'Invalid hours value';
            }

            // Match client
            if (!error && client) {
                const matchedClient = clients.find(c =>
                    c.name.toLowerCase() === client.toLowerCase() ||
                    c.name.toLowerCase().includes(client.toLowerCase()) ||
                    client.toLowerCase().includes(c.name.toLowerCase())
                );
                if (matchedClient) {
                    matchedClientId = matchedClient.id;
                } else {
                    status = 'warning';
                    error = `Client "${client}" not found. Entry will be skipped.`;
                }
            } else if (!error && !client) {
                status = 'error';
                error = 'Client name is required';
            }

            // Normalize date to YYYY-MM-DD
            let normalizedDate = date;
            if (date.includes('/')) {
                const parts = date.split('/');
                if (parts.length === 3) {
                    normalizedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                }
            }

            rows.push({
                date: normalizedDate,
                client,
                team_member,
                hours,
                billable,
                description,
                status,
                error,
                matchedClientId,
            });
        }

        return rows;
    };

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);

        return result;
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsProcessing(true);
        setImportResult(null);

        try {
            const text = await selectedFile.text();
            const rows = parseCSV(text);
            setParsedRows(rows);
        } catch (err) {
            console.error('Error parsing CSV:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = async () => {
        setIsImporting(true);

        const org = dataStore.getOrganization();
        const organizationId = org?.id || 'default-org';

        const validRows = parsedRows.filter(r => r.status === 'valid' && r.matchedClientId);

        const entries = validRows.map(row => ({
            client_id: row.matchedClientId!,
            organization_id: organizationId,
            hours: row.hours,
            date: row.date,
            team_member: row.team_member,
            description: row.description || '',
            billable: row.billable,
        }));

        dataStore.addTimeEntries(entries);

        setImportResult({
            success: validRows.length,
            failed: parsedRows.length - validRows.length,
        });

        setIsImporting(false);
    };

    const validCount = parsedRows.filter(r => r.status === 'valid').length;
    const warningCount = parsedRows.filter(r => r.status === 'warning').length;
    const errorCount = parsedRows.filter(r => r.status === 'error').length;

    const downloadTemplate = () => {
        const template = 'date,client,team_member,hours,billable,description\n2026-03-01,Alpha Corp,John Doe,4.5,true,Website development\n2026-03-02,Beta SaaS,Jane Smith,2,false,Internal meeting';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'time_entries_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Back Link */}
            <Link
                href="/app/time-entries"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-[var(--foreground)] transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Time Entries
            </Link>

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--neutral-metric)]/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[var(--neutral-metric)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Import Time Entries</h1>
                    <p className="text-gray-400">Upload a CSV file to bulk import time entries.</p>
                </div>
            </div>

            {/* Import Success Message */}
            {importResult && (
                <div className="bg-[var(--profit)]/10 border border-[var(--profit)]/20 rounded-xl p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 text-[var(--profit)] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Import Complete</h3>
                    <p className="text-gray-400 mb-4">
                        Successfully imported {importResult.success} time entries.
                        {importResult.failed > 0 && ` ${importResult.failed} entries were skipped.`}
                    </p>
                    <Link
                        href="/app/time-entries"
                        className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--card)] font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                    >
                        View Time Entries
                    </Link>
                </div>
            )}

            {/* Upload Area */}
            {!importResult && (
                <>
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">Upload CSV File</h2>
                            <button
                                onClick={downloadTemplate}
                                className="text-sm text-[var(--neutral-metric)] hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-1"
                            >
                                <Download className="w-4 h-4" />
                                Download Template
                            </button>
                        </div>

                        <div className="p-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center cursor-pointer hover:border-[var(--neutral-metric)] hover:bg-[var(--background)]/50 transition-all"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-[var(--foreground)] font-medium mb-2">
                                    {file ? file.name : 'Drop your CSV file here, or click to browse'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Required columns: date, client, hours. Optional: team_member, billable, description
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CSV Format Guide */}
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
                        <h3 className="text-sm font-medium text-gray-400 mb-4">CSV Format Guide</h3>
                        <div className="bg-[var(--background)] rounded-lg p-4 font-mono text-sm overflow-x-auto">
                            <div className="text-gray-500">date,client,team_member,hours,billable,description</div>
                            <div className="text-[var(--foreground)]">2026-03-01,Alpha Corp,John Doe,4.5,true,Website development</div>
                            <div className="text-[var(--foreground)]">2026-03-02,Beta SaaS,Jane Smith,2,false,Internal meeting</div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="font-medium text-[var(--foreground)]">date</p>
                                <p className="text-gray-500">YYYY-MM-DD or MM/DD/YYYY</p>
                            </div>
                            <div>
                                <p className="font-medium text-[var(--foreground)]">client</p>
                                <p className="text-gray-500">Must match existing client name</p>
                            </div>
                            <div>
                                <p className="font-medium text-[var(--foreground)]">hours</p>
                                <p className="text-gray-500">Decimal number (e.g., 4.5)</p>
                            </div>
                            <div>
                                <p className="font-medium text-[var(--foreground)]">team_member</p>
                                <p className="text-gray-500">Optional, defaults to &quot;Unknown&quot;</p>
                            </div>
                            <div>
                                <p className="font-medium text-[var(--foreground)]">billable</p>
                                <p className="text-gray-500">true/false, defaults to true</p>
                            </div>
                            <div>
                                <p className="font-medium text-[var(--foreground)]">description</p>
                                <p className="text-gray-500">Optional task description</p>
                            </div>
                        </div>
                    </div>

                    {/* Preview Results */}
                    {parsedRows.length > 0 && (
                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-[var(--foreground)]">Preview</h2>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-[var(--profit)] flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" />
                                        {validCount} valid
                                    </span>
                                    {warningCount > 0 && (
                                        <span className="text-yellow-500 flex items-center gap-1">
                                            <AlertTriangle className="w-4 h-4" />
                                            {warningCount} warnings
                                        </span>
                                    )}
                                    {errorCount > 0 && (
                                        <span className="text-[var(--leak)] flex items-center gap-1">
                                            <XCircle className="w-4 h-4" />
                                            {errorCount} errors
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[var(--background)]/50 border-b border-[var(--border)] text-gray-400 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 font-medium w-10">Status</th>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Client</th>
                                            <th className="px-4 py-3 font-medium">Team Member</th>
                                            <th className="px-4 py-3 font-medium">Hours</th>
                                            <th className="px-4 py-3 font-medium">Billable</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {parsedRows.slice(0, 50).map((row, index) => (
                                            <tr
                                                key={index}
                                                className={`${
                                                    row.status === 'error' ? 'bg-[var(--leak)]/5' :
                                                    row.status === 'warning' ? 'bg-yellow-500/5' : ''
                                                }`}
                                            >
                                                <td className="px-4 py-3">
                                                    {row.status === 'valid' && <CheckCircle2 className="w-4 h-4 text-[var(--profit)]" />}
                                                    {row.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                                    {row.status === 'error' && <XCircle className="w-4 h-4 text-[var(--leak)]" />}
                                                </td>
                                                <td className="px-4 py-3 text-[var(--foreground)]">{row.date}</td>
                                                <td className="px-4 py-3">
                                                    <span className={row.matchedClientId ? 'text-[var(--foreground)]' : 'text-gray-500'}>
                                                        {row.client}
                                                    </span>
                                                    {row.error && (
                                                        <p className="text-xs text-[var(--leak)] mt-0.5">{row.error}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-gray-400">{row.team_member}</td>
                                                <td className="px-4 py-3 text-[var(--foreground)]">{row.hours}h</td>
                                                <td className="px-4 py-3">
                                                    {row.billable ? (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--profit)]/10 text-[var(--profit)]">Yes</span>
                                                    ) : (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-gray-500/10 text-gray-500">No</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {parsedRows.length > 50 && (
                                    <div className="px-4 py-3 text-center text-sm text-gray-500 bg-[var(--background)]/50">
                                        Showing first 50 of {parsedRows.length} entries
                                    </div>
                                )}
                            </div>

                            {/* Import Button */}
                            <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--background)]/50">
                                <p className="text-sm text-gray-400">
                                    {validCount} entries will be imported. {errorCount + warningCount > 0 && `${errorCount + warningCount} will be skipped.`}
                                </p>
                                <button
                                    onClick={handleImport}
                                    disabled={isImporting || validCount === 0}
                                    className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--card)] font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    {isImporting ? 'Importing...' : `Import ${validCount} Entries`}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
