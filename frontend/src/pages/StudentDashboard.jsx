import { useState, useEffect } from "react";
import { fetchStudentTasks, requestTaskCompletion } from "../api/taskApi";
import DashboardLayout from "../components/DashboardLayout";
const StudentDashboard =()=> {
  const [tasks, setTasks]=useState([]);
  const [loading, setLoading] = useState(true);
  const loadTasks = async () => {
    try {
      const data = await fetchStudentTasks(); // now fetches tasks for logged-in student
      setTasks(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadTasks();
  }, []);
  const handleRequestCompletion = async (taskId) => {
    try {
      await requestTaskCompletion(taskId);
      alert("Request sent to teacher");
      loadTasks(); // refresh tasks
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    }
  };
  if (loading) return <p>Loading tasks...</p>;

  const allCompleted = tasks.length > 0 && tasks.every((t) => t.completedByTeacher);
  return (
    <DashboardLayout role="student">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      {allCompleted && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 font-semibold rounded">
          🎉 All tasks approved! No dues pending.
        </div>
      )}
      <ul className="space-y-3">
        {tasks.map((t) => (
          <li
            key={t._id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <p className={t.completedByTeacher ? "line-through text-green-600" : ""}>
                {t.taskId.title}
              </p>
              <p className="text-sm text-gray-500">{t.taskId.description}</p>
            </div>
            <div>
              {!t.completedByTeacher && (
                <button
                  onClick={() => handleRequestCompletion(t._id)}
                  disabled={t.requestSent}
                  className={`px-3 py-1 rounded ${
                    t.requestSent
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {t.requestSent ? "Request Sent" : "Request Completion"}
                </button>
              )}

              {t.completedByTeacher && (
                <span className="text-green-600 font-semibold">Completed</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </DashboardLayout>
  );
};

export default StudentDashboard;
