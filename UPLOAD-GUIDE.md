# Files cần upload lên Mat Bảo Premium Cloud Hosting

## 📁 Cấu trúc Upload
```
your-domain.com/
├── package.json
├── server.js
├── next.config.mjs
├── .env.local (tạo từ .env.production)
├── public/ (toàn bộ thư mục)
├── .next/ (sau khi build)
├── node_modules/ (sẽ install trên server)
├── src/ (toàn bộ thư mục)
├── prisma/ (toàn bộ thư mục)
├── scripts/ (toàn bộ thư mục)
└── các file config khác
```

## 🚀 Các bước thực hiện:

### Bước 1: Đăng nhập cPanel Mat Bảo
1. Truy cập: https://cp.matbao.net
2. Đăng nhập với thông tin hosting

### Bước 2: Tạo Database
1. Tìm "MySQL Databases"
2. Tạo database mới: `vuki_db`
3. Tạo user: `vuki_user`
4. Gán full quyền cho user

### Bước 3: Upload Files
**Phương án A: File Manager**
1. Mở "File Manager" trong cPanel
2. Vào thư mục `public_html`
3. Upload file ZIP chứa toàn bộ project
4. Extract file ZIP

**Phương án B: FTP/SFTP**
1. Sử dụng FileZilla hoặc WinSCP
2. Upload toàn bộ thư mục project

### Bước 4: Cấu hình Environment
1. Tạo file `.env.local` trong thư mục gốc:
```env
NODE_ENV=production
DATABASE_URL="mysql://vuki_user:password@localhost:3306/vuki_db"
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key-32-characters-min
```

### Bước 5: Cài đặt Dependencies
1. Mở "Terminal" trong cPanel
2. Chạy lệnh:
```bash
cd public_html
npm install --production
```

### Bước 6: Setup Database
```bash
npx prisma generate
npx prisma db push
npx prisma db seed (nếu có)
```

### Bước 7: Cấu hình Node.js App
1. Tìm "Node.js App" trong cPanel
2. Tạo app mới:
   - **Application Root**: `/public_html`
   - **Application URL**: yourdomain.com
   - **Application startup file**: `server.js`
   - **Node.js version**: 18.x

### Bước 8: Start Application
1. Trong Node.js App settings
2. Click "Restart" để khởi động
3. Kiểm tra logs nếu có lỗi

## 🔧 Troubleshooting

### Lỗi thường gặp:
1. **Database connection failed**
   - Kiểm tra DATABASE_URL trong .env.local
   - Đảm bảo database đã được tạo

2. **Module not found**
   - Chạy lại: `npm install`

3. **Permission denied**
   - Chmod 755 cho folders: `find . -type d -exec chmod 755 {} \;`
   - Chmod 644 cho files: `find . -type f -exec chmod 644 {} \;`

4. **Port already in use**
   - Thay đổi PORT trong server.js

### Kiểm tra logs:
```bash
# Xem logs ứng dụng
tail -f logs/app.log

# Xem error logs
tail -f logs/error.log
```

## ✅ Checklist trước khi upload:
- [ ] Build project thành công (`npm run build`)
- [ ] Có file server.js
- [ ] Có file .env.production mẫu
- [ ] Database schema ready (prisma/schema.prisma)
- [ ] Tất cả dependencies trong package.json

## 🎯 Sau khi upload thành công:
- Website sẽ chạy tại: https://yourdomain.com
- Admin panel: https://yourdomain.com/admin
- API endpoints: https://yourdomain.com/api/*