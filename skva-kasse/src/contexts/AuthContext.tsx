import { createContext, useEffect, useState } from "react";
import { logoutUser, fetchCurrentUser } from "@/api";
import { User, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ⬅️ Neu

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    console.log("Logout click!");
    logoutUser();
    setUser(null);
  };

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };