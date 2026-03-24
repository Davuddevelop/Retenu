---
name: testing
description: Write and run tests for the application. Use for unit tests, integration tests, E2E tests with Jest, React Testing Library, and Playwright. Invoke when user mentions "test", "testing", "coverage", "TDD", or "quality assurance".
---

# Testing Skill

## Test Structure

### Component Tests
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceForm } from './InvoiceForm';

describe('InvoiceForm', () => {
  it('renders all required fields', () => {
    render(<InvoiceForm />);

    expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/client is required/i)).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/amount/i), '1000');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        amount: 1000
      }));
    });
  });
});
```

### API Route Tests
```typescript
import { GET, POST } from './route';
import { createMockRequest } from '@/test/utils';

describe('API /api/invoices', () => {
  it('GET returns invoices for authenticated user', async () => {
    const request = createMockRequest({
      method: 'GET',
      auth: { userId: 'user-123' }
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.invoices).toBeInstanceOf(Array);
  });

  it('POST creates new invoice', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { clientId: 'client-1', amount: 500 },
      auth: { userId: 'user-123' }
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
  });

  it('returns 401 for unauthenticated requests', async () => {
    const request = createMockRequest({ method: 'GET' });
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
```

### Integration Tests
```typescript
import { createTestClient, seedTestData, cleanupTestData } from '@/test/setup';

describe('Invoice Creation Flow', () => {
  let testClient;

  beforeAll(async () => {
    testClient = await createTestClient();
    await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('creates invoice and updates client balance', async () => {
    const invoice = await testClient.createInvoice({
      clientId: 'test-client',
      amount: 1000
    });

    const client = await testClient.getClient('test-client');

    expect(invoice.status).toBe('pending');
    expect(client.outstandingBalance).toBe(1000);
  });
});
```

## Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- InvoiceForm.test.tsx

# Watch mode
npm test -- --watch
```

## Best Practices
- Test behavior, not implementation
- Use meaningful test descriptions
- Mock external dependencies
- Keep tests fast and isolated
- Aim for high coverage on critical paths
