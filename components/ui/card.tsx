import { cn } from '@/lib/utils';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'bg-surface border border-border rounded-2xl p-6',
                'shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }: CardProps) {
    return (
        <div className={cn('mb-4', className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }: CardProps) {
    return (
        <h3
            className={cn(
                'text-base font-semibold text-text-primary leading-6',
                className,
            )}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardDescription({ className, children, ...props }: CardProps) {
    return (
        <p className={cn('text-sm text-text-secondary mt-1', className)} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ className, children, ...props }: CardProps) {
    return (
        <div className={cn('', className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className, children, ...props }: CardProps) {
    return (
        <div className={cn('mt-4 flex items-center gap-3', className)} {...props}>
            {children}
        </div>
    );
}
