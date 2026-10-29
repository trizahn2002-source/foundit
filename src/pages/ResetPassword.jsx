
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  KeyRound,
  Link2Off,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import PasswordStrength, {
  passwordChecklistComplete,
} from "../components/PasswordStrength";
import { request } from "../utils/api";


function ResetPassword() {
  const [token] = useState(() => {
    const params = new URLSearchParams(
      window.location.hash.slice(1)
    );

    return params.get("token") || "";
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [tokenStatus, setTokenStatus] = useState(
    token ? "checking" : "invalid"
  );

  const [tokenError, setTokenError] = useState(
    token ? "" : "This reset link is missing or invalid."
  );

  const [retryCount, setRetryCount] = useState(0);

  // Remove the token from the visible address bar.
  // React keeps the token in memory while this page is open.
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, []);

  // Verify the reset link before showing the password form.
  useEffect(() => {
    if (!token || success) return;

    let cancelled = false;

    async function checkToken() {
      try {
        const data = await request(
          "/validate-reset-token",
          { method: "POST", body: { token } },
          "We couldn't check your link right now."
        );

        if (cancelled) return;

        if (data.valid === true) {
          setTokenStatus("valid");
          setTokenError("");
          return;
        }

        setTokenStatus("invalid");
        setTokenError(
          data.message ||
            "This reset link has expired or has already been used."
        );
      } catch (err) {
        if (cancelled) return;

        if (err.status === 400) {
          setTokenStatus("invalid");
          setTokenError(err.message);
          return;
        }

        setTokenStatus("error");
        setTokenError(
          err.status
            ? err.message
            : "We couldn't connect to FoundIt. Please check your connection and try again."
        );
      }
    }

    checkToken();

    return () => {
      cancelled = true;
    };
  }, [token, retryCount, success]);

  function retryValidation() {
    setTokenStatus("checking");
    setTokenError("");
    setRetryCount((count) => count + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (tokenStatus !== "valid" || loading) return;

    if (!passwordChecklistComplete(password, confirmPassword)) {
      setError("Please meet all six password requirements.");
      return;
    }

    setLoading(true);

    try {
      const data = await request(
        "/reset-password",
        {
          method: "POST",
          body: {
            token,
            password,
            confirm_password: confirmPassword,
          },
        },
        "Unable to reset your password."
      );

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      setMessage(data.message || "Your password has been updated.");
    } catch (err) {
      if (
        err.status === 400 &&
        /invalid|expired/i.test(err.message)
      ) {
        setTokenStatus("invalid");
        setTokenError(err.message);
        setPassword("");
        setConfirmPassword("");
        return;
      }

      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isExpired = /expir/i.test(tokenError);

  return (
    <section className="auth-page foundit-auth-page foundit-recovery-page">
      <div className="foundit-auth-form-panel">
        <div className="auth-card recovery-card">

          {/* PASSWORD RESET SUCCESS */}
          {success ? (
            <div className="recovery-state">
              <div className="recovery-icon recovery-icon-success">
                <CheckCircle2 size={36} strokeWidth={1.8} />
              </div>

              <span className="recovery-eyebrow">
                ACCOUNT SECURITY
              </span>

              <h1>Password updated!</h1>

              <p className="recovery-description">
                Your FoundIt password has been changed
                successfully. You can now sign in with
                your new password.
              </p>

              {message && (
                <p className="recovery-feedback" role="status">
                  <ShieldCheck size={16} />
                  {message}
                </p>
              )}

              <Link
                to="/login"
                className="btn auth-button recovery-primary"
              >
                Continue to login
                <ArrowRight size={18} />
              </Link>

              <p className="recovery-footnote">
                Keep your password private and never
                share it with anyone.
              </p>
            </div>

          ) : tokenStatus === "checking" ? (
            /* VERIFYING LINK */
            <div className="recovery-state">
              <div className="recovery-icon recovery-icon-neutral">
                <RefreshCw
                  size={33}
                  className="recovery-spin"
                />
              </div>

              <span className="recovery-eyebrow">
                ACCOUNT SECURITY
              </span>

              <h1>Checking your link</h1>

              <p className="recovery-description" role="status">
                We're making sure your password-reset
                link is still valid.
              </p>
            </div>

          ) : tokenStatus === "invalid" ? (
            /* EXPIRED, USED OR INVALID LINK */
            <div className="recovery-state">
              <div className="recovery-icon recovery-icon-invalid">
                {isExpired ? (
                  <Clock3 size={36} strokeWidth={1.8} />
                ) : (
                  <Link2Off size={36} strokeWidth={1.8} />
                )}
              </div>

              <span className="recovery-eyebrow">
                ACCOUNT SECURITY
              </span>

              <h1>
                {isExpired
                  ? "This link has expired"
                  : "This link is no longer valid"}
              </h1>

              <p className="recovery-description" role="alert">
                {tokenError ||
                  "This password-reset link may have already been used."}
              </p>

              <div className="recovery-help-note">
                <Mail size={19} aria-hidden="true" />
                <span>
                  Need to reset your password? Request
                  a fresh link and we'll send it to
                  your registered email address.
                </span>
              </div>

              <Link
                to="/forgot-password"
                className="btn auth-button recovery-primary"
              >
                Request a new link
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/login"
                className="recovery-secondary-link"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>

          ) : tokenStatus === "error" ? (
            /* TEMPORARY CONNECTION ERROR */
            <div className="recovery-state">
              <div className="recovery-icon recovery-icon-neutral">
                <RefreshCw size={33} strokeWidth={1.8} />
              </div>

              <span className="recovery-eyebrow">
                ACCOUNT SECURITY
              </span>

              <h1>We couldn't check your link</h1>

              <p className="recovery-description" role="alert">
                {tokenError}
              </p>

              <button
                type="button"
                className="btn auth-button recovery-primary"
                onClick={retryValidation}
              >
                <RefreshCw size={17} />
                Try again
              </button>

              <Link
                to="/forgot-password"
                className="recovery-secondary-link"
              >
                Request another link
              </Link>
            </div>

          ) : (
            /* VALID LINK — NEW PASSWORD FORM */
            <div className="recovery-form-state">
              <div className="recovery-icon recovery-icon-neutral">
                <KeyRound size={33} strokeWidth={1.8} />
              </div>

              <span className="recovery-eyebrow">
                ACCOUNT SECURITY
              </span>

              <h1>Create a new password</h1>

              <p className="recovery-description">
                Almost there! Choose a new password
                to keep your FoundIt account secure.
              </p>

              <form
                className="auth-form recovery-form"
                onSubmit={handleSubmit}
              >
                <div className="form-group">
                  <label htmlFor="new-password">
                    New password
                  </label>

                  <input
                    id="new-password"
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-new-password">
                    Confirm new password
                  </label>

                  <input
                    id="confirm-new-password"
                    type="password"
                    className="input"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    required
                  />
                </div>

                <PasswordStrength
                  password={password}
                  confirmPassword={confirmPassword}
                />

                {error && (
                  <p
                    className="auth-message"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn auth-button recovery-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Updating password..."
                    : "Update password"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <Link
                to="/login"
                className="recovery-secondary-link"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

export default ResetPassword;
