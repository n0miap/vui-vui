@echo off
chcp 65001 >nul
title Tao Link HTTPS Cloudflare Cho Dien Thoai - EE Lab
echo ========================================================
echo   TAO LINK HTTPS DE DIEN THOAI KET NOI CAO ANH QUA LAPTOP
echo ========================================================
echo.

python -X utf8 "%~dp0tao_link_tunnel.py"

echo.
echo ========================================================
echo Nhan phim bat ky de dong cua so nay...
pause >nul
