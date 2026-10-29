
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { request } from "../utils/api";


function post(path, body) {
  return request(
    path,
    { method: "POST", body },
    "Something went wrong."
  );
}

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setMessage("");

    if (!/^[0-9]{6}$/.test(code)) {
      setMessage("Please enter the six-digit code.");
      return;
    }

    setLoading(true);

    try {
      const data = await post("/verify-email", {
        email: email.trim().toLowerCase(),
        code,
      });

      setSuccess(true);
      setPassword("");
      setCode("");
      setMessage(data.message || "Email verified successfully!");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(e) {
    e.preventDefault();
    setMessage("");
    setResending(true);

    try {
      const data = await post("/resend-verification", {
        email: email.trim().toLowerCase(),
        password,
      });

      setPassword("");
      setCode("");
      setMessage(data.message || "A new code has been sent.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <section className="auth-page foundit-auth-page">
      <div className="foundit-auth-form-panel">
        <div className="auth-card">
          <div className="auth-header">
            <MailCheck
              size={44}
              aria-hidden="true"
              style={{ color: "#e07a5f", marginBottom: 12 }}
            />

            <h1>
              {success ? "Email verified!" : "Verify your email"}
            </h1>

            <p>
              {success
                ? "Your FoundIt email address is verified. You can now sign in."
                : "Enter the six-digit verification code we sent to your inbox. The code expires in 5 minutes."}
            </p>
          </div>

          {message && (
            <p
              className="auth-message"
              role={success ? "status" : "alert"}
            >
              {message}
            </p>
          )}

          {success ? (
            <button
              type="button"
              className="btn auth-button"
              onClick={() => navigate("/login")}
            >
              Continue to login
            </button>
          ) : (
            <>
              <form className="auth-form" onSubmit={handleVerify}>
                <div className="form-group">
                  <label htmlFor="verify-email">
                    Email address
                  </label>
                  <input
                    id="verify-email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="verification-code">
                    Verification code
                  </label>
                  <input
                    id="verification-code"
                    type="text"
                    className="input"
                    placeholder="000000"
                    value={code}
                    onChange={(e) =>
                      setCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn auth-button"
                  disabled={loading || resending}
                >
                  {loading ? "Verifying..." : "Verify email"}
                </button>
              </form>

              <form
                className="auth-form"
                onSubmit={handleResend}
                style={{ marginTop: 20 }}
              >
                <p>
                  Didn't receive the code? Enter your account
                  password to request a new one.
                </p>

                <div className="form-group">
                  <label htmlFor="resend-password">
                    Account password
                  </label>
                  <input
                    id="resend-password"
                    type="password"
                    className="input"
                    placeholder="Your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="switch-button"
                  disabled={resending || loading}
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              </form>
            </>
          )}

          <div className="auth-switch" style={{ marginTop: 24 }}>
            <button
              type="button"
              className="switch-button"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VerifyEmail;
