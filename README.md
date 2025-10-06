# Shoe Store Starter

![CI](https://github.com/hotriluan/vuki/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/hotriluan/vuki/branch/main/graph/badge.svg)](https://codecov.io/gh/hotriluan/vuki)
[![GitHub release](https://img.shields.io/github/v/release/hotriluan/vuki?logo=github)](https://github.com/hotriluan/vuki/releases)

> Badge đã trỏ tới repo thật. Nếu Codecov chưa hiển thị %, đảm bảo workflow chạy ít nhất một lần trên nhánh `main`.

## ⚡ Quickstart (Remote MySQL)

1. Tạo database (trên server MySQL 8.x):

```sql
CREATE DATABASE IF NOT EXISTS vuki CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Tạo file `.env` (dựa trên `.env.example`):

```bash
DATABASE_URL=mysql://root:yourPass@192.168.18.33:3306/vuki
ADMIN_SECRET=change-me                 # dùng cho endpoint rebuild search cũ
NEXTAUTH_SECRET=your-long-random-hex   # tạo bằng: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Tuỳ chọn seed admin (scripts/seed-admin.mjs)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Admin
LOG_LEVEL=info
```

3. Cài dependencies:

```bash
npm ci
```

4. Generate & migrate (nếu chưa có DB schema):

```bash
npx prisma generate
npx prisma migrate deploy
# Nếu đã tồn tại schema cũ trước khi thêm field role: chạy
# npx prisma migrate dev --name add-user-role
```

5. Seed dữ liệu & đồng bộ (blog + search index) – nhiều bước này chạy tự động ở predev nhưng có thể gọi thủ công:

```bash
npm run db:seed                           # seed cơ bản (nếu có)
node scripts/migrate-products-to-db.mjs   # import products JSON vào DB (idempotent)
node scripts/seed-admin.mjs               # tạo / cập nhật user admin (role=ADMIN)
node scripts/sync-blog.mjs
node scripts/build-unified-search-index.mjs
```

6. Kiểm tra kết nối DB nhanh:

```bash
npm run db:check
```

7. Chạy dev:

```bash
npm run dev
```

8. Rebuild search index (admin):

```bash
curl -X POST http://localhost:3000/api/admin/rebuild-search -H "x-admin-secret: change-me"
```

Rate limit mặc định:

- Public (`/api/search`, `/api/orders`): 60 req / 5 phút / IP (env: `PUBLIC_RATE_LIMIT`, `PUBLIC_RATE_WINDOW_MS`)
- Admin rebuild: 5 req / 5 phút / IP (env: `ADMIN_REBUILD_LIMIT`, `ADMIN_REBUILD_WINDOW_MS`)

Một boilerplate cửa hàng bán giày (demo) sử dụng Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## ✅ Phase 1 Backend Completion (v0.4.0)

Phase 1 đã hoàn tất với trọng tâm biến prototype storefront thành nền tảng có admin backend thực thi chuẩn chỉnh:

### Phạm vi chính

- Product lifecycle: trạng thái `DRAFT | PUBLISHED | SCHEDULED` + `publishedAt` (lên lịch xuất bản) và lọc soft delete (`deletedAt`).
- Media system: bảng `ProductMedia` (ordering, `isPrimary`, alt text bắt buộc cho primary) + fallback chain (`primaryImage` → media primary → ảnh đầu tiên).
- Variants: full-replace variant matrix API (xoá rồi insert lại atomically) + audit variant counts.
- Bulk operations: publish / unpublish / soft delete (cascades variants hard delete) kèm diff audit & cache invalidation hợp nhất.
- Slug handling: tạo tự động từ tên, gợi ý slug khi xung đột (409) cả create & edit.
- Product duplication: deep copy (sản phẩm + variants + media + categories) về bản DRAFT mới, slug mới.
- Optimistic concurrency: kiểm tra `updatedAt` trước update (409 trả về snapshot hiện tại để reconcile UI).
- Audit logging: diff trước/sau thay đổi field, variant delta, bulk status transitions, duplicate, search rebuild.
- Validation warnings API: bề mặt cảnh báo admin (thiếu alt primary, lịch publish quá khứ, draft chưa có category, thiếu primary image, v.v.).
- Unified cache invalidation: gom toàn bộ revalidate product page, category pages, homepage, sitemap + trigger rebuild chỉ mục search nền.
- Performance & LCP: ưu tiên ảnh hero/primary, dynamic import khối nặng (reviews / related / recently viewed), deferred wishlist hydrate, tinh chỉnh thuộc tính `sizes`.

### Kiến trúc kỹ thuật nổi bật

- Prisma schema mở rộng: trường trạng thái, lịch publish, soft delete, bảng media được index cho truy vấn hiệu quả.
- Tách helpers: `lib/invalidate.ts`, `lib/slug.ts`, `lib/audit.ts` chuẩn hoá reuse & giảm drift.
- Search index hợp nhất (products + blog) rebuild nền với rate limit & secret header.
- All mutation endpoints → audit + invalidation + optional diff meta ở cùng một vị trí (ít lặp, dễ review).
- Strict alt text policy cho primary image nâng cao SEO & accessibility.

### Lợi ích vận hành

- Giảm rủi ro ghi đè: concurrency guard.
- Dễ truy vết lỗi / chỉnh sửa nhầm: audit diff chi tiết.
- Triển khai mở rộng (restore, versioning media) dễ dàng do schema & logging đã chuẩn bị.
- Nền tảng hiệu năng tốt: tránh hydrate không cần thiết & tách bundle.

### Bảng tính năng Phase 1 (tóm tắt)

| Nhóm                                  | Trạng thái | Ghi chú                                                |
| ------------------------------------- | ---------- | ------------------------------------------------------ |
| Product status & scheduling           | DONE       | Enum + lọc query + publishAt validate                  |
| Product media & primary               | DONE       | Alt bắt buộc primary + ordering                        |
| Variant matrix replace                | DONE       | Ghi nhận diff variantCountBefore/After                 |
| Bulk publish/unpublish/delete         | DONE       | Cascade xoá cứng variants khi soft delete              |
| Slug auto & suggestion                | DONE       | Suggest slug trên 409 (P2002)                          |
| Duplicate product                     | DONE       | Deep copy quan hệ, DRAFT mới                           |
| Soft delete cascade                   | DONE       | Hard delete variants, giữ orderItems                   |
| Optimistic concurrency                | DONE       | 409 + payload snapshot                                 |
| Audit diff logging                    | DONE       | Field-level & bulk summaries                           |
| Validation warnings API               | DONE       | Missing alt, invalid schedule, no category, no primary |
| Unified invalidation + search rebuild | DONE       | Revalidate path + background index                     |
| LCP optimizations                     | DONE       | Priority images + dynamic imports                      |

## 🔭 Roadmap Gợi Ý Sau Phase 1

- Product restore (`deletedAt = null`) + audit `product.restore`.
- Pagination & server filtering (products, orders, logs) + cursor khi lớn.
- Bundle size guard (size-limit CI) + Lighthouse CI baseline.
- Media alt bulk suggestion (AI hoặc heuristic) + xuất báo cáo thiếu alt.
- Search nâng cao: synonyms, accent-insensitive normalization, popularity boost.
- Advanced RBAC (roles granular hoặc permissions) & activity viewer UI cho audit diff.
- Rate limit fine-grained cho create/update/delete endpoint.

---

## 🛠️ Admin Features Overview

| Nhóm       | Route chính            | Hành động                                                                     | Ghi chú                                                                                 |
| ---------- | ---------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------- |
| Dashboard  | `/admin`               | Thống kê đơn hàng (tổng, items, revenue PAID/FULFILLED), rebuild search index | Form rebuild sử dụng secret `ADMIN_SECRET` (sẽ dần thay thế bằng kiểm tra role + audit) |
| Products   | `/admin/products`      | List, create, edit, soft delete                                               | Soft delete đặt `deletedAt`; chưa có restore UI (dự kiến `product.restore`)             |
| Variants   | Trong form create/edit | Nhập theo dòng: `Label                                                        | Stock                                                                                   | PriceDiff?` | PriceDiff là chênh lệch so với giá gốc (VND), bỏ trống nếu không có |
| Categories | `/admin/categories`    | CRUD danh mục + đếm sản phẩm liên kết                                         | Join table `ProductCategory`; xoá cascade giữ dữ liệu sạch                              |
| Orders     | `/admin/orders`        | Xem, lọc theo status, cập nhật status                                         | Audit: `order.status.update`; doanh thu tính theo PAID + FULFILLED                      |
| Users      | `/admin/users`         | Xem danh sách, promote/demote role                                            | Bảo vệ không hạ ADMIN cuối cùng; audit `user.role.update`                               |
| Audit Logs | `/admin/logs`          | Xem 50 log gần nhất + filter action + tìm meta (client)                       | Hiển thị JSON meta, dropdown action distinct, future pagination >50                     |

### Soft Delete Sản Phẩm

- Trường: `deletedAt: DateTime?` (+ index)
- Tầng data public (helpers `lib/data.ts`, search index builder, related, product service) tự động loại trừ sản phẩm đã xóa mềm (`deletedAt IS NOT NULL`).
- Admin có thể thêm helper riêng nếu cần xem cả deleted (hiện chưa có trang liệt kê deleted).
- Xóa mềm giữ nguyên variants & orderItems để bảo toàn lịch sử đơn hàng.
- Khôi phục (restore) chưa có UI – kế hoạch: endpoint đặt `deletedAt = null` + audit `product.restore`.

### Định Dạng Variants

Textarea mỗi dòng: `Label|Stock|PriceDiff?`

Ví dụ:

```
Size 39|10
Size 40|8|20000
Size 41|5|25000
```

PriceDiff (nếu có) cộng vào giá gốc khi hiển thị.

### Users Management

- Toggle role USER ⇄ ADMIN qua nút (confirm)
- Chặn tự hạ quyền nếu là ADMIN duy nhất
- Endpoint: `POST /api/admin/users/:id/role` body `{ role: 'USER' | 'ADMIN' }`

### Audit Logging

File: `src/lib/audit.ts`

Actions hiện ghi (đã có viewer `/admin/logs`):

```
product.create | product.update | product.delete | product.restore (dự kiến)
category.create | category.update | category.delete
order.status.update
user.role.update
search.rebuild
```

Trường `meta` (JSON) có thể chứa: `by`, `target`, `ip`, v.v.
Lỗi khi ghi audit bị nuốt (console.error) để không phá luồng chính.

### Orders Metrics

- Tổng số đơn, tổng items (sum quantity), doanh thu: cộng các đơn status PAID + FULFILLED.
- Có filter status qua query param (ví dụ `?status=PAID`).

### Bảo Mật & Quy Ước

- Chỉ ADMIN truy cập `/admin/*` (middleware decode JWT, kiểm tra `role`).
- Đổi `NEXTAUTH_SECRET` khi triển khai production.
- Không truyền path con vào `NEXTAUTH_URL` (luôn là origin).

### Roadmap Admin (Cập nhật)

1. Product restore (API + UI + audit).
2. Pagination & search back-office (products, orders, logs paging >50).
3. Xuất CSV đơn hàng.
4. Inline variant stock editing.
5. Rate limit + lockout login.

### Product Form UX (Mới)

- Form tạo & sửa sản phẩm chuyển sang client component (fetch POST) → hiển thị lỗi slug trùng inline (status 409) thay vì reload.
- Tự sinh slug từ tên nếu bỏ trống (blur name lần đầu).
- Nút submit hiển thị trạng thái (Đang tạo... / Đang lưu...).
- Bảo toàn logic slugify & kiểm tra server (tránh race condition / P2002 fallback).

### Search & Related Nhận Biết Soft Delete

- Search index build ưu tiên dữ liệu từ DB `where deletedAt IS NULL`; fallback static JSON chỉ khi DB không khả dụng.
- Runtime Fuse search cũng thử DB trước; nếu rỗng/lỗi mới fallback.
- Related products load danh sách active từ DB; không hiển thị sản phẩm đã soft delete.

---

## Offline Fallback (PWA)

- Đã chuyển sang dùng static `public/offline.html` làm fallback (service worker `next-pwa`).
- Đã xoá hoàn toàn thư mục `app/` gốc tạm (shim) để tránh xung đột với `src/app`.
- Nếu muốn tuỳ biến UI offline nâng cao, tạo component client riêng và build ra static HTML trước, hoặc dùng runtime hydrate trong `offline.html` (script inline nhỏ đọc cache).
- Lưu ý: Không nên tạo lại `app/offline/page.tsx` trừ khi cũng có `app/layout.tsx`; cấu trúc chính thức: chỉ dùng `src/app`.

## Versioning & Release

Tự động hoá bằng **semantic-release**.

| Thành phần              | Mô tả                                                                       |
| ----------------------- | --------------------------------------------------------------------------- |
| Nhánh stable            | `main` (phát hành bản thường)                                               |
| Nhánh prerelease        | `alpha` (gắn hậu tố `-alpha.N`)                                             |
| File cấu hình           | `.releaserc.json`                                                           |
| Changelog               | `CHANGELOG.md` (plugin `@semantic-release/changelog`)                       |
| GitHub Release          | Tạo tự động kèm ghi chú phiên bản                                           |
| Commit bump + changelog | Plugin `@semantic-release/git` (message: `chore(release): x.y.z [skip ci]`) |

### Quy tắc commit (Conventional Commits)

```
feat(cart): add multi-currency toggle
fix(search): debounce racing condition
refactor(price): simplify discount calc
docs(readme): add release section
chore(deps): bump next to 14.2.33
perf(fuse): memoize index
test(cart): add coupon edge cases
```

BREAKING CHANGE:

```
feat!: change cart state shape

Body:
BREAKING CHANGE: cart items now store variant as object instead of id
```

### Mapping commit → version

| Kiểu                    | Ảnh hưởng | Ví dụ bump (giả sử đang 0.1.0) |
| ----------------------- | --------- | ------------------------------ |
| fix                     | patch     | 0.1.1                          |
| feat                    | minor     | 0.2.0                          |
| feat! / BREAKING CHANGE | major     | 1.0.0 (khi đã >=1.x)           |

Trong giai đoạn 0.x semantic-release vẫn tuân thủ logic semver—`feat` vẫn tạo bump minor (0.1.0 → 0.2.0).

### Prerelease flow

1. Tạo nhánh / cập nhật nhánh `alpha` từ `main`.
2. Push commit conventional (ví dụ `feat:`) → semantic-release sinh `0.2.0-alpha.1`.
3. Thêm commit fix → `0.2.0-alpha.2`.
4. Khi merge sang `main`, bản stable kế tiếp phát hành (0.2.0).

### Dry-run cục bộ (chỉ để xem dự đoán)

```bash
npx semantic-release --dry-run
```

### Thực thi CI

Workflow: `.github/workflows/release.yml` chạy trên push vào `main` hoặc `alpha`:

1. Checkout (fetch-depth: 0)
2. Install (npm ci)
3. Test (Vitest)
4. Build sanity
5. `npm run release`

### Tag baseline

Đã tạo thủ công: `v0.1.0`. Commits mới conventional sau tag sẽ kích hoạt bump tự động.

### Ghi chú

- Không tự chỉnh `version` trong `package.json` thủ công—semantic-release quản lý.
- Dùng `[skip ci]` chỉ khi commit thuần generated (semantic-release đã tự thêm).
- Nếu cần bỏ qua phát hành cho một commit: dùng prefix khác ngoài các loại chuẩn (ví dụ `chore(local): ...`).

## Tính năng hiện tại

- Layout cơ bản (Header, Footer)
- Trang chủ + Featured products
- Thành phần ProductCard, Price
- Mock data (sản phẩm + danh mục)
- Cấu hình Tailwind, ESLint, Prettier
- Route động sản phẩm `/product/[slug]`
- Route động danh mục `/category/[slug]`
- Giỏ hàng (context) + đếm số lượng
- Persist giỏ hàng (localStorage, versioned)
- Định dạng tiền tệ VND (Intl.NumberFormat)
- Trang giỏ hàng chi tiết (số lượng, xoá, subtotal, mã giảm giá, phí ship)
- Cart Drawer (slide over) đồng bộ với giỏ chính
- Coupon codes (SALE10, FREESHIP, VIP50K) + freeship ngưỡng ≥ 1.000.000₫
- Product Variants (size) với selector + merge logic theo (productId, variantId)
- Wishlist (thêm/xoá, persist localStorage, trang /wishlist)
- Skeleton loading (grid + product page) & blur placeholder ảnh (base64 tiny PNG)
- Search autocomplete (Fuse.js) với highlight, phím tắt / và Ctrl+K
- Multi-currency (VND/USD/EUR) với selector Header + quy đổi mock rate
- Infinite scroll category (IntersectionObserver + fallback nút "Tải thêm")
- Recent searches (localStorage) + clear
- Animation SearchModal (fade + scale, unmount trễ)
- Sitemap.xml + robots.txt + Breadcrumb JSON-LD (Home → Category → Product)
- Dark mode toggle (persist localStorage, system fallback)
- Lọc danh mục: sắp xếp (newest / price-asc / price-desc) + khoảng giá (min/max) qua query params
- Kiểm tra commit message (commitlint) + CI chạy Node 18 & 20 (matrix)
- Lọc danh mục theo size (multi-select) qua query param `sizes=sz-39,sz-40`
- Recently viewed products (LRU 8 mục, localStorage)
- Related products (ưu tiên cùng category, fallback bổ sung đủ số lượng)
- Mock product reviews + aggregate rating (JSON-LD `aggregateRating`)
- User-submitted reviews (client merge, localStorage)
- Category page Breadcrumb JSON-LD (Home → Category)
- Size filter hiển thị cả size hết hàng (disabled + stock count)

## Blog (Markdown)

Module blog sử dụng file markdown đặt trong thư mục `content/posts`. Mỗi file chứa **frontmatter** ở đầu + nội dung markdown. Build time: đọc, parse bằng `gray-matter` + render HTML với `marked`. Dữ liệu được cache nhẹ trong process để tránh đọc đĩa nhiều lần.

### Cấu trúc thư mục

```
content/
  posts/
    2025-09-giay-chay-bo-toi-uu.md
    2025-08-cach-chon-size-chuan.md
    2025-07-bao-quan-giay-sneaker.md
    2025-06-xu-huong-mau-sac-2025.md
```

Tên file có thể prefixed bằng ngày để giúp quản lý, nhưng slug thực tế lấy từ frontmatter `slug`.

### Frontmatter chuẩn

```yaml
---
slug: giay-chay-bo-toi-uu # bắt buộc – dùng làm route /blog/[slug]
title: 'Tối ưu hiệu suất chạy bộ với đôi giày phù hợp' # bắt buộc
excerpt: 'Mô tả ngắn hiển thị ở trang list' # khuyến nghị (SEO/meta)
cover: https://images.unsplash.com/... # optional – ảnh 16:9
publishedAt: 2025-09-25T09:00:00.000Z # ISO string (bắt buộc)
author: 'Admin' # optional
tags: ['chay-bo', 'huong-dan'] # optional – tối đa nên <6
readingMinutes: 6 # optional – có thể tự tính sau này
---
```

### APIs nội bộ

File: `src/lib/blog.ts`

| Hàm                            | Mô tả                                                             |
| ------------------------------ | ----------------------------------------------------------------- |
| `getAllPosts()`                | Trả về danh sách đã sort desc theo `publishedAt` (đã kèm `html`). |
| `getPostBySlug(slug)`          | Lấy 1 bài theo slug hoặc null.                                    |
| `getRecentPosts(limit)`        | Trả về frontmatter rút gọn (không `html`).                        |
| `generatePostParams()`         | Dùng cho `generateStaticParams` (SSG).                            |
| `estimateReadingMinutes(html)` | Ước tính thời gian đọc từ HTML (200 wpm).                         |

### Routes

- Trang list: `/blog` – static revalidate mỗi 10 phút (`revalidate = 600`).
- Trang chi tiết: `/blog/[slug]` – SSG + ISR 10 phút + metadata (OpenGraph/Twitter) + JSON-LD Article.

### Structured Data

`/blog/[slug]` inject `<script type="application/ld+json">` với schema `Article` (headline, datePublished, dateModified, image, keywords, author nếu có).

### Cách thêm bài viết mới

1. Tạo file mới `content/posts/YYYY-MM-ten-bai.md`.
2. Khai báo frontmatter chuẩn (ít nhất: slug, title, publishedAt; optionally excerpt, cover, tags).
3. Commit & push → Next.js build sẽ pick up và trang `/blog` cùng các route chi tiết sinh lại sau chu kỳ ISR.

### Kiểm thử

Test: `src/lib/__tests__/blog.test.ts` xác nhận:

- Có >= 4 bài
- Sort đúng thứ tự thời gian desc
- Nội dung parse có thẻ heading (`<h2>`)

### Mở rộng tương lai đề xuất

- Pagination (ví dụ mỗi trang 10 bài → dynamic segment `page/[n]`).
- Lọc theo tag `/blog/tag/[tag]` (filter dữ liệu từ `getAllPosts()`).
- Tự động tính `readingMinutes` nếu thiếu (ước tính từ HTML sau parse) → bỏ trường trong frontmatter.
- RSS feed `/feed.xml` (dùng `xmlbuilder2` hoặc template string). Revalidate song song với list.
- Tạo `search-index-blog.json` gộp (title, excerpt, tags) để hợp nhất search sản phẩm + bài viết.
- Highlight code block: tích hợp `shiki` (SSR) hoặc `rehype-prism-plus` (remark pipeline) – cân nhắc bundle.
- Draft mode: thêm trường `draft: true` → exclude khỏi production list, chỉ hiển thị khi bật draft (`draftMode().enable()`).

### Lưu ý hiệu năng & SEO

- Số bài ít: đọc file sync build time đơn giản (chưa cần pipeline remark phức tạp).
- Khi > ~200 bài: xem xét build pre-index JSON (cache) để giảm parse lặp; hoặc chuyển sang headless CMS.
- Ảnh cover dùng Unsplash: đảm bảo thêm `?w=1600&q=80&auto=format` để tối ưu.
- Thêm `<meta name="robots" content="noindex" />` cho các bài `draft` nếu sau này hỗ trợ.

---

## Chạy dự án

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm lint
```

### Phân tích bundle (Bundle Analyzer)

Chạy build kèm phân tích kích thước:

```bash
npm run analyze
```

Sau khi build, mở trang tĩnh được in ra trong terminal (thường ở `.next/analyze` hoặc hiển thị link). Biến môi trường `ANALYZE=1` kích hoạt plugin `@next/bundle-analyzer`.

Gợi ý tối ưu sau khi xem report:

- Tách dynamic import thêm (ví dụ: mô-đun currency rates nếu sau này gọi API lớn).
- Kiểm tra kích thước Fuse.js (đã lazy loaded—không xuất hiện trong initial bundles nếu chưa mở SearchModal).
- Dò các dependency lớn bất ngờ (moment, lodash full, v.v.) nếu thêm mới.

## Cấu trúc thư mục chính

```
src/
  app/         # App Router pages & layout
  components/  # UI components
  lib/         # types, data, utils (currency)
```

## Định Dạng Tiền Tệ (Đã triển khai)

Utility: `src/lib/currency.ts`

```ts
import { formatVnd } from '@/lib/currency';
formatVnd(1590000); // "1.590.000 ₫"
```

`Price` component sử dụng formatter này và chuẩn hoá tính phần trăm giảm giá thông qua biến `discountPercent`.

## Tiếp theo (sẽ bổ sung)

- Tối ưu image nâng cao (blur dynamic theo ảnh, prefetch priority)
- Thêm ngôn ngữ (i18n chuỗi giao diện)
- Thêm test bổ sung cho Header / WishlistButton / SEO JSON-LD

## Search Autocomplete (Đã triển khai)

## Multi-Currency (Đã triển khai)

File: `src/context/CurrencyContext.tsx`

Mock rates (base VND):

```
VND: 1
USD: 24000
EUR: 26000
```

API context:

```
const { currency, setCurrency, format, convert } = useCurrency();
```

`Price` + CartDrawer hiển thị theo currency hiện tại (tính toán nội bộ vẫn dựa trên VND). Persist bằng localStorage `currency:v1`.

Mở rộng gợi ý:

- Fetch rates từ API (ex: exchangerate.host) qua route cache 12h.
- Thêm lựa chọn định dạng số thập phân động.
- Hiển thị badge “≈ giá trị nội tệ” khi khác VND.

## Infinite Scroll Category (Đã triển khai)

Component: `InfiniteCategory` (client) sử dụng `IntersectionObserver`.
Props chính: `slug`, `pageSize=12`.
Fallback nút “Tải thêm” & switch chế độ tự động/thủ công.

## Recent Searches (Đã triển khai)

Key lưu: `recent-searches` (tối đa 8 mục, LRU đơn giản). Hiển thị khi query rỗng.

## Animation SearchModal

Fade + scale (150ms). Delay unmount giúp mượt hơn. State `visible` giữ component cho tới khi kết thúc animation.

## Sitemap & Robots & Breadcrumb

Routes: `/robots.txt`, `/sitemap.xml`.
Sinh URL từ categories + products.
Breadcrumb JSON-LD thêm vào trang sản phẩm (`ld-breadcrumb`).
Mẹo mở rộng: tách sitemap nếu > 50k URL, thêm `<changefreq>` và `<image:image>`.
Thành phần: `SearchModal` + util `src/lib/search.ts`

Phím tắt:
| Phím | Hành động |
|------|-----------|
| / | Mở hộp tìm kiếm (khi không focus input khác) |
| Ctrl+K / Cmd+K | Toggle mở/đóng |
| Esc | Đóng |
| ↑ / ↓ | Di chuyển lựa chọn |
| Enter | Mở sản phẩm đang chọn |

Logic Fuse:

```ts
threshold: 0.38
keys: name (0.6), description (0.3), slug (0.1)
minMatchCharLength: 2
ignoreLocation: true
includeMatches: true (để highlight)
```

Highlight: Dùng `dangerouslySetInnerHTML` với nội dung đã escape (anti-XSS) và wrap phần khớp bằng `<mark>`.

Mở rộng tương lai:

- Index theo category, variant SKU
- Tải index async (dynamic import) nếu data lớn
- Kết nối service search SaaS (Algolia / Meilisearch) khi sản phẩm nhiều

## Nâng cấp tương lai

- Mini checkout form (name, email, address, province) lưu localStorage
- Ước tính phí ship theo tỉnh (HCM, Hà Nội, Đà Nẵng, Khác) + freeship ngưỡng
- VAT 10% (config `src/config/pricing.ts`) hiển thị dòng thuế
- Coupon có expiresAt + chặn áp nếu hết hạn / đã có coupon khác
- Toggle VAT runtime (checkbox giỏ hàng) + persist localStorage
- Validation checkout (yêu cầu name>=2, email hợp lệ, address>=8, province) mới enable thanh toán
- Inline coupon error message thay vì chỉ browser validity

### VAT Toggle & Checkout Validation (Bổ sung)

Tại trang giỏ hàng và CartDrawer:

- Checkbox VAT 10% cho phép bật/tắt thuế runtime (persist `vatEnabled`).
- Nút thanh toán disabled cho tới khi form mini checkout hợp lệ.
- Lỗi coupon hiển thị inline (mã không hợp lệ / đã hết hạn / đã có mã khác / chưa đạt minSubtotal).
  WORKDIR /app
  ENV NODE_ENV=production
  COPY --from=build /app/.next ./.next
  COPY --from=build /app/public ./public
  COPY package.json .
  EXPOSE 3000

Mở rộng thực tế bổ sung:

- Mini checkout form: Thu thập tạm thời `name, email, address, province` để ước tính ship (không gửi backend).
- Province shipping: base fee theo mapping (`TP Hồ Chí Minh:30k`, `Hà Nội:35k`, `Đà Nẵng:32k`, `Khác:40k`). Nếu đạt ngưỡng ≥ 1.000.000 sau giảm → miễn phí.
- VAT 10%: tính trên (subtotal - discount) rồi cộng vào tổng cuối (floor). Có test so sánh VAT on/off.
- Coupon expiration: trường `expiresAt`. Nếu hết hạn hoặc đã có coupon khác → từ chối áp (hiển thị reason). Test expired coupon mô phỏng layer apply.
  CMD ["npm","start"]

````

## Checklist Production Cơ Bản

- [ ] Thiết lập `NODE_ENV=production` khi chạy build.
- [ ] Bật Image Optimization (đã có remotePatterns Unsplash, thêm domain riêng nếu có CDN).
- [ ] Thêm favicon, Open Graph images (`app/icon.png`, `app/opengraph-image.png`).
- [ ] Kiểm tra Lighthouse: Performance > 85, Accessibility > 90.
- [ ] Thiết lập Analytics (Vercel Analytics / GA4) khi cần.

## SEO & Metadata (Đã triển khai)

File helper: `src/lib/seo.ts`

Chức năng chính:

- `getSiteUrl()` lấy base URL từ `NEXT_PUBLIC_SITE_URL` (fallback `http://localhost:3000`).
- Root layout dùng `metadataBase`, `title.template`, Open Graph + Twitter defaults.
- `buildProductMetadata(product)` tạo metadata động (title, description cắt 155 ký tự, canonical, OG image).
- `buildProductJsonLd(product)` sinh structured data Product schema.

Trang sản phẩm `app/product/[slug]/page.tsx` export `generateMetadata` và chèn JSON-LD qua `<Script id="ld-product" ... />`.

Ví dụ JSON-LD sinh ra:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Urban Runner White",
  "description": "Lightweight everyday sneaker with breathable mesh and cushioned sole.",
  "image": ["https://images.unsplash.com/..."],
  "sku": "p-1",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "VND",
    "price": 1290000,
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/product/urban-runner-white"
  }
}
````

Thiết lập môi trường (ví dụ Vercel):

```bash
NEXT_PUBLIC_SITE_URL=https://example.com
```

Lưu ý: Nếu có nhiều biến thể với giá khác nhau, có thể mở rộng `offers` thành mảng hoặc dùng `AggregateOffer`.

## Skeleton & Blur Placeholder (Đã triển khai)

Thành phần liên quan:

- `src/components/BlurImage.tsx`: wrapper cho `next/image` với `placeholder="blur"` + `blurDataURL` tĩnh (`BLUR_PLACEHOLDER`).
- `src/lib/placeholder.ts`: chứa base64 PNG 1x1 làm mờ.
- `src/components/ProductImage.tsx`: thêm fallback 404 + blur.
- `src/components/SkeletonProductCard.tsx`: khung thẻ sản phẩm skeleton (pulse).
- `app/loading.tsx`: skeleton grid cho trang root / list.
- `app/product/[slug]/loading.tsx`: skeleton chi tiết sản phẩm.

Mở rộng tương lai:

- Tạo blur động từ ảnh thật (lấy qua edge function / LQIP / plaiceholder).
- Dùng `priority` cho hero image đầu trang.
- Prefetch bằng `IntersectionObserver` cho viewport sắp xuất hiện (sau này nếu có pagination).

## Thiết Lập Alias Import

Thêm vào `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": { "@/*": ["*"] }
  }
}
```

Sau đó đổi import: `import { products } from '@/lib/data';`

## Persist Giỏ Hàng (Đã triển khai)

Key: `cart:v1` (version hiện tại 2 — thêm coupon; variant thêm trường `variantId` vẫn backward compatible).

Lưu trữ:

```jsonc
{
  "items": [{ "productId": "p-1", "quantity": 2, "variantId": "sz-40" }],
  "coupon": { "code": "SALE10", "kind": "percent", "value": 10, "minSubtotal": 500000 },
  "version": 2,
}
```

Actions chính: `ADD`, `SET_QTY`, `REMOVE`, `CLEAR`, `APPLY_COUPON`, `REMOVE_COUPON`, `REPLACE`.

Tính toán dẫn xuất: `subtotal`, `discountAmount`, `shippingFee`, `total`.

## Trang Giỏ Hàng & Cart Drawer (Đã triển khai)

Hiển thị:

- Danh sách sản phẩm với biến thể (nếu có) + ảnh + đơn giá đã tính variant
- Điều chỉnh số lượng (floor = 1), xoá từng dòng, xoá toàn bộ
- Mã giảm giá (validate điều kiện minSubtotal) + hiển thị giảm giá
- Phí ship (0 hoặc 30.000 dựa trên tổng sau giảm ≥ 1.000.000)
- Tổng tiền = subtotal - discount + shipping

Logic giá:

1. Bắt đầu từ `salePrice` nếu < `price` else `price`
2. Nếu variant có `overridePrice` → dùng trực tiếp
3. Else nếu variant có `priceDiff` → cộng chênh lệch
4. Nhân số lượng → lineTotal
5. Cộng toàn bộ lineTotal → subtotal
6. Áp coupon (percent hoặc fixed, nếu đủ điều kiện) → discount
7. Ship rule → shippingFee
8. Tính `total`

Coupon mẫu:
| Code | Loại | Giá trị | Điều kiện |
|------|------|---------|-----------|
| SALE10 | percent | 10% | ≥ 500.000 |
| FREESHIP | fixed | 30.000 | ≥ 300.000 |
| VIP50K | fixed | 50.000 | ≥ 800.000 |

Ví dụ áp percent: discount = floor(subtotal \* value / 100).

## Tích Hợp Backend / CMS

| Nhu cầu                       | Giải pháp nhanh                 | Ghi chú                        |
| ----------------------------- | ------------------------------- | ------------------------------ |
| Sửa sản phẩm không deploy lại | Sanity / Strapi                 | Sanity nhanh cho content + ảnh |
| Quản lý kho & đơn hàng        | Medusa (self-host)              | Cần DB + Redis                 |
| Thanh toán VN                 | Tích hợp PayOS / ZaloPay / Momo | Tạo route API riêng            |

## Roadmap Gợi Ý (Cập nhật)

1. Multi-currency / i18n
2. Pagination / infinite scroll
3. CMS / Payment integration
4. Reviews / rating mock
5. Testing & CI
6. Bundle & performance optimizations
7. Sitemap.xml + robots.txt + breadcrumbs

## Testing (Đã khởi tạo)

Stack: Vitest + jsdom + Testing Library.

Chạy toàn bộ test:

```bash
npm test
```

Cấu hình: `vitest.config.ts` (environment jsdom, globals bật). File setup: `vitest.setup.ts` load `@testing-library/jest-dom`.

Vị trí test: đặt cạnh logic trong thư mục `__tests__` (ví dụ: `src/context/__tests__/cartCore.test.ts`).

Phạm vi hiện tại:

- Unit test cho `cartCore` (reducer + pricing pipeline + coupon + shipping rule)
- Edge cases: clamp số lượng >= 1, discount không vượt subtotal, total không âm

Định hướng mở rộng:

- Test component: `CartDrawer`, `SearchModal` (keyboard navigation, recent searches)
- Snapshot JSON-LD sản phẩm & breadcrumb
- Kiểm tra multi-currency hiển thị format đúng khi đổi context
- Mock IntersectionObserver để test infinite scroll logic
- Thiết lập GitHub Actions CI (node 18/20) chạy `npm ci && npm test && npm run build`

Mẹo viết test thuần logic:

1. Tách business logic ra file thuần (`cartCore.ts`) không import React → test nhanh, không cần render.
2. Dùng factory nhỏ `baseState()` tránh lặp.
3. Kiểm tra giá trị dẫn xuất (subtotal, discount, shipping, total) thay vì nội bộ từng bước.

Ví dụ (rút gọn) kiểm tra coupon percent:

```ts
const state = { items: [{ productId: 'p-1', quantity: 1 }], coupon: COUPONS[0] };
const totals = computeTotals(state, products as any);
expect(totals.discountAmount).toBeGreaterThan(0);
```

## Coverage & CI (Đã cấu hình)

## 9. Triển Khai & Quan Sát

### Healthcheck

Route: `GET /api/health`

Trả về ví dụ:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "buildTime": "2025-09-29T12:34:56.000Z",
  "timestamp": "2025-09-29T12:40:00.000Z"
}
```

Bạn có thể set biến môi trường build (ví dụ trong CI):

```bash
APP_VERSION=0.1.1 BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ) next build
```

### Web Vitals

Khi flag bật (`NEXT_PUBLIC_FF_WEB_VITALS` khác '0'), client sẽ đăng ký `CLS, LCP, FID, INP, TTFB` qua `web-vitals` và POST tới `/api/analytics`.

Mã nguồn:

- Client init: `src/lib/webVitalsClient.ts`
- Endpoint: `src/app/api/analytics/route.ts` (mock – chỉ `console.log` ở dev)

Payload ví dụ:

```json
{ "metric": "LCP", "value": 1320.45, "id": "v2-1234", "label": "good" }
```

Triển khai thực tế có thể forward sang: Datadog, New Relic, Sentry Performance hoặc BigQuery.

### Feature Flags

File: `src/config/features.ts`

| Flag                  | Biến môi trường                  | Mặc định | Ghi chú       |
| --------------------- | -------------------------------- | -------- | ------------- |
| enableRecentlyViewed  | `NEXT_PUBLIC_FF_RECENTLY_VIEWED` | true     | Tắt nếu = '0' |
| enableRelatedProducts | `NEXT_PUBLIC_FF_RELATED`         | true     |               |
| enableProductReviews  | `NEXT_PUBLIC_FF_REVIEWS`         | true     |               |
| enableSentry          | `NEXT_PUBLIC_FF_SENTRY`          | false    | Bật nếu = '1' |
| enableWebVitals       | `NEXT_PUBLIC_FF_WEB_VITALS`      | true     | Tắt nếu = '0' |

Helper: `isEnabled('enableWebVitals')`.

### Sentry (Skeleton – tùy chọn)

Đã thêm các file:

```
sentry.client.config.ts
sentry.server.config.ts
```

Chưa cài `@sentry/nextjs` để tránh tăng bundle khi chưa cần. Bật bằng cách:

```bash
npm install @sentry/nextjs
NEXT_PUBLIC_FF_SENTRY=1 NEXT_PUBLIC_SENTRY_DSN=... SENTRY_DSN=... next build
```

Sau đó mở rộng:

```ts
// sentry.client.config.ts
Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, tracesSampleRate: 0.2 });
```

### Mở Rộng Quan Sát

- Thêm tracing server (middleware đo thời gian render, ghi log JSON).
- Gửi vitals + errors tới một queue (Kafka / Redis Stream) để phân tích offline.
- Tự động so sánh bundle size (job preview-size hiện đã có) theo PR base branch.
- Alert nếu LCP > 2.5s hoặc INP > 200ms trung bình 5 mẫu đầu.

### Ghi chú bảo mật

- Endpoint `/api/analytics` hiện không có auth – khi deploy sản phẩm thực tế nên thêm rate limit / secret key / turn off trên production nếu không dùng.
- Không log PII trong web vitals.

Badge (thay OWNER/REPO sau khi push):
`![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)`

Chạy test với coverage:

```bash
npm run test:coverage
```

Report tạo trong thư mục `coverage/` (HTML mở `coverage/index.html`).

Phạm vi coverage đã giới hạn lại chỉ đo `src/**/*.{ts,tsx}` và exclude `.next/**` + file helper tĩnh để % phản ánh đúng hơn.
Tiếp tục tăng coverage bằng cách viết test cho các component chưa test: `CartDrawer`, `WishlistButton`, `Header`, `Footer`, `InfiniteCategory`.

GitHub Actions workflow: `.github/workflows/ci.yml`
Chạy các bước:

1. Lint (`next lint`)
2. Test (vitest + coverage)
3. Build sản phẩm (`next build`)

Muốn enforce ngưỡng coverage: bản Vitest 1.6.0 chưa dùng object threshold trực tiếp trong config như bản mới; có thể:

- Nâng cấp Vitest + plugin coverage đồng bộ phiên bản
- Hoặc script đọc `coverage/coverage-final.json` và fail nếu < mức yêu cầu (custom script Node nhỏ)

Ví dụ exclude bổ sung (cập nhật `vitest.config.ts`):

```ts
coverage: {
  provider: 'v8',
  reporter: ['text','html','lcov'],
  exclude: [
    'src/**/__tests__/**',
    'src/lib/seo.ts', // nếu muốn bỏ qua logic trình bày
    '.next/**'
  ]
}
```

### Kế hoạch tăng Coverage đề xuất

| Ưu tiên | Mục                    | Lý do                               |
| ------- | ---------------------- | ----------------------------------- |
| Cao     | CartDrawer interaction | Core UX checkout                    |
| Cao     | WishlistContext        | Persist & toggle logic              |
| Trung   | InfiniteCategory       | IntersectionObserver fallback logic |
| Trung   | SEO helpers            | Bảo đảm JSON-LD đúng schema         |
| Thấp    | Layout/Footer static   | Ít rủi ro                           |

Script gợi ý custom threshold (tạo file `scripts/check-coverage.mjs`):

```js
import fs from 'fs';
const data = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
const { statements } = data.total;
const MIN = 40; // ví dụ
if (statements.pct < MIN) {
  console.error(`Coverage statements ${statements.pct}% < MIN ${MIN}%`);
  process.exit(1);
}
```

Sau đó thêm vào workflow sau bước test.

## Khắc Phục PATH Node (Ghi chú)

Nếu gặp lại lỗi PATH với `node`, thêm alias vào profile PowerShell:

```powershell
notepad $PROFILE
Set-Alias node "C:\Program Files\nodejs\node.exe"
Set-Alias npm  "C:\Program Files\nodejs\npm.cmd"
```

Lưu, mở shell mới.

## License

Dùng tự do cho học tập / MVP.

## Đưa Lên GitHub (Repository Setup)

Các bước (đã thực hiện nếu bạn đang đọc trên GitHub, ghi lại để tham khảo):

```powershell
# 1. Khởi tạo
git init

# 2. Thêm toàn bộ & commit đầu tiên
git add .
git commit -m "chore: initial commit (Next.js storefront baseline)"

# 3. Đặt nhánh chính (nếu chưa là main)
git branch -M main

# 4. Thêm remote
git remote add origin https://github.com/hotriluan/vuki.git

# 5. Push
git push -u origin main
```

Sau push:

- Vào tab Actions: kiểm tra workflow CI đã chạy thành công.
- Badge Codecov hiển thị sau run đầu tiên có báo cáo coverage.
- Có thể bật branch protection: yêu cầu CI pass trước khi merge.

### Gợi Ý Quy Ước Commit

Sử dụng conventional commits:

- feat: chức năng mới
- fix: sửa lỗi
- chore: việc phụ trợ (config, build)
- refactor: thay đổi code không đổi behavior
- test: bổ sung / sửa test
- docs: tài liệu

CI sẽ kiểm tra commit messages trên Pull Request (job commitlint). Nếu cần kiểm tra cục bộ:

```bash
npx commitlint --from=HEAD~1 --to=HEAD
```

Hoặc cài husky hook (tùy chọn) để pre-commit / commit-msg.

### Dark Mode

Có `ThemeContext` lưu giá trị: `light | dark | system`. Toggle trong `Header` (🌙 / ☀️). Lưu ở `localStorage:theme`. Khi chọn `system` sẽ tự động theo `prefers-color-scheme`.

Tailwind bật `darkMode: 'class'` và lớp `dark` gắn vào `<html>`. Một số utility surface thêm trong `globals.css`.

### Lọc Danh Mục (Category Filters)

Trang `/category/[slug]` có form client-side:

- Sort: `newest | price-asc | price-desc`
- Min / Max price: cập nhật qua query param (`?sort=price-asc&min=500000&max=1500000`)
- Size filter: nhiều size cùng lúc (`sizes=sz-39,sz-41`) — nút size toggle trạng thái, gửi lên URL (giúp share link)
  Thao tác thay đổi sử dụng `router.replace` (shallow) để không reset scroll & tránh full reload.

Logic xử lý filter được gom vào `src/lib/filter.ts` (giữ thuần để dễ test / tái sử dụng). Size filter lọc theo variant id (không hiển thị sản phẩm nếu không có ít nhất một variant thuộc tập size chọn).

Mở rộng gợi ý:

- Thêm hiển thị count còn hàng bên cạnh size.
- Disable size hết hàng (stock=0) với tooltip.
- Bật sync state → URL debounce (khi nhiều input sau này).

### Recently Viewed (Đã triển khai)

File logic: `src/lib/recentlyViewed.ts`
Component: `src/components/RecentlyViewed.tsx`

Key localStorage: `recently-viewed:v1`
Đặc điểm:

- LRU tối đa 8 mục
- Không duplicate (đẩy lên đầu nếu xem lại)
- Ghi nhận qua `requestIdleCallback` hoặc fallback `setTimeout` để tránh chặn render đầu

### Related Products (Đã triển khai)

File logic: `src/lib/related.ts`
Component: `src/components/RelatedProducts.tsx`

Chiến lược chọn:

1. Lấy sản phẩm khác cùng ít nhất 1 category với sản phẩm gốc, sort theo `createdAt` mới nhất.
2. Nếu chưa đủ `limit` (mặc định 4) → bổ sung sản phẩm khác bất kỳ (tránh trùng & tránh chính nó) đến đủ.

Mở rộng tương lai:

- Chấm điểm dựa trên số category trùng + số lần xem (advanced personalization)
- Thêm fallback khi dataset nhỏ: ẩn hoàn toàn block nếu < 2 sản phẩm.

### Reviews & Aggregate Rating (Mock + User Submission)

Logic chính:

- Mock reviews + helper: `src/lib/reviews.ts`
- User reviews lưu localStorage key `user-reviews:v1` (merge vào mock, sort newest first)
- Component UI: `src/components/ProductReviews.tsx`
- Aggregate tính lại realtime sau mỗi submit (client state)
- JSON-LD enrich chỉ dùng mock ban đầu (user review không tác động SSR SEO)

Form submission:

- Mở bằng nút "Viết đánh giá"
- Input: Tên (required), Rating (select 1–5), Nhận xét (>= 8 ký tự)
- Submit thêm review (prepend), reset form, đóng form
- Giới hạn lưu tối đa 50 user reviews

Tương lai có thể thêm:

- Limit 1 review/user
- Sort: highest / lowest rating
- Highlight pros/cons parsing

Ví dụ snippet JSON-LD (mock aggregate):

```json
{
  "@type": "Product",
  "name": "Urban Runner White",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.0",
    "reviewCount": 3
  }
}
```

### CI Matrix Node Versions

Workflow `ci.yml` chạy song song trên Node 18 và 20 để phát hiện sớm khác biệt môi trường (đặc biệt thay đổi engine / deprecation).

## Secrets & Biến Môi Trường

Không commit file `.env` (đã ignore). Tạo file mẫu `/.env.example` nếu thêm biến mới.

Biến đề xuất:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
# FUTURE_API_BASE=https://api.example.com
```

### Codecov Token

- Public repo: có thể KHÔNG cần token (Codecov dùng upload không token).
- Private repo: tạo token trong Codecov → Settings → Repository → Copy token.
- Thêm vào GitHub: Settings → Secrets and variables → Actions → New repository secret:
  - Name: CODECOV_TOKEN
  - Value: <token>

Workflow sẽ tự động sử dụng (nếu script upload có tham chiếu biến env). Đảm bảo không echo token trong logs.

### An toàn thêm

- Không commit dữ liệu người dùng / API keys.
- Nếu lỡ commit `.env`: xoá file rồi `git commit --amend` (trước push) hoặc dùng `git filter-repo` / BFG để gỡ lịch sử (sau push public).

## CI Tối Ưu Đề Xuất (Mở Rộng)

- Thêm job kiểm tra kích thước bundle: chạy `npm run analyze` rồi dùng script parse `.next/analyze/client.html` (regex) để fail nếu vượt ngưỡng.
- Thêm badge Lighthouse (dùng GitHub Action chạy headless Chrome).
- Matrix Node versions: 18.x và 20.x để sớm phát hiện khác biệt.

## Phần Bảo Mật & Mở Rộng Tiềm Năng

- Khi thêm auth: luôn tách secret JWT/SESSION_KEY vào `Actions Secrets`.
- Dùng `NEXT_PUBLIC_` prefix chỉ cho biến an toàn public.
- Thêm kiểm tra `process.env.NODE_ENV !== 'production'` trước khi log debug nặng.

### Bổ sung mới (Pricing Breakdown, Countdown, Debounce, Auto Province, i18n)

Các nâng cấp bổ sung gần đây:

- Shared `PricingBreakdown` component gom hiển thị `subtotal / discount / shipping / VAT / total` dùng chung giữa CartPage & CartDrawer.
- Coupon expiry countdown (<24h): hiển thị đồng hồ `HH:MM:SS` cập nhật mỗi giây; hết hạn realtime hiển thị trạng thái.
- Debounced checkout persistence: lưu form mini checkout vào localStorage sau 300ms idle thay vì mỗi ký tự.
- Auto province detection: Blur ô địa chỉ sẽ cố gắng suy ra tỉnh (HCM, Hà Nội, Đà Nẵng) từ segment cuối của chuỗi nếu user chưa chọn.
- I18n skeleton (vi/en): `LanguageContext` + hàm `t(key)` áp dụng cho label giá, form, coupon, trạng thái. Persist `lang:v1` & toggle nhanh trong CartPage / CartDrawer.
- Tests mới: PricingBreakdown render, i18n toggle đổi “Giỏ hàng” ↔ “Cart”, auto detect province, countdown coupon trong 24h, đảm bảo total vẫn tính đúng sau refactor.

Lợi ích:

1. Giảm lặp mã & chuẩn hoá layout pricing.
2. Cải thiện UX (urgency countdown, auto province, thông báo rõ ràng đa ngôn ngữ cơ bản).
3. Hiệu năng tốt hơn (debounce writes localStorage, countdown chỉ kích hoạt khi cần <24h & có expiresAt).
4. Dễ mở rộng i18n (có thể tách dictionary JSON, thêm plural rules sau này).

Hướng mở rộng tương lai:

- Thêm full danh sách 63 tỉnh + fuzzy match.
- Đồng bộ countdown hết hạn tự động gỡ coupon (thay vì chờ reload/apply lại).
- Tooltips giải thích dòng thuế & phí ship trong PricingBreakdown.
- Namespace i18n: `cart`, `common`, lazy load JSON theo locale.
- Tự động detect ngôn ngữ từ `navigator.language` lần đầu.

## 5. Performance & Bundle (Mới)

| Hạng mục                         | Trạng thái      | Chi tiết triển khai                                                                                                                                                                                         |
| -------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Split code theo route chuyên sâu | ĐÃ LÀM          | `ProductReviews`, `RelatedProducts`, `RecentlyViewed` chuyển sang `next/dynamic` với fallback, tách khỏi initial product bundle. Reviews & RecentlyViewed tắt SSR để tránh hydrate không cần thiết ban đầu. |
| Prefetch/SSG sản phẩm & danh mục | ĐÃ LÀM          | Export `generateStaticParams` + `revalidate` ở `app/product/[slug]` (3600s) và `app/category/[slug]` (1800s). Giúp ISR thay vì full SSR runtime.                                                            |
| Edge middleware/API cache        | ĐÃ LÀM (cơ bản) | Route `GET /api/products` (runtime edge) trả JSON sản phẩm kèm header `cache-control: public, s-maxage=300, stale-while-revalidate=3600`. Chuẩn bị nền tảng nếu chuyển dữ liệu sang fetch động.             |
| Thêm compression                 | GHI CHÚ         | Vercel auto Brotli/Gzip. Nếu self-host: thêm Fastify `@fastify/compress` hoặc Nginx `gzip on; brotli_static on;`. Chưa cần code thay đổi.                                                                   |
| Lazy hydration secondary UI      | ĐANG MỞ RỘNG    | Suspense fallback nhẹ cho khối reviews/related/recently giúp FCP nhanh hơn.                                                                                                                                 |

### Giải thích lựa chọn

- Dynamic import giúp giảm thời gian TTFB + JS initial parse cho trang product: người dùng thấy ảnh + thông tin chính nhanh hơn, các block nặng (reviews) tải sau.
- ISR (`revalidate`) giữ SEO ổn định nhưng vẫn có thể cập nhật dữ liệu mock trong tương lai mà không rebuild toàn site.
- Edge API route tạo precedent: Khi chuyển data sang DB, có thể áp dụng cache tầng edge và stale-while-revalidate để làm tươi nền.

### Mở rộng tiềm năng tiếp theo

1. Tạo `route segment config` bật `preferredRegion` (nếu Vercel) để kéo product page gần user.
2. Dùng `next/headers` + `draftMode` cho preview không cache.
3. Prefetch thông minh: sử dụng `onMouseEnter` prefetch dynamic chunk reviews khi user hover anchor tới section.
4. Sử dụng `size-limit` hoặc `bundlesize` CI để fail build khi vượt threshold (ví dụ mỗi page < 180KB gzip initial JS).
5. Áp dụng Partial Hydration / RSC hoá nhiều component tĩnh (Price, ProductCard container) – giữ client logic nhỏ (AddToCartButton).
6. Kiểm tra tree-shaking: đảm bảo không import toàn bộ thư viện (Fuse.js đã chỉ import default tối ưu). Nếu thêm date lib → chọn `date-fns` thay moment.

### Kiểm tra sau tối ưu

Chạy `ANALYZE=1 npm run build` và so sánh trước/sau:

- Giảm kích thước bundle trang `/product/[slug]` (JS initial) do 3 block tách ra.
- Time-to-interaction phần chính không chờ tải reviews.

### Self-host Compression Ghi chú

Fastify server (pseudo):

```ts
import compress from '@fastify/compress';
app.register(compress, { global: true, encodings: ['br', 'gzip'] });
```

Nginx snippet:

```nginx
gzip on;
gzip_types text/css application/javascript application/json image/svg+xml;
gzip_min_length 1024;
```

### Theo dõi

- Thêm script Lighthouse CI để đo lường FCP/LCP sau khi tách dynamic.
- Ghi lại baseline trong README (sẽ cập nhật khi có số liệu thực tế).

## 6. Search Nâng Cao (Mới)

## 7. Testing & Chất Lượng

Mục tiêu nâng chuẩn chất lượng code:

- SearchModal: Đã bổ sung test điều hướng bàn phím (Arrow, Home, End, Escape), highlight segments.
- CartDrawer: Test flow coupon (hợp lệ, không hợp lệ, huỷ bỏ).
- Wishlist: Test tránh duplicate + persistence vào localStorage sau rehydrate.
- SEO JSON-LD: Snapshot + assert field bắt buộc (context, type, offers...).
- Layout/Footer: Smoke test render.
- Hiệu năng Search Index: Đo thời gian `ensureIndexLoad()` < 120ms với mock fetch.

### Gợi ý mở rộng

- Mutation Testing: Có thể tích hợp Stryker hoặc `vitest --mutation` (khi feature stable) để đo mutation score. Bước khởi đầu:

  1. Cài: `npm i -D @stryker-mutator/core @stryker-mutator/typescript-checker`.
  2. Tạo `stryker.conf.json` tối giản:
     ```json
     {
       "mutate": ["src/**/*.{ts,tsx}"],
       "testRunner": "vitest",
       "coverageAnalysis": "off"
     }
     ```
  3. Chạy: `npx stryker run`.
  4. Thiết lập threshold (ví dụ) trong config: `"thresholds": { "high": 80, "low": 60, "break": 50 }`.

- Tracer hiệu năng nâng cao: Bọc thêm `performance.mark()` quanh các đoạn build Fuse phức tạp, hoặc dùng Web Vitals khi lên production.

Các cải tiến vừa bổ sung cho trải nghiệm tìm kiếm:

| Hạng mục             | Trạng thái  | Ghi chú                                                                                                         |
| -------------------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| Debounce input       | ĐÃ CẬP NHẬT | Thời gian debounce tăng 150→220ms để giảm số lần xây results khi người gõ nhanh.                                |
| Lazy load index JSON | ĐÃ LÀM      | File `public/search-index.json` (chỉ trường nhỏ: id, slug, name, description, featured) fetch lần đầu mở modal. |
| Loading state index  | ĐÃ LÀM      | Hiển thị “Đang tải index…” (animate-pulse) trước khi Fuse sẵn sàng.                                             |
| Fuzzy slug weight    | ĐÃ LÀM      | Tăng weight slug 0.1→0.20, threshold 0.38→0.42, distance 120 để tolerant sai chính tả / thiếu ký tự.            |
| No results fallback  | ĐÃ LÀM      | Thay “No results” bằng gợi ý top featured (tối đa 3) giúp giữ user trong flow.                                  |
| Externalize index    | ĐÃ LÀM      | Giúp tách data khỏi JS bundle; dễ chuyển sang prebuild/bulk fetch sau này.                                      |

### Cấu trúc index

`public/search-index.json` – ví dụ:

```json
[
  {
    "id": "p-1",
    "slug": "urban-runner-white",
    "name": "Urban Runner White",
    "description": "Lightweight everyday sneaker...",
    "featured": true
  }
]
```

Có thể regenerate bằng script build riêng (chưa thêm) khi sản phẩm động.

### Fuse config mới

```ts
keys: [
  { name: 'name', weight: 0.55 },
  { name: 'description', weight: 0.25 },
  { name: 'slug', weight: 0.20 }
],
threshold: 0.42,
distance: 120,
ignoreLocation: true,
includeMatches: true
```

### UI States mới

1. Loading: Hiện khi index hoặc Fuse đang load lần đầu.
2. No results: Render featured recommendations.
3. Recent searches: Không đổi (xuất hiện khi query rỗng và có lịch sử).

### Test cập nhật

- Điều chỉnh thời gian giả lập debounce 220ms.
- Thêm test fallback: query “zzzzz” → nhận “No results – gợi ý nổi bật” + links.

### Hướng mở rộng tiếp

1. Prefetch index khi người dùng focus vào input header (anticipatory fetch).
2. Thêm scoring cho “featured” (boost) hoặc popularity count.
3. Chunk index lớn (shard) nếu > vài nghìn sản phẩm.
4. Streaming search: hiển thị kết quả incremental khi dataset lớn (Web Worker).
5. Synonym map (ví dụ: “runner” ~ “sneaker”).
6. Fallback accent-insensitive matching (normalize dấu tiếng Việt). Hiện rely vào lowercase base.

### Tác động hiệu năng

- Giảm kích thước bundle vì không bundle full `products` vào Fuse build client ban đầu.
- Index fetch dùng `cache: force-cache` → browser có thể reuse cho các lần mở sau.

---

## 🔐 Auth & Admin (NextAuth + Prisma)

Hệ thống đăng nhập đã tích hợp `next-auth` (Credentials Provider) + Prisma `User` model mở rộng có `role` (enum: `USER | ADMIN`).

### Schema mở rộng

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String
  role         Role     @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  orders       Order[]
  sessions     Session[]
}

enum Role {
  USER
  ADMIN
}
```

Nếu thêm `role` sau khi DB đã tồn tại: chạy `npx prisma migrate dev --name add-user-role`.

### Cấu hình NextAuth

File: `src/app/api/auth/[...nextauth]/route.ts` dùng Credentials provider:

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
// authorize: kiểm tra email + bcrypt.compare(passwordHash)
// callbacks.jwt: token.role
// callbacks.session: session.user.role
```

Biến môi trường tối thiểu:

```
NEXTAUTH_SECRET=... # JWT sign
```

### Seed admin user

Script: `scripts/seed-admin.mjs` (idempotent upsert):

```bash
node scripts/seed-admin.mjs
```

Tùy chỉnh qua ENV: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.

Tạo secret ngẫu nhiên:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Middleware bảo vệ /admin

File: `src/middleware.ts` – dùng `getToken` từ `next-auth/jwt` kiểm tra `token.role === 'ADMIN'`.
Nếu không đạt → redirect `/auth/login?from=/admin/...`.

### Trang Login

`/auth/login` form POST credentials đến NextAuth. Nếu đang đăng nhập → redirect `/admin`.

### Admin Dashboard & CRUD

| Route                       | Mục đích           |
| --------------------------- | ------------------ |
| `/admin`                    | Tổng quan          |
| `/admin/products`           | Danh sách sản phẩm |
| `/admin/products/create`    | Tạo mới            |
| `/admin/products/[id]/edit` | Chỉnh sửa          |

Create/Edit dùng form POST tới các API route:

- POST `/api/admin/products/create`
- POST `/api/admin/products/[id]/edit`

### Di chuyển dữ liệu sản phẩm JSON → DB

Script: `scripts/migrate-products-to-db.mjs` đọc `src/lib/products.json` và upsert vào bảng `Product` + join `ProductCategory` + `ProductVariant`.

```bash
node scripts/migrate-products-to-db.mjs
```

Sau khi xác nhận dữ liệu đã tồn tại hoàn toàn trong DB, module `src/lib/data.ts` đã refactor sang Prisma nên có thể xoá file JSON nếu không cần giữ làm tham chiếu.

### Hàm dữ liệu hiện tại

| Hàm                        | Chức năng                                    |
| -------------------------- | -------------------------------------------- |
| `getProducts()`            | Trả về list sản phẩm + categories + variants |
| `findProductBySlug()`      | Lấy một sản phẩm theo slug                   |
| `productsByCategorySlug()` | Lọc sản phẩm theo slug category              |
| `getCategories()`          | Danh sách category                           |

### Mở rộng đề xuất

1. Thêm trang quản lý category (`/admin/categories`).
2. Xoá mềm sản phẩm (`deletedAt` + filter).
3. Pagination server-side (skip/take) cho danh sách lớn.
4. Upload ảnh (S3/Cloudinary) thay vì URL.
5. OAuth providers (Google) + whitelist email cấp role ADMIN.
6. Quên mật khẩu: token reset (email OTP).

### Bảo mật

| Thành phần         | Hiện tại           | Gợi ý production                |
| ------------------ | ------------------ | ------------------------------- |
| Hash mật khẩu      | bcrypt (10 rounds) | Có thể tăng 12 nếu CPU cho phép |
| Chiến lược session | JWT stateless      | DB sessions nếu cần revoke      |
| Rate limit admin   | Chỉ rebuild index  | Thêm limit create/edit/delete   |
| CSRF               | Form credentials   | Giữ bật (NextAuth mặc định)     |
| Logging            | pino               | Không log password/email        |

---
