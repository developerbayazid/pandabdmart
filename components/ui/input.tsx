import { cn } from '@/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
    return (
        <input
            className={cn(
                'w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted',
                'focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                className,
            )}
            {...props}
        />
    );
}
