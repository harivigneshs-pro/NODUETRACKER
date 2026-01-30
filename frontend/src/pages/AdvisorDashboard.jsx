import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
    fetchStudents,
    fetchTasksForStudent,
} from "../api/taskApi";
import DashboardLayout from "../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Search,
    GraduationCap,
    BarChart2,
    CheckCircle,
    AlertCircle,
    Clock,
    X,
    Loader2,
    ChevronRight
} from "lucide-react";

const AdvisorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentTasks, setStudentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingImage, setViewingImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

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
            // alert(err.message || "Failed to load students");
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

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.batch && s.batch.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
                <p className="text-slate-500 font-medium animate-pulse">Loading Advisor Dashboard...</p>
            </div>
        </div>
    );

    return (
        <DashboardLayout role="advisor">
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
                                <X size={32} />
                            </button>
                            <img src={viewingImage} alt="Proof" className="max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-100px)]">

                {/* Sidebar: Student List */}
                <div className="md:col-span-1 glass-panel rounded-2xl p-4 flex flex-col h-full bg-white/60 backdrop-blur-xl border-white/40">
                    <div className="flex items-center justify-between mb-6 px-1 pt-1">
                        <div className="flex items-center gap-2">
                            <Users size={20} className="text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-800">Students</h3>
                        </div>
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            {students.length}
                        </span>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Find student..."
                            className="w-full pl-9 pr-3 py-3 bg-white/50 rounded-xl text-sm border border-transparent focus:bg-white focus:border-indigo-300 outline-none transition-all shadow-sm focus:shadow-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="overflow-y-auto flex-1 custom-scrollbar space-y-2 pr-1">
                        {filteredStudents.map((s) => (
                            <button
                                key={s._id}
                                onClick={() => selectStudent(s._id)}
                                className={`w-full text-left p-3 rounded-xl transition-all border border-transparent group relative flex items-center gap-3 ${selectedStudent === s._id
                                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                    : 'hover:bg-white/60 text-slate-600 hover:shadow-sm'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-transform ${selectedStudent === s._id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 group-hover:scale-105'
                                    }`}>
                                    {s.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold text-sm truncate ${selectedStudent === s._id ? 'text-white' : 'text-slate-800'}`}>{s.name}</div>
                                    <div className={`text-xs truncate ${selectedStudent === s._id ? 'text-indigo-100/80' : 'text-slate-400'}`}>{s.batch || "No Batch"}</div>
                                </div>
                                {selectedStudent === s._id && <ChevronRight size={16} className="text-indigo-200" />}
                            </button>
                        ))}
                        {filteredStudents.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-slate-400 text-sm font-medium">No students found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content: Tasks View */}
                <div className="md:col-span-3 h-full overflow-y-auto custom-scrollbar pb-20">
                    {!selectedStudent ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 glass-card rounded-2xl border-dashed border-2 border-slate-200/60 bg-slate-50/30">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <div className="relative p-8 bg-white rounded-full shadow-lg shadow-indigo-100 text-indigo-200">
                                    <GraduationCap size={64} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-2">Student Overview</h3>
                            <p className="text-slate-500 font-medium text-center max-w-sm">Select a student from the sidebar to view their detailed clearance status and progress.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Student Header & Stats */}
                            <div className="glass-card p-6 bg-gradient-to-br from-white to-indigo-50/50">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
                                            {students.find(s => s._id === selectedStudent)?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800">
                                                {students.find(s => s._id === selectedStudent)?.name}
                                            </h2>
                                            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-xs">
                                                    {students.find(s => s._id === selectedStudent)?.batch || "N/A"}
                                                </span>
                                                <span>•</span>
                                                <span>{students.find(s => s._id === selectedStudent)?.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 bg-white/60 p-4 rounded-xl border border-white/60">
                                        <div className="text-center">
                                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Progress</div>
                                            <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                                {stats.percentage}%
                                            </div>
                                        </div>
                                        <div className="w-px h-10 bg-slate-200"></div>
                                        <div className="text-center">
                                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Cleared</div>
                                            <div className="text-2xl font-bold text-emerald-600">
                                                {stats.completed}<span className="text-sm text-slate-400 font-medium">/{stats.total}</span>
                                            </div>
                                        </div>
                                        <div className="w-16 h-16">
                                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                                <path
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="#e2e8f0"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="#4f46e5"
                                                    strokeWidth="4"
                                                    strokeDasharray={`${stats.percentage}, 100`}
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tasks List */}
                            <div className="glass-panel p-6 bg-white/40">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <BarChart2 size={20} className="text-indigo-500" />
                                    Department Clearances
                                </h3>

                                <div className="grid gap-3">
                                    {studentTasks.length === 0 ? (
                                        <p className="text-center text-slate-500 py-10 bg-white/50 rounded-xl border border-dashed border-slate-200">
                                            No tasks assigned to this student yet.
                                        </p>
                                    ) : (
                                        studentTasks.map(t => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={t._id}
                                                className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                            >
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{t.taskId.title}</h4>
                                                    <p className="text-sm text-slate-500 mt-1 max-w-xl">{t.taskId.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {t.proofImage && (
                                                            <button
                                                                onClick={() => setViewingImage(t.proofImage)}
                                                                className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                                            >
                                                                View Proof
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0">
                                                    {t.completedByTeacher ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                            <CheckCircle size={16} /> Cleared
                                                        </span>
                                                    ) : t.requestSent ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                                            <Clock size={16} /> Pending
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                            <AlertCircle size={16} /> Not Done
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdvisorDashboard;
