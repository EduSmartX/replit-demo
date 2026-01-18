/**
 * Core Application Contexts
 * 
 * Global state management using React Context API.
 * Provides user authentication, authorization, and organization data.
 */

export { UserProvider, useUser } from './user-context';
export type { UserRole, User, Organization } from './user-context';
