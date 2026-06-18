'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, FolderTree, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    createCategoryAction,
    updateCategoryAction,
    deleteCategoryAction,
} from '@/actions/category.actions';
import type {
    AdminCategoryListItem,
    AdminCategoryListResult,
    AdminCategoryFormData,
    AdminParentCategoryOption,
} from '@/types/admin-catalog';

type CategoryTreeProps = {
    initialData: AdminCategoryListResult | null;
    parentOptions: AdminParentCategoryOption[];
};

type FormState = {
    mode: 'create' | 'edit';
    categoryId?: string;
    name: string;
    slug: string;
    parentId: string | null;
};

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 200);
}

function buildTree(categories: AdminCategoryListItem[]): AdminCategoryListItem[] {
    const map = new Map<string, AdminCategoryListItem & { children: AdminCategoryListItem[] }>();
    const roots: (AdminCategoryListItem & { children: AdminCategoryListItem[] })[] = [];

    for (const cat of categories) {
        map.set(cat.id, { ...cat, children: [] });
    }

    for (const cat of map.values()) {
        if (cat.parentId && map.has(cat.parentId)) {
            map.get(cat.parentId)!.children.push(cat);
        } else {
            roots.push(cat);
        }
    }

    return roots;
}

function TreeNode({
    node,
    depth,
    expandedIds,
    toggleExpand,
    onEdit,
    onDelete,
    deleting,
}: {
    node: AdminCategoryListItem & { children?: AdminCategoryListItem[] };
    depth: number;
    expandedIds: Set<string>;
    toggleExpand: (id: string) => void;
    onEdit: (cat: AdminCategoryListItem) => void;
    onDelete: (id: string) => void;
    deleting: string | null;
}) {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <>
            <div
                className={cn(
                    'flex items-center gap-3 px-3 py-2.5 hover:bg-surface-secondary transition-colors group',
                    depth > 0 && 'border-t border-border-light',
                )}
                style={{ paddingLeft: `${12 + depth * 24}px` }}
            >
                <button
                    onClick={() => toggleExpand(node.id)}
                    className={cn(
                        'shrink-0 p-0.5 rounded hover:bg-surface-tertiary transition-colors',
                        !hasChildren && 'invisible',
                    )}
                >
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-text-muted" />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-text-primary truncate">
                            {node.name}
                        </span>
                        {node.childrenCount > 0 && (
                            <Badge variant="neutral">{node.childrenCount} sub</Badge>
                        )}
                        {node.productCount > 0 && (
                            <Badge variant="neutral">{node.productCount} products</Badge>
                        )}
                    </div>
                    <span className="text-[12px] text-text-muted">{node.slug}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(node)}
                        className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface-tertiary transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(node.id)}
                        disabled={deleting === node.id}
                        className="p-1.5 text-text-muted hover:text-error rounded hover:bg-error-light transition-colors disabled:opacity-50"
                    >
                        {deleting === node.id ? (
                            <span className="text-[11px]">...</span>
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {isExpanded && hasChildren && node.children && (
                <>
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            expandedIds={expandedIds}
                            toggleExpand={toggleExpand}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            deleting={deleting}
                        />
                    ))}
                </>
            )}
        </>
    );
}

export function CategoryTree({ initialData, parentOptions }: CategoryTreeProps) {
    const [categories, setCategories] = useState(initialData?.categories ?? []);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [form, setForm] = useState<FormState | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const tree = buildTree(categories);

    function toggleExpand(id: string) {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function expandAll() {
        const ids = new Set(categories.map((c) => c.id));
        setExpandedIds(ids);
    }

    function collapseAll() {
        setExpandedIds(new Set());
    }

    function openCreateForm() {
        setForm({ mode: 'create', name: '', slug: '', parentId: null });
        setError(null);
    }

    function openEditForm(cat: AdminCategoryListItem) {
        setForm({
            mode: 'edit',
            categoryId: cat.id,
            name: cat.name,
            slug: cat.slug,
            parentId: cat.parentId,
        });
        setError(null);
    }

    function closeForm() {
        setForm(null);
        setError(null);
    }

    async function handleSave() {
        if (!form) return;
        const formData: AdminCategoryFormData = {
            name: form.name,
            slug: form.slug,
            parentId: form.parentId,
        };

        setSaving(true);
        setError(null);

        let result;
        if (form.mode === 'create') {
            result = await createCategoryAction(formData);
        } else if (form.categoryId) {
            result = await updateCategoryAction(form.categoryId, formData);
        }

        if (result?.success) {
            closeForm();
            router.refresh();
        } else {
            setError(result?.error ?? 'Action failed');
        }
        setSaving(false);
    }

    async function handleDelete(categoryId: string) {
        setDeleting(categoryId);
        const result = await deleteCategoryAction(categoryId);
        if (result.success) {
            setCategories((prev) => prev.filter((c) => c.id !== categoryId));
        } else {
            setError(result.error ?? 'Failed to delete category');
        }
        setDeleting(null);
    }

    const parentOptionsForForm = form?.categoryId
        ? parentOptions.filter((po) => po.id !== form.categoryId)
        : parentOptions;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={expandAll}
                        disabled={categories.length === 0}
                    >
                        Expand All
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={collapseAll}
                        disabled={categories.length === 0}
                    >
                        Collapse All
                    </Button>
                </div>
                <Button variant="primary" size="sm" onClick={openCreateForm}>
                    <Plus className="w-4 h-4" />
                    New Category
                </Button>
            </div>

            {form && (
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)] space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[16px] font-semibold text-text-primary">
                            {form.mode === 'create' ? 'New Category' : 'Edit Category'}
                        </h2>
                        <button
                            onClick={closeForm}
                            className="p-1 text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-error-light border border-error/20 rounded-md px-4 py-3 text-[14px] text-error">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setForm((prev) => ({
                                        ...prev!,
                                        name,
                                        slug:
                                            prev!.mode === 'create' &&
                                            (!prev!.slug || prev!.slug === generateSlug(prev!.name))
                                                ? generateSlug(name)
                                                : prev!.slug,
                                    }));
                                }}
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                placeholder="e.g. Electronics"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev!, slug: e.target.value }))
                                }
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                                placeholder="e.g. electronics"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                                Parent Category
                            </label>
                            <select
                                value={form.parentId ?? ''}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev!,
                                        parentId: e.target.value || null,
                                    }))
                                }
                                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                            >
                                <option value="">None (Root)</option>
                                {parentOptionsForForm.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {'\u00A0\u00A0'.repeat(Math.max(0, opt.depth - 1))}
                                        {opt.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button variant="primary" onClick={handleSave} disabled={saving}>
                            {saving
                                ? 'Saving...'
                                : form.mode === 'create'
                                  ? 'Create Category'
                                  : 'Save Changes'}
                        </Button>
                        <Button variant="secondary" onClick={closeForm} disabled={saving}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                {tree.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-4">
                            <FolderTree className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="text-[14px] text-text-secondary mb-4">
                            No categories yet
                        </p>
                        <Button variant="secondary" onClick={openCreateForm}>
                            <Plus className="w-4 h-4" />
                            Create your first category
                        </Button>
                    </div>
                ) : (
                    tree.map((node) => (
                        <TreeNode
                            key={node.id}
                            node={node}
                            depth={0}
                            expandedIds={expandedIds}
                            toggleExpand={toggleExpand}
                            onEdit={openEditForm}
                            onDelete={handleDelete}
                            deleting={deleting}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
