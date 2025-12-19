const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        console.log("1. Testing Health/Root...");
        // There is no root route enabled in server.js currently, but let's check auth

        // LOGIN TEACHER (Assuming a user exists or I need to register one)
        // Actually, I should probably register a temp teacher and student to be safe
        const timestamp = Date.now();
        const teacherEmail = `teacher_${timestamp}@test.com`;
        const studentEmail = `student_${timestamp}@test.com`;

        console.log(`2. Registering Teacher (${teacherEmail})...`);
        const teacherReg = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Test Teacher',
            email: teacherEmail,
            password: 'password123',
            role: 'teacher'
        });
        const teacherToken = teacherReg.data.token;
        console.log("   Teacher Registered. Token received.");

        console.log(`3. Registering Student (${studentEmail})...`);
        const studentReg = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Test Student',
            email: studentEmail,
            password: 'password123',
            role: 'student',
            batch: 'Batch A'
        });
        const studentToken = studentReg.data.token;
        const studentId = studentReg.data.user._id; // Assuming response structure
        console.log("   Student Registered. Token received.");

        // CREATE TASK (Teacher)
        console.log("4. Teacher Creating Task...");
        const taskTitle = `Test Task ${timestamp}`;
        const createRes = await axios.post(`${BASE_URL}/tasks/create`, {
            title: taskTitle,
            description: "This is a test task"
        }, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        console.log("   Task Created.");
        const taskId = createRes.data.task._id;

        // GET TASKS (Student)
        console.log("5. Student Fetching Tasks...");
        const studentTasks = await axios.get(`${BASE_URL}/student/tasks`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        const myTask = studentTasks.data.find(t => t.taskId.title === taskTitle);

        if (!myTask) throw new Error("Created task not found in student list!");
        console.log("   Task found in student list.");
        const studentTaskId = myTask._id;

        // REQUEST COMPLETION (Student)
        console.log("6. Student Requesting Completion...");
        await axios.patch(`${BASE_URL}/student/request/${studentTaskId}`, {}, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log("   Request sent.");

        // APPROVE TASK (Teacher)
        console.log("7. Teacher Approving Task...");
        await axios.patch(`${BASE_URL}/tasks/approve/${studentTaskId}`, {}, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        console.log("   Task Approved.");

        // VERIFY COMPLETION (Student)
        console.log("8. Verifying Completion Status...");
        const checkTasks = await axios.get(`${BASE_URL}/student/tasks`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        const doneTask = checkTasks.data.find(t => t._id === studentTaskId);
        if (!doneTask.completedByTeacher) throw new Error("Task not marked as completed!");

        console.log("\n✅ BACKEND VERIFICATION PASSED SUCCESSFULLY! ✅");

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED ❌");
        console.error(error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

verify();
