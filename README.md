# Shoe Store Starter

![CI](https://github.com/hotriluan/vuki/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/hotriluan/vuki/branch/main/graph/badge.svg)](https://codecov.io/gh/hotriluan/vuki)

> Badge đã trỏ tới repo thật. Nếu Codecov chưa hiển thị %, đảm bảo workflow chạy ít nhất một lần trên nhánh `main`.

Một boilerplate cửa hàng bán giày (demo) sử dụng Next.js 14 (App Router) + TypeScript + Tailwind CSS.

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
- Kết nối CMS (Sanity / Strapi) hoặc backend riêng
- Thanh toán (Stripe / PayOS / ZaloPay...) 
- Authentication (Clerk / NextAuth)
- Tìm kiếm (Algolia / Meilisearch)
- Internationalization (i18n)

## Triển khai (Deployment)

### Vercel (khuyến nghị)
1. Tạo repo GitHub và push mã nguồn.
2. Đăng nhập https://vercel.com → New Project → Import repo.
3. Framework: tự nhận Next.js. Build command mặc định: `next build`. Output: `.next`.
4. Environment variables (nếu có API sau này) thêm ở tab Settings → Environment Variables.
5. Deploy → Sau build thành công, test các route: `/`, `/product/...`, `/category/...`.

### Docker (tùy chọn)
```
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
# Chọn 1 trình quản lý gói, ví dụ pnpm:
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json .
EXPOSE 3000
CMD ["npm","start"]
```

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
```

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
  "items": [
    { "productId": "p-1", "quantity": 2, "variantId": "sz-40" }
  ],
  "coupon": { "code": "SALE10", "kind": "percent", "value": 10, "minSubtotal": 500000 },
  "version": 2
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

Ví dụ áp percent: discount = floor(subtotal * value / 100).

## Tích Hợp Backend / CMS
| Nhu cầu | Giải pháp nhanh | Ghi chú |
|---------|-----------------|--------|
| Sửa sản phẩm không deploy lại | Sanity / Strapi | Sanity nhanh cho content + ảnh |
| Quản lý kho & đơn hàng | Medusa (self-host) | Cần DB + Redis |
| Thanh toán VN | Tích hợp PayOS / ZaloPay / Momo | Tạo route API riêng |

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
| Ưu tiên | Mục | Lý do |
|---------|-----|-------|
| Cao | CartDrawer interaction | Core UX checkout |
| Cao | WishlistContext | Persist & toggle logic |
| Trung | InfiniteCategory | IntersectionObserver fallback logic |
| Trung | SEO helpers | Bảo đảm JSON-LD đúng schema |
| Thấp | Layout/Footer static | Ít rủi ro |

Script gợi ý custom threshold (tạo file `scripts/check-coverage.mjs`):
```js
import fs from 'fs';
const data = JSON.parse(fs.readFileSync('coverage/coverage-summary.json','utf8'));
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
