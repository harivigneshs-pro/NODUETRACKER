const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const StudentTask = require("../models/StudentTask");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// 1️⃣ Teacher creates a task
router.post("/create", protect, allowRoles("teacher"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = await Task.create({ title, description, createdBy: req.user.id });

    // Assign this task to all students
    const students = await User.find({ role: "student" });
    const studentTasks = students.map((s) => ({
      studentId: s._id,
      taskId: task._id,
    }));
    await StudentTask.insertMany(studentTasks);

    res.status(201).json({ message: "Task created and assigned to all students", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2️⃣ Student requests completion
router.put("/request/:taskId", protect, allowRoles("student"), async (req, res) => {
  try {
    const studentTask = await StudentTask.findOne({
      studentId: req.user.id,
      taskId: req.params.taskId,
    });

    if (!studentTask) return res.status(404).json({ message: "Task not found for student" });

    studentTask.requestSent = true;
    await studentTask.save();

    res.json({ message: "Request sent to teacher" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3️⃣ Teacher approves a task for a student
router.put("/approve/:studentTaskId", protect, allowRoles("teacher"), async (req, res) => {
  try {
    const studentTask = await StudentTask.findById(req.params.studentTaskId);
    if (!studentTask) return res.status(404).json({ message: "Student task not found" });

    studentTask.completedByTeacher = true;
    await studentTask.save();

    res.json({ message: "Task marked completed by teacher" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4️⃣ Get all tasks for a student
router.get("/student-tasks", protect, allowRoles("student"), async (req, res) => {
  try {
    const tasks = await StudentTask.find({ studentId: req.user.id })
      .populate("taskId")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5️⃣ Get all students + tasks for teacher dashboard
router.get("/teacher-tasks", protect, allowRoles("teacher"), async (req, res) => {
  try {
    const studentTasks = await StudentTask.find()
      .populate("taskId")
      .populate("studentId")
      .sort({ createdAt: -1 });
    res.json(studentTasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
