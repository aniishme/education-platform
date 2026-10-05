const db = require("../db");

// Get all lessons for a course
<<<<<<< HEAD
exports.getLessonsByCourse = (req, res) => {
=======
exports.getLessonsByCourse = async (req, res) => {
>>>>>>> origin/main
    const { courseId } = req.params;

    const sql = `
        SELECT *
        FROM lessons
        WHERE course_id = ?
        ORDER BY lesson_order ASC
    `;

<<<<<<< HEAD
    db.query(sql, [courseId], (err, results) => {
        if (err) {
            console.error("Error fetching lessons:", err);
            return res.status(500).json({
                message: "Failed to fetch lessons"
            });
        }

        res.json(results);
    });
};

// Get a single lesson
exports.getLessonById = (req, res) => {
=======
    try {
        const [results] = await db.query(sql, [courseId]);
        res.json(results);
    } catch (err) {
        console.error("Error fetching lessons:", err);
        return res.status(500).json({
            message: "Failed to fetch lessons"
        });
    }
};

// Get a single lesson
exports.getLessonById = async (req, res) => {
>>>>>>> origin/main
    const { id } = req.params;

    const sql = "SELECT * FROM lessons WHERE id = ?";

<<<<<<< HEAD
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching lesson:", err);
            return res.status(500).json({
                message: "Failed to fetch lesson"
            });
        }
=======
    try {
        const [results] = await db.query(sql, [id]);
>>>>>>> origin/main

        if (results.length === 0) {
            return res.status(404).json({
                message: "Lesson not found"
            });
        }

        res.json(results[0]);
<<<<<<< HEAD
    });
};

// Mark a lesson as completed
exports.completeLesson = (req, res) => {
    const { userId, lessonId } = req.body;

    if (!userId || !lessonId) {
        return res.status(400).json({
            message: "userId and lessonId are required"
        });
    }

    const sql = `
        INSERT INTO lesson_progress
            (user_id, lesson_id, completed, completed_at)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
            completed = 1,
            completed_at = CURRENT_TIMESTAMP
    `;

    db.query(sql, [userId, lessonId], (err, result) => {
        if (err) {
            console.error("Error completing lesson:", err);
            return res.status(500).json({
                message: "Failed to complete lesson"
            });
        }

        res.json({
            message: "Lesson completed successfully",
            userId,
            lessonId
        });
    });
};

// Get completed lessons for a user in a course
exports.getLessonProgress = (req, res) => {
    const { userId, courseId } = req.params;

    const sql = `
        SELECT lp.lesson_id, lp.completed, lp.completed_at
        FROM lesson_progress lp
        INNER JOIN lessons l ON lp.lesson_id = l.id
        WHERE lp.user_id = ?
          AND l.course_id = ?
          AND lp.completed = 1
        ORDER BY l.lesson_order ASC
    `;

    db.query(sql, [userId, courseId], (err, results) => {
        if (err) {
            console.error("Error fetching lesson progress:", err);
            return res.status(500).json({
                message: "Failed to fetch lesson progress"
            });
        }

        res.json(results);
    });
=======
    } catch (err) {
        console.error("Error fetching lesson:", err);
        return res.status(500).json({
            message: "Failed to fetch lesson"
        });
    }
>>>>>>> origin/main
};