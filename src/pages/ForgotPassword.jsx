
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { request } from "../utils/api";


function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


    async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
        const data = await request(
        "/forgot-password",
        {
            method: "POST",
            body: {
            email: email.trim().toLowerCase(),
            },
        },
        "Unable to send reset link."
        );

        setMessage(data.message);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
    }

  return (
    <section className="auth-page foundit-auth-page">
      <div className="foundit-auth-form-panel">
        <div className="auth-card">
          <div className="auth-header">
            <Mail
              size={42}
              aria-hidden="true"
              style={{ color: "#e07a5f" }}
            />

            <h1>Forgot your password?</h1>

            <p>
              Enter the email address associated with
              your FoundIt account. We'll send you a
              secure password-reset link.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="recovery-email">
                Email address
              </label>

              <input
                id="recovery-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                maxLength={120}
                required
              />
            </div>

            <button
              type="submit"
              className="btn auth-button"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send reset link"}
            </button>

            {message && (
              <p className="auth-message" role="status">
                {message}
              </p>
            )}

            {error && (
              <p className="auth-message" role="alert">
                {error}
              </p>
            )}
          </form>

          <div className="auth-switch">
            <Link
              to="/login"
              className="switch-button"
            >
              <ArrowLeft
                size={16}
                aria-hidden="true"
              />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;
