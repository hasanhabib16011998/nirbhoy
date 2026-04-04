import { useNavigate } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/api";
// Initialize empty user state
export const INITIAL_USER = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false,
  logout: () => {},
};

const AuthContext = createContext(INITIAL_STATE);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // ✅ Start loading immediately if a token exists in storage.
  // This tells RootLayout to show the Loader and wait, instead of redirecting.
  const [isLoading, setIsLoading] = useState(() => {
    return localStorage.getItem("accessToken") ? true : false;
  });

  const checkAuthUser = async () => {
    setIsLoading(true);
    try {
      const currentAccount = await getCurrentUser();
      
      if (currentAccount) {
        // ✅ Mapping Django response to your Frontend user object
        setUser({
          id: currentAccount.id.toString(), // Ensure ID is string
          name: `${currentAccount.first_name} ${currentAccount.last_name}`.trim(),
          username: currentAccount.username,
          email: currentAccount.email,
          // Use empty string as fallback if backend doesn't send these yet
          imageUrl: currentAccount.imageUrl || "", 
          bio: currentAccount.bio || "",
        });
        
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Auth Check Failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(INITIAL_USER);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // ✅ FIX: Only try to restore the session if a token exists.
    // Do NOT redirect here. Let your Router/Layout handle redirects.
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
        checkAuthUser();
    }
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUserContext = () => useContext(AuthContext);