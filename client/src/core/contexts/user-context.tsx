import { createContext, useContext, useState, useEffect } from "react";
import { ERROR_MESSAGES } from "@/lib/constants";
import type { ReactNode } from "react";

export type UserRole = "admin" | "teacher" | "parent";

export interface Organization {
  public_id: string;
  name: string;
  organization_type: string;
  email: string;
  phone: string;
  website_url: string;
  board_affiliation: string;
  legal_entity: string;
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
}

export interface User {
  public_id: string;
  username: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

interface UserContextType {
  user: User | null;
  organization: Organization | null;
  tokens: AuthTokens | null;
  setAuth: (user: User, organization: Organization, tokens: AuthTokens) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedOrg = localStorage.getItem("organization");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (storedUser && storedOrg && accessToken && refreshToken) {
      try {
        setUser(JSON.parse(storedUser));
        setOrganization(JSON.parse(storedOrg));
        setTokens({ access: accessToken, refresh: refreshToken });
      } catch (error) {
        console.error("Failed to restore auth state:", error);
        // Clear corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("organization");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    setIsInitialized(true);
  }, []);

  const setAuth = (user: User, organization: Organization, tokens: AuthTokens) => {
    setUser(user);
    setOrganization(organization);
    setTokens(tokens);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("organization", JSON.stringify(organization));
    localStorage.setItem("accessToken", tokens.access);
    localStorage.setItem("refreshToken", tokens.refresh);
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
    setTokens(null);
    localStorage.removeItem("user");
    localStorage.removeItem("organization");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  // Don't render children until we've checked localStorage
  if (!isInitialized) {
    return null;
  }

  return (
    <UserContext.Provider value={{ user, organization, tokens, setAuth, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(ERROR_MESSAGES.USE_USER_OUTSIDE_PROVIDER);
  }
  return context;
}
