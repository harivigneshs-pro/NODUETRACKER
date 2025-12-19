import { useState, useEffect, useContext } from "react";
import { fetchStudentTasks, requestTaskCompletion } from "../api/taskApi";
import DashboardLayout from "../components/DashboardLayout";
import Certificate from "../components/Certificate";
import { AuthContext } from "../context/AuthContext";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

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
      // Find the input element
      const fileInput = document.getElementById(`file-${taskId}`);
      if (!fileInput || !fileInput.files[0]) {
        alert("Please select a screenshot/image as proof.");
        return;
      }

      // Convert to Base64
      const file = fileInput.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File too large. Please upload image under 10MB.");
        return;
      }

      proofImage = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    try {
      await requestTaskCompletion(taskId, proofImage);
      loadTasks();
    } catch (err) {
      alert(err.message || "Failed to send request");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const allCompleted = tasks.length > 0 && tasks.every(t => t.completedByTeacher);
  const pendingCount = tasks.filter(t => !t.completedByTeacher).length;

  if (showCertificate) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowCertificate(false)}
          className="fixed top-4 left-4 z-[10000] bg-gray-800 text-white px-4 py-2 rounded shadow-lg btn-print hover:bg-gray-700"
        >
          ← Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="fixed top-4 right-4 z-[10000] bg-indigo-600 text-white px-6 py-2 rounded shadow-lg btn-print font-bold hover:bg-indigo-700"
        >
          🖨️ Print / Save PDF
        </button>
        <Certificate
          studentName={user?.name || "Student"}
          batch={user?.batch || "N/A"}
          date={new Date().toLocaleDateString()}
        />
      </div>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">My Tasks</h1>
            <p className="text-gray-500 mt-2">Manage your no-due clearances.</p>
          </div>
          <div className="flex gap-4">
            {allCompleted && (
              <button
                onClick={() => setShowCertificate(true)}
                className="animate-fade-in bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center"
              >
                <span className="mr-2">🎓</span> Download Certificate
              </button>
            )}
            <div className="glass-card px-6 py-3 rounded-xl text-center">
              <span className="block text-2xl font-bold text-indigo-600">{pendingCount}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Pending</span>
            </div>
          </div>
        </div>

        {allCompleted && (
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-2xl shadow-lg mb-8 animate-fade-in text-center">
            <h2 className="text-3xl font-bold mb-2">🎉 Congratulations!</h2>
            <p className="opacity-90">You have no dues pending. You can now download your No Due Certificate.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((t) => (
            <div key={t._id} className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full bg-white/80 hover:scale-[1.02] transition-transform duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Assignment</span>
                  {t.completedByTeacher ? (
                    <span className="text-green-500 font-bold flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Cleared
                    </span>
                  ) : (
                    <span className="text-orange-400 font-bold text-sm">Action Needed</span>
                  )}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${t.completedByTeacher ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {t.taskId.title}
                </h3>
                {t.taskId.proofRequired && (
                  <span className="text-xs font-semibold bg-pink-100 text-pink-600 px-2 py-1 rounded mb-2 inline-block">📸 Proof Required</span>
                )}
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  {t.taskId.description}
                </p>

                {!t.completedByTeacher && !t.requestSent && t.taskId.proofRequired && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-400 mb-1">Attach Screenshot</label>
                    <input type="file" id={`file-${t._id}`} accept="image/*" className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                  </div>
                )}
              </div>

              <div>
                {!t.completedByTeacher && (
                  <button
                    onClick={() => handleRequest(t._id, t.taskId.proofRequired)}
                    disabled={t.requestSent}
                    className={`w-full py-3 rounded-xl font-semibold transition-all shadow-md ${t.requestSent
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'btn-primary'
                      }`}
                  >
                    {t.requestSent ? "Waiting for Approval..." : "Request Completion"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
