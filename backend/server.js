const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const taskRoutes = require("./routes/tasks");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/account");
const { authenticateToken } = require("./middleware/auth");

const app = express();

const allowedOrigins = [
  "https://wms.zeveph.com",
  "http://localhost:3000",
  "http://localhost:5000",
];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

// Serve built frontend
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", authenticateToken, taskRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/account", accountRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// SPA catch-all — serve index.html for any non-API route
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}`);
});
