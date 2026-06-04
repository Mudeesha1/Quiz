const express = require("express");

const adminRoutes = express.Router();

// Public Routes
adminRoutes.get("/health", (req, res) => {
    res.status(200).json({
    status: "success",
    message: "Admin Server is running",
    timestamp: new Date().toISOString(),
    });
});
// Protect following routes with auth + role check

// protected routes for registered users

module.exports = adminRoutes;