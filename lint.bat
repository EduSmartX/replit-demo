@echo off
REM Frontend Code Quality Check & Fix Script

echo ========================================
echo  Frontend Code Quality Tools
echo ========================================
echo.

echo [1/3] Running ESLint auto-fix...
docker-compose exec frontend npm run lint:fix
if %ERRORLEVEL% NEQ 0 (
    echo ESLint found errors that couldn't be auto-fixed!
    echo Please check the output above.
    pause
    exit /b 1
)
echo ✓ ESLint passed
echo.

echo [2/3] Running Prettier format...
docker-compose exec frontend npm run format
if %ERRORLEVEL% NEQ 0 (
    echo Prettier formatting failed!
    pause
    exit /b 1
)
echo ✓ Prettier formatting completed
echo.

echo [3/3] Running TypeScript type check...
docker-compose exec frontend npm run type-check
if %ERRORLEVEL% NEQ 0 (
    echo TypeScript type errors found!
    echo Please fix the errors shown above.
    pause
    exit /b 1
)
echo ✓ Type check passed
echo.

echo ========================================
echo  All checks passed! ✓
echo  Your code is clean and ready to commit
echo ========================================
pause
