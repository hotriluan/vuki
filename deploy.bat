@echo off
echo ================================
echo     VUKI DEPLOYMENT SCRIPT
echo    Mat Bao Premium Cloud Hosting  
echo ================================
echo.

echo [1/6] Building production...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/6] Creating deployment folder...
if exist "deploy" rmdir /s /q deploy
mkdir deploy

echo.
echo [3/6] Copying necessary files...
xcopy /E /I /Y "public" "deploy\public"
xcopy /E /I /Y ".next" "deploy\.next"
xcopy /E /I /Y "src" "deploy\src"
xcopy /E /I /Y "prisma" "deploy\prisma"
xcopy /E /I /Y "scripts" "deploy\scripts"

copy "package.json" "deploy\"
copy "server.js" "deploy\"
copy "next.config.mjs" "deploy\"
copy ".env.production" "deploy\.env.local"
copy "UPLOAD-GUIDE.md" "deploy\"
copy "MATBAO-DEPLOYMENT.md" "deploy\"

echo.
echo [4/6] Creating deployment instructions...
echo NODE_ENV=production > deploy\.env.local
echo # Update these values for your Mat Bao hosting: >> deploy\.env.local
echo DATABASE_URL="mysql://your_user:your_password@localhost:3306/your_database" >> deploy\.env.local
echo NEXTAUTH_URL=https://yourdomain.com >> deploy\.env.local
echo NEXTAUTH_SECRET=your-secret-key-minimum-32-characters >> deploy\.env.local

echo.
echo [5/6] Creating deployment package...
cd deploy
tar -czf ..\vuki-deployment.tar.gz *
cd ..

echo.
echo [6/6] Cleanup...
rmdir /s /q deploy

echo.
echo ================================
echo   DEPLOYMENT PACKAGE CREATED!
echo ================================
echo.
echo File created: vuki-deployment.tar.gz
echo.
echo Next steps:
echo 1. Upload vuki-deployment.tar.gz to your Mat Bao hosting
echo 2. Extract in public_html folder
echo 3. Follow instructions in UPLOAD-GUIDE.md
echo.
echo ================================
pause