const User = require("../models/User");
const StudentTask = require("../models/StudentTask");

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get batch-wise no-due status
// Returns a summary: { "BatchA": { total: 10, completed: 5 }, "BatchB": ... }
exports.getBatchStatus = async (req, res) => {
    try {
        const students = await User.find({ role: "student" });
        const studentTasks = await StudentTask.find().populate("studentId");

        const batchData = {};

        students.forEach(student => {
            const batch = student.batch || "Unknown";
            if (!batchData[batch]) {
                batchData[batch] = { totalStudents: 0, pending: 0, completed: 0 };
            }
            batchData[batch].totalStudents++;
        });

        // Determine completion status logic?
        // Requirement says "View no-due status batch-wise"
        // Since we don't have a concept of "All Tasks Completed" flag on User, 
        // we can show counts of pending vs completed tasks per batch.

        // Let's aggregate by batch for tasks
        const stats = {};

        for (const task of studentTasks) {
            if (!task.studentId) continue; // Orphaned record check
            const batch = task.studentId.batch || "Unknown";

            if (!stats[batch]) {
                stats[batch] = { totalTasks: 0, completed: 0, pending: 0 };
            }

            stats[batch].totalTasks++;
            if (task.completedByTeacher) {
                stats[batch].completed++;
            } else {
                stats[batch].pending++;
            }
        }

        res.json({ studentsByBatch: batchData, taskStatsByBatch: stats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
