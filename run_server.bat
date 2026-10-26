@echo off
chcp 65001 >nul
title EE Lab Pinout Server
echo ========================================================
echo   KHOI DONG SERVER TIM ANH PINOUT CHO EE LAB INVENTORY
echo ========================================================
echo.
echo [1/2] Dang kiem tra va cai thu vien can thiet...
python -m pip install --quiet flask flask-cors duckduckgo_search
if %ERRORLEVEL% neq 0 (
    echo [!] Khong the goi python. Ban hay kiem tra xem may da cai Python chua nhe.
    pause
    exit /b
)
echo [2/2] Dang khoi chay server...
python pinout_server.py
pause

