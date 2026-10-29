
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  checkSession,
  logout as apiLogout,
} from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const refreshSession = useCallback(async () => {
    try {
      const data = await checkSession();

      setUser(data.logged_in ? data.user : null);
      setAuthError(null);

      return data;
    } catch (error) {
      // A connection failure does not necessarily mean
      // that the user's session has expired.
      setAuthError(
        "Unable to connect to FoundIt. Please try again."
      );

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession().catch(() => {
      // Keep the error available through authError.
    });
  }, [refreshSession]);

  async function logout() {
    await apiLogout();

    setUser(null);
    setAuthError(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        authError,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
