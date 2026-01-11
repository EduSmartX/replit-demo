# Frontend Code Quality - Docker Commands

## Quick Commands

### Lint your code
```bash
docker-compose exec frontend npm run lint
```

### Auto-fix linting issues
```bash
docker-compose exec frontend npm run lint:fix
```

### Format all files
```bash
docker-compose exec frontend npm run format
```

### Check types
```bash
docker-compose exec frontend npm run type-check
```

### Run all checks (lint + format + type-check)
```bash
docker-compose exec frontend npm run lint && docker-compose exec frontend npm run format:check && docker-compose exec frontend npm run type-check
```

## Setup Inside Container

### Initialize Husky (first time only)
```bash
docker-compose exec frontend npm run prepare
```

### Install dependencies (if package.json changed)
```bash
docker-compose exec frontend npm install
```

## Development Workflow

### 1. Start containers
```bash
docker-compose up -d
```

### 2. Before committing, run checks
```bash
docker-compose exec frontend npm run lint:fix
docker-compose exec frontend npm run format
```

### 3. Commit your changes
```bash
git add .
git commit -m "your message"
```

The pre-commit hook will automatically run lint-staged inside the container!

## VS Code Integration

### Option 1: Install Extensions (Recommended)
Install these extensions in VS Code:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)

The extensions will use the config files and auto-format on save!

### Option 2: Manual Format via Docker
If you don't want extensions, format manually:
```bash
docker-compose exec frontend npm run format
```

## Batch Scripts (Windows Helper)

### Create `lint.bat` in project root:
```bat
@echo off
docker-compose exec frontend npm run lint:fix
docker-compose exec frontend npm run format
echo Code quality checks completed!
```

### Create `check.bat` in project root:
```bat
@echo off
echo Running linting...
docker-compose exec frontend npm run lint
echo.
echo Checking format...
docker-compose exec frontend npm run format:check
echo.
echo Checking types...
docker-compose exec frontend npm run type-check
echo.
echo All checks completed!
```

## CI/CD Pipeline (Docker-based)

```yaml
# Example GitHub Actions / GitLab CI
- name: Start containers
  run: docker-compose up -d

- name: Install dependencies
  run: docker-compose exec -T frontend npm ci

- name: Lint
  run: docker-compose exec -T frontend npm run lint

- name: Format check
  run: docker-compose exec -T frontend npm run format:check

- name: Type check
  run: docker-compose exec -T frontend npm run type-check

- name: Build
  run: docker-compose exec -T frontend npm run build
```

## Troubleshooting

### "npm not found" error
Make sure you're running commands inside the container:
```bash
docker-compose exec frontend <command>
```

### Node modules not found
Rebuild the container:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Permissions issues on Windows
Run Docker Desktop as administrator or adjust file sharing settings.

### Husky hooks not working
Initialize husky inside container:
```bash
docker-compose exec frontend npm run prepare
```

### Want to enter the container shell?
```bash
docker-compose exec frontend sh
```
Then you can run commands directly:
```bash
npm run lint
npm run format
```

## Performance Notes

- **node_modules volume**: Keeps dependencies in container (faster on Windows)
- **Source code mounted**: Changes reflect immediately without rebuild
- **lint-staged**: Only checks staged files (fast!)
- **ESLint cache**: Can be enabled with `--cache` flag for faster linting

## Quick Reference

| Task | Command |
|------|---------|
| Lint | `docker-compose exec frontend npm run lint` |
| Fix lint | `docker-compose exec frontend npm run lint:fix` |
| Format | `docker-compose exec frontend npm run format` |
| Type check | `docker-compose exec frontend npm run type-check` |
| Enter shell | `docker-compose exec frontend sh` |
| View logs | `docker-compose logs -f frontend` |
| Rebuild | `docker-compose build frontend` |
