const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to get headers with JWT token dynamically
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
// Helper to handle response
const handleResponse = async (res) => {
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "API Error");
  }
  return res.json();
};

// ================= STUDENT API =================
// Fetch tasks for logged-in student
export const fetchStudentTasks = async () => {
  const res = await fetch(`${API_URL}/student/tasks`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
// Request completion of a task
export const requestTaskCompletion = async (taskId, proofImage) => {
  const res = await fetch(`${API_URL}/student/request/${taskId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ proofImage }), // Send image if present
  });
  return handleResponse(res);
};
// ================= TEACHER API =================
// Teacher: Create task for all students
export const createTaskForAllStudents = async (task) => {
  const res = await fetch(`${API_URL}/tasks/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
};
// Teacher: Approve a student's task
export const approveStudentTask = async (taskId) => {
  const res = await fetch(`${API_URL}/tasks/approve/${taskId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
// Teacher: Fetch all students
export const fetchStudents = async () => {
  const res = await fetch(`${API_URL}/tasks/students`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Teacher: Fetch tasks for a specific student
export const fetchTasksForStudent = async (studentId) => {
  const res = await fetch(`${API_URL}/tasks/student/${studentId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};