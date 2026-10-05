const db = require("../db");

const getUsers = async (req, res) => {
    try {
       const [users] = await db.query(
    `SELECT
        id,
        name,
        email,
        role,
        status,
        created_at
     FROM users
     ORDER BY created_at DESC`
);
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);

        res.status(500).json({
            message: "Unable to fetch users"
        });
    }
};
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({
                message: "Name, email and role are required"
            });
        }

        const [result] = await db.query(
            `UPDATE users
             SET name = ?, email = ?, role = ?
             WHERE id = ?`,
            [name.trim(), email.trim(), role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const [users] = await db.query(
            `SELECT
                id,
                name,
                email,
                role,
                created_at
             FROM users
             WHERE id = ?`,
            [id]
        );

        res.json({
            message: "User updated successfully",
            user: users[0]
        });

    } catch (error) {
        console.error("Error updating user:", error);

        res.status(500).json({
            message: "Unable to update user"
        });
    }
};
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["active", "deactivated"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const [result] = await db.query(
            "UPDATE users SET status = ? WHERE id = ?",
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const [users] = await db.query(
            `SELECT
                id,
                name,
                email,
                role,
                status,
                created_at
             FROM users
             WHERE id = ?`,
            [id]
        );

        res.json({
            message: "User status updated successfully",
            user: users[0]
        });

    } catch (error) {
        console.error("Error updating user status:", error);

        res.status(500).json({
            message: "Unable to update user status"
        });
    }
};
module.exports = {
    getUsers,
    updateUser,
    updateUserStatus
};