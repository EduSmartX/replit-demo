# Role-Based Navigation & Routing Guide

## 🎯 Overview

The Educard application uses **role-based sidebars** to control which menu items and routes are available to different user types. Each role (Admin, Teacher, Parent) has its own sidebar component with specific menu items.

## 📋 Current Implementation

### **1. Role-Specific Sidebars**

Each role has a dedicated sidebar component:

| Role | Sidebar Component | Location |
|------|------------------|----------|
| **Admin** | `AdminSidebar` | [client/src/components/dashboard/admin-sidebar.tsx](client/src/components/dashboard/admin-sidebar.tsx) |
| **Teacher** | `TeacherSidebar` | [client/src/components/dashboard/teacher-sidebar.tsx](client/src/components/dashboard/teacher-sidebar.tsx) |
| **Parent** | `ParentSidebar` | [client/src/components/dashboard/parent-sidebar.tsx](client/src/components/dashboard/parent-sidebar.tsx) |

### **2. Admin Menu Items** (Currently Implemented)

```typescript
const adminMenuItems = [
  { id: "overview", label: "Overview", icon: BarChart3, section: "main" },
  { divider: true, label: "Administration" },
  { id: "organization", label: "Organization Leaves", icon: Calendar, section: "admin" },
  { id: "allocations", label: "Leave Allocations", icon: FileText, section: "admin" }, // ✅ ADMIN ONLY
  { id: "preferences", label: "Organization Preferences", icon: Settings, section: "admin" },
  { divider: true, label: "Management" },
  { id: "teachers", label: "Teachers", icon: Users, section: "admin" },
  { id: "classes", label: "Classes", icon: Building2, section: "admin" },
  { id: "subjects", label: "Subjects", icon: BookOpen, section: "admin" },
  { id: "students", label: "Students", icon: Users, section: "admin" },
  { divider: true, label: "Operations" },
  { id: "attendance", label: "Attendance", icon: CheckCircle2, section: "admin" },
  { id: "requests", label: "Leave Requests", icon: Briefcase, section: "admin" },
];
```

**✅ "Leave Allocations" is ONLY in the admin menu**

### **3. Teacher Menu Items** (Currently Implemented)

```typescript
const teacherMenuItems = [
  { id: "overview", label: "Overview", icon: BarChart3, section: "main" },
  { divider: true, label: "Classes" },
  { id: "my-classes", label: "My Classes", icon: GraduationCap, section: "teacher" },
  { id: "students", label: "Students", icon: Users, section: "teacher" },
  { id: "subjects", label: "Subjects", icon: BookOpen, section: "teacher" },
  { divider: true, label: "Operations" },
  { id: "attendance", label: "Mark Attendance", icon: CheckCircle2, section: "teacher" },
  { id: "assignments", label: "Assignments", icon: FileText, section: "teacher" },
  { id: "schedule", label: "Class Schedule", icon: Calendar, section: "teacher" },
];
```

**❌ "Leave Allocations" is NOT in the teacher menu**

### **4. Parent Menu Items** (Currently Implemented)

```typescript
const parentMenuItems = [
  { id: "overview", label: "Overview", icon: BarChart3, section: "main" },
  { divider: true, label: "Child Information" },
  { id: "child-profile", label: "Child Profile", icon: User, section: "parent" },
  { id: "attendance", label: "Attendance", icon: Calendar, section: "parent" },
  { id: "progress", label: "Academic Progress", icon: FileText, section: "parent" },
  { divider: true, label: "Communication" },
  { id: "messages", label: "Messages", icon: MessageSquare, section: "parent" },
  { id: "reports", label: "Reports", icon: FileText, section: "parent" },
];
```

**❌ "Leave Allocations" is NOT in the parent menu**

## 🔒 Route Protection

### **In dashboard-page.tsx:**

```typescript
{/* Leave Allocations - ADMIN ONLY */}
{activeMenu === "allocations" && user.role === "admin" && (
  <LeaveAllocationForm 
    onSuccess={() => {
      toast({
        title: "Success",
        description: "Leave allocation policy has been created successfully",
      });
    }}
  />
)}
```

**Double Protection:**
1. ✅ Menu item only appears in AdminSidebar
2. ✅ Route checks `user.role === "admin"` before rendering

## 📊 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    User Logs In                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Check Role    │
              └────┬───┬───┬───┘
                   │   │   │
         ┌─────────┘   │   └─────────┐
         │             │             │
         ▼             ▼             ▼
    ┌────────┐   ┌──────────┐   ┌────────┐
    │ Admin  │   │ Teacher  │   │ Parent │
    │Sidebar │   │ Sidebar  │   │Sidebar │
    └────┬───┘   └─────┬────┘   └───┬────┘
         │             │             │
         │             │             │
    Contains      Does NOT      Does NOT
    "Leave        Contain       Contain
    Allocations"  "Leave        "Leave
                  Allocations"  Allocations"
```

## 🛡️ Security Layers

### **Layer 1: UI/Menu Level**
- Menu items only appear in the appropriate sidebar
- Users won't see options they can't access

### **Layer 2: Route Level**
- Routes check user role before rendering components
- Example: `activeMenu === "allocations" && user.role === "admin"`

### **Layer 3: API Level** (Backend)
- Backend validates user permissions
- Only admins can call leave allocation APIs
- Returns 403 Forbidden if unauthorized

## 🎨 Adding New Role-Specific Features

### **Example: Add a new Admin-only feature**

**Step 1: Add menu item to AdminSidebar**
```typescript
const adminMenuItems = [
  // ... existing items
  { id: "my-feature", label: "My Feature", icon: SomeIcon, section: "admin" },
];
```

**Step 2: Add route in dashboard-page.tsx**
```typescript
{/* My Feature - ADMIN ONLY */}
{activeMenu === "my-feature" && user.role === "admin" && (
  <MyFeatureComponent />
)}
```

**Step 3: Ensure it's NOT in other sidebars**
- Don't add to `teacherMenuItems`
- Don't add to `parentMenuItems`

## 📝 Quick Reference Table

| Feature | Admin | Teacher | Parent | Location |
|---------|-------|---------|--------|----------|
| **Leave Allocations** | ✅ Yes | ❌ No | ❌ No | Admin Sidebar Line 23 |
| Organization Leaves | ✅ Yes | ❌ No | ❌ No | Admin Sidebar Line 22 |
| My Classes | ❌ No | ✅ Yes | ❌ No | Teacher Sidebar Line 18 |
| Child Profile | ❌ No | ❌ No | ✅ Yes | Parent Sidebar Line 9 |
| Overview | ✅ Yes | ✅ Yes | ✅ Yes | All Sidebars |

## 🔧 How to Modify Role Access

### **To make a feature available to multiple roles:**

**Option 1: Add to multiple sidebars**
```typescript
// In admin-sidebar.tsx
{ id: "shared-feature", label: "Shared Feature", icon: Icon, section: "admin" }

// In teacher-sidebar.tsx
{ id: "shared-feature", label: "Shared Feature", icon: Icon, section: "teacher" }
```

**Option 2: Modify route check**
```typescript
{/* Shared Feature - ADMIN & TEACHER */}
{activeMenu === "shared-feature" && 
  (user.role === "admin" || user.role === "teacher") && (
  <SharedFeatureComponent />
)}
```

### **To restrict a feature (make it more secure):**

1. Remove from unwanted sidebars
2. Add role check in route
3. Ensure backend validates permissions

## 🎯 Current Leave Allocation Access

### ✅ **ADMIN CAN:**
- See "Leave Allocations" menu item
- Click and access the form
- Create leave allocation policies
- Manage organization-wide leave settings

### ❌ **TEACHER CANNOT:**
- See "Leave Allocations" menu item
- Access the route (even with direct URL)
- Create leave allocations

### ❌ **PARENT CANNOT:**
- See "Leave Allocations" menu item
- Access the route (even with direct URL)
- Create leave allocations

## 🚦 Testing Role Access

### **Manual Testing:**

1. **Login as Admin:**
   - ✅ Should see "Leave Allocations" in sidebar
   - ✅ Should be able to access form
   - ✅ Should be able to create policies

2. **Login as Teacher:**
   - ❌ Should NOT see "Leave Allocations" in sidebar
   - ❌ Manually typing URL should show "Coming Soon" or nothing

3. **Login as Parent:**
   - ❌ Should NOT see "Leave Allocations" in sidebar
   - ❌ Manually typing URL should show "Coming Soon" or nothing

## 💡 Best Practices

1. **Always check role in both places:**
   - Sidebar menu items (UI visibility)
   - Route rendering (access control)

2. **Use consistent naming:**
   - Menu item ID should match route check
   - Example: `id: "allocations"` → `activeMenu === "allocations"`

3. **Backend validation:**
   - Never rely only on frontend checks
   - Backend must validate user permissions

4. **Clear section labels:**
   - Group related items with dividers
   - Use descriptive section names

## 📚 Summary

**✅ Leave Allocations is ALREADY properly secured:**
- Only appears in Admin sidebar
- Route checks for admin role
- Backend validates admin permissions
- Other roles cannot access it

**No changes needed!** The implementation already ensures Leave Allocations only appears for Admin users.

---

**For questions or modifications, refer to:**
- Admin Sidebar: [client/src/components/dashboard/admin-sidebar.tsx](client/src/components/dashboard/admin-sidebar.tsx)
- Dashboard Routes: [client/src/pages/dashboard-page.tsx](client/src/pages/dashboard-page.tsx)
