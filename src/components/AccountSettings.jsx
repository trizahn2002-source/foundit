import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { request } from "../utils/api";

export default function AccountSettings({ user, onUserChanged }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [name, setName] = useState(user.display_name || user.username || "");
  const [googleOnly, setGoogleOnly] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [googleCredential, setGoogleCredential] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [openSection, setOpenSection] = useState("profile");
  const googleButton = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    setName(user.display_name || user.username || "");
  }, [user.display_name, user.username]);

  useEffect(() => {
    let cancelled = false;
    request("/account")
      .then((data) => { if (!cancelled) setGoogleOnly(Boolean(data.google_only)); })
      .catch((err) => { if (!cancelled) setMessage(err.message); });
    return () => { cancelled = true; };
  }, []);

  const googleCallback = useCallback((response) => {
    setGoogleCredential(response?.credential || "");
    setMessage(response?.credential
      ? "Google identity confirmed. Type DELETE below to continue."
      : "Google confirmation failed.");
  }, []);

  useEffect(() => {
    if (openSection !== "delete" || !googleOnly || !googleClientId || !googleButton.current) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !googleButton.current || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({ client_id: googleClientId, callback: googleCallback });
      googleButton.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: "outline", size: "large", text: "continue_with", width: 300,
      });
    };
    if (window.google?.accounts?.id) render();
    else {
      let script = document.getElementById("google-identity-services");
      if (!script) {
        script = document.createElement("script");
        script.id = "google-identity-services";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      return () => { cancelled = true; script.removeEventListener("load", render); };
    }
    return () => { cancelled = true; };
  }, [openSection, googleOnly, googleClientId, googleCallback]);

  async function perform(action) {
    setBusy(true);
    setMessage("");
    try { await action(); }
    catch (err) { setMessage(err.message || "Please try again."); }
    finally { setBusy(false); }
  }

  function toggle(section) {
    if (busy) return;
    setOpenSection((current) => current === section ? null : section);
    setMessage("");
    setDeletePassword("");
    setConfirmation("");
    setGoogleCredential("");
  }

  const sections = [
    { id: "profile", Icon: UserRound, title: "Personal information", subtitle: "Update how FoundIt addresses you." },
    { id: "security", Icon: ShieldCheck, title: "Account security", subtitle: "Manage your sign-in and password." },
    { id: "delete", Icon: Trash2, title: "Delete account", subtitle: "Permanently remove your account and its data." },
  ];

  return (
    <div className="foundit-settings" aria-label="Account settings">
      <div className="foundit-settings-intro">
        <div className="foundit-settings-avatar" aria-hidden="true">
          {(user.display_name || user.username || "?").charAt(0).toUpperCase()}
        </div>
        <div className="foundit-settings-identity">
          <h3>{user.display_name || user.username}</h3>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="foundit-settings-sections">
        {sections.map(({ id, Icon, title, subtitle }) => (
          <section key={id} className={`foundit-settings-section ${id === "delete" ? "is-danger" : ""} ${openSection === id ? "is-expanded" : ""}`}>
            <button
              type="button"
              className="foundit-settings-trigger"
              aria-expanded={openSection === id}
              aria-controls={`foundit-settings-${id}`}
              onClick={() => toggle(id)}
              disabled={busy}
            >
              <span className="foundit-settings-icon"><Icon size={21} aria-hidden="true" /></span>
              <span className="foundit-settings-trigger-text">
                <strong>{title}</strong>
                <small>{subtitle}</small>
              </span>
              <ChevronDown className="foundit-settings-chevron" size={19} aria-hidden="true" />
            </button>

            {openSection === id && (
              <div id={`foundit-settings-${id}`} className="foundit-settings-body">
                {id === "profile" && (
                  <form onSubmit={(event) => {
                    event.preventDefault();
                    perform(async () => {
                      const data = await request("/account/display-name", { method: "PATCH", body: { display_name: name } });
                      onUserChanged(data.user);
                      setUser(data.user);
                      setMessage("Display name saved.");
                    });
                  }}>
                    <p className="foundit-settings-help">Choose the name shown in your dashboard and account menu.</p>
                    <label htmlFor="account-display-name">Display name</label>
                    <input id="account-display-name" className="input" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} required />
                    <button type="submit" className="btn foundit-settings-save" disabled={busy}>Save changes</button>
                  </form>
                )}

                {id === "security" && (
                  googleOnly === null ? <p className="foundit-settings-help">Loading sign-in settings…</p> :
                  googleOnly ? (
                    <div className="foundit-settings-provider">
                      <ShieldCheck size={20} aria-hidden="true" />
                      <div><strong>Google Sign-In</strong><p>Your account uses Google authentication. You don't need a FoundIt password.</p></div>
                    </div>
                  ) : (
                    <form autoComplete="off" onSubmit={(event) => {
                      event.preventDefault();
                      perform(async () => {
                        const result = await request("/account/change-password", {
                          method: "POST",
                          body: { current_password: currentPassword, new_password: newPassword },
                        });
                        setCurrentPassword(""); setNewPassword(""); setUser(null);
                        navigate("/login", { replace: true, state: { notice: result.message } });
                      });
                    }}>
                      <p className="foundit-settings-help">After changing your password, you'll need to log in again.</p>
                      <label htmlFor="account-old-password">Current password</label>
                      <input id="account-old-password" className="input" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                      <label htmlFor="account-new-password">New password</label>
                      <input id="account-new-password" className="input" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                      <button className="btn foundit-settings-save" type="submit" disabled={busy}>Change password</button>
                    </form>
                  )
                )}

                {id === "delete" && (
                  <form onSubmit={(event) => {
                    event.preventDefault();
                    if (!window.confirm("Permanently delete your FoundIt account, your reports, and any claims on those reports? This cannot be undone.")) return;
                    perform(async () => {
                      await request("/account/delete", { method: "POST", body: {
                        confirmation,
                        ...(googleOnly ? { google_credential: googleCredential } : { password: deletePassword }),
                      }});
                      setUser(null);
                      navigate("/", { replace: true });
                    });
                  }}>
                    <p className="foundit-settings-danger-notice">This permanently deletes your account, reports, claims, and claims on your reports. This cannot be undone.</p>
                    {googleOnly === true && <>
                      <p className="foundit-settings-help">Authenticate with the same Google account you use for FoundIt.</p>
                      <div ref={googleButton} className="foundit-settings-google-button" />
                      {!googleClientId && <p role="alert">Google Client ID is missing.</p>}
                    </>}
                    {googleOnly === false && <>
                      <label htmlFor="account-delete-password">Confirm current password</label>
                      <input id="account-delete-password" className="input" type="password" autoComplete="current-password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required />
                    </>}
                    <label htmlFor="account-delete-confirmation">Type DELETE to confirm</label>
                    <input id="account-delete-confirmation" className="input" autoComplete="off" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required />
                    <button type="submit" className="foundit-settings-delete-button" disabled={busy || googleOnly === null || confirmation !== "DELETE" || (googleOnly && !googleCredential)}>
                      Permanently delete my account
                    </button>
                  </form>
                )}
                {message && <p role="status" className="foundit-settings-message">{message}</p>}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
