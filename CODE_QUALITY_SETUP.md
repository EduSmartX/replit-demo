# Frontend Code Quality Setup

This project uses a comprehensive code quality toolchain similar to Django's pre-commit setup.

## 🛠️ Tools Included

### 1. **ESLint** - Linting
- Static code analysis for JavaScript/TypeScript
- Catches bugs, enforces coding standards
- Config: `.eslintrc.cjs`

### 2. **Prettier** - Code Formatting
- Opinionated code formatter
- Ensures consistent code style
- Config: `.prettierrc.json`

### 3. **TypeScript** - Type Checking
- Static type checking
- Catches type errors before runtime
- Config: `tsconfig.json`

### 4. **Husky** - Git Hooks
- Runs checks before commits (like pre-commit)
- Prevents bad code from being committed
- Config: `.husky/` directory

### 5. **lint-staged** - Staged Files Only
- Runs linters only on staged files
- Faster than checking entire codebase
- Config: `.lintstagedrc.json`

## 📦 Installation

```bash
cd c:\Educard\replit-demo
npm install
```

This will install all dev dependencies including:
- eslint & plugins
- prettier & plugins
- husky
- lint-staged
- TypeScript ESLint

## 🎯 Usage

### Run Linting
```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Format Code
```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check
```

### Type Check
```bash
# Check TypeScript types without building
npm run type-check
```

### Pre-commit Hook
Automatically runs when you commit:
```bash
git add .
git commit -m "your message"
# ↑ This will automatically run lint-staged
```

The hook will:
1. Run ESLint and auto-fix issues
2. Run Prettier and format code
3. Only on staged files (fast!)

## 🔧 Configuration Details

### ESLint Rules
Located in `.eslintrc.cjs`:
- **React Rules**: No PropTypes (using TypeScript), React 17+ JSX transform
- **TypeScript Rules**: Warn on `any`, unused vars with `_` prefix ignored
- **React Hooks**: Enforces hooks rules, warns on missing dependencies
- **Import Order**: Alphabetically sorted imports
- **General**: Warns on console.log, no var, prefer const

### Prettier Configuration
Located in `.prettierrc.json`:
- Semi-colons: Yes
- Single quotes: No (double quotes)
- Print width: 100 characters
- Tab width: 2 spaces
- Tailwind CSS class sorting enabled

### lint-staged Configuration
Located in `.lintstagedrc.json`:
- **JS/TS files**: ESLint fix → Prettier format
- **JSON/MD/CSS files**: Prettier format only

## 📝 VS Code Integration

### Auto-format on Save
Settings in `.vscode/settings.json`:
- Format on save enabled
- ESLint auto-fix on save
- Prettier as default formatter

### Recommended Extensions
Install from `.vscode/extensions.json`:
1. **ESLint** - `dbaeumer.vscode-eslint`
2. **Prettier** - `esbenp.prettier-vscode`
3. **Tailwind CSS IntelliSense** - `bradlc.vscode-tailwindcss`

## 🚀 CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Install dependencies
  run: npm ci

- name: Lint check
  run: npm run lint

- name: Format check
  run: npm run format:check

- name: Type check
  run: npm run type-check

- name: Build
  run: npm run build
```

## 🔒 Comparison with Django

| Django (Backend) | React (Frontend) |
|------------------|------------------|
| pre-commit | husky |
| black | prettier |
| flake8/pylint | eslint |
| mypy | typescript |
| isort | eslint-plugin-import |
| pyproject.toml | package.json + config files |

## 🎨 Customization

### Add Custom ESLint Rules
Edit `.eslintrc.cjs`:
```js
rules: {
  'your-rule': 'error',
}
```

### Change Prettier Settings
Edit `.prettierrc.json`:
```json
{
  "printWidth": 120,
  "singleQuote": true
}
```

### Ignore Files
- `.eslintignore` - Files ESLint should skip
- `.prettierignore` - Files Prettier should skip

## ⚡ Performance Tips

1. **lint-staged**: Only checks staged files (fast)
2. **ESLint cache**: ESLint caches results (use `--cache` flag)
3. **Parallel execution**: lint-staged runs tasks in parallel
4. **Skip hooks**: Use `git commit --no-verify` to skip (not recommended)

## 🐛 Troubleshooting

### ESLint errors after setup
```bash
npm run lint:fix
```

### Prettier conflicts with ESLint
Already configured! `eslint-config-prettier` disables conflicting rules.

### Husky hooks not running
```bash
npm run prepare
```

### VS Code not auto-formatting
1. Install Prettier extension
2. Set as default formatter
3. Enable format on save in settings

## 📚 Additional Resources

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Husky Documentation](https://typicode.github.io/husky/)
