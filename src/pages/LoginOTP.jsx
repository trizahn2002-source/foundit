import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { request } from "../utils/api";

function LoginOTP() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const [resending, setResending] = useState(false);

  async function verify(event) {
    event.preventDefault();
    if (!/^[0-9]{6}$/.test(code)) {
      setMessage("Please enter your six-digit code.");
      return;
    }
    setWorking(true);
    setMessage("");
    try {
      const data = await request("/login/verify-otp", { method: "POST", body: { code } });
      setUser(data.user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally { setWorking(false); }
  }

  async function resend() {
    setResending(true);
    setMessage("");
    try {
      const data = await request("/login/resend-otp", { method: "POST" });
      setMessage(data.message || "A new code was sent.");
    } catch (error) { setMessage(error.message); }
    finally { setResending(false); }
  }

  return (
    <section className="auth-page foundit-auth-page">
      <div className="foundit-auth-form-panel">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Verify your sign-in</h1>
            <p>Enter the six-digit code sent to your verified email. It expires in 5 minutes.</p>
          </div>
          <form className="auth-form" onSubmit={verify}>
            <div className="form-group">
              <label htmlFor="login-code">Sign-in code</label>
              <input id="login-code" className="input" type="text" inputMode="numeric" autoComplete="one-time-code"
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                pattern="[0-9]{6}" maxLength={6} required />
            </div>
            {message && <p className="auth-message" role="status">{message}</p>}
            <button className="btn auth-button" type="submit" disabled={working || resending}>
              {working ? "Verifying..." : "Verify and log in"}
            </button>
          </form>
          <div className="auth-switch">
            <button type="button" className="switch-button" disabled={working || resending} onClick={resend}>
              {resending ? "Sending..." : "Resend code"}
            </button>
            <p style={{ display: "block", marginTop: 16 }}><Link to="/login">Back to login</Link></p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginOTP;
