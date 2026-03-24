---
name: backend
description: Backend API development for Next.js applications. Use for API routes, server actions, database queries, authentication, webhooks, and server-side logic. Covers Supabase, Stripe integration, and API best practices. Invoke when user mentions "API", "endpoint", "server", "webhook", or backend work.
---

# Backend Development Skill

## Purpose
Build robust, secure, and performant backend services.

## Technical Stack
- **API**: Next.js API Routes and Server Actions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Validation**: Zod schemas

## Implementation Guidelines

### API Route Structure
```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Implementation
    log('info', 'Request processed', { duration: Date.now() - startTime });
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    log('error', 'Request failed', { error, duration: Date.now() - startTime });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Server Actions
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createItem(formData: FormData) {
  const validated = schema.parse(Object.fromEntries(formData));
  // Database operation
  revalidatePath('/items');
}
```

### Structured Logging
```typescript
interface LogContext {
  eventId?: string;
  eventType?: string;
  duration?: number;
  error?: unknown;
  [key: string]: unknown;
}

function log(level: 'info' | 'warn' | 'error', message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, service: 'api', ...context };
  console[level](JSON.stringify(logEntry));
}
```

### Webhook Handling
```typescript
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Verify signature before processing
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  // Process event with proper error handling
}
```

## Security Guidelines
- Always validate input with Zod
- Never expose internal error details
- Use proper authentication checks
- Implement rate limiting for public endpoints
- Log security-relevant events
