const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const taskController = require("../controllers/taskController");

// ================= TEACHER ROUTES ===
// Get all students
router.get("/students", protect, allowRoles("teacher", "advisor"), taskController.getStudents);

// Get task statistics for a specific student
router.get("/student/:id/stats", protect, allowRoles("teacher", "advisor"), taskController.getStudentTaskStats);

// Get tasks for a specific student
router.get("/student/:id", protect, allowRoles("teacher", "advisor"), taskController.getStudentTasks);

// Approve a student's task
router.patch("/approve/:taskId", protect, allowRoles("teacher", "advisor"), taskController.approveTask);

// Create a task for all students
router.post("/create", protect, allowRoles("teacher", "advisor"), taskController.createTaskForAllStudents);

module.exports = router;
