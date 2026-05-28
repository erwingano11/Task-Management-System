import { useState, useEffect } from "react";
import "./AcceptInvite.css";

function AcceptInvite({ onLogin }) {
  const token = new URLSearchParams(window.location.search).get("token");

  const [invite, setInvite] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | valid | invalid | success
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const ROLE_LABELS = { admin: "Admin", manager: "Manager", member: "Member" };

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    fetch(`/api/account/accept-invite?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(d.error));
        return res.json();
      })
      .then((data) => {
        setInvite(data);
        setStatus("valid");
      })
      .catch((e) => {
        setError(e || "Invalid or expired invitation.");
        setStatus("invalid");
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/account/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Auto-login
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          accountId: data.accountId,
        }),
      );
      setStatus("success");
      onLogin({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        accountId: data.accountId,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="accept-invite-page">
      <div className="accept-invite-card">
        <div className="accept-invite-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">WorkMS</span>
        </div>

        {status === "loading" && (
          <p className="ai-loading">Validating your invitation...</p>
        )}

        {status === "invalid" && (
          <div className="ai-invalid">
            <div className="ai-invalid-icon">✕</div>
            <h2>Invitation Invalid</h2>
            <p>{error || "This invitation link is invalid or has expired."}</p>
          </div>
        )}

        {status === "valid" && invite && (
          <>
            <h2>You've been invited!</h2>
            <p className="ai-subtitle">
              {invite.accountName && (
                <>
                  Join <strong>{invite.accountName}</strong> on WorkMS as a
                </>
              )}
              {!invite.accountName && (
                <>You've been invited to join WorkMS as a</>
              )}{" "}
              <strong>{ROLE_LABELS[invite.role] || invite.role}</strong>.
              <br />
              Account email: <strong>{invite.email}</strong>
            </p>

            {error && <div className="ai-error">{error}</div>}

            <form className="ai-form" onSubmit={handleSubmit}>
              <div className="ai-row">
                <label htmlFor="ai-name">Your full name</label>
                <input
                  id="ai-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                />
              </div>
              <div className="ai-row">
                <label htmlFor="ai-password">Create password</label>
                <input
                  id="ai-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="ai-row">
                <label htmlFor="ai-confirm">Confirm password</label>
                <input
                  id="ai-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="ai-btn" disabled={submitting}>
                {submitting ? "Creating account..." : "Create Account & Join"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default AcceptInvite;
