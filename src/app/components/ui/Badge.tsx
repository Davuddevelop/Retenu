// src/app/components/ui/Badge.tsx
import { cn } from '@/app/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]',
    success: 'bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    destructive: 'bg-[var(--leak)]/10 text-[var(--leak)] border-[var(--leak)]/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
