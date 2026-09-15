@echo off
title Pashu Suraksha - Livestock Health Surveillance
echo ========================================================
echo   Starting Pashu Suraksha System (Local Server)
echo ========================================================
echo.
echo Opening browser at http://127.0.0.1:5000 ...
start "" "http://127.0.0.1:5000"
echo.

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    py app.py
) else (
    "C:\Users\admin\AppData\Local\Python\pythoncore-3.14-64\python.exe" app.py
)
pause
