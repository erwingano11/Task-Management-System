import { useState, useEffect } from "react";
import "./AccountManagement.css";

const ROLE_LABELS = { admin: "Admin", manager: "Manager", member: "Member" };
const ROLE_ORDER = ["admin", "manager", "member"];

function RoleBadge({ role }) {
  return (
    <span className={`role-badge role-${role}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

function AccountManagement({
  user,
  onUserUpdate,
  onAccountNameChange,
  onWorkspaceJoined,
}) {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [myInvitations, setMyInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Account info state
  const [accountName, setAccountName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [accountNameInput, setAccountNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);

  // Active tab
  const [tab, setTab] = useState("members");

  const isAdmin = user?.role === "admin";
  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/account/members", { headers: headers() });
      if (!res.ok) throw new Error(await res.text());
      setMembers(await res.json());
    } catch (e) {
      setError("Failed to load members.");
    }
  };

  const fetchAccountInfo = async () => {
    try {
      const res = await fetch("/api/account/info", { headers: headers() });
      if (!res.ok) return;
      const data = await res.json();
      setAccountName(data.name);
      setAccountNameInput(data.name);
    } catch (_) {}
  };

  const fetchMyInvitations = async () => {
    try {
      const res = await fetch("/api/account/my-invitation", {
        headers: headers(),
      });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      setMyInvitations(await res.json());
    } catch (e) {
      setError("Failed to load your invitation: " + e.message);
    }
  };

  const fetchInvitations = async () => {
    if (!isAdminOrManager) return;
    try {
      const res = await fetch("/api/account/invitations", {
        headers: headers(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Error ${res.status}`);
      }
      setInvitations(await res.json());
    } catch (e) {
      setError(`Failed to load invitations: ${e.message}`);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchMembers(),
      fetchInvitations(),
      fetchAccountInfo(),
      fetchMyInvitations(),
    ]).finally(() => setLoading(false));
  }, [user?.accountId]);

  const handleRoleChange = async (memberId, newRole) => {
    setError(null);
    try {
      const res = await fetch(`/api/account/members/${memberId}/role`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );
      showSuccess("Role updated successfully.");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the team?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/account/members/${memberId}`, {
        method: "DELETE",
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      showSuccess(`${memberName} has been removed.`);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setError(null);
    setInviteLink(null);
    try {
      const res = await fetch("/api/account/invite", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const link = data.inviteLink;
      setInviteLink(link);
      setInviteEmail("");
      setInviteRole("member");
      showSuccess("Invitation created! Share the link below.");
      await fetchInvitations();
      setTab("invitations");
    } catch (e) {
      setError(e.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevokeInvitation = async (inviteId) => {
    setError(null);
    try {
      const res = await fetch(`/api/account/invitations/${inviteId}`, {
        method: "DELETE",
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInvitations((prev) =>
        prev.map((i) => (i.id === inviteId ? { ...i, status: "expired" } : i)),
      );
      showSuccess("Invitation revoked.");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSaveAccountName = async () => {
    if (!accountNameInput.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/account/info", {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ name: accountNameInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAccountName(data.name);
      setEditingName(false);
      if (onAccountNameChange) onAccountNameChange(data.name);
      showSuccess("Workspace name updated.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingName(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => showSuccess("Copied to clipboard!"));
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  if (loading) return <div className="acct-loading">Loading team...</div>;

  return (
    <div className="account-management">
      <div className="acct-header">
        <h2>Account Management</h2>
        <p className="acct-subtitle">
          Manage your team members, roles, and invitations.
        </p>
      </div>

      {/* Workspace name */}
      <div className="acct-workspace-card">
        <div className="acct-workspace-label">Workspace Name</div>
        {editingName ? (
          <div className="acct-workspace-edit">
            <input
              className="acct-workspace-input"
              value={accountNameInput}
              onChange={(e) => setAccountNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveAccountName()}
              autoFocus
            />
            <button
              className="acct-btn-primary"
              onClick={handleSaveAccountName}
              disabled={savingName}
            >
              {savingName ? "Saving…" : "Save"}
            </button>
            <button
              className="acct-btn-secondary"
              onClick={() => {
                setEditingName(false);
                setAccountNameInput(accountName);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="acct-workspace-display">
            <span className="acct-workspace-name">{accountName}</span>
            {user?.role === "admin" && (
              <button
                className="acct-btn-edit"
                onClick={() => setEditingName(true)}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {error && <div className="acct-error">{error}</div>}
      {success && <div className="acct-success">{success}</div>}

      <div className="acct-tabs">
        <button
          className={`acct-tab ${tab === "members" ? "active" : ""}`}
          onClick={() => setTab("members")}
        >
          Team Members ({members.length})
        </button>
        {isAdminOrManager && (
          <button
            className={`acct-tab ${tab === "invitations" ? "active" : ""}`}
            onClick={() => {
              setTab("invitations");
              fetchInvitations();
            }}
          >
            Invitations (
            {invitations.filter((i) => i.status === "pending").length})
          </button>
        )}
        {isAdminOrManager && (
          <button
            className={`acct-tab ${tab === "invite" ? "active" : ""}`}
            onClick={() => setTab("invite")}
          >
            Invite Member
          </button>
        )}
        <button
          className={`acct-tab ${tab === "my-invitation" ? "active" : ""}`}
          onClick={() => setTab("my-invitation")}
        >
          My Invitation
        </button>
      </div>

      {tab === "members" && (
        <div className="acct-section">
          <div className="members-table-wrap">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className={member.id === user.id ? "current-user-row" : ""}
                  >
                    <td>
                      <div className="member-info">
                        <div className="member-avatar">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="member-name">
                          {member.name}
                          {member.id === user.id && (
                            <span className="you-badge"> (You)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>
                      {isAdmin && member.id !== user.id ? (
                        <select
                          className="role-select"
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member.id, e.target.value)
                          }
                        >
                          {ROLE_ORDER.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}
                    </td>
                    <td>{formatDate(member.createdAt)}</td>
                    {isAdmin && (
                      <td>
                        {member.id !== user.id && (
                          <button
                            className="btn-remove"
                            onClick={() =>
                              handleRemoveMember(member.id, member.name)
                            }
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "invitations" && isAdminOrManager && (
        <div className="acct-section">
          {inviteLink && (
            <div className="invite-link-box" style={{ marginBottom: "16px" }}>
              <p>
                <strong>Last created invite link</strong> — share with your new
                team member:
              </p>
              <div className="invite-link-row">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="invite-link-input"
                />
                <button
                  className="btn-copy"
                  onClick={() => copyToClipboard(inviteLink)}
                >
                  Copy
                </button>
              </div>
              <p className="invite-link-note">This link expires in 7 days.</p>
            </div>
          )}
          {invitations.length === 0 ? (
            <p className="acct-empty">No invitations sent yet.</p>
          ) : (
            <div className="members-table-wrap">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Invited By</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.email}</td>
                      <td>
                        <RoleBadge role={inv.role} />
                      </td>
                      <td>
                        <span className={`status-badge status-${inv.status}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>{inv.invitedByName || "—"}</td>
                      <td>{formatDate(inv.expiresAt)}</td>
                      <td>
                        {inv.status === "pending" && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              className="btn-copy"
                              onClick={() => copyToClipboard(inv.inviteLink)}
                              title={inv.inviteLink}
                            >
                              Copy Link
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => handleRevokeInvitation(inv.id)}
                            >
                              Revoke
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "invite" && isAdminOrManager && (
        <div className="acct-section invite-section">
          <h3>Invite a New Member</h3>
          <p className="acct-subtitle">
            Send an invitation link to a new team member. The link expires in 7
            days.
          </p>
          <form className="invite-form" onSubmit={handleInvite}>
            <div className="form-row">
              <label htmlFor="invite-email">Email address</label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                required
              />
            </div>
            <div className="form-row">
              <label htmlFor="invite-role">Role</label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                {ROLE_ORDER.filter(
                  (r) => !(r === "admin" && user.role !== "admin"),
                ).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn-invite"
              disabled={inviteLoading}
            >
              {inviteLoading ? "Creating..." : "Create Invitation"}
            </button>
          </form>
        </div>
      )}

      {tab === "my-invitation" && (
        <div className="acct-section">
          <h3>My Invitation History</h3>
          <p className="acct-subtitle">
            Invitations sent to your email across all workspaces.
          </p>
          {myInvitations.length === 0 ? (
            <div className="acct-empty-state">
              <span className="acct-empty-icon">📬</span>
              <p>
                No invitation record found — you may have joined by registering
                directly.
              </p>
            </div>
          ) : (
            <div className="members-table-wrap">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Workspace</th>
                    <th>Role Granted</th>
                    <th>Status</th>
                    <th>Invited By</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {myInvitations.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.workspaceName || "—"}</td>
                      <td>
                        <RoleBadge role={inv.role} />
                      </td>
                      <td>
                        <span className={`status-badge status-${inv.status}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>{inv.invitedByName || "—"}</td>
                      <td>{formatDate(inv.createdAt)}</td>
                      <td>
                        {inv.status === "pending" && (
                          <button
                            className="acct-btn-sm acct-btn-primary"
                            onClick={async () => {
                              try {
                                const res = await fetch(
                                  `/api/account/my-invitation/${inv.id}/accept`,
                                  { method: "POST", headers: headers() },
                                );
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error);
                                showSuccess(data.message);
                                await fetchMyInvitations();
                                if (onWorkspaceJoined)
                                  await onWorkspaceJoined();
                              } catch (e) {
                                setError(e.message);
                              }
                            }}
                          >
                            Accept
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AccountManagement;
