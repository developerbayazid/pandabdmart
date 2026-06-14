import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type CategoryBreadcrumbProps = {
    ancestors: { name: string; slug: string }[];
    currentName: string;
};

export function CategoryBreadcrumb({ ancestors, currentName }: CategoryBreadcrumbProps) {
    return (
        <nav className="flex items-center gap-2 text-[13px] text-text-secondary mb-6">
            <Link
                href="/"
                className="hover:text-text-primary transition-colors"
            >
                Home
            </Link>
            {ancestors.map((ancestor) => (
                <span key={ancestor.slug} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    <Link
                        href={`/categories/${ancestor.slug}`}
                        className="hover:text-text-primary transition-colors"
                    >
                        {ancestor.name}
                    </Link>
                </span>
            ))}
            <ChevronRight className="w-4 h-4" />
            <span className="text-text-primary font-medium">{currentName}</span>
        </nav>
    );
}
