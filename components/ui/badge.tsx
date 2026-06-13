import { cn } from '@/lib/utils';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    variant?:
        | 'neutral'
        | 'success'
        | 'warning'
        | 'error'
        | 'info'
        | 'primary';
};

export function Badge({
    variant = 'neutral',
    className,
    children,
    ...props
}: BadgeProps) {
    const variants = {
        neutral: 'bg-surface-secondary text-text-secondary border border-border',
        success: 'bg-success-light text-success-foreground',
        warning: 'bg-warning-light text-warning-foreground',
        error: 'bg-error-light text-error-foreground',
        info: 'bg-info-light text-info-foreground',
        primary: 'bg-surface-inverse text-text-inverse',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                variants[variant],
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}
