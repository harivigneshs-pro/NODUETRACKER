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
  PartyPopper,
  Loader2
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
        <p className="text-slate-500 font-medium animate-pulse">Loading your tasks...</p>
      </div>
    </div>
  );

  const allCompleted = tasks.length > 0 && tasks.every(t => t.completedByTeacher);
  const pendingCount = tasks.filter(t => !t.completedByTeacher).length;

  if (showCertificate) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto print:bg-white print:absolute print:inset-0 print:overflow-visible"
      >
        <div className="min-h-screen flex flex-col items-center justify-center p-4 print:p-0 print:block print:h-full">
          <div className="w-full max-w-4xl glass-panel bg-white rounded-xl shadow-2xl overflow-hidden relative print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
            <div className="absolute top-4 left-4 z-10 print:hidden">
              <button
                onClick={() => setShowCertificate(false)}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                ← Back
              </button>
            </div>
            <div className="absolute top-4 right-4 z-10 print:hidden">
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2"
              >
                <Download size={18} /> Print / Save
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
      <div className="max-w-6xl mx-auto text-slate-800">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              Hello, <span className="text-indigo-600 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">{user?.name?.split(' ')[0] || 'Student'}</span> 👋
            </h1>
            <p className="text-slate-500 mt-2 text-lg">Here's your progress on clearing dues.</p>
          </div>

          <div className="flex gap-4">
            <div className="glass-card px-6 py-4 flex items-center gap-4 bg-white/60">
              <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800 leading-none">{pendingCount}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Pending</p>
              </div>
            </div>

            {allCompleted && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCertificate(true)}
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/30 flex items-center gap-2"
              >
                <PartyPopper size={24} />
                <span>Get Certificate</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Success Banner */}
        <AnimatePresence>
          {allCompleted && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-6">
                  <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                    <CheckCircle size={40} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Passed with Flying Colors!</h2>
                    <p className="text-emerald-50 text-lg">You have cleared all your dues. Your No Due Certificate is ready for download.</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {tasks.map((t) => (
            <motion.div
              key={t._id}
              variants={item}
              className={`glass-card p-0 flex flex-col h-full bg-white/70 hover:bg-white/90 group ${t.completedByTeacher ? 'border-emerald-200/50' : 'border-white/50'
                }`}
            >
              {/* Card Header */}
              <div className="p-6 pb-4 border-b border-slate-100/50">
                <div className="flex justify-between items-start mb-4">
                  <div className={`
                    text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5
                    ${t.completedByTeacher
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-indigo-50 text-indigo-700'}
                  `}>
                    {t.completedByTeacher ? (
                      <><CheckCircle size={12} /> Cleared</>
                    ) : (
                      <><FileText size={12} /> Assignment</>
                    )}
                  </div>
                  {t.taskId?.proofRequired && !t.completedByTeacher && (
                    <span className="text-xs font-semibold bg-rose-50 text-rose-600 px-2 py-1 rounded flex items-center gap-1">
                      <AlertCircle size={12} /> Proof Needed
                    </span>
                  )}
                </div>

                <h3 className={`text-xl font-bold leading-tight ${t.completedByTeacher ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}>
                  {t.taskId?.title}
                </h3>
              </div>

              {/* Card Content */}
              <div className="p-6 pt-4 flex-grow flex flex-col justify-between">
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {t.taskId?.description}
                </p>

                <div className="space-y-4">
                  {/* File Upload Section */}
                  {!t.completedByTeacher && !t.requestSent && t.taskId?.proofRequired && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 border-dashed hover:border-indigo-300 transition-colors">
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Attach Proof</label>
                      <input
                        type="file"
                        id={`file-${t._id}`}
                        accept="image/*"
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  {!t.completedByTeacher && (
                    <button
                      onClick={() => handleRequest(t._id, t.taskId?.proofRequired)}
                      disabled={t.requestSent || uploadingTaskId === t._id}
                      className={`
                        w-full py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2
                        ${t.requestSent
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                          : 'btn-primary active:scale-95'
                        }
                      `}
                    >
                      {uploadingTaskId === t._id ? (
                        <><Loader2 className="animate-spin" size={18} /> Uploading...</>
                      ) : t.requestSent ? (
                        <><Clock size={18} /> In Review</>
                      ) : (
                        <><Upload size={18} /> {t.taskId?.proofRequired ? 'Submit Proof' : 'Mark Done'}</>
                      )}
                    </button>
                  )}

                  {t.completedByTeacher && (
                    <div className="w-full py-3 text-center text-emerald-600 font-medium bg-emerald-50 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle size={18} /> Approved
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
