const express = require("express");
const { loginAdmin, registerAdmin } = require("./controllers/adminAuth.controller");

const adminRoutes = express.Router();

// Public Routes
adminRoutes.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Admin Server is running",
    timestamp: new Date().toISOString(),
  });
});

adminRoutes.post("/login", loginAdmin);
adminRoutes.post("/register", registerAdmin);

module.exports = adminRoutes;