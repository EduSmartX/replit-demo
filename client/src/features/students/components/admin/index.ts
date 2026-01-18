/**
 * Student Management - Admin Components
 * 
 * Admin-specific components for student management.
 * Includes list views with filtering, pagination, and bulk operations.
 */

export { StudentsList } from './students-list';

// Sub-components (can be reused elsewhere)
export { StudentsHeader } from './students-header';
export { StudentsStats } from './students-stats';
export { StudentsFilters } from './students-filters';
export { getStudentColumns } from './students-table-columns';
export { StudentsErrorState } from './students-error-state';
export { StudentsLoadingState } from './students-loading-state';
export { StudentsEmptyState } from './students-empty-state';
