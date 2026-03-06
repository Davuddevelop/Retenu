// src/app/lib/dataStore.ts
// Centralized data management with localStorage persistence

import {
    Organization,
    FinancialSettings,
    Client,
    Contract,
    Invoice,
    TimeEntry,
    DataStore,
    EMPTY_FINANCIAL_SETTINGS,
} from './types';

// Storage keys
const STORAGE_KEYS = {
    STORE: 'revenueLeak_dataStore',
    DEMO_MODE: 'revenueLeak_demoMode',
} as const;

// ============================================
// DEMO DATA (Only loaded in demo mode)
// ============================================

const DEMO_ORGANIZATION: Organization = {
    id: 'demo-org-001',
    name: 'Demo Agency',
    created_at: '2026-01-01T00:00:00Z',
    demo_mode: true,
};

const DEMO_SETTINGS: FinancialSettings = {
    id: 'demo-settings-001',
    organization_id: 'demo-org-001',
    ...EMPTY_FINANCIAL_SETTINGS,
    updated_at: new Date().toISOString(),
};

const DEMO_CLIENTS: Client[] = [
    {
        id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        name: 'Alpha Corp',
        agreed_monthly_retainer: 5000,
        agreed_deliverables: '4 Blog Posts, 2 Newsletters',
        hour_limit: 40,
        custom_hourly_rate: null,
        custom_cost_rate: null,
        custom_margin_threshold: null,
        start_date: '2026-01-01',
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'demo-client-beta',
        organization_id: 'demo-org-001',
        name: 'Beta SaaS',
        agreed_monthly_retainer: 8000,
        agreed_deliverables: 'Paid Ads Management',
        hour_limit: 60,
        custom_hourly_rate: 180,
        custom_cost_rate: 80,
        custom_margin_threshold: null,
        start_date: '2026-02-01',
        status: 'active',
        created_at: '2026-02-01T00:00:00Z',
        updated_at: '2026-02-01T00:00:00Z',
    },
    {
        id: 'demo-client-gamma',
        organization_id: 'demo-org-001',
        name: 'Gamma Dev',
        agreed_monthly_retainer: 3000,
        agreed_deliverables: 'SEO Optimization',
        hour_limit: 20,
        custom_hourly_rate: 120,
        custom_cost_rate: 50,
        custom_margin_threshold: 30,
        start_date: '2026-02-15',
        status: 'active',
        created_at: '2026-02-15T00:00:00Z',
        updated_at: '2026-02-15T00:00:00Z',
    },
];

const DEMO_CONTRACTS: Contract[] = [
    {
        id: 'demo-contract-alpha',
        client_id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        internal_hourly_rate: 150,
        internal_cost_rate: 60,
        start_date: '2026-01-01',
        end_date: null,
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'demo-contract-beta',
        client_id: 'demo-client-beta',
        organization_id: 'demo-org-001',
        internal_hourly_rate: 180,
        internal_cost_rate: 80,
        start_date: '2026-02-01',
        end_date: null,
        status: 'active',
        created_at: '2026-02-01T00:00:00Z',
    },
    {
        id: 'demo-contract-gamma',
        client_id: 'demo-client-gamma',
        organization_id: 'demo-org-001',
        internal_hourly_rate: 120,
        internal_cost_rate: 50,
        start_date: '2026-02-15',
        end_date: null,
        status: 'active',
        created_at: '2026-02-15T00:00:00Z',
    },
];

const DEMO_INVOICES: Invoice[] = [
    {
        id: 'demo-invoice-alpha-1',
        client_id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        amount: 5000,
        status: 'paid',
        issue_date: '2026-03-01',
        due_date: '2026-03-15',
        paid_date: '2026-03-10',
        stripe_invoice_id: null,
        created_at: '2026-03-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-beta-1',
        client_id: 'demo-client-beta',
        organization_id: 'demo-org-001',
        amount: 8000,
        status: 'overdue',
        issue_date: '2026-01-15',
        due_date: '2026-02-15',
        paid_date: null,
        stripe_invoice_id: null,
        created_at: '2026-01-15T00:00:00Z',
    },
];

const DEMO_TIME_ENTRIES: TimeEntry[] = [
    {
        id: 'demo-time-alpha-1',
        client_id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        hours: 25,
        date: '2026-03-01',
        team_member: 'Alice',
        description: 'Content creation',
        billable: true,
        created_at: '2026-03-01T00:00:00Z',
    },
    {
        id: 'demo-time-alpha-2',
        client_id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        hours: 20,
        date: '2026-03-03',
        team_member: 'Alice',
        description: 'Newsletter design',
        billable: true,
        created_at: '2026-03-03T00:00:00Z',
    },
    {
        id: 'demo-time-beta-1',
        client_id: 'demo-client-beta',
        organization_id: 'demo-org-001',
        hours: 40,
        date: '2026-03-02',
        team_member: 'Bob',
        description: 'Ad campaign management',
        billable: true,
        created_at: '2026-03-02T00:00:00Z',
    },
    {
        id: 'demo-time-gamma-1',
        client_id: 'demo-client-gamma',
        organization_id: 'demo-org-001',
        hours: 15,
        date: '2026-03-01',
        team_member: 'Charlie',
        description: 'SEO audit',
        billable: true,
        created_at: '2026-03-01T00:00:00Z',
    },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function isClient(): boolean {
    return typeof window !== 'undefined';
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
    if (!isClient()) return defaultValue;
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error(`Error loading ${key} from localStorage:`, e);
    }
    return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
    if (!isClient()) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error saving ${key} to localStorage:`, e);
    }
}

// ============================================
// DATA STORE SINGLETON
// ============================================

class DataStoreManager {
    private static instance: DataStoreManager;
    private store: DataStore;
    private isDemoMode: boolean = false;
    private initialized: boolean = false;

    private constructor() {
        this.store = {
            organization: null,
            settings: null,
            clients: [],
            contracts: [],
            invoices: [],
            timeEntries: [],
            alerts: [],
        };
    }

    static getInstance(): DataStoreManager {
        if (!DataStoreManager.instance) {
            DataStoreManager.instance = new DataStoreManager();
        }
        return DataStoreManager.instance;
    }

    // Initialize from localStorage (call on app load)
    initialize(): void {
        if (this.initialized || !isClient()) return;

        this.isDemoMode = loadFromStorage(STORAGE_KEYS.DEMO_MODE, false);

        if (this.isDemoMode) {
            this.loadDemoData();
        } else {
            const savedStore = loadFromStorage<DataStore | null>(STORAGE_KEYS.STORE, null);
            if (savedStore) {
                this.store = savedStore;
            }
        }

        this.initialized = true;
    }

    private loadDemoData(): void {
        this.store = {
            organization: DEMO_ORGANIZATION,
            settings: DEMO_SETTINGS,
            clients: [...DEMO_CLIENTS],
            contracts: [...DEMO_CONTRACTS],
            invoices: [...DEMO_INVOICES],
            timeEntries: [...DEMO_TIME_ENTRIES],
            alerts: [],
        };
    }

    private persist(): void {
        if (this.isDemoMode) return;
        saveToStorage(STORAGE_KEYS.STORE, this.store);
    }

    // ============================================
    // DEMO MODE
    // ============================================

    enableDemoMode(): void {
        this.isDemoMode = true;
        saveToStorage(STORAGE_KEYS.DEMO_MODE, true);
        this.loadDemoData();
    }

    disableDemoMode(): void {
        this.isDemoMode = false;
        saveToStorage(STORAGE_KEYS.DEMO_MODE, false);

        // Load real data from storage or reset to empty
        const savedStore = loadFromStorage<DataStore | null>(STORAGE_KEYS.STORE, null);
        if (savedStore) {
            this.store = savedStore;
        } else {
            this.reset();
        }
    }

    isDemoModeEnabled(): boolean {
        if (!this.initialized && isClient()) {
            this.initialize();
        }
        return this.isDemoMode;
    }

    // ============================================
    // GETTERS
    // ============================================

    getOrganization(): Organization | null {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.organization;
    }

    getSettings(): FinancialSettings | null {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.settings;
    }

    getClients(): Client[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.clients;
    }

    getClientById(id: string): Client | undefined {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.clients.find(c => c.id === id);
    }

    getActiveClients(): Client[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.clients.filter(c => c.status === 'active');
    }

    getContracts(): Contract[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.contracts;
    }

    getContractByClientId(clientId: string): Contract | undefined {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.contracts.find(c => c.client_id === clientId && c.status === 'active');
    }

    getInvoices(): Invoice[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.invoices;
    }

    getInvoiceById(id: string): Invoice | undefined {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.invoices.find(i => i.id === id);
    }

    getInvoicesByClientId(clientId: string): Invoice[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.invoices.filter(i => i.client_id === clientId);
    }

    getTimeEntries(): TimeEntry[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.timeEntries;
    }

    getTimeEntryById(id: string): TimeEntry | undefined {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.timeEntries.find(t => t.id === id);
    }

    getTimeEntriesByClientId(clientId: string): TimeEntry[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.timeEntries.filter(t => t.client_id === clientId);
    }

    getTimeEntriesByDateRange(startDate: string, endDate: string): TimeEntry[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.timeEntries.filter(t => t.date >= startDate && t.date <= endDate);
    }

    getFullStore(): DataStore {
        if (!this.initialized && isClient()) this.initialize();
        return { ...this.store };
    }

    // ============================================
    // ORGANIZATION
    // ============================================

    setOrganization(org: Organization): void {
        this.store.organization = org;
        this.isDemoMode = org.demo_mode;
        this.persist();
    }

    createOrganization(name: string): Organization {
        const org: Organization = {
            id: generateId('org'),
            name,
            created_at: new Date().toISOString(),
            demo_mode: false,
        };
        this.store.organization = org;
        this.persist();
        return org;
    }

    // ============================================
    // SETTINGS
    // ============================================

    setSettings(settings: FinancialSettings): void {
        this.store.settings = settings;
        this.persist();
    }

    createSettings(orgId: string, overrides?: Partial<FinancialSettings>): FinancialSettings {
        const settings: FinancialSettings = {
            id: generateId('settings'),
            organization_id: orgId,
            ...EMPTY_FINANCIAL_SETTINGS,
            ...overrides,
            updated_at: new Date().toISOString(),
        };
        this.store.settings = settings;
        this.persist();
        return settings;
    }

    updateSettings(updates: Partial<FinancialSettings>): void {
        if (this.store.settings) {
            this.store.settings = {
                ...this.store.settings,
                ...updates,
                updated_at: new Date().toISOString(),
            };
            this.persist();
        }
    }

    // ============================================
    // CLIENTS
    // ============================================

    setClients(clients: Client[]): void {
        this.store.clients = clients;
        this.persist();
    }

    addClient(client: Client): void {
        // Ensure we're initialized
        if (!this.initialized && isClient()) this.initialize();

        this.store.clients.push(client);
        this.persist();
    }

    createClient(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Client {
        const now = new Date().toISOString();
        const client: Client = {
            ...data,
            id: generateId('client'),
            created_at: now,
            updated_at: now,
        };
        this.store.clients.push(client);
        this.persist();
        return client;
    }

    updateClient(clientId: string, updates: Partial<Client>): Client | null {
        const index = this.store.clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
            this.store.clients[index] = {
                ...this.store.clients[index],
                ...updates,
                updated_at: new Date().toISOString(),
            };
            this.persist();
            return this.store.clients[index];
        }
        return null;
    }

    deleteClient(clientId: string): boolean {
        const initialLength = this.store.clients.length;
        this.store.clients = this.store.clients.filter(c => c.id !== clientId);
        // Also remove related data
        this.store.contracts = this.store.contracts.filter(c => c.client_id !== clientId);
        this.store.invoices = this.store.invoices.filter(i => i.client_id !== clientId);
        this.store.timeEntries = this.store.timeEntries.filter(t => t.client_id !== clientId);
        this.persist();
        return this.store.clients.length < initialLength;
    }

    // ============================================
    // CONTRACTS
    // ============================================

    setContracts(contracts: Contract[]): void {
        this.store.contracts = contracts;
        this.persist();
    }

    addContract(contract: Contract): void {
        this.store.contracts.push(contract);
        this.persist();
    }

    createContract(data: Omit<Contract, 'id' | 'created_at'>): Contract {
        const contract: Contract = {
            ...data,
            id: generateId('contract'),
            created_at: new Date().toISOString(),
        };
        this.store.contracts.push(contract);
        this.persist();
        return contract;
    }

    updateContract(contractId: string, updates: Partial<Contract>): Contract | null {
        const index = this.store.contracts.findIndex(c => c.id === contractId);
        if (index !== -1) {
            this.store.contracts[index] = {
                ...this.store.contracts[index],
                ...updates,
            };
            this.persist();
            return this.store.contracts[index];
        }
        return null;
    }

    // ============================================
    // INVOICES
    // ============================================

    setInvoices(invoices: Invoice[]): void {
        this.store.invoices = invoices;
        this.persist();
    }

    addInvoice(invoice: Invoice): void {
        this.store.invoices.push(invoice);
        this.persist();
    }

    createInvoice(data: Omit<Invoice, 'id' | 'created_at'>): Invoice {
        const invoice: Invoice = {
            ...data,
            id: generateId('invoice'),
            created_at: new Date().toISOString(),
        };
        this.store.invoices.push(invoice);
        this.persist();
        return invoice;
    }

    updateInvoice(invoiceId: string, updates: Partial<Invoice>): Invoice | null {
        const index = this.store.invoices.findIndex(i => i.id === invoiceId);
        if (index !== -1) {
            this.store.invoices[index] = {
                ...this.store.invoices[index],
                ...updates,
            };
            this.persist();
            return this.store.invoices[index];
        }
        return null;
    }

    deleteInvoice(invoiceId: string): boolean {
        const initialLength = this.store.invoices.length;
        this.store.invoices = this.store.invoices.filter(i => i.id !== invoiceId);
        this.persist();
        return this.store.invoices.length < initialLength;
    }

    markInvoicePaid(invoiceId: string, paidDate?: string): Invoice | null {
        return this.updateInvoice(invoiceId, {
            status: 'paid',
            paid_date: paidDate || new Date().toISOString().split('T')[0],
        });
    }

    // ============================================
    // TIME ENTRIES
    // ============================================

    setTimeEntries(entries: TimeEntry[]): void {
        this.store.timeEntries = entries;
        this.persist();
    }

    addTimeEntry(entry: TimeEntry): void {
        this.store.timeEntries.push(entry);
        this.persist();
    }

    createTimeEntry(data: Omit<TimeEntry, 'id' | 'created_at'>): TimeEntry {
        const entry: TimeEntry = {
            ...data,
            id: generateId('time'),
            created_at: new Date().toISOString(),
        };
        this.store.timeEntries.push(entry);
        this.persist();
        return entry;
    }

    addTimeEntries(entries: Omit<TimeEntry, 'id' | 'created_at'>[]): TimeEntry[] {
        const now = new Date().toISOString();
        const newEntries = entries.map((data, index) => ({
            ...data,
            id: generateId(`time-${index}`),
            created_at: now,
        }));
        this.store.timeEntries.push(...newEntries);
        this.persist();
        return newEntries;
    }

    updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): TimeEntry | null {
        const index = this.store.timeEntries.findIndex(t => t.id === entryId);
        if (index !== -1) {
            this.store.timeEntries[index] = {
                ...this.store.timeEntries[index],
                ...updates,
            };
            this.persist();
            return this.store.timeEntries[index];
        }
        return null;
    }

    deleteTimeEntry(entryId: string): boolean {
        const initialLength = this.store.timeEntries.length;
        this.store.timeEntries = this.store.timeEntries.filter(t => t.id !== entryId);
        this.persist();
        return this.store.timeEntries.length < initialLength;
    }

    deleteTimeEntries(entryIds: string[]): number {
        const initialLength = this.store.timeEntries.length;
        this.store.timeEntries = this.store.timeEntries.filter(t => !entryIds.includes(t.id));
        this.persist();
        return initialLength - this.store.timeEntries.length;
    }

    // ============================================
    // HELPERS & UTILITIES
    // ============================================

    hasData(): boolean {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.clients.length > 0;
    }

    hasSettings(): boolean {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.settings !== null;
    }

    hasInvoices(): boolean {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.invoices.length > 0;
    }

    hasTimeEntries(): boolean {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.timeEntries.length > 0;
    }

    reset(): void {
        this.isDemoMode = false;
        this.store = {
            organization: null,
            settings: null,
            clients: [],
            contracts: [],
            invoices: [],
            timeEntries: [],
            alerts: [],
        };
        if (isClient()) {
            localStorage.removeItem(STORAGE_KEYS.STORE);
            localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
        }
    }

    // Get stats for a specific month
    getMonthlyStats(year: number, month: number): { hours: number; revenue: number; invoiceCount: number } {
        if (!this.initialized && isClient()) this.initialize();

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

        const monthEntries = this.store.timeEntries.filter(
            t => t.date >= startDate && t.date <= endDate
        );
        const monthInvoices = this.store.invoices.filter(
            i => i.issue_date >= startDate && i.issue_date <= endDate
        );

        return {
            hours: monthEntries.reduce((sum, t) => sum + t.hours, 0),
            revenue: monthInvoices.reduce((sum, i) => sum + i.amount, 0),
            invoiceCount: monthInvoices.length,
        };
    }
}

// Export singleton instance
export const dataStore = DataStoreManager.getInstance();

// Export for backwards compatibility during migration
export function getDataStore(): DataStoreManager {
    return DataStoreManager.getInstance();
}
