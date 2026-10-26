@echo off
chcp 65001 >nul
title Cai Dat Khoi Dong Cung Windows - EE Lab Server
echo ========================================================
echo   CAI DAT SERVER CHAY NGAM TU DONG KHI BAT MAY
echo ========================================================
echo.

set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "VBS_TARGET=%STARTUP_FOLDER%\ee_lab_pinout_server.vbs"
set "PYTHONW_BIN=pythonw"
if exist "%LOCALAPPDATA%\Python\pythoncore-3.14-64\pythonw.exe" (
    set "PYTHONW_BIN=%LOCALAPPDATA%\Python\pythoncore-3.14-64\pythonw.exe"
)

echo Dang tao file khoi dong tu dong trong thu muc Startup...
(
    echo Set WshShell = CreateObject^("WScript.Shell"^)
    echo WshShell.Run """%PYTHONW_BIN%"" ""%SERVER_SCRIPT%""", 0, False
) > "%VBS_TARGET%"

echo [OK] Da cai dat thanh cong!
echo Tu gio moi khi mo may tinh, Server se tu dong chay ngam.
echo Chi xuat hien icon vi mach nho o goc phai man hinh (canh dong ho).
echo.
echo Dang khoi dong server ngay bay gio...
wscript "%VBS_TARGET%"
echo [XONG] Server da khoi dong ngam!
timeout /t 3 >nul

