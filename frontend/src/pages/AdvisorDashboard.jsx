import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
    fetchStudents,
    fetchTasksForStudent,
} from "../api/taskApi";
import DashboardLayout from "../components/DashboardLayout";

const AdvisorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentTasks, setStudentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingImage, setViewingImage] = useState(null);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await fetchStudents();
            setStudents(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to load students");
        }
    };

    const selectStudent = async (studentId) => {
        setSelectedStudent(studentId);
        try {
            const tasks = await fetchTasksForStudent(studentId);
            setStudentTasks(tasks);
        } catch (err) {
            console.error(err);
            alert("Failed to load tasks");
        }
    };

    // Calculate stats for selected student
    const getStats = () => {
        if (!studentTasks.length) return { total: 0, completed: 0, percentage: 0 };
        const total = studentTasks.length;
        const completed = studentTasks.filter(t => t.completedByTeacher).length;
        return {
            total,
            completed,
            percentage: Math.round((completed / total) * 100)
        };
    };

    const stats = getStats();

    return (
        <DashboardLayout role="advisor">
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

                {/* Sidebar: Student List */}
                <div className="md:col-span-1 glass-card rounded-2xl p-4 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 px-2">Students</h3>
                    <div className="overflow-y-auto flex-1 space-y-2">
                        {students.map((s) => (
                            <button
                                key={s._id}
                                onClick={() => selectStudent(s._id)}
                                className={`w-full text-left p-3 rounded-xl transition-all ${selectedStudent === s._id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                            >
                                <div className="font-semibold">{s.name}</div>
                                <div className={`text-xs ${selectedStudent === s._id ? 'text-indigo-200' : 'text-gray-400'}`}>{s.batch || "No Batch"}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content: Tasks View */}
                <div className="md:col-span-3">
                    {!selectedStudent ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 glass-card rounded-2xl">
                            <span className="text-6xl mb-4">👨‍🏫</span>
                            <p className="text-xl">Select a student to view their NoDude status.</p>
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-6 border-b pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Student Progress</h2>
                                    <p className="text-gray-500">Overview of all assigned tasks from all teachers.</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-extrabold text-indigo-600">{stats.percentage}%</div>
                                    <div className="text-sm text-gray-500">{stats.completed} / {stats.total} Tasks Completed</div>
                                </div>
                            </div>

                            <div className="overflow-y-auto flex-1 space-y-4">
                                {studentTasks.length === 0 ? (
                                    <p className="text-center text-gray-500 mt-10">No tasks assigned to this student yet.</p>
                                ) : (
                                    studentTasks.map(t => (
                                        <div key={t._id} className="bg-white/50 border border-white/60 p-4 rounded-xl flex justify-between items-center shadow-sm">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{t.taskId.title}</h4>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                    <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-600">Teacher ID: {t.taskId.createdBy}</span>
                                                </div>
                                                {t.proofImage && (
                                                    <button
                                                        onClick={() => setViewingImage(t.proofImage)}
                                                        className="text-xs text-blue-500 underline mt-2 flex items-center gap-1"
                                                    >
                                                        📷 View Proof
                                                    </button>
                                                )}
                                            </div>
                                            <div>
                                                {t.completedByTeacher ? (
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                                                        ✅ Verified
                                                    </span>
                                                ) : t.requestSent ? (
                                                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold border border-orange-200">
                                                        ⏳ Pending Approval
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-bold border border-gray-200">
                                                        ❌ Not Done
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdvisorDashboard;
