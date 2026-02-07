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

  // Listen for storage changes in other tabs (cross-tab logout)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // If accessToken is removed in another tab, logout this tab too
      if (event.key === "accessToken" && event.newValue === null) {
        // Clear state in this tab
        setUser(null);
        setOrganization(null);
        setTokens(null);

        // Redirect to login page
        window.location.href = "/auth";
      }
    };

    // Listen for storage events from other tabs
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
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

  const logout = async () => {
    // Call backend logout API to invalidate token
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      if (accessToken && refreshToken) {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/auth/logout/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access: accessToken,
              refresh: refreshToken,
            }),
          }
        );
      }
    } catch (error) {
      // Ignore errors, proceed with logout anyway
      console.error("Logout API call failed:", error);
    }

    // Clear all state and localStorage
    setUser(null);
    setOrganization(null);
    setTokens(null);
    localStorage.removeItem("user");
    localStorage.removeItem("organization");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Clear history to prevent back navigation
    window.history.pushState(null, "", "/auth");
    window.history.replaceState(null, "", "/auth");
  };

  // Don't render children until we've checked localStorage
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
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
