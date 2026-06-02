const pool = require("../db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");
const crypto = require("crypto");

// GET /api/account/info
const getAccountInfo = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT id, name, billingName, billingEmail, createdAt FROM accounts WHERE id = ?",
      [req.user.accountId],
    );
    connection.release();
    if (rows.length === 0)
      return res.status(404).json({ error: "Account not found." });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/account/info  (admin only)
const updateAccountInfo = async (req, res) => {
  try {
    const { name, billingName, billingEmail } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Account name is required." });
    if (billingEmail && billingEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(billingEmail.trim()))
        return res
          .status(400)
          .json({ error: "Invalid billing email address." });
    }
    const connection = await pool.getConnection();
    await connection.query(
      "UPDATE accounts SET name = ?, billingName = ?, billingEmail = ? WHERE id = ?",
      [
        name.trim(),
        billingName ? billingName.trim() : null,
        billingEmail ? billingEmail.trim() : null,
        req.user.accountId,
      ],
    );
    connection.release();
    res.json({
      message: "Account info updated.",
      name: name.trim(),
      billingName: billingName ? billingName.trim() : null,
      billingEmail: billingEmail ? billingEmail.trim() : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/account/my-workspaces
const getMyWorkspaces = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [workspaces] = await connection.query(
      `SELECT a.id, a.name, am.role, am.joinedAt,
              (a.id = ?) AS isActive
       FROM account_members am
       JOIN accounts a ON a.id = am.accountId
       WHERE am.userId = ?
       ORDER BY am.joinedAt ASC`,
      [req.user.accountId, req.user.id],
    );
    connection.release();
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/account/switch/:accountId
const switchWorkspace = async (req, res) => {
  try {
    const { accountId } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT role FROM account_members WHERE userId = ? AND accountId = ?",
      [req.user.id, accountId],
    );
    if (rows.length === 0) {
      connection.release();
      return res
        .status(403)
        .json({ error: "You are not a member of this workspace." });
    }
    const role = rows[0].role;
    await connection.query("UPDATE users SET accountId = ? WHERE id = ?", [
      accountId,
      req.user.id,
    ]);
    connection.release();
    const token = jwt.sign(
      {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role,
        accountId,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role,
      accountId,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/account/workspaces  — create a new workspace
const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Workspace name is required." });
    const connection = await pool.getConnection();
    const accountId = uuidv4();
    await connection.query(
      "INSERT INTO accounts (id, name, createdAt) VALUES (?, ?, NOW())",
      [accountId, name.trim()],
    );
    await connection.query(
      "INSERT INTO account_members (userId, accountId, role, joinedAt) VALUES (?, ?, 'admin', NOW())",
      [req.user.id, accountId],
    );
    // Switch user to new workspace
    await connection.query("UPDATE users SET accountId = ? WHERE id = ?", [
      accountId,
      req.user.id,
    ]);
    connection.release();
    const token = jwt.sign(
      {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: "admin",
        accountId,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );
    res.status(201).json({
      accountId,
      name: name.trim(),
      role: "admin",
      token,
      id: req.user.id,
      email: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/account/my-invitation  — current user's own invitation(s) for this workspace
const getMyInvitation = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT i.id, i.email, i.role, i.status, i.createdAt, i.expiresAt,
              u.name AS invitedByName,
              a.name AS workspaceName
       FROM invitations i
       LEFT JOIN users u ON u.id = i.invitedBy
       LEFT JOIN accounts a ON a.id = i.accountId
       WHERE i.email = ?
       ORDER BY i.createdAt DESC`,
      [req.user.email],
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/account/my-invitation/:id/accept — logged-in user accepts a pending invite
const acceptMyInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Verify the invitation belongs to this user and is still pending
    const [invRows] = await connection.query(
      "SELECT * FROM invitations WHERE id = ? AND email = ? AND status = 'pending'",
      [id, req.user.email],
    );
    if (invRows.length === 0) {
      connection.release();
      return res
        .status(404)
        .json({ error: "Invitation not found or already used." });
    }
    const invite = invRows[0];

    // Check if already a member
    const [existing] = await connection.query(
      "SELECT 1 FROM account_members WHERE userId = ? AND accountId = ?",
      [req.user.id, invite.accountId],
    );
    if (existing.length > 0) {
      await connection.query(
        "UPDATE invitations SET status = 'accepted' WHERE id = ?",
        [id],
      );
      connection.release();
      return res.json({
        message: "You are already a member of this workspace.",
      });
    }

    // Add to workspace
    await connection.query(
      "INSERT INTO account_members (userId, accountId, role, joinedAt) VALUES (?, ?, ?, NOW())",
      [req.user.id, invite.accountId, invite.role],
    );
    // Mark accepted
    await connection.query(
      "UPDATE invitations SET status = 'accepted' WHERE id = ?",
      [id],
    );
    connection.release();
    res.json({
      message: "Invitation accepted. You can now switch to the workspace.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/account/members
const getMembers = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      `SELECT u.id, u.name, u.email, am.role, am.joinedAt AS createdAt
       FROM account_members am
       JOIN users u ON u.id = am.userId
       WHERE am.accountId = ?
       ORDER BY am.joinedAt ASC`,
      [req.user.accountId],
    );
    connection.release();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/account/members/:id/role  (admin only)
const updateMemberRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["admin", "manager", "member"].includes(role))
      return res.status(400).json({ error: "Invalid role." });
    if (id === req.user.id)
      return res
        .status(400)
        .json({ error: "You cannot change your own role." });
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "UPDATE account_members SET role = ? WHERE userId = ? AND accountId = ?",
      [role, id, req.user.accountId],
    );
    connection.release();
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ error: "User not found in this workspace." });
    res.json({ message: "Role updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/account/members/:id  (admin only)
const removeMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id)
      return res.status(400).json({ error: "You cannot remove yourself." });
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "DELETE FROM account_members WHERE userId = ? AND accountId = ?",
      [id, req.user.accountId],
    );
    connection.release();
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ error: "User not found in this workspace." });
    res.json({ message: "Member removed successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/account/invite  (admin or manager)
const inviteUser = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });
    const inviteRole = ["admin", "manager", "member"].includes(role)
      ? role
      : "member";
    const connection = await pool.getConnection();
    await connection.query(
      "UPDATE invitations SET status = 'expired' WHERE email = ? AND accountId = ? AND status = 'pending'",
      [email, req.user.accountId],
    );
    const id = uuidv4();
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await connection.query(
      "INSERT INTO invitations (id, email, role, token, invitedBy, accountId, status, expiresAt) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)",
      [
        id,
        email,
        inviteRole,
        token,
        req.user.id,
        req.user.accountId,
        expiresAt,
      ],
    );
    connection.release();
    const appUrl =
      process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    res.status(201).json({
      message: "Invitation created.",
      token,
      inviteLink: `${appUrl}/accept-invite?token=${token}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/account/invitations  (admin or manager)
const getInvitations = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query(
      "UPDATE invitations SET status = 'expired' WHERE status = 'pending' AND expiresAt < NOW()",
    );
    const [invitations] = await connection.query(
      `SELECT i.id, i.email, i.role, i.status, i.expiresAt, i.createdAt,
              u.name AS invitedByName,
              i.token
       FROM invitations i LEFT JOIN users u ON u.id = i.invitedBy
       WHERE i.accountId = ? ORDER BY i.createdAt DESC`,
      [req.user.accountId],
    );
    console.log("Invitations fetched:", invitations);
    const appUrl =
      process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    const result = invitations.map((inv) => ({
      ...inv,
      inviteLink:
        inv.token && inv.status === "pending"
          ? `${appUrl}/accept-invite?token=${inv.token}`
          : null,
      token: undefined,
    }));
    connection.release();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/account/invitations/:id  (admin or manager)
const revokeInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "UPDATE invitations SET status = 'expired' WHERE id = ? AND accountId = ? AND status = 'pending'",
      [id, req.user.accountId],
    );
    connection.release();
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ error: "Invitation not found or already resolved." });
    res.json({ message: "Invitation revoked." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/account/accept-invite?token=...  (public)
const validateInviteToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token is required." });
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT i.id, i.email, i.role, i.status, i.expiresAt, a.name AS accountName
       FROM invitations i LEFT JOIN accounts a ON a.id = i.accountId WHERE i.token = ?`,
      [token],
    );
    connection.release();
    if (rows.length === 0)
      return res.status(404).json({ error: "Invitation not found." });
    const invite = rows[0];
    if (
      invite.status !== "pending" ||
      new Date(invite.expiresAt) < new Date()
    ) {
      return res
        .status(410)
        .json({ error: "Invitation has expired or already been used." });
    }
    res.json({
      email: invite.email,
      role: invite.role,
      accountName: invite.accountName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/account/accept-invite  (public)
const acceptInvite = async (req, res) => {
  try {
    const { token, name, password } = req.body;
    if (!token || !name || !password)
      return res
        .status(400)
        .json({ error: "Token, name, and password are required." });
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT id, email, role, status, expiresAt, accountId FROM invitations WHERE token = ?",
      [token],
    );
    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Invitation not found." });
    }
    const invite = rows[0];
    if (
      invite.status !== "pending" ||
      new Date(invite.expiresAt) < new Date()
    ) {
      connection.release();
      return res
        .status(410)
        .json({ error: "Invitation has expired or already been used." });
    }
    const [existing] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [invite.email],
    );
    if (existing.length > 0) {
      connection.release();
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.query(
      "INSERT INTO users (id, name, email, password, accountId, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
      [id, name, invite.email, hashedPassword, invite.accountId],
    );
    await connection.query(
      "INSERT IGNORE INTO account_members (userId, accountId, role, joinedAt) VALUES (?, ?, ?, NOW())",
      [id, invite.accountId, invite.role],
    );
    await connection.query(
      "UPDATE invitations SET status = 'accepted' WHERE id = ?",
      [invite.id],
    );
    connection.release();
    const jwtToken = jwt.sign(
      {
        id,
        name,
        email: invite.email,
        role: invite.role,
        accountId: invite.accountId,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );
    res.status(201).json({
      id,
      name,
      email: invite.email,
      role: invite.role,
      accountId: invite.accountId,
      token: jwtToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/account/profile
const getProfile = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT id, name, email, accountId, createdAt FROM users WHERE id = ?",
      [req.user.id],
    );
    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "User not found." });
    }
    const user = rows[0];
    const [memberRows] = await connection.query(
      "SELECT role FROM account_members WHERE userId = ? AND accountId = ?",
      [user.id, user.accountId],
    );
    connection.release();
    const role = memberRows.length > 0 ? memberRows[0].role : "member";
    res.json({ ...user, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/account/profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "Name and email are required." });
    const connection = await pool.getConnection();
    const [conflict] = await connection.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, req.user.id],
    );
    if (conflict.length > 0) {
      connection.release();
      return res.status(409).json({ error: "Email already in use." });
    }
    await connection.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, req.user.id],
    );
    connection.release();
    const jwtToken = jwt.sign(
      {
        id: req.user.id,
        name,
        email,
        role: req.user.role,
        accountId: req.user.accountId,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );
    res.json({
      id: req.user.id,
      name,
      email,
      role: req.user.role,
      accountId: req.user.accountId,
      token: jwtToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/account/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ error: "Current and new password are required." });
    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters." });
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id],
    );
    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "User not found." });
    }
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) {
      connection.release();
      return res.status(401).json({ error: "Current password is incorrect." });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await connection.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      req.user.id,
    ]);
    connection.release();
    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAccountInfo,
  updateAccountInfo,
  getMyWorkspaces,
  switchWorkspace,
  createWorkspace,
  getMembers,
  updateMemberRole,
  removeMember,
  inviteUser,
  getInvitations,
  revokeInvitation,
  getMyInvitation,
  acceptMyInvitation,
  validateInviteToken,
  acceptInvite,
  getProfile,
  updateProfile,
  changePassword,
};
