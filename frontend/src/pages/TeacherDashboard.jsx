import { useState, useEffect } from "react";
import {
  fetchStudents,
  fetchTasksForStudent,
  approveStudentTask,
  createTaskForAllStudents,
} from "../api/taskApi";
import DashboardLayout from "../components/DashboardLayout";

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTasks, setStudentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all students
  const loadStudents = async () => {
    try {
      const data = await fetchStudents();
      setStudents(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to load students");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Load tasks for a selected student
  const selectStudent = async (studentId) => {
    setSelectedStudent(studentId);
    try {
      const tasks = await fetchTasksForStudent(studentId);
      setStudentTasks(tasks);
    } catch (err) {
      console.error(err);
      alert("Failed to load student tasks");
    }
  };

  // Approve a task
  const handleApprove = async (taskId) => {
    try {
      await approveStudentTask(taskId);
      alert("Task approved successfully");
      // Refresh the tasks
      const tasks = await fetchTasksForStudent(selectedStudent);
      setStudentTasks(tasks);
    } catch (err) {
      console.error(err);
      alert("Failed to approve task");
    }
  };
  if (loading) return <p>Loading students...</p>;
  return (
    <DashboardLayout role="teacher">
      <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>
      {/* List of Students */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Students</h2>
        <ul className="space-y-2">
          {students.map((s) => (
            <li
              key={s._id}
              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => selectStudent(s._id)}
            >
              {s.name}
            </li>
          ))}
        </ul>
      </div>
      {/* Selected Student Tasks */}
      {selectedStudent && (<div className="mt-6">
        <h2 className="font-semibold mb-2">Tasks for selected student</h2>
        {studentTasks.length === 0 ? (
          <p>No tasks assigned yet.</p>
        ) : (
          <ul className="space-y-3">
            {studentTasks.map((t) => (
              <li
                key={t._id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p
                    className={
                      t.completedByTeacher ? "line-through text-green-600" : ""
                    }
                  >
                    {t.taskId.title}
                  </p>
                  <p className="text-sm text-gray-500">{t.taskId.description}</p>
                </div>

                <div>
                  {!t.completedByTeacher && t.requestSent && (
                    <button
                      onClick={() => handleApprove(t._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}

                  {t.completedByTeacher && (
                    <span className="text-green-600 font-semibold">Completed</span>
                  )}

                  {!t.requestSent && !t.completedByTeacher && (
                    <span className="text-gray-400 font-semibold">Pending Request</span>
                  )}
                </div>

              </li>
            ))}
          </ul>
        )}
      </div>
      )}
      {
        <div>
          {/*add task for students*/}
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Create  a new Task for All Students</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await createTaskForAllStudents({
                    title: e.target.title.value,
                    description: e.target.description.value,
                  });
                  alert("Task created successfully");
                } catch (err) {
                  console.error(err);
                  alert("Failed to create task");
                }
              }}
            >
              <input
                type="text"
                name="title"
                placeholder="Title"
                className="p-2 border rounded-lg mb-2"
              />
              <textarea
                name="description"
                placeholder="Description"
                className="p-2 border rounded-lg mb-2"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"      >
                Create Task
              </button>
            </form>
          </div>


        </div>

      }
    </DashboardLayout>
  );
};

export default TeacherDashboard;
