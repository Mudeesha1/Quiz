const express = require("express");
const { getGrades, getSubjectsByGrade, getTopRankedUsers } = require("./controllers/grade.controller");

const applicationRoutes = express.Router();

// Public Routes
applicationRoutes.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Application Server is running",
        timestamp: new Date().toISOString(),
    });
});

applicationRoutes.get("/grades", getGrades);
applicationRoutes.get("/grades/:gradeId/subjects", getSubjectsByGrade);
applicationRoutes.get("/leaderboard/top-3", getTopRankedUsers);
// Protect following routes with auth + role check

// protected routes for registered users

module.exports = applicationRoutes;