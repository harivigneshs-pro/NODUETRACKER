const Task = require("../models/Task");
const User = require("../models/User");
const StudentTask = require("../models/StudentTask");

// ================= TEACHER CONTROLLERS =================

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("name email batch");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks for a specific student (Teacher View)
exports.getStudentTasks = async (req, res) => {
  try {
    const studentTasks = await StudentTask.find({ studentId: req.params.id })
      .populate("taskId")
      .populate("studentId", "name email batch");
    res.json(studentTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a student's task (Teacher Action)
exports.approveTask = async (req, res) => {
  try {
    const studentTask = await StudentTask.findById(req.params.taskId);

    if (!studentTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    studentTask.completedByTeacher = true;
    await studentTask.save();

    res.json({ message: "Task approved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a task assigned to all students (Teacher Action)
exports.createTaskForAllStudents = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Step 1: Create the Task
    const newTask = await Task.create({
      title,
      description,
      createdBy: req.user.id,
    });

    // Step 2: Get all students
    const students = await User.find({ role: "student" });

    // Step 3: Create StudentTask entries
    const studentTaskPromises = students.map((student) =>
      StudentTask.create({
        studentId: student._id,
        taskId: newTask._id,
        requestSent: false,
        completedByTeacher: false,
      })
    );

    await Promise.all(studentTaskPromises);

    res.status(201).json({
      message: "Task created and assigned to all students",
      task: newTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= STUDENT CONTROLLERS =================

// Get tasks for the logged-in student
exports.getMyTasks = async (req, res) => {
  try {
    const studentTasks = await StudentTask.find({ studentId: req.user.id })
      .populate("taskId") // Populate task details (title, description)
      .sort({ createdAt: -1 });

    res.json(studentTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request task completion (Student Action)
exports.requestTaskCompletion = async (req, res) => {
  try {
    const { taskId } = req.params; // Using params as per route definition

    // Find by StudentTask ID (NOT Task ID)
    const studentTask = await StudentTask.findById(taskId);

    if (!studentTask) {
      return res.status(404).json({ message: "Task entry not found" });
    }

    // Verify ownership
    if (studentTask.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    studentTask.requestSent = true;
    await studentTask.save();

    res.json({
      message: "Completion request sent to teacher",
      task: studentTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
