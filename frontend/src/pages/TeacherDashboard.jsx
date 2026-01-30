import { useState, useEffect, useContext } from "react";
import { fetchStudents, fetchTasksForStudent, approveStudentTask, createTaskForAllStudents as createTask } from "../api/taskApi";
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
  Filter,
  User,
  GraduationCap,
  Mail,
  TrendingUp,
  Award,
  AlertCircle
} from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTasks, setStudentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("students");
  const [allPendingRequests, setAllPendingRequests] = useState([]);
  const [viewingImage, setViewingImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      setLoading(false);
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
          studentEmail: student.email,
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
      loadStudents();
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const getStudentStats = (studentId) => {
    // This would need to be calculated from actual data
    // For now, returning mock data
    return {
      total: 5,
      completed: Math.floor(Math.random() * 5),
      pending: Math.floor(Math.random() * 3)
    };
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.batch && s.batch.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600">
            Manage student tasks and track progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{students.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold text-orange-600">{allPendingRequests.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-3xl font-bold text-green-600">12</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-3xl font-bold text-purple-600">8</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FileText size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === "students"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending Reviews
            {allPendingRequests.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {allPendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === "create"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Create Task
          </button>
        </div>

        {/* Students View */}
        {activeTab === "students" && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="glass-card p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search students by name, batch, or email..."
                  className="glass-input w-full pl-10 pr-4 py-3 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student, index) => {
                const stats = getStudentStats(student._id);
                const progressPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                
                return (
                  <motion.div
                    key={student._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 hover:shadow-medium transition-all duration-200 cursor-pointer"
                    onClick={() => selectStudent(student._id)}
                  >
                    {/* Student Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap size={16} className="text-gray-400" />
                        <span className="text-gray-600">
                          Batch: {student.batch || "Not specified"}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">
                          {stats.completed}/{stats.total} tasks
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{stats.pending}</div>
                        <div className="text-xs text-gray-500">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{Math.round(progressPercentage)}%</div>
                        <div className="text-xs text-gray-500">Progress</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Pending Reviews View */}
        {activeTab === "pending" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Pending Reviews</h2>
              <div className="flex gap-2">
                <button className="btn-secondary px-4 py-2 flex items-center gap-2">
                  <Filter size={16} />
                  Filter
                </button>
              </div>
            </div>

            {allPendingRequests.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No pending requests to review right now.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allPendingRequests.map((req) => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">
                              {req.studentName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{req.studentName}</h4>
                            <p className="text-sm text-gray-500">{req.studentEmail}</p>
                          </div>
                          {req.studentBatch && (
                            <span className="badge badge-info">{req.studentBatch}</span>
                          )}
                        </div>
                        <div className="ml-13">
                          <h5 className="font-medium text-gray-900 mb-1">{req.taskId?.title}</h5>
                          <p className="text-sm text-gray-600">{req.taskId?.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {req.taskId?.proofRequired && req.proofImage ? (
                          <button
                            onClick={() => setViewingImage(req.proofImage)}
                            className="btn-secondary px-4 py-2 flex items-center gap-2"
                          >
                            <ImageIcon size={16} />
                            View Proof
                          </button>
                        ) : req.taskId?.proofRequired ? (
                          <span className="badge badge-danger">No Proof</span>
                        ) : null}

                        <button
                          onClick={() => handleApprove(req._id, true)}
                          className="btn-success px-6 py-2 flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Task View */}
        {activeTab === "create" && (
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Task</h2>
                <p className="text-gray-600">This task will be assigned to all students</p>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    className="glass-input w-full px-4 py-3 text-gray-900"
                    placeholder="e.g., Submit Library Clearance"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    className="glass-input w-full px-4 py-3 text-gray-900"
                    placeholder="Provide detailed instructions for the task..."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="proof"
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    checked={newTaskProof}
                    onChange={(e) => setNewTaskProof(e.target.checked)}
                  />
                  <label htmlFor="proof" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Require students to upload proof (screenshot/document)
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Create Task
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;