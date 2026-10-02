const db = require("../db");

const getActivities = async (req, res) => {
    try {
        const [activities] = await db.query(
            `SELECT
                id,
                message,
                created_at
             FROM activity
             ORDER BY created_at DESC
             LIMIT 20`
        );

        res.json(activities);

    } catch (error) {
        console.error("Error fetching activities:", error);

        res.status(500).json({
            message: "Unable to fetch activities"
        });
    }
};

const createActivity = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Activity message is required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO activity (message)
             VALUES (?)`,
            [message.trim()]
        );

        const [activities] = await db.query(
            `SELECT
                id,
                message,
                created_at
             FROM activity
             WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            message: "Activity created successfully",
            activity: activities[0]
        });

    } catch (error) {
        console.error("Error creating activity:", error);

        res.status(500).json({
            message: "Unable to create activity"
        });
    }
};

module.exports = {
    getActivities,
    createActivity
};
