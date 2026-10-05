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