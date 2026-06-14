import { Skeleton } from '@/components/ui/skeleton';
import type { ShopFilterOptions } from '@/types/shop';

type ShopPageClientFallbackProps = {
    filterOptions: ShopFilterOptions;
};

export function ShopPageClientFallback({ filterOptions: _filterOptions }: ShopPageClientFallbackProps) {
    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-16 py-6">
                <div className="flex gap-8">
                    <div className="hidden lg:block w-[260px] shrink-0 space-y-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-5 w-24 mb-3" />
                                <div className="space-y-2">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <Skeleton key={j} className="h-4 w-full" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i}>
                                    <Skeleton className="w-full h-[220px] lg:h-[280px] rounded-lg mb-3" />
                                    <Skeleton className="h-3 w-24 mb-2" />
                                    <Skeleton className="h-4 w-full mb-1" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
