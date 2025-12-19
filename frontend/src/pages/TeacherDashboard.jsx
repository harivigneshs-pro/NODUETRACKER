import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  fetchStudents,
  fetchTasksForStudent,
  approveStudentTask,
  createTaskForAllStudents,
} from "../api/taskApi";
import DashboardLayout from "../components/DashboardLayout";

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTasks, setStudentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all-requests"); // 'all-requests', 'students', 'create'

  // New State for aggregating all requests
  const [allPendingRequests, setAllPendingRequests] = useState([]);

  // New State for Image Modal
  const [viewingImage, setViewingImage] = useState(null);

  // Load all students
  const loadStudents = async () => {
    try {
      const data = await fetchStudents();
      setStudents(data);
      setLoading(false);
      // After loading students, we could potentially load THEIR tasks to find requests
      // But ideally backend should support `getPendingRequests`. 
      // For now, we iterate (less efficient but works for small scale)
      fetchAllPendingRequests(data);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load students");
    }
  };

  const fetchAllPendingRequests = async (studentList) => {
    let requests = [];
    for (const student of studentList) {
      try {
        const tasks = await fetchTasksForStudent(student._id);
        const pending = tasks.filter(t => t.requestSent && !t.completedByTeacher);
        // Attach student info to task for display
        const pendingWithInfo = pending.map(task => ({ ...task, studentName: student.name, studentBatch: student.batch, sid: student._id }));
        requests = [...requests, ...pendingWithInfo];
      } catch (err) {
        console.error("Skipping student", student._id);
      }
    }
    setAllPendingRequests(requests);
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
    }
  };

  // Approve a task
  const handleApprove = async (taskId, isBulkView = false) => {
    try {
      await approveStudentTask(taskId);
      // alert("Task approved successfully");

      if (isBulkView) {
        // Remove from local state for smoothness
        setAllPendingRequests(prev => prev.filter(t => t._id !== taskId));
      } else {
        // Refresh individual view
        const tasks = await fetchTasksForStudent(selectedStudent);
        setStudentTasks(tasks);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to approve task");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <DashboardLayout role={user?.role || "teacher"}>
      {/* Image Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setViewingImage(null)}>
          <div className="bg-white p-2 rounded-xl max-w-3xl max-h-full overflow-hidden relative">
            <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2" onClick={() => setViewingImage(null)}>✕</button>
            <img src={viewingImage} alt="Proof" className="max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-100px)]">

        {/* Sidebar / Navigation within Dash */}
        <div className="md:col-span-1 glass-card rounded-2xl p-4 flex flex-col space-y-2">
          <button
            onClick={() => setActiveTab("all-requests")}
            className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'all-requests' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}
          >
            <div className="flex justify-between items-center">
              <span>🔴 Pending Requests</span>
              {allPendingRequests.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{allPendingRequests.length}</span>}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("create")}
            className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'create' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}
          >
            ➕ Create New Task
          </button>

          <div className="h-px bg-gray-200 my-2"></div>

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Students</h3>
          <div className="overflow-y-auto flex-1">
            {students.map((s) => (
              <button
                key={s._id}
                onClick={() => { setActiveTab("students"); selectStudent(s._id); }}
                className={`w-full text-left p-2 rounded-lg text-sm mb-1 truncate transition-all ${selectedStudent === s._id && activeTab === 'students' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'hover:bg-gray-50'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">

          {/* VIEW: ALL PENDING REQUESTS */}
          {activeTab === 'all-requests' && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Review Pending Requests</h2>
              <p className="text-gray-500 text-sm">Approve task completion requests.</p>

              {allPendingRequests.length === 0 ? (
                <div className="glass-card p-12 rounded-2xl text-center text-gray-400">
                  <span className="text-4xl block mb-2">✨</span>
                  No pending requests! You're all caught up.
                </div>
              ) : (
                <div className="grid gap-4">
                  {allPendingRequests.map(req => (
                    <div key={req._id} className="glass-card p-5 rounded-xl flex justify-between items-center bg-white">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-gray-800">{req.studentName}</span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{req.studentBatch || "No Batch"}</span>
                        </div>
                        <h3 className="text-indigo-600 font-medium">{req.taskId.title}</h3>
                        {req.proofImage && (
                          <button
                            onClick={() => setViewingImage(req.proofImage)}
                            className="text-xs flex items-center mt-1 text-blue-500 underline font-semibold"
                          >
                            📷 View Proof Image
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleApprove(req._id, true)}
                        className="btn-primary px-6 py-2 rounded-lg shadow-lg hover:shadow-xl"
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: CREATE TASK */}
          {activeTab === 'create' && (
            <div className="animate-fade-in max-w-2xl">
              <div className="glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Assignment</h2>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await createTaskForAllStudents({
                      title: e.target.title.value,
                      description: e.target.description.value,
                      proofRequired: e.target.proofRequired.checked,
                    });
                    alert("Task created successfully!");
                    e.target.reset();
                  } catch (err) {
                    alert("Failed to create task");
                  }
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Task Title</label>
                      <input name="title" required className="glass-input w-full p-3 rounded-lg" placeholder="e.g. Lab Record Submission" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                      <textarea name="description" rows="4" className="glass-input w-full p-3 rounded-lg" placeholder="Details about the task..."></textarea>
                    </div>

                    <div className="flex items-center space-x-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                      <input type="checkbox" id="proofRequired" name="proofRequired" className="w-5 h-5 text-indigo-600 rounded bg-white border-0 focus:ring-0" />
                      <label htmlFor="proofRequired" className="text-sm font-semibold text-indigo-700 cursor-pointer">
                        Require Photo Proof (Screenshot)
                      </label>
                    </div>

                    <button type="submit" className="btn-primary w-full py-3 rounded-lg font-bold text-lg">
                      🚀 Publish Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* VIEW: SINGLE STUDENT TASKS */}
          {activeTab === 'students' && selectedStudent && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-4">Tasks for Student</h2>
              <div className="space-y-3">
                {studentTasks.length === 0 ? <p className="text-gray-500">No tasks assigned.</p> :
                  studentTasks.map((t) => {
                    const isMyTask = t.taskId.createdBy === user.id;
                    return (
                      <div key={t._id} className="glass-card p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${t.completedByTeacher ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{t.taskId.title}</h4>
                            {!isMyTask && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Created by other teacher</span>}
                          </div>
                          {t.proofImage && (
                            <button
                              onClick={() => setViewingImage(t.proofImage)}
                              className="text-xs text-blue-500 underline"
                            >
                              View Submitted Proof
                            </button>
                          )}
                        </div>
                        <div>
                          {t.completedByTeacher ? (
                            <span className="text-green-500 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">Completed</span>
                          ) : t.requestSent ? (
                            isMyTask ? (
                              <button onClick={() => handleApprove(t._id)} className="btn-primary px-4 py-1.5 rounded-lg text-sm">Approve Request</button>
                            ) : (
                              <span className="text-orange-400 font-semibold text-sm border border-orange-200 px-3 py-1 rounded-full">Pending Approval (Other)</span>
                            )
                          ) : (
                            <span className="text-gray-400 text-sm">Not Requested</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
