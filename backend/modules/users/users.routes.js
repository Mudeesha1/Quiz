const express = require("express");
const registerUser = require("./controllers/register.controller");
const loginUser = require("./controllers/login.controller");

const usersRoutes = express.Router();

// Public Routes
usersRoutes.post("/register", registerUser);
usersRoutes.post("/login", loginUser);

// Protect following routes with auth + role check

// protected routes for registered users

module.exports = usersRoutes;