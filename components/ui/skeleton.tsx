import { cn } from '@/lib/utils';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-surface-secondary rounded-md',
                className,
            )}
            {...props}
        />
    );
}

export function SkeletonText({
    lines = 1,
    className,
}: {
    lines?: number;
    className?: string;
}) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        'h-4',
                        i === lines - 1 && lines > 1 && 'w-3/4',
                    )}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-4', className)}>
            <Skeleton className="h-48 w-full rounded-lg" />
            <SkeletonText lines={2} />
        </div>
    );
}
