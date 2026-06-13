import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
};

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}: ButtonProps) {
    const variants = {
        primary:
            'bg-surface-inverse text-text-inverse hover:bg-surface-inverse-hover disabled:opacity-50',
        secondary:
            'bg-surface border border-border text-text-primary hover:bg-surface-secondary disabled:opacity-50',
        destructive:
            'bg-surface border border-border text-error hover:bg-error-light disabled:opacity-50',
        ghost:
            'bg-transparent text-text-secondary hover:bg-surface-secondary disabled:opacity-50',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-sm',
    };

    return (
        <button
            className={cn(
                'rounded-md font-medium transition-colors inline-flex items-center justify-center gap-2',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
