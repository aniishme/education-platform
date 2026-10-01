const express = require("express");
const cors = require("cors");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "StudyFlow backend is running!"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [result] = await db.query("SELECT 1");

        res.json({
            message: "MySQL connection successful!",
            result
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "MySQL connection failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});