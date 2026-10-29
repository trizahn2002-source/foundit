import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RequireAuth({ children, message }) {
  const { user, loading, authError } = useAuth();
  const location = useLocation();

  // Never render the protected page while the session is being checked.
  if (loading) {
    return <p role="status">Checking your session...</p>;
  }

  if (!user) {
    // A connection failure is not the same as being logged out.
    if (authError) {
      return <p role="alert">{authError}</p>;
    }
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
          message: message || "Please log in to continue.",
        }}
      />
    );
  }

  return children;
}

export default RequireAuth;