const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const {
    getLessonsByCourse,
    getLessonById
} = require("../controllers/lessonsController");

const lessonsReadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
});

// Get all lessons for a course
router.get("/course/:courseId", lessonsReadLimiter, getLessonsByCourse);

// Get one lesson
router.get("/:id", lessonsReadLimiter, getLessonById);

module.exports = router;