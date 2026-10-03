import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="logo">📍 FoundIt</NavLink>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/report" className="nav-cta">Report item</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;