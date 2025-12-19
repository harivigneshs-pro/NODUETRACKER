const mongoose = require("mongoose");
const studentTaskSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    requestSent: { type: Boolean, default: false }, // Student requests completion
    completedByTeacher: { type: Boolean, default: false }, // Teacher approves
  },
  { timestamps: true }
);
module.exports = mongoose.model("StudentTask", studentTaskSchema);
