import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    variant?: 'default' | 'compact';
};

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    variant = 'default',
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const visiblePages = pages.filter((page) => {
        if (totalPages <= 5) return true;
        if (page === 1 || page === totalPages) return true;
        if (page >= currentPage - 1 && page <= currentPage + 1) return true;
        return false;
    });

    const showStartEllipsis = totalPages > 5 && currentPage > 3;
    const showEndEllipsis = totalPages > 5 && currentPage < totalPages - 2;

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-2">
                {visiblePages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={cn(
                            'w-8 h-8 text-[13px] font-medium rounded-md transition-colors flex items-center justify-center',
                            page === currentPage
                                ? 'bg-surface-inverse text-text-inverse'
                                : 'border border-border text-text-secondary hover:bg-surface-secondary',
                        )}
                    >
                        {page}
                    </button>
                ))}

                {showEndEllipsis && (
                    <span className="px-1 text-text-muted">...</span>
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={cn(
                        'w-8 h-8 flex items-center justify-center text-[13px] font-medium border border-border rounded-md text-text-secondary hover:bg-surface-secondary transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={cn(
                    'px-3 py-1.5 text-[13px] font-medium border border-border rounded-md text-text-secondary hover:bg-surface-secondary transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
            >
                Previous
            </button>

            {showStartEllipsis && (
                <span className="px-2 text-text-muted">...</span>
            )}

            {visiblePages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={cn(
                        'w-8 h-8 text-[13px] font-medium rounded-md transition-colors',
                        page === currentPage
                            ? 'bg-surface-inverse text-text-inverse'
                            : 'border border-border text-text-secondary hover:bg-surface-secondary',
                    )}
                >
                    {page}
                </button>
            ))}

            {showEndEllipsis && (
                <span className="px-2 text-text-muted">...</span>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={cn(
                    'px-3 py-1.5 text-[13px] font-medium border border-border rounded-md text-text-secondary hover:bg-surface-secondary transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
            >
                Next
            </button>
        </div>
    );
}
