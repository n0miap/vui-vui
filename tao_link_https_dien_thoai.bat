@echo off
chcp 65001 >nul
title Tao Link HTTPS Cho Dien Thoai - EE Lab
echo ========================================================
echo   TAO LINK HTTPS DE DIEN THOAI KET NOI CAO ANH QUA LAPTOP
echo ========================================================
echo.
echo [1/2] Dang kiem tra cong cu Cloudflare Tunnel...
if not exist "%~dp0cloudflared.exe" (
    echo [i] Dang tai cloudflared.exe ve thu muc (chi tai 1 lan duy nhat, xin doi vai giay)...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%~dp0cloudflared.exe'"
)

if not exist "%~dp0cloudflared.exe" (
    echo [!] Khong the tai cloudflared.exe tu dong. Ban co the tai thu cong tai:
    echo     https://github.com/cloudflare/cloudflared/releases
    pause
    exit /b
)

echo.
echo [2/2] Dang tao duong truyen HTTPS toi cong 5000 cua Laptop...
echo --------------------------------------------------------
echo  HAY COPY LINK CO DANG https://...trycloudflare.com BEN DUOI
echo  DAN VAO PHAN 'Dia chi Server Pinout' TREN DIEN THOAI VA LUU!
echo --------------------------------------------------------
echo.
"%~dp0cloudflared.exe" tunnel --url http://localhost:5000
pause

