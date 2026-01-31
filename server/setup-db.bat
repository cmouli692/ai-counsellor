@echo off
REM Database Setup Script for AI Counsellor MVP (Windows)
REM Run this after PostgreSQL is installed and running

setlocal enabledelayedexpansion

REM Load environment variables from .env
for /f "tokens=1,2 delims==" %%A in (.env) do (
    set "%%A=%%B"
)

REM Set defaults if not in .env
if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=5432
if not defined DB_NAME set DB_NAME=ai_counsellor_dev
if not defined DB_USER set DB_USER=postgres

echo.
echo 🗄️  Setting up PostgreSQL database...
echo Database: %DB_NAME%
echo User: %DB_USER%
echo Host: %DB_HOST%:%DB_PORT%
echo.

REM Check if psql is in PATH
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: psql not found in PATH
    echo Please add PostgreSQL bin directory to your PATH
    echo Typically: C:\Program Files\PostgreSQL\15\bin
    pause
    exit /b 1
)

echo 📝 Creating database '%DB_NAME%'...
psql -h %DB_HOST% -U %DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | findstr /C:"1" >nul
if %ERRORLEVEL% NEQ 0 (
    echo Database does not exist, creating...
    psql -h %DB_HOST% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"
) else (
    echo Database already exists
)

echo ✅ Database created/exists
echo.

echo 🏗️  Loading schema...
psql -h %DB_HOST% -U %DB_USER% -d %DB_NAME% -f schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Schema loaded successfully!
    echo.
    echo 📊 Database is ready:
    echo    - 6 tables created
    echo    - 30 universities seeded
    echo    - Ready for application!
    echo.
) else (
    echo ❌ ERROR: Failed to load schema
    pause
    exit /b 1
)

pause
