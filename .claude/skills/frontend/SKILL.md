---
name: frontend
description: Frontend development for React/Next.js applications. Use for UI components, styling, responsive design, animations, accessibility, and client-side features. Covers Tailwind CSS, Framer Motion, shadcn/ui, and modern frontend patterns. Invoke when user says "build UI", "create component", "style this", "make responsive", or mentions frontend work.
---

# Frontend Development Skill

## Purpose
Create bold, intentional, and premium frontend interfaces that avoid generic "AI-made" aesthetics.

## Design Principles
1. **Atmospheric depth** - Use subtle gradients, noise textures, and layered shadows
2. **Typography hierarchy** - Massive headlines (6xl-8xl), controlled letter-spacing, deliberate line heights
3. **Restraint** - Fewer elements with more impact. White space is premium.
4. **Motion with purpose** - Framer Motion for meaningful transitions, not decoration
5. **Color intention** - Limited palette with strategic accent colors

## Technical Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: shadcn/ui as base, heavily customized
- **Animation**: Framer Motion for complex interactions
- **Icons**: Lucide React

## Implementation Guidelines

### Component Structure
```tsx
// Use semantic, typed components
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}
```

### Styling Patterns
```tsx
// Glassmorphism
className="bg-white/5 backdrop-blur-md border border-white/10"

// Gradient borders
<div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/20 to-white/5">
  <div className="bg-[#1A1A1A] rounded-2xl p-8">
    {/* content */}
  </div>
</div>

// Atmospheric shadows
style={{ boxShadow: '0 0 60px rgba(255, 87, 51, 0.15)' }}
```

### Animation Patterns
```tsx
// Entrance animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
>

// Scroll-based parallax
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
```

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Max container width: 1400px for premium feel
- Touch targets: minimum 44x44px

## Anti-Patterns to Avoid
- Generic gradients without purpose
- Excessive animations
- Cluttered layouts with too many elements
- Stock-looking card grids
- Default border-radius on everything
- Generic blue/purple color schemes

## Retenu Brand Guidelines
- Primary accent: Orange gradient `from-[#FF5733] to-[#FF8C00]`
- Background: Deep charcoal `#0D0D0D` to `#1A1A1A`
- Glass effects: `bg-white/5 backdrop-blur-md`
- Typography: Inter or system font stack
