const express = require("express");
const router = express.Router();
const { createUser, loginUser } = require("../controllers/userController");

// POST /api/auth/register
router.post("/register", createUser);

// POST /api/auth/login
router.post("/login", loginUser);

module.exports = router;
