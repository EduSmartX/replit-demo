import { createContext, useContext, useState, ReactNode } from "react";

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

  const setAuth = (user: User, organization: Organization, tokens: AuthTokens) => {
    setUser(user);
    setOrganization(organization);
    setTokens(tokens);
    localStorage.setItem("accessToken", tokens.access);
    localStorage.setItem("refreshToken", tokens.refresh);
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
    setTokens(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <UserContext.Provider value={{ user, organization, tokens, setAuth, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
