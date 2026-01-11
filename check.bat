@echo off
REM Frontend Code Quality Check (without auto-fix)

echo ========================================
echo  Frontend Code Quality Checks
echo ========================================
echo.

echo [1/3] Checking ESLint...
docker-compose exec frontend npm run lint
set LINT_RESULT=%ERRORLEVEL%
echo.

echo [2/3] Checking Prettier format...
docker-compose exec frontend npm run format:check
set FORMAT_RESULT=%ERRORLEVEL%
echo.

echo [3/3] Checking TypeScript types...
docker-compose exec frontend npm run type-check
set TYPE_RESULT=%ERRORLEVEL%
echo.

echo ========================================
echo  Results Summary:
echo ========================================
if %LINT_RESULT% EQU 0 (
    echo ✓ ESLint: PASSED
) else (
    echo ✗ ESLint: FAILED
)

if %FORMAT_RESULT% EQU 0 (
    echo ✓ Prettier: PASSED
) else (
    echo ✗ Prettier: FAILED
)

if %TYPE_RESULT% EQU 0 (
    echo ✓ TypeScript: PASSED
) else (
    echo ✗ TypeScript: FAILED
)
echo ========================================

if %LINT_RESULT% NEQ 0 (
    echo.
    echo To auto-fix linting issues, run: lint.bat
)

if %FORMAT_RESULT% NEQ 0 (
    echo.
    echo To auto-fix formatting issues, run: lint.bat
)

pause
