---
name: performance
description: Optimize application performance. Use for improving load times, reducing bundle size, optimizing images, implementing caching, and fixing performance bottlenecks. Invoke when user mentions "slow", "performance", "optimize", "speed", "bundle size", or "caching".
---

# Performance Optimization Skill

## Next.js Optimizations

### Image Optimization
```typescript
import Image from 'next/image';

// Always use next/image for automatic optimization
<Image
  src="/hero.png"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// For responsive images
<Image
  src="/feature.png"
  alt="Feature"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>
```

### Code Splitting
```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // For client-only components
});

// Route-based splitting is automatic in App Router
```

### Server Components
```typescript
// Default to Server Components (no 'use client')
// Only add 'use client' when needed for:
// - Event handlers (onClick, onChange)
// - Browser APIs (localStorage, window)
// - State (useState, useReducer)
// - Effects (useEffect)

// Server Component - no client JS shipped
async function InvoiceList() {
  const invoices = await db.getInvoices(); // Direct DB access
  return <ul>{invoices.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
}
```

### Caching Strategies
```typescript
// Page-level revalidation
export const revalidate = 3600; // Revalidate every hour

// On-demand revalidation
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateInvoice(id: string) {
  await db.update(id);
  revalidatePath('/invoices');
  revalidateTag('invoices');
}

// Fetch caching
const data = await fetch(url, {
  next: {
    revalidate: 3600,
    tags: ['invoices']
  }
});
```

## Client-Side Optimizations

### React Performance
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return calculateComplexValue(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Avoid unnecessary re-renders
const MemoizedComponent = React.memo(ExpensiveComponent);
```

### Virtual Lists
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              height: virtualItem.size,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Bundle Analysis
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer

# Check for duplicate dependencies
npx depcheck
```

## Monitoring
```typescript
// Web Vitals tracking
import { onCLS, onFID, onLCP } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onLCP(console.log);
```

## Performance Checklist
- [ ] Use next/image for all images
- [ ] Implement proper caching headers
- [ ] Minimize client-side JavaScript
- [ ] Use Server Components where possible
- [ ] Lazy load below-the-fold content
- [ ] Optimize fonts with next/font
- [ ] Enable gzip/brotli compression
- [ ] Use CDN for static assets
