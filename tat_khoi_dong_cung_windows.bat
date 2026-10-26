@echo off
chcp 65001 >nul
title Tat Khoi Dong Cung Windows - EE Lab Server
set "VBS_TARGET=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\ee_lab_pinout_server.vbs"

if exist "%VBS_TARGET%" (
    del "%VBS_TARGET%"
    echo [OK] Da tat tinh nang tu khoi dong cung Windows.
) else (
    echo [i] Server hien khong cai khoi dong cung Windows.
)
timeout /t 3 >nul

