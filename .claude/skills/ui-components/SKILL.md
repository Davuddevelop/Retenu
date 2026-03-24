---
name: ui-components
description: Create reusable UI components with shadcn/ui patterns. Use for building design system components, form elements, modals, dialogs, and interactive widgets. Invoke when user says "create component", "build widget", "design system", or mentions specific UI elements.
---

# UI Components Skill

## Component Architecture

### Variant System with CVA
```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-[#FF5733] to-[#FF8C00] text-white hover:brightness-110 shadow-lg shadow-[#FF5733]/20',
        secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
        ghost: 'hover:bg-white/5 text-gray-400 hover:text-white',
        destructive: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  isLoading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      {children}
    </button>
  );
}
```

### Composition Pattern
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

function Card({ children, className, gradient }: CardProps) {
  if (gradient) {
    return (
      <div className={cn('p-[1px] rounded-2xl bg-gradient-to-b from-white/20 to-white/5', className)}>
        <div className="bg-[#1A1A1A] rounded-2xl h-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-[#1A1A1A] border border-white/10 rounded-2xl', className)}>
      {children}
    </div>
  );
}

Card.Header = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('p-6 pb-0', className)}>{children}</div>
);

Card.Content = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('p-6', className)}>{children}</div>
);

Card.Footer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('p-6 pt-0 flex items-center gap-4', className)}>{children}</div>
);

export { Card };
```

### Form Components
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg',
            'text-white placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-[#FF5733]/50 focus:border-[#FF5733]',
            'transition-colors',
            icon && 'pl-10',
            error && 'border-red-500 focus:ring-red-500/50',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
```

### Dialog/Modal
```typescript
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

## Best Practices
- Always use TypeScript with proper interfaces
- Implement forwardRef for form elements
- Support className override via cn() utility
- Include loading and disabled states
- Use semantic HTML elements
- Ensure keyboard accessibility
