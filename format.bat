@echo off
REM Quick format only

echo Running Prettier format...
docker-compose exec frontend npm run format
if %ERRORLEVEL% EQU 0 (
    echo ✓ Code formatted successfully!
) else (
    echo ✗ Formatting failed!
)
pause
