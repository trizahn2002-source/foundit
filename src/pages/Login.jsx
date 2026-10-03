import { useState } from "react";

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isRegistering ? "Create an account" : "Welcome back"}</h1>

          <p>
            {isRegistering
              ? "Create an account to start using FoundIt."
              : "Log in to manage your lost and found items."}
          </p>
        </div>

        <form className="auth-form">
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Enter your password"
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
  type="button"
  className="btn auth-button"
  onClick={() =>
    setMessage(
      isRegistering
        ? "Registration is not available yet. Authentication will be added in a later phase."
        : "Login is not available yet. Authentication will be added in a later phase."
    )
  }
>
  {isRegistering ? "Create account" : "Log in"}
</button>

{message && <p className="auth-message">{message}</p>}
        </form>

        <div className="auth-switch">
          <p>
            {isRegistering
              ? "Already have an account?"
              : "Don't have an account?"}
          </p>

          <button
            type="button"
            className="switch-button"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Log in" : "Register"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Login;