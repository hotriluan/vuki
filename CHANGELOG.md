# Changelog

All notable changes to this project will be documented in this file. Manual sections (like 0.4.0) summarize grouped development phases; semantic-release generated sections follow.

## [0.4.0] - 2025-10-02 (Phase 1 Completion)

### Highlights

- Completed admin backend Phase 1: product lifecycle, media management, bulk ops, validation, duplication, soft delete cascade, concurrency control, audit diffs, performance & caching improvements.

### Added

- Product status enum (DRAFT / PUBLISHED / SCHEDULED) + scheduling (`publishedAt`).
- `primaryImage` field + ProductMedia model (ordered media with `isPrimary`, `alt`, `position`).
- Variant matrix full-replace API & admin UI.
- Bulk product actions (publish / unpublish / soft delete) with cache invalidation & audit logging.
- Validation warnings endpoint & panel (missing alt, invalid schedule, draft without category, missing primary image).
- Slug conflict auto-suggestion for create & edit.
- Product duplication (deep copy variants/media/categories to new DRAFT).
- Soft delete (product) + hard variant cascade deletion.
- Optimistic concurrency (updatedAt precondition) on product & variant writes.
- Structured audit log diffs (before/after field changes, variant counts, bulk status transitions).
- Primary image alt enforcement (blocking validation + warning coverage).
- Centralized cache invalidation (product/category pages, sitemap, homepage, search index) & background unified search rebuild endpoint (rate-limited).
- LCP optimizations: priority hero images, dynamic import heavy sections, deferred wishlist hydration, refined responsive `sizes`.

### Changed

- Migrated static mock imports to live Prisma queries across frontend routes & components.
- Refactored auth config (extracted `authOptions`) and unified admin route guard.
- Consolidated search indexing (products + blog) with background rebuild pattern.
- Image fallback chain: product.primaryImage -> media.isPrimary -> first images array item.

### Fixed

- Resolved numerous TS issues (async misuse, stale imports, Promise handling) improving type safety.
- Sitemap & search exclude soft-deleted/unpublished products.
- Slug conflict now returns structured JSON with `suggestedSlug` (409) instead of generic error.

### Performance

- Dynamic imported non-critical panels (Reviews, RelatedProducts, RecentlyViewed).
- Prioritized above-the-fold images with tuned `sizes` to reduce CLS & improve LCP.

### Accessibility / SEO

- Mandatory alt text for primary product imagery.
- Added Product & Breadcrumb JSON-LD (plus AggregateRating when available).

### Observability / DX

- Audit actions extended (`product.duplicate`, bulk status diff payloads).
- Conflict responses return current snapshot enabling user to reconcile edits.
- Unified invalidation helper reduces code duplication and drift risk.

### Security / Safety

- Rate-limited search rebuild endpoint with secret key.
- Soft delete strategy preserves historical order context while cleaning variant rows.

### Roadmap (Next Suggestions)

- Product restore flow.
- Catalog pagination & advanced server filters.
- Bundle size guard & automated Lighthouse CI.
- Media alt bulk suggestion & audit export.
- Search synonyms & accent-insensitive matching.

---

## [0.3.0](https://github.com/hotriluan/vuki/compare/v0.2.0...v0.3.0) (2025-09-30)

### Features

- **blog:** add markdown blog section (listing, detail, SEO, tests, docs) ([63e197c](https://github.com/hotriluan/vuki/commit/63e197c6ff6794b539570e4cc3c82cbe4e0cbb89))

## [0.2.0](https://github.com/hotriluan/vuki/compare/v0.1.0...v0.2.0) (2025-09-30)

### Features

- **hero:** add accessible homepage hero slider with autoplay and tests ([8f0dc72](https://github.com/hotriluan/vuki/commit/8f0dc72a0de27382d1ef20c73739abab0fa81664))
- **blog:** add markdown blog section (listing, detail pages, metadata, JSON-LD, tests, docs) ([1583fef](https://github.com/hotriluan/vuki/commit/1583fef))

## [0.1.0] - 2025-09-30

### Added

- Baseline storefront, cart logic, wishlist, search modal, reviews mock, PWA fallback, accessibility improvements.
