import { cn } from '@/lib/utils';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
};

export function Select({ label, error, className, children, ...props }: SelectProps) {
    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={cn(
                        'w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary',
                        'appearance-none focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error && 'border-error focus:ring-error focus:border-error',
                    )}
                    {...props}
                >
                    {children}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && (
                <p className="mt-1 text-xs text-error">{error}</p>
            )}
        </div>
    );
}
