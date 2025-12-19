const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to get headers with JWT token dynamically
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ================= STUDENT API =================

// Fetch tasks for logged-in student
export const fetchStudentTasks = async () => {
  try {
    const res = await fetch(`${API_URL}/student/tasks`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Request completion of a task
export const requestTaskCompletion = async (taskId) => {
  try {
    const res = await fetch(`${API_URL}/student/request/${taskId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to send request");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// ================= TEACHER API =================

// Teacher: Create task for all students
export const createTaskForAllStudents = async (task) => {
  try {
    const res = await fetch(`${API_URL}/tasks/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Failed to create task");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Teacher: Approve a student's task
export const approveStudentTask = async (taskId) => {
  try {
    const res = await fetch(`${API_URL}/tasks/approve/${taskId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to approve task");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Teacher: Fetch all students
export const fetchStudents = async () => {
  try {
    const res = await fetch(`${API_URL}/tasks/students`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch students");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Teacher: Fetch tasks for a specific student
export const fetchTasksForStudent = async (studentId) => {
  try {
    const res = await fetch(`${API_URL}/tasks/student/${studentId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch student tasks");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};