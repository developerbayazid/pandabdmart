export type CategoryPageData = {
    category: {
        id: string;
        name: string;
        slug: string;
    };
    ancestors: {
        name: string;
        slug: string;
    }[];
    children: {
        id: string;
        name: string;
        slug: string;
    }[];
};
