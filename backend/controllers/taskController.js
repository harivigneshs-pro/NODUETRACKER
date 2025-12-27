const Task = require("../models/Task");
const User = require("../models/User");
const StudentTask = require("../models/StudentTask");

// ================= TEACHER CONTROLLERS==

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("name email batch");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks for a specific student (Teacher/Advisor View)
exports.getStudentTasks = async (req, res) => {
  try {
    let studentTasks;

    if (req.user.role === "advisor") {
      // ADVISOR: See ALL tasks from ALL teachers
      studentTasks = await StudentTask.find({ studentId: req.params.id })
        .populate("taskId")
        .populate("studentId", "name email batch");
    } else {
      // TEACHER: See only tasks created by THIS teacher
      const myTasks = await Task.find({ createdBy: req.user.id }).select('_id');
      const myTaskIds = myTasks.map(t => t._id);

      studentTasks = await StudentTask.find({
        studentId: req.params.id,
        taskId: { $in: myTaskIds }
      })
        .populate("taskId")
        .populate("studentId", "name email batch");
    }

    res.json(studentTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a student's task (Teacher Action)
exports.approveTask = async (req, res) => {
  try {
    const studentTask = await StudentTask.findById(req.params.taskId).populate("taskId");

    if (!studentTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Security Check: Ensure the logged-in teacher OWNS this task
    if (studentTask.taskId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to approve this task." });
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
    const { title, description, proofRequired } = req.body;

    // Step 1: Create the Task
    const newTask = await Task.create({
      title,
      description,
      createdBy: req.user.id,
      proofRequired: proofRequired || false,
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

// ================= STUDENT CONTROLLERS

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
    const { proofImage } = req.body; // Base64 string

    // Find by StudentTask ID (NOT Task ID) and populate generic task details
    const studentTask = await StudentTask.findById(taskId).populate("taskId");

    if (!studentTask) {
      return res.status(404).json({ message: "Task entry not found" });
    }

    // Verify ownership
    if (studentTask.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if proof is required
    if (studentTask.taskId.proofRequired && !proofImage) {
      return res.status(400).json({ message: "This task requires a photo proof!" });
    }

    studentTask.requestSent = true;
    if (proofImage) {
      studentTask.proofImage = proofImage;
    }

    await studentTask.save();

    res.json({
      message: "Completion request sent to teacher",
      task: studentTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
