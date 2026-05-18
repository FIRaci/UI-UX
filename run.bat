@echo off
title MediCare AI - Dev Server
echo ===================================================
echo   KHOI DONG MEDICARE AI - DEVELOPMENT SERVER
echo ===================================================
echo [!] Da tu dong khac phuc loi duong dan co dau "&"
echo [!] Tu dong cap nhat giao dien khi code thay doi (Hot Reload)
echo ---------------------------------------------------
echo.

node "%~dp0node_modules\vite\bin\vite.js"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Gap loi khi khoi dong server. 
    echo Vui long chac chan ban da chay "npm install" truoc do.
    pause
)
