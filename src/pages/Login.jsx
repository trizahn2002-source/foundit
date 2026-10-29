import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Heart, Sparkles } from "lucide-react";
import PasswordStrength, { passwordChecklistComplete } from "../components/PasswordStrength";
import { request } from "../utils/api";

const emptyForm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

async function post(path, body) {
  return request(
    path,
    { method: "POST", body },
    "Something went wrong. Please try again."
  );
}

function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleCredential = useCallback(async (response) => {
    if (!response?.credential) {
      setMessage("Google sign-in was not completed. Please try again.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const data = await post("/auth/google", { credential: response.credential });
      if (!data?.user) {
        throw new Error("Unexpected Google sign-in response.");
      }
      setUser(data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setMessage(err.message || "Unable to sign in with Google.");
    } finally {
      setLoading(false);
    }
  }, [navigate, setUser]);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;
    let cancelled = false;
    const scriptId = "google-identity-services";

    const renderButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      const google = window.google.accounts.id;
      google.initialize({ client_id: googleClientId, callback: handleGoogleCredential });
      googleButtonRef.current.replaceChildren();
      google.renderButton(googleButtonRef.current, {
        theme: "outline", size: "large", text: "continue_with", shape: "pill",
        width: Math.min(340, googleButtonRef.current.clientWidth || 300),
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", renderButton);
    }
    return () => {
      cancelled = true;
      document.getElementById(scriptId)?.removeEventListener("load", renderButton);
    };
  }, [googleClientId, handleGoogleCredential]);

  function handleChange(e) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    if (isRegistering && form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (
      isRegistering &&
      !passwordChecklistComplete(
        form.password,
        form.confirmPassword
      )
    ) {
      setMessage("Please meet all six password requirements.");
      return;
    }
    setLoading(true);
    try {
      if (isRegistering) {
        const data = await post("/register", {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        navigate("/verify-email", {
          state: {
            email: data.email || form.email.trim().toLowerCase(),
          },
        });
        return;
      }
      const data = await post("/login", {
        identifier: form.email,
        password: form.password,
      });
      if (data.two_factor_required) {
        setForm(emptyForm);
        navigate("/login/verify-otp");
        return;
      }
      setMessage("Unexpected login response. Please try again.");
    } catch (err) {
      if (
        err.details?.verification_required ||
        (err.status === 403 && /verify your email before signing in/i.test(err.message))
      ) {
        navigate("/verify-email", {
          state: {
            email: err.details?.email || (
              isRegistering ? form.email.trim().toLowerCase() : ""
            ),
          },
        });
        return;
      }
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page foundit-auth-page">
      <div className="foundit-auth-layout">
        {/* LEFT BRANDING PANEL */}
        <div className="foundit-auth-brand">
          <div className="foundit-auth-brand-content">
            {/* FOUNDIT LOGO */}
            <div
              className="foundit-auth-logo"
              aria-label="FoundIt"
            >
              <span className="auth-logo-found">F</span>
              <svg
                className="auth-logo-search"
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
              <span className="auth-logo-found">und</span>
              <span className="auth-logo-it">It</span>
              <Sparkles
                className="auth-logo-sparkle"
                size={19}
                aria-hidden="true"
              />
            </div>
            {/* BRAND MESSAGE */}
            <h2>
              Lost something?
              <span> Found something?</span>
            </h2>
            <p>
              Report and discover lost and found items
              easily. A kinder, more connected community
              for everyone.
            </p>
            {/* FEATURE HIGHLIGHTS */}
            <div className="foundit-auth-highlights">
              <div>
                <span aria-hidden="true">
                  <Search size={24} strokeWidth={2} />
                </span>
                <p>Report lost or found items</p>
              </div>
              <div>
                <span aria-hidden="true">
                  <Heart size={24} strokeWidth={2} />
                </span>
                <p>Help reunite items with their owners</p>
              </div>
              <div>
                <span aria-hidden="true">
                  <Sparkles size={24} strokeWidth={2} />
                </span>
                <p>Be part of a caring community</p>
              </div>
            </div>
          </div>
        </div>
        {/* RIGHT AUTHENTICATION PANEL */}
        <div className="foundit-auth-form-panel">
          <div className="auth-card">
            <div className="auth-header">
              <h1>
                {isRegistering ? "Create an account" : "Welcome back"}
              </h1>
              <p>
                {isRegistering
                  ? "Create an account to start using FoundIt."
                  : "Log in to manage your lost and found items."}
              </p>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              {isRegistering && (
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="input"
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={handleChange}
                    maxLength={80}
                    autoComplete="username"
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="email">
                  {isRegistering ? "Email address" : "Email or username"}
                </label>
                <input
                  id="email"
                  name="email"
                  type={isRegistering ? "email" : "text"}
                  className="input"
                  placeholder={
                    isRegistering
                      ? "Enter your email"
                      : "Enter your email or username"
                  }
                  value={form.email}
                  onChange={handleChange}
                  maxLength={120}
                  autoComplete={isRegistering ? "email" : "username"}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="input"
                  placeholder={
                    isRegistering
                      ? "At least 8 characters"
                      : "Enter your password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  minLength={isRegistering ? 8 : undefined}
                  autoComplete={
                    isRegistering ? "new-password" : "current-password"
                  }
                  required
                />
              </div>
              {!isRegistering && (
              <div className="auth-forgot-password">
                <Link
                  to="/forgot-password"
                  className="switch-button"
                >
                  Forgot password?
                </Link>
              </div>
            )}
              {isRegistering && (
                <>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="input"
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <PasswordStrength
                    password={form.password}
                    confirmPassword={form.confirmPassword}
                  />
                </>
              )}
              <button
                type="submit"
                className="btn auth-button"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isRegistering
                    ? "Create account"
                    : "Log in"}
              </button>
              {message && (
                <p className="auth-message" role="alert">
                  {message}
                </p>
              )}
            </form>
            {!isRegistering && googleClientId && (
              <div className="google-signin-section" style={{ marginTop: "1rem", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <span style={{ flex: 1, height: 1, backgroundColor: "#ddd" }} />
                  <span style={{ fontSize: "0.875rem", opacity: 0.7 }}>or continue with</span>
                  <span style={{ flex: 1, height: 1, backgroundColor: "#ddd" }} />
                </div>
                <div ref={googleButtonRef} style={{ display: "flex", justifyContent: "center", minHeight: 44 }} />
              </div>
            )}
            <div className="auth-switch">
              <p>
                {isRegistering
                  ? "Already have an account?"
                  : "New to FoundIt?"}
              </p>
              <button
                type="button"
                className="switch-button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setMessage("");
                }}
              >
                {isRegistering ? "Log in" : "Create an account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Login;
