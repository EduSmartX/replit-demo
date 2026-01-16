# Reusable Utilities and Components Guide

This guide explains the reusable utility functions and components created to avoid code duplication across Classes, Students, Teachers, and other entities.

## 📁 Structure

```
client/src/
├── lib/
│   └── utils/
│       ├── form-utils.ts           # Form state and configuration utilities
│       ├── api-service-utils.ts    # Generic API CRUD operations
│       └── index.ts                # Utility exports
├── components/
│   └── common/
│       ├── form-fields.tsx         # Reusable form field components
│       ├── success-message.tsx     # Success message component
│       └── index.ts                # Component exports
```

## 🎯 Utilities Overview

### 1. Form Utilities (`form-utils.ts`)

Provides reusable functions for form operations and state management.

#### Key Functions:

**`getFormConfig(mode, entityName)`**

- Returns form configuration (title, description, button text) based on mode
- Modes: 'create' | 'view' | 'edit'

```typescript
const formConfig = getFormConfig("create", "Teacher");
// Returns: { title: "Add New Teacher", description: "...", ... }
```

**`isFormMode(mode, checkMode)`**

- Check if form is in specific mode(s)

**`formatDateForInput(date)`** & **`parseLocalDate(dateString)`**

- Date formatting utilities without timezone issues

**`handleMutationSuccess(options)`**

- Standardized success handling with optional callbacks

**`extractValidationErrors(error)` & `formatValidationError(errors)`**

- Extract and format API validation errors

**`cleanPayload(payload)` & `convertNumberFields(payload, fields)`**

- Clean empty values and convert string numbers to integers

**`createCrudActions(setState, deleteAction, setLocation, basePath)`**

- Generate standardized CRUD action handlers

```typescript
const actions = createCrudActions(setState, deleteEntity, setLocation, "/teachers");
// Returns: { handleCreate, handleView, handleEdit, handleDelete, handleCancel, handleSuccess }
```

---

### 2. API Service Utilities (`api-service-utils.ts`)

Generic API functions for CRUD operations - no more repetitive API code!

#### Key Functions:

**`fetchList<T>(url)`**

- Generic function to fetch paginated lists

**`fetchDetail<T>(url)`**

- Generic function to fetch single entity details

**`createEntity<T, P>(url, payload)`**

- Generic function to create entities

**`updateEntity<T, P>(url, payload)`**

- Generic function to update entities

**`deleteEntity(url)`**

- Generic function to delete entities

**`createEntityService<T, CreatePayload, UpdatePayload>(baseUrl, detailUrl)`**

- Factory function to create complete CRUD service

#### Example Usage:

```typescript
// In teacher-api.ts
const teacherService = createEntityService<Teacher, TeacherCreatePayload, TeacherCreatePayload>(
  `${API_BASE_URL}/api/teacher/admin/`,
  (publicId: string) => `${API_BASE_URL}/api/teacher/admin/${publicId}/`
);

// Export ready-to-use functions
export const fetchTeachers = teacherService.fetchList;
export const fetchTeacherDetail = teacherService.fetchDetail;
export const createTeacher = teacherService.create;
export const updateTeacher = teacherService.update;
export const deleteTeacher = teacherService.delete;
```

---

### 3. Form Field Components (`form-fields.tsx`)

Reusable form field components with consistent styling and behavior.

#### Available Components:

**`TextInputField<T>`**

- Props: control, name, label, placeholder, required, disabled, description, type

```tsx
<TextInputField
  control={form.control}
  name="employee_id"
  label="Employee ID"
  placeholder="EMP001"
  required
  disabled={isViewMode}
/>
```

**`SelectField<T>`**

- Props: control, name, label, placeholder, required, disabled, description, options

```tsx
<SelectField
  control={form.control}
  name="status"
  label="Status"
  options={[
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]}
/>
```

**`BloodGroupField<T>`**

- Pre-configured select field for blood groups
- Options: A+, A-, B+, B-, AB+, AB-, O+, O-

```tsx
<BloodGroupField control={form.control} name="blood_group" disabled={isViewMode} />
```

**`GenderField<T>`**

- Pre-configured select field for gender
- Options: M (Male), F (Female), O (Other)

```tsx
<GenderField control={form.control} name="gender" disabled={isViewMode} />
```

**`CheckboxGroupField<T>`**

- Multi-select checkbox group with grid layout
- Props: control, name, label, description, disabled, options, loading, maxColumns

```tsx
<CheckboxGroupField
  control={form.control}
  name="subjects"
  label="Subjects"
  description="Select subjects"
  options={subjects}
  loading={loadingSubjects}
  maxColumns={3}
/>
```

---

### 4. Success Message Component (`success-message.tsx`)

Standardized success message display.

```tsx
<SuccessMessage title="Teacher Created!" description="A new teacher has been added successfully." />
```

---

## 🚀 Usage Examples

### Creating a New Entity (e.g., Student)

#### 1. Create API Service (`student-api.ts`)

```typescript
import { createEntityService } from "../utils/api-service-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface Student {
  public_id: string;
  roll_number: string;
  first_name: string;
  last_name: string;
  email: string;
  // ... other fields
}

export interface StudentCreatePayload {
  roll_number: string;
  first_name: string;
  last_name: string;
  email: string;
  // ... other fields
}

// Create service in one line!
const studentService = createEntityService<Student, StudentCreatePayload, StudentCreatePayload>(
  `${API_BASE_URL}/api/students/`,
  (publicId: string) => `${API_BASE_URL}/api/students/${publicId}/`
);

// Export functions
export const fetchStudents = studentService.fetchList;
export const fetchStudentDetail = studentService.fetchDetail;
export const createStudent = studentService.create;
export const updateStudent = studentService.update;
export const deleteStudent = studentService.delete;
```

#### 2. Create Form Component (`student-form.tsx`)

```tsx
import { useForm } from "react-hook-form";
import { TextInputField, GenderField, BloodGroupField } from "@/components/common";
import { SuccessMessage } from "@/components/common";
import { getFormConfig } from "@/lib/utils";
import type { FormMode } from "@/lib/utils";

export function StudentForm({ mode = "create", initialData, onSuccess, onCancel }) {
  const formConfig = getFormConfig(mode, "Student");
  const isViewMode = mode === "view";

  // ... form setup and mutation handlers

  if (showSuccess) {
    return (
      <SuccessMessage
        title={formConfig.successMessage}
        description="Student information has been saved successfully."
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h1>{formConfig.title}</h1>
        <p>{formConfig.description}</p>

        <TextInputField
          control={form.control}
          name="roll_number"
          label="Roll Number"
          required
          disabled={isViewMode}
        />

        <TextInputField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          required
          disabled={isViewMode}
        />

        <GenderField control={form.control} name="gender" disabled={isViewMode} />

        <BloodGroupField control={form.control} name="blood_group" disabled={isViewMode} />

        {/* ... more fields */}
      </form>
    </Form>
  );
}
```

#### 3. Create List Component (`students-list.tsx`)

```tsx
import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "@/lib/api/student-api";

export function StudentsList({ onCreateNew, onView, onEdit, onDelete }) {
  const { data: students, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents, // Uses generic fetchList under the hood
  });

  // ... render table with students
}
```

---

## 📋 Benefits

✅ **No Code Duplication**: Write once, use everywhere
✅ **Consistent UX**: All forms look and behave the same
✅ **Easy Maintenance**: Fix bugs in one place
✅ **Type Safety**: Full TypeScript support
✅ **Quick Development**: New entities in minutes, not hours
✅ **Standardized Error Handling**: Consistent validation messages
✅ **Reusable CRUD Operations**: Same patterns for all entities

---

## 🎨 Styling

All components use:

- Tailwind CSS classes
- shadcn/ui components
- Consistent purple-pink gradient theme
- Responsive design (mobile-first)

---

## 🔄 Future Entities

When adding new entities (Classes, Departments, etc.), follow the same pattern:

1. Define interfaces
2. Create API service using `createEntityService`
3. Create form using reusable field components
4. Create list component using standard query hooks
5. Add routing in dashboard-page.tsx

That's it! No need to reinvent the wheel each time.

---

## 📚 Related Files

- `/lib/api.ts` - API configuration and endpoints
- `/lib/error-parser.ts` - Error parsing utilities
- `/components/ui/*` - shadcn/ui base components
- `/hooks/use-toast.ts` - Toast notifications

---

**Happy Coding! 🚀**
