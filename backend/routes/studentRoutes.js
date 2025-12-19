const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const taskController = require("../controllers/taskController");

router.use(protect); // All routes require login

// Get logged-in student's tasks
router.get("/tasks", allowRoles("student"), taskController.getMyTasks);

// Request task completion
router.patch("/request/:taskId", allowRoles("student"), taskController.requestTaskCompletion);

module.exports = router;
