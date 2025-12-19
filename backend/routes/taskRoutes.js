const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const taskController = require("../controllers/taskController");

// ================= TEACHER ROUTES ===
// Get all students
router.get("/students", protect, allowRoles("teacher"), taskController.getStudents);

// Get tasks for a specific student
router.get("/student/:id", protect, allowRoles("teacher"), taskController.getStudentTasks);

// Approve a student's task
router.patch("/approve/:taskId", protect, allowRoles("teacher"), taskController.approveTask);

// Create a task for all students
router.post("/create", protect, allowRoles("teacher"), taskController.createTaskForAllStudents);

module.exports = router;
