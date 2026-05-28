import { useState } from "react";
import "./ProfileSettings.css";

function ProfileSettings({ user, onUserUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(null);

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const ROLE_LABELS = { admin: "Admin", manager: "Manager", member: "Member" };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Update stored user and token
      localStorage.setItem("token", data.token);
      const updatedUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onUserUpdate(updatedUser);
      setProfileSuccess("Profile updated successfully.");
    } catch (e) {
      setProfileError(e.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPwSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPwError(e.message);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="profile-settings">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-header-info">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span className={`profile-role-badge role-${user?.role}`}>
            {ROLE_LABELS[user?.role] || user?.role}
          </span>
        </div>
      </div>

      <div className="profile-cards">
        {/* Profile info card */}
        <div className="profile-card">
          <h3>Profile Information</h3>
          {profileError && <div className="profile-error">{profileError}</div>}
          {profileSuccess && (
            <div className="profile-success">{profileSuccess}</div>
          )}
          <form onSubmit={handleProfileSave} className="profile-form">
            <div className="pf-row">
              <label htmlFor="pf-name">Full name</label>
              <input
                id="pf-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="pf-row">
              <label htmlFor="pf-email">Email address</label>
              <input
                id="pf-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-save"
              disabled={profileLoading}
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Password card */}
        <div className="profile-card">
          <h3>Change Password</h3>
          {pwError && <div className="profile-error">{pwError}</div>}
          {pwSuccess && <div className="profile-success">{pwSuccess}</div>}
          <form onSubmit={handlePasswordChange} className="profile-form">
            <div className="pf-row">
              <label htmlFor="pw-current">Current password</label>
              <input
                id="pw-current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="pf-row">
              <label htmlFor="pw-new">New password</label>
              <input
                id="pw-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            <div className="pf-row">
              <label htmlFor="pw-confirm">Confirm new password</label>
              <input
                id="pw-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn-save" disabled={pwLoading}>
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
