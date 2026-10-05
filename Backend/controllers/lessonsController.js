const db = require("../db");

// Get all lessons for a course
exports.getLessonsByCourse = async (req, res) => {
    const { courseId } = req.params;

    const sql = `
        SELECT *
        FROM lessons
        WHERE course_id = ?
        ORDER BY lesson_order ASC
    `;

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
    const { id } = req.params;

    const sql = "SELECT * FROM lessons WHERE id = ?";

    try {
        const [results] = await db.query(sql, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                message: "Lesson not found"
            });
        }

        res.json(results[0]);
    } catch (err) {
        console.error("Error fetching lesson:", err);
        return res.status(500).json({
            message: "Failed to fetch lesson"
        });
    }
};

// Mark a lesson as completed
exports.completeLesson = async (req, res) => {
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

    try {
        await db.query(sql, [userId, lessonId]);

        res.json({
            message: "Lesson completed successfully",
            userId,
            lessonId
        });
    } catch (err) {
        console.error("Error completing lesson:", err);
        return res.status(500).json({
            message: "Failed to complete lesson"
        });
    }
};

// Get completed lessons for a user in a course
exports.getLessonProgress = async (req, res) => {
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

    try {
        const [results] = await db.query(sql, [userId, courseId]);
        res.json(results);
    } catch (err) {
        console.error("Error fetching lesson progress:", err);
        return res.status(500).json({
            message: "Failed to fetch lesson progress"
        });
    }
};
