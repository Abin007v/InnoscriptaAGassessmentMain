@echo off
echo 🔧 Checking Node.js installation...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo 🔧 Setting up environment files...
node setup-env.js

if %errorlevel% equ 0 (
    echo ✅ Setup completed successfully!
) else (
    echo ❌ Setup failed!
)

pause 