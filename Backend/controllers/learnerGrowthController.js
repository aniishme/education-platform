const db = require("../db");

const getLearnerGrowth = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT
                id,
                created_at
             FROM users
             WHERE role = 'student'
             ORDER BY created_at ASC`
        );

        res.json(users);

    } catch (error) {
        console.error("Error fetching learner growth:", error);

        res.status(500).json({
            message: "Unable to fetch learner growth"
        });
    }
};

module.exports = {
    getLearnerGrowth
};