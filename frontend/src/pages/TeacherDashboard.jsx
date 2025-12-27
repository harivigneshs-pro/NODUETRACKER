import { useState, useEffect, useContext } from "react";
import { fetchStudents, fetchTasksForStudent, approveStudentTask, createTask } from "../api/taskApi";
import DashboardLayout from "../components/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Plus,
  Image as ImageIcon,
  Loader2,
  FileText,
  Filter
} from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTasks, setStudentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all-requests");
  const [allPendingRequests, setAllPendingRequests] = useState([]);
  const [viewingImage, setViewingImage] = useState(null);

  // Create Task State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskProof, setNewTaskProof] = useState(false);

  const loadStudents = async () => {
    try {
      const data = await fetchStudents();
      setStudents(data);
      setLoading(false);
      fetchAllPendingRequests(data);
    } catch (err) {
      console.error(err);
      // alert(err.message || "Failed to load students");
    }
  };

  const fetchAllPendingRequests = async (studentList) => {
    let requests = [];
    for (const student of studentList) {
      try {
        const tasks = await fetchTasksForStudent(student._id);
        const pending = tasks.filter(t => t.requestSent && !t.completedByTeacher);
        const pendingWithInfo = pending.map(task => ({
          ...task,
          studentName: student.name,
          studentBatch: student.batch,
          sid: student._id
        }));
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

  const selectStudent = async (studentId) => {
    setSelectedStudent(studentId);
    try {
      const tasks = await fetchTasksForStudent(studentId);
      setStudentTasks(tasks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (taskId, isBulkView = false) => {
    try {
      await approveStudentTask(taskId);
      if (isBulkView) {
        setAllPendingRequests(prev => prev.filter(t => t._id !== taskId));
      } else {
        const tasks = await fetchTasksForStudent(selectedStudent);
        setStudentTasks(tasks);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to approve task");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({
        title: newTaskTitle,
        description: newTaskDesc,
        proofRequired: newTaskProof
      });
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskProof(false);
      alert("Task created successfully for all students!");
      loadStudents(); // Reload to refresh state
    } catch (err) {
      alert("Failed to create task");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
        <p className="text-slate-500 font-medium">Loading Dashboard...</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout role={user?.role || "teacher"}>
      {/* Image Modal */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setViewingImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-transparent max-w-5xl max-h-full overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
                onClick={() => setViewingImage(null)}
              >
                <XCircle size={32} />
              </button>
              <img src={viewingImage} alt="Proof" className="max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-100px)]">

        {/* Sidebar */}
        <div className="md:col-span-1 glass-panel rounded-2xl p-4 flex flex-col h-full bg-white/60 backdrop-blur-xl border-white/40">
          <div className="space-y-2 mb-6">
            <button
              onClick={() => setActiveTab("all-requests")}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 ${activeTab === 'all-requests'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'hover:bg-white/60 text-slate-600'
                }`}
            >
              <div className="flex items-center gap-3">
                <Clock size={18} />
                <span className="font-semibold text-sm">Pending</span>
              </div>
              {allPendingRequests.length > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'all-requests' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                  }`}>
                  {allPendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("create")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 ${activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'hover:bg-white/60 text-slate-600'
                }`}
            >
              <Plus size={18} />
              <span className="font-semibold text-sm">Create Task</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3 px-1">
            <Users size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students</h3>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-9 pr-3 py-2 bg-white/50 rounded-lg text-sm border border-transparent focus:bg-white focus:border-indigo-300 outline-none transition-all"
            />
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar space-y-1">
            {students.map(s => (
              <button
                key={s._id}
                onClick={() => {
                  setActiveTab("students");
                  selectStudent(s._id);
                }}
                className={`w-full text-left p-3 rounded-xl transition-all border border-transparent ${selectedStudent === s._id && activeTab === 'students'
                    ? 'bg-white border-indigo-100 shadow-sm'
                    : 'hover:bg-white/40 text-slate-600'
                  }`}
              >
                <p className="font-semibold text-sm text-slate-800">{s.name}</p>
                <p className="text-xs text-slate-500">{s.batch}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 h-full overflow-y-auto custom-scrollbar pb-20">

          {/* VIEW: All Pending Requests */}
          {activeTab === "all-requests" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-slate-800">Review Requests</h2>
                <div className="flex gap-2">
                  <button className="p-2 bg-white rounded-lg shadow-sm text-slate-600 hover:text-indigo-600"><Filter size={18} /></button>
                </div>
              </div>

              {allPendingRequests.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <CheckCircle size={64} className="mx-auto mb-4 text-emerald-100" />
                  <p className="text-lg font-medium">All caught up!</p>
                  <p>No pending requests to review.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {allPendingRequests.map((req) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={req._id}
                      className="glass-card p-5 bg-white flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group hover:border-indigo-200/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                            {req.studentBatch}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-slate-500 text-xs font-medium">Submitted just now</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-0.5">{req.studentName}</h4>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <FileText size={14} className="text-indigo-400" />
                          <span className="font-medium">{req.taskId.title}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        {req.taskId.proofRequired && req.proofImage ? (
                          <button
                            onClick={() => setViewingImage(req.proofImage)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-50 text-pink-600 font-medium hover:bg-pink-100 transition-colors"
                          >
                            <ImageIcon size={18} /> View Proof
                          </button>
                        ) : req.taskId.proofRequired ? (
                          <span className="text-xs text-rose-500 font-medium bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <XCircle size={14} /> No Proof Attached
                          </span>
                        ) : null}

                        <button
                          onClick={() => handleApprove(req._id, true)}
                          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 transition-all ml-auto md:ml-0"
                        >
                          <CheckCircle size={18} /> Approve
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: Create Task */}
          {activeTab === "create" && (
            <div className="max-w-2xl mx-auto pt-10">
              <div className="glass-card bg-white p-8 rounded-3xl shadow-xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Create New Assignment</h2>
                  <p className="text-slate-500">This task will be assigned to all students.</p>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input
                      className="glass-input w-full px-4 py-3 rounded-xl bg-slate-50 focus:bg-white"
                      placeholder="e.g., Submit Record Note"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                      className="glass-input w-full px-4 py-3 rounded-xl bg-slate-50 focus:bg-white min-h-[120px]"
                      placeholder="Detailed instructions..."
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      id="proof"
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      checked={newTaskProof}
                      onChange={(e) => setNewTaskProof(e.target.checked)}
                    />
                    <label htmlFor="proof" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                      Require students to upload proof (screenshot/image)
                    </label>
                  </div>
                  <button type="submit" className="w-full btn-primary py-4 rounded-xl text-lg shadow-xl shadow-indigo-500/20">
                    Publish Task
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* VIEW: Single Student Tasks */}
          {activeTab === "students" && selectedStudent && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 pl-1">
                Tasks for <span className="text-indigo-600 px-2 bg-indigo-50 rounded-lg">{students.find(s => s._id === selectedStudent)?.name}</span>
              </h2>

              <div className="grid gap-4">
                {studentTasks.map(t => (
                  <div key={t._id} className="glass-card bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className={`text-lg font-bold ${t.completedByTeacher ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {t.taskId.title}
                      </h4>
                      <p className="text-slate-500 text-sm">{t.taskId.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {t.completedByTeacher ? (
                          <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded inline-flex items-center gap-1">
                            <CheckCircle size={12} /> Completed
                          </span>
                        ) : t.requestSent ? (
                          <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded inline-flex items-center gap-1">
                            <Clock size={12} /> Pending Approval
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                            Not Started
                          </span>
                        )}
                      </div>
                    </div>

                    {t.requestSent && !t.completedByTeacher && (
                      <div className="flex gap-2">
                        {t.taskId.proofRequired && (
                          <button onClick={() => setViewingImage(t.proofImage)} className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100">
                            <ImageIcon size={20} />
                          </button>
                        )}
                        <button onClick={() => handleApprove(t._id)} className="p-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
                          <CheckCircle size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
