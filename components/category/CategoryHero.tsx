type CategoryHeroProps = {
    name: string;
};

export function CategoryHero({ name }: CategoryHeroProps) {
    return (
        <div className="bg-surface-secondary rounded-2xl overflow-hidden mb-8">
            <div className="flex items-end">
                <div className="flex-1 p-8 lg:p-12">
                    <span className="text-[12px] text-text-secondary uppercase tracking-wider font-medium">
                        Category
                    </span>
                    <h1 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[36px] font-normal leading-[1.3] text-text-primary mt-2">
                        {name}
                    </h1>
                    <p className="text-[14px] text-text-secondary mt-3 max-w-lg">
                        Explore our collection of {name.toLowerCase()} products. Handpicked quality items for you.
                    </p>
                </div>
                <div className="hidden lg:block w-1 h-full" />
            </div>
        </div>
    );
}
