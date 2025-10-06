## [0.4.0](https://github.com/hotriluan/vuki/compare/v0.3.0...v0.4.0) (2025-10-06)


### Features

* **api:** add blog, search, and order endpoints with seed blog import ([429f4a4](https://github.com/hotriluan/vuki/commit/429f4a4467c12278f0085135768ccd0605b63ec8))
* **auth:** session cookie + anonymous user bootstrap; integrate into order creation ([2068922](https://github.com/hotriluan/vuki/commit/2068922082cc34c68e4ac63c018107baf00ffb55))
* **backend:** add Prisma MySQL schema, seed script, product API endpoints, and README docs ([2353110](https://github.com/hotriluan/vuki/commit/2353110a86e8384ab0147f56fcaee3a37b03ca46))
* Complete menu system with database integration and admin management ([2bbe051](https://github.com/hotriluan/vuki/commit/2bbe0515414274b9a5b1f694ab8208e493b41bf3))
* **order:** add GET /api/orders/[id] endpoint with product & variant stock info ([344afdf](https://github.com/hotriluan/vuki/commit/344afdf4cff0076af2ebf2d685fc63666984f587))
* **search:** add debounce override and stabilize SearchModal tests ([0b58525](https://github.com/hotriluan/vuki/commit/0b585257890eb35fb6bc5c47e3598917a160dd94))
* **search:** unify product + blog search index with UI badges and API route ([b9edbd4](https://github.com/hotriluan/vuki/commit/b9edbd48b02754a9ebc7eb27315ae3ec69f5840c))
* **stock:** add Product.stock field, seed computation, and transactional stock decrement in order creation ([f8e794f](https://github.com/hotriluan/vuki/commit/f8e794f7dca44b75d0a4b0cf392cab7e3c64900d))


### Bug Fixes

* **blog,search:** allow fs in vitest jsdom, improve blog test resilience, non-blocking blog retry in search index ([31a694a](https://github.com/hotriluan/vuki/commit/31a694a0fad5d6cbe94fd40a20d65558c1a91a80))
* **blog:** more robust posts dir resolution (env + parent paths) & relax test minimum count ([f2ec84a](https://github.com/hotriluan/vuki/commit/f2ec84a44886a3ed829c4553d580cb185f10c097))
* **build,prisma,blog:** repair build pre-script, prisma relations, and server-only blog module ([9ef6269](https://github.com/hotriluan/vuki/commit/9ef626994f6638e7667e76b2b655d6a27a0d04dd))
* resolve CI/CD workflow errors ([1959361](https://github.com/hotriluan/vuki/commit/1959361cafa176b26de1857a14e5d4108dd4dde1))
* **search,ci:** add server fs fallback for search index and pin Node 20.19.0 ([8ce3b40](https://github.com/hotriluan/vuki/commit/8ce3b402280dca7799221f7caca771e1d28ba3cf))
* simplify tests for CI/CD compatibility ([c4d60b3](https://github.com/hotriluan/vuki/commit/c4d60b325425946ff821ed152a102b1bb5dabd15))

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
