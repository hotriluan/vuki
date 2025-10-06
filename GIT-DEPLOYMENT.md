# Git Deployment Configuration for Mat Bao
# Đây là file hướng dẫn cấu hình Git deployment

## 🔧 Cấu hình trong cPanel Mat Bảo

### Bước 1: Tạo Git Repository
1. Đăng nhập cPanel Mat Bảo
2. Tìm **"Git Version Control"** hoặc **"Git™ Version Control"**
3. Click **"Create"** để tạo repository mới

### Bước 2: Cấu hình Repository
```
Repository Path: /public_html
Repository URL: https://github.com/hotriluan/vuki.git
Branch: main
```

### Bước 3: Cấu hình Deployment Hook
Trong phần **Deployment**, thêm:
```bash
#!/bin/bash
cd /home/username/public_html
chmod +x deploy.sh
./deploy.sh
```

## 🔑 Setup SSH Keys (Khuyên dùng)

### Tạo SSH Key trên server:
```bash
# Trong Terminal cPanel
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
cat ~/.ssh/id_rsa.pub
```

### Thêm vào GitHub:
1. Copy public key từ lệnh trên
2. Vào GitHub → Settings → SSH and GPG keys
3. Add SSH key mới

## 🌐 Environment Variables

Tạo file `.env.local` trên server:
```bash
# Trong Terminal cPanel
cd /home/username/public_html
nano .env.local
```

Nội dung file:
```env
NODE_ENV=production
DATABASE_URL="mysql://db_user:db_pass@localhost:3306/db_name"
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secret-key-32-chars-minimum
```

## 🔄 Auto Deployment Workflow

Khi bạn push code lên GitHub:
1. Git hook tự động pull latest code
2. Script deploy.sh chạy tự động
3. Dependencies được cài đặt
4. Database được update
5. Application được build và restart

## 📝 Commands hữu ích

### Manual deployment:
```bash
cd /home/username/public_html
git pull origin main
./deploy.sh
```

### Check status:
```bash
git status
git log --oneline -5
npm run build
```

### Restart app:
```bash
# Restart từ Node.js App panel trong cPanel
# Hoặc pm2 restart app (nếu dùng PM2)
```

## 🛠️ Troubleshooting

### Git không pull được:
- Kiểm tra SSH keys
- Kiểm tra repository URL
- Kiểm tra branch name

### Build failed:
- Kiểm tra Node.js version
- Kiểm tra .env.local
- Xem logs: `tail -f logs/error.log`

### Database errors:
- Kiểm tra DATABASE_URL
- Chạy: `npx prisma db push`
- Kiểm tra database connection

## 🎯 Benefits của Git Deployment:
- ✅ Auto deployment khi push code
- ✅ Version control đầy đủ
- ✅ Rollback dễ dàng
- ✅ Collaborative development
- ✅ Backup tự động