const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const {
    getLessonsByCourse,
    getLessonById,
    completeLesson,
    getLessonProgress
} = require("../controllers/lessonsController");

const lessonsReadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
});

// Get all lessons for a course
router.get("/course/:courseId", lessonsReadLimiter, getLessonsByCourse);

// Get completed lessons for a user in a course
router.get("/progress/:userId/:courseId", lessonsReadLimiter, getLessonProgress);

// Mark a lesson as completed
router.post("/complete", completeLesson);

// Get one lesson
router.get("/:id", lessonsReadLimiter, getLessonById);

module.exports = router;
