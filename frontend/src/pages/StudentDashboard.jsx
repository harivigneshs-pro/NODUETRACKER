import { useState, useEffect, useContext } from "react";
import { fetchStudentTasks, requestTaskCompletion } from "../api/taskApi";
import DashboardLayout from "../components/DashboardLayout";
import Certificate from "../components/Certificate";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Upload,
  FileText,
  AlertCircle,
  Download,
  Award,
  Target,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState(null);

  const loadTasks = async () => {
    try {
      const data = await fetchStudentTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleRequest = async (taskId, proofRequired) => {
    let proofImage = null;
    if (proofRequired) {
      const fileInput = document.getElementById(`file-${taskId}`);
      if (!fileInput || !fileInput.files[0]) {
        alert("Please select a screenshot/image as proof.");
        return;
      }

      const file = fileInput.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large. Please upload image under 10MB.");
        return;
      }

      setUploadingTaskId(taskId);
      proofImage = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    } else {
      setUploadingTaskId(taskId);
    }

    try {
      await requestTaskCompletion(taskId, proofImage);
      loadTasks();
    } catch (err) {
      alert(err.message || "Failed to send request");
    } finally {
      setUploadingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const allCompleted = tasks.length > 0 && tasks.every(t => t.completedByTeacher);
  const pendingCount = tasks.filter(t => !t.completedByTeacher).length;
  const completedCount = tasks.filter(t => t.completedByTeacher).length;
  const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (showCertificate) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 overflow-y-auto print:bg-white print:absolute print:inset-0 print:overflow-visible"
      >
        <div className="min-h-screen flex flex-col items-center justify-center p-4 print:p-0 print:block print:h-full">
          <div className="w-full max-w-4xl glass-panel bg-white overflow-hidden relative print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
            <div className="absolute top-4 left-4 z-10 print:hidden">
              <button
                onClick={() => setShowCertificate(false)}
                className="btn-secondary px-4 py-2 text-sm"
              >
                ← Back
              </button>
            </div>
            <div className="absolute top-4 right-4 z-10 print:hidden">
              <button
                onClick={() => window.print()}
                className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
              >
                <Download size={16} /> Print Certificate
              </button>
            </div>
            <div className="relative h-[800px] bg-white print:h-screen print:w-screen">
              <Certificate
                studentName={user?.name || "Student"}
                batch={user?.batch || "N/A"}
                date={new Date().toLocaleDateString()}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-gray-600">
            Track your progress and manage your academic tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock size={24} className="text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-3xl font-bold text-blue-600">{Math.round(progressPercentage)}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
            <span className="text-sm font-medium text-gray-600">
              {completedCount} of {tasks.length} tasks completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-blue-600 h-3 rounded-full"
            />
          </div>
        </motion.div>

        {/* Success Banner */}
        <AnimatePresence>
          {allCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 mb-8 bg-green-50 border-green-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Award size={32} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900 mb-1">
                    Congratulations!
                  </h3>
                  <p className="text-green-700">
                    You have completed all your tasks. Your certificate is ready for download.
                  </p>
                </div>
                <button
                  onClick={() => setShowCertificate(true)}
                  className="btn-success px-6 py-3 flex items-center gap-2"
                >
                  <Award size={20} />
                  Get Certificate
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass-card p-6 hover:shadow-medium transition-all duration-200"
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className={`badge ${
                      task.completedByTeacher ? 'badge-success' : 'badge-info'
                    }`}>
                      {task.completedByTeacher ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <h3 className={`font-semibold text-gray-900 ${
                    task.completedByTeacher ? 'line-through opacity-60' : ''
                  }`}>
                    {task.taskId?.title}
                  </h3>
                </div>
                {task.taskId?.proofRequired && !task.completedByTeacher && (
                  <span className="badge badge-warning text-xs">
                    Proof Required
                  </span>
                )}
              </div>

              {/* Task Description */}
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {task.taskId?.description}
              </p>

              {/* File Upload */}
              {!task.completedByTeacher && !task.requestSent && task.taskId?.proofRequired && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Proof
                  </label>
                  <input
                    type="file"
                    id={`file-${task._id}`}
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              )}

              {/* Action Button */}
              <div className="flex gap-2">
                {!task.completedByTeacher && (
                  <button
                    onClick={() => handleRequest(task._id, task.taskId?.proofRequired)}
                    disabled={task.requestSent || uploadingTaskId === task._id}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      task.requestSent
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                  >
                    {uploadingTaskId === task._id ? (
                      <>
                        <div className="spinner w-4 h-4"></div>
                        Uploading...
                      </>
                    ) : task.requestSent ? (
                      <>
                        <Clock size={16} />
                        Under Review
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        {task.taskId?.proofRequired ? 'Submit Proof' : 'Mark Complete'}
                      </>
                    )}
                  </button>
                )}

                {task.completedByTeacher && (
                  <div className="flex-1 py-2 px-4 bg-green-50 text-green-700 rounded-lg font-medium text-center flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    Approved
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;