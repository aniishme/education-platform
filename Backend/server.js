const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const courseRoutes = require("./routes/courseRoutes");

app.use("/api/courses", courseRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Education Platform Backend is running!"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});