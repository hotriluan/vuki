# Menu System Test Guide

## 🚀 Hướng dẫn kiểm tra hệ thống Menu

### Các trang để test:

1. **Trang chính**: `/` hoặc `/test` - Trang test với tất cả components
2. **Trang Admin**: `/admin/menu` - Quản lý menu trong admin

### 📋 Danh sách components đã triển khai:

#### 1. Header Component (`/src/components/Header.tsx`)

- ✅ Responsive navigation với sticky header
- ✅ Integration với tất cả navigation components
- ✅ Mock data từ `/src/data/mockData.ts`

#### 2. MegaMenu Component (`/src/components/navigation/MegaMenu.tsx`)

- ✅ Desktop mega menu với featured products
- ✅ Categories grid với icons
- ✅ Brands showcase
- ✅ Newsletter signup section

#### 3. MobileMenu Component (`/src/components/navigation/MobileMenu.tsx`)

- ✅ Full-screen slide-out navigation
- ✅ Smooth animations
- ✅ Expandable menu sections
- ✅ User integration

#### 4. SearchBar Component (`/src/components/navigation/SearchBar.tsx`)

- ✅ Real-time autocomplete
- ✅ Product/Category/Brand suggestions
- ✅ Loading states và empty states

#### 5. CartDropdown Component (`/src/components/navigation/CartDropdown.tsx`)

- ✅ Shopping cart với quantity controls
- ✅ Price calculations
- ✅ Product image previews

#### 6. UserDropdown Component (`/src/components/navigation/UserDropdown.tsx`)

- ✅ User account management
- ✅ Profile information
- ✅ Order history access

#### 7. Admin Management (`/src/components/admin/MenuManagement.tsx`)

- ✅ Full CRUD operations cho menu items
- ✅ Drag & drop reordering
- ✅ Mega menu configuration
- ✅ Visibility toggles

#### 8. API Endpoints (`/src/app/api/`)

- ✅ `/api/menu` - Menu management APIs
- ✅ `/api/search/suggestions` - Search functionality

### 🧪 Cách test từng component:

#### Desktop (Màn hình lớn):

1. **Mega Menu**: Hover vào "Sneakers" hoặc "Boots" để xem mega menu
2. **Search**: Gõ "Nike", "Adidas", "Sneakers" để test autocomplete
3. **Cart**: Click icon 🛒 (có badge số 3) để xem cart dropdown
4. **User**: Click icon 👤 để xem user account menu
5. **Wishlist**: Click icon ❤️ (có badge số 2) để xem wishlist

#### Mobile (Màn hình nhỏ):

1. **Mobile Menu**: Click icon ☰ để mở hamburger menu
2. **Mobile Search**: Click icon 🔍 để mở search bar
3. **Expandable Sections**: Trong mobile menu, click vào arrow để expand "Sneakers"
4. **Touch Interactions**: Test tất cả touch gestures

#### Admin Panel:

1. Truy cập `/admin/menu`
2. Test CRUD operations:
   - ✅ Thêm menu item mới
   - ✅ Edit existing items
   - ✅ Delete items
   - ✅ Reorder bằng drag & drop
   - ✅ Toggle visibility
   - ✅ Configure mega menu

### 📊 Dữ liệu mẫu (`/src/data/mockData.ts`):

#### Products:

- Nike Air Max 270 React (2,890,000đ) - HOT
- Adidas Ultraboost 22 (3,200,000đ) - NEW
- Timberland 6-Inch Premium (4,500,000đ) - BESTSELLER
- Converse Chuck Taylor (1,890,000đ)
- Vans Old Skool (2,100,000đ)
- Dr. Martens 1460 (3,800,000đ)

#### Categories:

- Sneakers 👟 (156 products)
- Boots 🥾 (89 products)
- Sandals 👡 (67 products)
- Accessories 🎒 (234 products)

#### Brands:

- Nike, Adidas, Timberland, Converse, Vans, Dr. Martens

#### Cart Items (2 items):

- Nike Air Max 270 React (1x)
- Timberland 6-Inch Premium (2x)

#### User Data:

- Name: Nguyễn Văn An
- Email: nguyenvanan@example.com
- Orders: 2 đơn hàng
- Wishlist: 2 items

### 🔧 API Testing:

#### Menu API:

```bash
# Get all menu items
GET /api/menu

# Get specific menu item
GET /api/menu/1

# Create new menu item
POST /api/menu
{
  "name": "New Category",
  "href": "/category/new",
  "visible": true
}

# Update menu item
PUT /api/menu/1
{
  "name": "Updated Name",
  "href": "/category/updated"
}

# Delete menu item
DELETE /api/menu/1
```

#### Search API:

```bash
# Quick search
GET /api/search/suggestions?q=nike&limit=5

# Advanced search
POST /api/search/suggestions
{
  "query": "nike",
  "filters": {
    "type": ["product"],
    "priceMin": 1000000,
    "priceMax": 5000000
  },
  "sort": "price_asc",
  "limit": 10
}
```

### 💡 Test Cases để thử:

#### Functional Tests:

1. ✅ Mega menu hiển thị đúng khi hover
2. ✅ Mobile menu slide animation hoạt động
3. ✅ Search suggestions xuất hiện real-time
4. ✅ Cart dropdown cập nhật quantity
5. ✅ User dropdown hiển thị thông tin đúng
6. ✅ Admin CRUD operations hoạt động
7. ✅ Responsive design trên mọi device

#### Performance Tests:

1. ✅ Search debounce 300ms
2. ✅ Mega menu hover không lag
3. ✅ Mobile menu animation mượt mà
4. ✅ Image loading progressive

#### UX Tests:

1. ✅ Click outside để đóng dropdowns
2. ✅ ESC key để đóng modals
3. ✅ Loading states hiển thị đúng
4. ✅ Empty states có message phù hợp
5. ✅ Error handling graceful

### 🚀 Để chạy test:

```bash
# Start development server
npm run dev

# Open test pages
http://localhost:3000/test
http://localhost:3000/admin/menu

# Test API endpoints
curl http://localhost:3000/api/menu
curl "http://localhost:3000/api/search/suggestions?q=nike"
```

### 📱 Responsive Breakpoints:

- **Mobile**: < 768px (Hamburger menu)
- **Tablet**: 768px - 1024px (Simplified mega menu)
- **Desktop**: > 1024px (Full mega menu)

### 🎨 Design Features:

- ✅ Consistent color scheme (Black primary, Red accents)
- ✅ Smooth hover animations
- ✅ Loading spinners và skeletons
- ✅ Badge notifications
- ✅ Vietnamese currency formatting
- ✅ Professional admin interface

Tất cả components đã được tích hợp với dữ liệu mẫu và sẵn sàng để test!
