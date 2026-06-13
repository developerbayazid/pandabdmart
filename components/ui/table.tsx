import { cn } from '@/lib/utils';

export function Table({ className, children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
    return (
        <div className="w-full overflow-x-auto">
            <table
                className={cn('w-full text-sm text-left', className)}
                {...props}
            >
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <thead className={cn('bg-surface-tertiary', className)} {...props}>
            {children}
        </thead>
    );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <tbody className={cn('divide-y divide-border', className)} {...props}>
            {children}
        </tbody>
    );
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr
            className={cn(
                'hover:bg-surface-secondary transition-colors',
                className,
            )}
            {...props}
        >
            {children}
        </tr>
    );
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) {
    return (
        <th
            className={cn(
                'px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary',
                className,
            )}
            {...props}
        >
            {children}
        </th>
    );
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableDataCellElement>) {
    return (
        <td
            className={cn(
                'px-4 py-3 text-sm text-text-primary',
                className,
            )}
            {...props}
        >
            {children}
        </td>
    );
}
