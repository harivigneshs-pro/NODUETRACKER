const mongoose = require("mongoose");
const User = require("./models/User");
const Task = require("./models/Task");
const StudentTask = require("./models/StudentTask");

// Test script to verify faculty information is properly populated
async function testFacultyInfo() {
  try {
    console.log("Testing faculty information population...");
    
    // Test getting student tasks with faculty info
    const studentTasks = await StudentTask.find()
      .populate({
        path: "taskId",
        populate: {
          path: "createdBy",
          select: "name email role"
        }
      })
      .populate("studentId", "name email batch")
      .limit(3);

    console.log("\n=== Sample Student Tasks with Faculty Info ===");
    studentTasks.forEach((task, index) => {
      console.log(`\nTask ${index + 1}:`);
      console.log(`  Title: ${task.taskId?.title || 'N/A'}`);
      console.log(`  Student: ${task.studentId?.name || 'N/A'}`);
      console.log(`  Created by: ${task.taskId?.createdBy?.name || 'N/A'} (${task.taskId?.createdBy?.role || 'N/A'})`);
      console.log(`  Faculty Email: ${task.taskId?.createdBy?.email || 'N/A'}`);
      console.log(`  Status: ${task.completedByTeacher ? 'Completed' : task.requestSent ? 'Pending' : 'Not Started'}`);
    });

    // Test getting tasks created by specific faculty
    const teachers = await User.find({ role: { $in: ["teacher", "advisor"] } }).limit(2);
    
    if (teachers.length > 0) {
      console.log(`\n=== Tasks created by ${teachers[0].name} ===`);
      const teacherTasks = await Task.find({ createdBy: teachers[0]._id })
        .populate("createdBy", "name email role");
      
      teacherTasks.forEach((task, index) => {
        console.log(`\nTask ${index + 1}:`);
        console.log(`  Title: ${task.title}`);
        console.log(`  Description: ${task.description}`);
        console.log(`  Created by: ${task.createdBy.name} (${task.createdBy.role})`);
        console.log(`  Proof Required: ${task.proofRequired ? 'Yes' : 'No'}`);
      });
    }

    console.log("\n✅ Faculty information test completed successfully!");
    
  } catch (error) {
    console.error("❌ Error testing faculty information:", error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  // Connect to database
  require("dotenv").config();
  
  mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/noduetracker")
    .then(() => {
      console.log("Connected to MongoDB");
      return testFacultyInfo();
    })
    .then(() => {
      mongoose.connection.close();
      console.log("Database connection closed");
    })
    .catch((error) => {
      console.error("Database connection error:", error);
      process.exit(1);
    });
}

module.exports = { testFacultyInfo };