const express = require("express");

const {
    getEnrolments,
    createEnrolment,
    deleteEnrolment
} = require("../controllers/enrolmentController");

const router = express.Router();

router.get("/", getEnrolments);
router.post("/", createEnrolment);
router.delete("/:id", deleteEnrolment);

module.exports = router;