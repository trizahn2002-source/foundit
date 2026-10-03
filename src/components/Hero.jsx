import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>Lost something? Let's bring it home.</h1>
        <p>Nairobi's friendly lost and found board.</p>
        <div className="hero-buttons">
          <Link to="/report" className="btn btn-primary">I lost something</Link>
          <Link to="/report" className="btn btn-outline">I found something</Link>
        </div>
      </div>

      <svg className="hero-art" viewBox="0 0 88 88" aria-hidden="true">
        <circle cx="44" cy="44" r="40" fill="#f2cc8f" />
        <rect x="22" y="34" width="34" height="30" rx="8" fill="#e07a5f" />
        <path d="M30 34 v-5 a9 9 0 0 1 18 0 v5" fill="none" stroke="#c4613f" strokeWidth="4" />
        <circle cx="33" cy="48" r="2" fill="#3d405b" />
        <circle cx="43" cy="48" r="2" fill="#3d405b" />
        <path d="M33 54 q5 4 10 0" fill="none" stroke="#3d405b" strokeWidth="2" strokeLinecap="round" />
        <circle cx="56" cy="50" r="12" fill="#fff8f0" stroke="#3d405b" strokeWidth="4" />
        <line x1="65" y1="59" x2="74" y2="68" stroke="#3d405b" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </section>
  );
}

export default Hero;