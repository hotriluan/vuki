# Hướng dẫn Deploy lên Mat Bảo Premium Cloud Hosting

## Thông tin hosting
- **Gói**: Premium Cloud Hosting - Cửa Hàng (Shop)
- **Hỗ trợ**: Node.js, MySQL/PostgreSQL, SSL
- **Control Panel**: cPanel hoặc DirectAdmin

## Bước 1: Chuẩn bị Files Upload

### 1.1 Build Production
```bash
npm run build
```

### 1.2 Files cần upload
- Toàn bộ project folder
- File package.json 
- File .env.local (tạo từ .env.example)
- Folder .next (sau khi build)

## Bước 2: Cấu hình Database

### 2.1 Tạo Database trên cPanel Mat Bảo
1. Đăng nhập cPanel
2. Tìm "MySQL Databases" 
3. Tạo database mới: `your_db_name`
4. Tạo user và gán quyền

### 2.2 Cập nhật .env.local
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# Next Auth (nếu có)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"

# Other environment variables
NODE_ENV=production
```

## Bước 3: Upload và Cài đặt

### 3.1 Upload qua File Manager hoặc FTP
- Upload toàn bộ project vào thư mục `public_html`
- Hoặc tạo subfolder: `public_html/vuki`

### 3.2 Cài đặt Dependencies qua Terminal
```bash
# Truy cập Terminal trong cPanel
cd public_html/vuki
npm install --production
```

### 3.3 Setup Database Schema
```bash
# Nếu dùng Prisma
npx prisma generate
npx prisma db push
```

## Bước 4: Cấu hình Node.js App

### 4.1 Tạo file app.js (Entry point)
```javascript
// app.js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

### 4.2 Cấu hình trong cPanel
1. Tìm "Node.js App" trong cPanel
2. Tạo application mới:
   - **Application Root**: `/public_html/vuki`
   - **Application URL**: `yourdomain.com` hoặc subdomain
   - **Application startup file**: `app.js`
   - **Node.js version**: 18.x hoặc mới nhất

## Bước 5: Domain và SSL

### 5.1 Cấu hình Domain
- Nếu dùng domain chính: trỏ về thư mục app
- Nếu dùng subdomain: tạo subdomain trong cPanel

### 5.2 Cài đặt SSL
- Sử dụng Let's Encrypt free SSL trong cPanel
- Hoặc upload SSL certificate riêng

## Bước 6: Monitoring và Logs

### 6.1 Kiểm tra logs
```bash
# Xem logs app
tail -f logs/app.log

# Xem error logs  
tail -f logs/error.log
```

### 6.2 Restart app
- Trong cPanel Node.js section
- Click "Restart" để restart application

## Troubleshooting

### Lỗi thường gặp:
1. **Port đã được sử dụng**: Thay đổi port trong app.js
2. **Database connection**: Kiểm tra DATABASE_URL
3. **File permissions**: Chmod 755 cho folders, 644 cho files
4. **Node modules**: Chạy lại `npm install`

### Optimization:
1. Enable gzip compression
2. Setup CDN cho static assets
3. Optimize images
4. Enable browser caching