# Memory — Feature 23 Audit Log Viewer

Last updated: 2026-06-19T10:18+06:00

## What was built

- **Types:** `types/admin-audit.ts` — `AdminAuditLogEntry`, `AdminAuditFilters` (with `actorName`), `AdminAuditResult`
- **Repository extended:** `repositories/audit.repository.ts` — added `dateFrom`/`dateTo` filters and `actorName` ILIKE search on `user.full_name`
- **Service:** `services/audit-viewer.service.ts` — wraps `getAuditLogs` with `{ success, data, error }` pattern
- **Actions:** `actions/audit.actions.ts` — `getAuditLogsAction` with admin role check
- **Component:** `components/admin/AuditLogList.tsx` — filter bar (actor name text search, action type dropdown with 22 actions, entity type dropdown with 9 types, date from/to pickers, Apply button), table (timestamp, actor name, color-coded action badge, entity type, truncated entity ID, expand/collapse chevron for meta JSON), empty states, pagination (20/page, URL-driven)
- **Page:** `app/admin/audit-logs/page.tsx` — Suspense + async content with `requireRole('admin')`, URL params as filters
- **Build:** 0 TS errors

## Decisions made

- Audit log viewer is admin-only (not shop_manager) — consistent with sidebar placement
- Filters are URL-driven (page reload) rather than client-side fetch — matches CustomerList pattern
- Action types and entity types hardcoded as known lists rather than fetched from DB
- Actor filter implemented as ILIKE name search on `users.full_name` via Supabase foreign table join rather than UUID input — better UX
- Meta JSON shown in expandable section below the table rather than modal

## Problems solved

- **Review fix:** Actor filter was missing from initial implementation. Added `actorName` parameter to repository with `query.ilike('user.full_name', '%${actorName}%')` and a text input to the filter bar.

## Current state

- Feature 23 complete and building cleanly (0 TS errors)
- Route: `/admin/audit-logs` (admin only)
- Filtering by: actor name, action type, entity type, date range
- Pagination at 20 per page, URL-driven
- Sidebar link existed — page now renders
- All Phase 5 admin panel features complete

## Next session starts with

Feature 24 — Email Notifications:
1. Set up `notification.service.ts` with Resend integration
2. Create email templates: order-confirmation, payment-success, shipment-update, delivery-confirmation
3. Trigger emails from: order creation, payment verification, admin status updates

## Open questions

- None
