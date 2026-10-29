
import { useEffect, useRef, useState } from "react";
import { Sparkles, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.display_name?.trim() || user?.username || "";
  const initial = displayName.charAt(0).toUpperCase() || "?";

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  }

  return (
    <nav className="navbar" aria-label="Main navigation">
      <NavLink
        to="/"
        className="logo"
        aria-label="FoundIt Home"
      >
        <span className="logo-found">F</span>

        <svg
          className="logo-search"
          viewBox="0 0 32 36"
          aria-hidden="true"
          focusable="false"
        >
          <circle
            cx="15"
            cy="17"
            r="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            d="M21.5 23.5 L25 27"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <span className="logo-found">und</span>
        <span className="logo-it">It</span>

        <Sparkles
          className="logo-sparkle"
          aria-hidden="true"
        />
      </NavLink>

      <div className="nav-links">
        <NavLink to="/">Home</NavLink>

        <NavLink to="/dashboard">Dashboard</NavLink>

        <NavLink to="/report" className="nav-cta">
          Report item
        </NavLink>

        {user ? (
          <div className="nav-account" ref={menuRef}>
            <button
              type="button"
              className="nav-avatar-button"
              aria-label={`Open account menu for ${displayName}`}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="nav-avatar">{initial}</span>
              <ChevronDown
                size={15}
                className={menuOpen ? "nav-chevron is-open" : "nav-chevron"}
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div className="nav-account-menu">
                <div className="nav-account-header">
                  <span className="nav-menu-avatar">{initial}</span>

                  <div className="nav-account-info">
                    <strong>{displayName}</strong>
                    <span>Signed in</span>
                  </div>
                </div>

                <div className="nav-account-divider" />

                <NavLink
                  to="/dashboard"
                  className="nav-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  My Dashboard
                </NavLink>

                <button
                  type="button"
                  className="nav-menu-item nav-menu-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
