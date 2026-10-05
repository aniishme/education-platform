const express = require("express");
<<<<<<< HEAD

=======
const rateLimit = require("express-rate-limit");
>>>>>>> origin/main
const router = express.Router();

const {
    getLessonsByCourse,
<<<<<<< HEAD
    getLessonById,
    completeLesson,
    getLessonProgress
} = require("../controllers/lessonsController");

// Get all lessons for a course
router.get("/course/:courseId", getLessonsByCourse);

// Get completed lessons for a user in a course
router.get("/progress/:userId/:courseId", getLessonProgress);

// Mark a lesson as completed
router.post("/complete", completeLesson);

// Get one lesson
router.get("/:id", getLessonById);
=======
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
>>>>>>> origin/main

module.exports = router;