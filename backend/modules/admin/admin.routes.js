const express = require("express");
const { loginAdmin, registerAdmin } = require("./controllers/adminAuth.controller");
const { getAllUsers, createUser, updateUser, deleteUser, getUserPerformance, getDashboardStats } = require("./controllers/adminUser.controller");
const { requireAdmin } = require("../../middleware/auth");
const { uploadSingleFile } = require("../../middleware/fileUpload");

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

// Protected Admin Routes
adminRoutes.get("/users", requireAdmin, getAllUsers);
adminRoutes.post("/users", requireAdmin, uploadSingleFile("profiles"), createUser);
adminRoutes.put("/users/:userId", requireAdmin, uploadSingleFile("profiles"), updateUser);
adminRoutes.delete("/users/:userId", requireAdmin, deleteUser);
adminRoutes.get("/users/:userId/performance", requireAdmin, getUserPerformance);
adminRoutes.get("/dashboard-stats", requireAdmin, getDashboardStats);

module.exports = adminRoutes;