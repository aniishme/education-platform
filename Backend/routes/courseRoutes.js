const express = require("express");
const courses = require("../../src/data/courses.json");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(courses);
});
    
module.exports = router;