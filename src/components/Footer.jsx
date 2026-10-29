import { Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <NavLink to="/" className="logo footer-logo" aria-label="FoundIt Home">
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
        <Sparkles className="logo-sparkle" aria-hidden="true" />
      </NavLink>

      <p className="footer-tagline">
        Helping lost items find their way home.
      </p>

      <p className="footer-small">
        © {new Date().getFullYear()} FoundIt · All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;