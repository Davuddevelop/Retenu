---
name: database
description: Database operations and schema design with Supabase/PostgreSQL. Use for migrations, queries, data modeling, RLS policies, and database optimization. Invoke when user mentions "database", "query", "schema", "migration", "table", or "Supabase".
---

# Database Skill

## Supabase Client Setup
```typescript
import { createClient } from '@supabase/supabase-js';

// Server-side
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Client-side (with RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## Query Patterns

### Basic Queries
```typescript
// Select with relations
const { data, error } = await supabase
  .from('invoices')
  .select('*, client:clients(*), line_items(*)')
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false });

// Insert
const { data, error } = await supabase
  .from('invoices')
  .insert({ client_id, amount, status: 'pending' })
  .select()
  .single();

// Update
const { error } = await supabase
  .from('invoices')
  .update({ status: 'paid' })
  .eq('id', invoiceId);

// Upsert
const { error } = await supabase
  .from('settings')
  .upsert({ org_id, key, value }, { onConflict: 'org_id,key' });
```

### Row Level Security
```sql
-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users can only view their organization's data
CREATE POLICY "org_isolation" ON invoices
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
);

-- Service role bypasses RLS for webhooks
CREATE POLICY "service_role_access" ON invoices
FOR ALL USING (auth.role() = 'service_role');
```

### Migrations
```sql
-- Create table with proper types
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for common queries
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
```

## Best Practices
- Always use typed queries with generated types
- Handle errors explicitly
- Use transactions for multi-step operations
- Index frequently queried columns
- Use RLS for multi-tenant isolation
