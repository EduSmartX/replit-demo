# 🏗️ Replit-Demo Application Structure

## Overview
This is a multi-role educational management application with **Admin**, **Teacher**, and **Parent** roles. The codebase has been restructured following modern best practices for scalability and maintainability.

---

## 📁 New Folder Structure

```
client/src/
├── common/                          # Application-level shared resources
│   ├── components/                  # Reusable UI components
│   │   ├── forms/                   # Form components (form-fields, address-management)
│   │   ├── dialogs/                 # Dialog components (bulk-upload, confirmation)
│   │   ├── tables/                  # Table components (future)
│   │   ├── role-dashboard.tsx       # Role-based dashboard router
│   │   └── index.ts                 # Central export
│   ├── layouts/                     # Shared layouts
│   │   ├── dashboard-layout.tsx     # Main dashboard layout with role-based sidebars
│   │   └── index.ts
│   ├── hooks/                       # Custom React hooks (future)
│   ├── utils/                       # Helper functions (future)
│   └── types/                       # Shared TypeScript types (future)
│
├── core/                            # Core application infrastructure
│   ├── contexts/                    # React contexts
│   │   ├── user-context.tsx         # User authentication & authorization
│   │   └── index.ts
│   ├── config/                      # App configuration (future)
│   ├── routes/                      # Route definitions (future)
│   └── api/                         # API clients (future)
│
├── features/                        # Feature-based modules (business logic)
│   ├── auth/                        # Authentication feature
│   │   ├── components/              # Login, Signup, OTP, ProtectedRoute
│   │   ├── services/                # Auth API services (future)
│   │   └── index.ts
│   │
│   ├── teachers/                    # Teacher management feature
│   │   ├── components/
│   │   │   ├── common/              # TeacherForm (shared)
│   │   │   ├── admin/               # TeachersList, BulkUploadTeachers
│   │   │   ├── teacher/             # Teacher self-management (future)
│   │   │   └── index.ts
│   │   ├── services/                # Teacher API services (future)
│   │   └── index.ts
│   │
│   ├── students/                    # Student management (future)
│   ├── classes/                     # Class management (future)
│   ├── attendance/                  # Attendance tracking (future)
│   │
│   ├── leave/                       # Leave management feature
│   │   ├── components/
│   │   │   ├── common/              # Shared leave components
│   │   │   ├── admin/               # Holiday calendar, allocations
│   │   │   └── index.ts
│   │   ├── services/                # Leave API services (future)
│   │   └── index.ts
│   │
│   ├── organization/                # Organization settings (future)
│   │
│   └── preferences/                 # Organization preferences
│       ├── components/              # Preference forms and cards
│       ├── services/                # Preferences API (future)
│       └── index.ts
│
├── modules/                         # Role-based modules (UI/UX per role)
│   ├── admin/                       # Admin-specific module
│   │   ├── components/
│   │   │   ├── dashboard/           # AdminDashboard
│   │   │   ├── sidebar/             # AdminSidebar, ResizableSidebar
│   │   │   └── index.ts
│   │   ├── pages/                   # Admin pages
│   │   │   ├── overview-page.tsx
│   │   │   ├── teachers-page.tsx
│   │   │   ├── allocations-page.tsx
│   │   │   ├── organization-page.tsx
│   │   │   ├── preferences-page.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── teacher/                     # Teacher-specific module
│   │   ├── components/
│   │   │   ├── dashboard/           # TeacherDashboard
│   │   │   ├── sidebar/             # TeacherSidebar
│   │   │   └── index.ts
│   │   ├── pages/                   # Teacher pages (future)
│   │   └── index.ts
│   │
│   └── parent/                      # Parent-specific module
│       ├── components/
│       │   ├── dashboard/           # ParentDashboard
│       │   ├── sidebar/             # ParentSidebar
│       │   └── index.ts
│       ├── pages/                   # Parent pages (future)
│       └── index.ts
│
├── ui/                              # shadcn/ui components (unchanged)
│   └── [All UI components]
│
├── lib/                             # Library utilities (unchanged)
│   ├── api/                         # API clients
│   ├── utils.ts                     # Utility functions
│   └── queryClient.ts               # React Query config
│
├── hooks/                           # Application hooks (unchanged)
│   └── use-*.tsx
│
├── pages/                           # Top-level pages
│   ├── auth-page.tsx
│   ├── not-found.tsx
│   ├── organization-pending.tsx
│   └── registration-success.tsx
│
└── App.tsx                          # Main app component & routes

```

---

## 🎯 Design Principles

### 1. **Separation of Concerns**
- **`common/`** - Reusable components used across the entire app
- **`features/`** - Business logic organized by domain (teachers, leave, etc.)
- **`modules/`** - Role-specific UI/UX (admin, teacher, parent)
- **`core/`** - Application infrastructure (contexts, config, API)

### 2. **Feature-Based Architecture**
Each feature (teachers, leave, etc.) is self-contained with:
- Components (common + role-specific)
- Services (API calls)
- Hooks (custom logic)
- Types (TypeScript definitions)

### 3. **Role-Based Organization**
Each role (admin, teacher, parent) has its own module with:
- Dashboard components
- Sidebar navigation
- Role-specific pages

### 4. **Scalability**
- Easy to add new features (create new folder in `features/`)
- Easy to add new roles (create new folder in `modules/`)
- Easy to add reusable components (add to `common/components/`)

---

## 📦 Import Paths

### Common Components
```typescript
import { TextInputField, SelectField } from '@/common/components/forms';
import { BulkUploadDialog, ConfirmationDialog } from '@/common/components/dialogs';
import { DashboardLayout } from '@/common/layouts';
import { RoleDashboard } from '@/common/components';
```

### Core Infrastructure
```typescript
import { UserProvider, useUser } from '@/core/contexts';
```

### Features
```typescript
import { ProtectedRoute } from '@/features/auth';
import { TeachersList, TeacherForm } from '@/features/teachers';
import { LeaveAllocationForm, OrganizationHolidayCalendar } from '@/features/leave';
import { OrganizationPreferences } from '@/features/preferences';
```

### Role Modules
```typescript
import { AdminSidebar, AdminDashboard } from '@/modules/admin';
import { TeacherSidebar, TeacherDashboard } from '@/modules/teacher';
import { ParentSidebar, ParentDashboard } from '@/modules/parent';
```

### Admin Pages
```typescript
import {
  OverviewPage,
  TeachersPage,
  AllocationsPage,
  OrganizationPage,
  PreferencesPage
} from '@/modules/admin/pages';
```

---

## 🔄 Migration Guide

### Old Structure → New Structure

| Old Path | New Path | Category |
|----------|----------|----------|
| `components/common/` | `common/components/` | Reusable components |
| `components/auth/` | `features/auth/components/` | Auth feature |
| `components/teacher/` | `features/teachers/components/` | Teacher feature |
| `components/leave/` | `features/leave/components/` | Leave feature |
| `components/preferences/` | `features/preferences/components/` | Preferences feature |
| `components/dashboard/admin-*` | `modules/admin/components/` | Admin module |
| `components/dashboard/teacher-*` | `modules/teacher/components/` | Teacher module |
| `components/dashboard/parent-*` | `modules/parent/components/` | Parent module |
| `context/user-context.tsx` | `core/contexts/user-context.tsx` | Core contexts |
| `layouts/dashboard-layout.tsx` | `common/layouts/dashboard-layout.tsx` | Shared layouts |
| `pages/dashboard/` | `modules/admin/pages/` | Admin pages |

---

## 🚀 Next Steps

### Immediate Tasks
1. ✅ Create new folder structure
2. ✅ Move components to appropriate locations
3. ✅ Update import paths in core files
4. 🔄 Update remaining component imports
5. ⏳ Test build and fix any remaining import issues

### Future Enhancements
1. **Add Students Feature** (`features/students/`)
2. **Add Classes Feature** (`features/classes/`)
3. **Add Attendance Feature** (`features/attendance/`)
4. **Create Teacher Pages** (`modules/teacher/pages/`)
5. **Create Parent Pages** (`modules/parent/pages/`)
6. **Add Common Utilities** (`common/utils/`)
7. **Add Shared Types** (`common/types/`)
8. **Consolidate API Services** (`core/api/` or feature-specific services)

---

## 💡 Best Practices

### Component Placement
- **Reusable across entire app?** → `common/components/`
- **Feature-specific but role-agnostic?** → `features/[feature]/components/common/`
- **Feature-specific for one role?** → `features/[feature]/components/[role]/`
- **Role-specific UI/navigation?** → `modules/[role]/components/`

### Export Strategy
- Every folder has an `index.ts` for clean imports
- Use named exports (not default) for better refactoring
- Export types alongside components

### Naming Conventions
- **Components**: PascalCase (e.g., `TeacherForm.tsx`)
- **Folders**: lowercase with hyphens (e.g., `form-fields/`)
- **Files**: lowercase with hyphens (e.g., `teacher-form.tsx`)
- **Types**: PascalCase (e.g., `Teacher`, `UserRole`)

---

## 📝 Notes
- Original `components/`, `layouts/`, `context/`, and `pages/dashboard/` folders are kept temporarily for reference
- Once all imports are updated and tested, old folders can be safely deleted
- UI components (`components/ui/`) remain unchanged - they're from shadcn/ui
