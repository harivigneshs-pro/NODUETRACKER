import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchStudents, fetchTasksForStudent, fetchStudentTaskStats } from "../api/taskApi";
import DashboardLayout from "../components/DashboardLayout";
import TaskCompletionChart from "../components/TaskCompletionChart";
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
    ChevronRight,
    User,
    Mail,
    TrendingUp,
    Award,
    FileText,
    Image as ImageIcon,
    PieChart
} from "lucide-react";

const AdvisorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentTasks, setStudentTasks] = useState([]);
    const [studentStats, setStudentStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewingImage, setViewingImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState("overview");

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
            setLoading(false);
        }
    };

    const selectStudent = async (studentId) => {
        setSelectedStudent(studentId);
        setActiveView("student-detail");
        try {
            const [tasks, stats] = await Promise.all([
                fetchTasksForStudent(studentId),
                fetchStudentTaskStats(studentId)
            ]);
            setStudentTasks(tasks);
            setStudentStats(stats);
        } catch (err) {
            console.error(err);
            alert("Failed to load student data");
        }
    };

    const getStudentStats = (studentId) => {
        // Mock data - in real app, this would come from API
        return {
            total: 8,
            completed: Math.floor(Math.random() * 8),
            pending: Math.floor(Math.random() * 3)
        };
    };

    const getOverallStats = () => {
        const totalStudents = students.length;
        const studentsWithAllTasksComplete = Math.floor(totalStudents * 0.3);
        const studentsWithPendingTasks = totalStudents - studentsWithAllTasksComplete;
        const totalTasks = totalStudents * 8;
        const completedTasks = Math.floor(totalTasks * 0.65);
        
        return {
            totalStudents,
            studentsWithAllTasksComplete,
            studentsWithPendingTasks,
            totalTasks,
            completedTasks,
            completionRate: Math.round((completedTasks / totalTasks) * 100)
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
                    <p className="text-gray-600 font-medium">Loading advisor dashboard...</p>
                </div>
            </div>
        );
    }

    const overallStats = getOverallStats();

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

            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Advisor Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Monitor student progress and oversee academic clearances
                            </p>
                        </div>
                        {activeView === "student-detail" && (
                            <button
                                onClick={() => {
                                    setActiveView("overview");
                                    setSelectedStudent(null);
                                    setStudentStats(null);
                                }}
                                className="btn-secondary px-4 py-2"
                            >
                                ← Back to Overview
                            </button>
                        )}
                    </div>
                </div>

                {activeView === "overview" && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                                        <p className="text-3xl font-bold text-blue-600">{overallStats.totalStudents}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Users size={24} className="text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Fully Cleared</p>
                                        <p className="text-3xl font-bold text-green-600">{overallStats.studentsWithAllTasksComplete}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Award size={24} className="text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                                        <p className="text-3xl font-bold text-orange-600">{overallStats.studentsWithPendingTasks}</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <Clock size={24} className="text-orange-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                                        <p className="text-3xl font-bold text-purple-600">{overallStats.completionRate}%</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <TrendingUp size={24} className="text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="glass-card p-4 mb-8">
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
                                const chartData = {
                                    total: stats.total,
                                    completed: stats.completed,
                                    pending: stats.pending,
                                    notStarted: stats.total - stats.completed - stats.pending,
                                    completionRate: Math.round(progressPercentage)
                                };
                                
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
                                            <ChevronRight size={20} className="text-gray-400" />
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

                                        {/* Mini Chart Preview */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-gray-600">Clearance Progress</span>
                                                    <span className="font-medium text-gray-900">
                                                        {stats.completed}/{stats.total}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${
                                                            progressPercentage === 100 ? 'bg-green-600' : 
                                                            progressPercentage >= 50 ? 'bg-blue-600' : 'bg-orange-600'
                                                        }`}
                                                        style={{ width: `${progressPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <TaskCompletionChart 
                                                    data={chartData} 
                                                    size={80} 
                                                    showLegend={false}
                                                    innerRadius={25}
                                                />
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="pt-4 border-t border-gray-100">
                                            {progressPercentage === 100 ? (
                                                <span className="badge badge-success">Fully Cleared</span>
                                            ) : stats.pending > 0 ? (
                                                <span className="badge badge-warning">
                                                    {stats.pending} Pending
                                                </span>
                                            ) : (
                                                <span className="badge badge-info">In Progress</span>
                                            )}
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
                    </>
                )}

                {/* Student Detail View */}
                {activeView === "student-detail" && selectedStudent && (
                    <div className="space-y-6">
                        {/* Student Header & Stats */}
                        <div className="glass-card p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-bold text-2xl">
                                            {students.find(s => s._id === selectedStudent)?.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {students.find(s => s._id === selectedStudent)?.name}
                                        </h2>
                                        <div className="flex items-center gap-4 text-gray-600 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Mail size={16} />
                                                <span>{students.find(s => s._id === selectedStudent)?.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <GraduationCap size={16} />
                                                <span>{students.find(s => s._id === selectedStudent)?.batch || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {studentTasks.filter(t => t.completedByTeacher).length}
                                        </div>
                                        <div className="text-sm text-gray-500">Completed</div>
                                    </div>
                                    <div className="w-px h-10 bg-gray-300"></div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {studentTasks.filter(t => !t.completedByTeacher).length}
                                        </div>
                                        <div className="text-sm text-gray-500">Pending</div>
                                    </div>
                                    <div className="w-px h-10 bg-gray-300"></div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {studentTasks.length > 0 ? Math.round((studentTasks.filter(t => t.completedByTeacher).length / studentTasks.length) * 100) : 0}%
                                        </div>
                                        <div className="text-sm text-gray-500">Progress</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Task Completion Chart */}
                        {studentStats && (
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <PieChart size={20} className="text-blue-600" />
                                    Task Completion Overview
                                </h3>
                                <div className="flex justify-center">
                                    <TaskCompletionChart 
                                        data={studentStats} 
                                        size={300} 
                                        showLegend={true}
                                        innerRadius={80}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tasks List */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FileText size={20} className="text-blue-600" />
                                Academic Clearances
                            </h3>

                            <div className="space-y-4">
                                {studentTasks.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500">No tasks assigned to this student yet.</p>
                                    </div>
                                ) : (
                                    studentTasks.map(task => (
                                        <motion.div
                                            key={task._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                                        >
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        {task.taskId?.title || 'Untitled Task'}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {task.taskId?.description || 'No description available'}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        {task.proofImage && (
                                                            <button
                                                                onClick={() => setViewingImage(task.proofImage)}
                                                                className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                                                            >
                                                                <ImageIcon size={12} />
                                                                View Proof
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0">
                                                    {task.completedByTeacher ? (
                                                        <span className="badge badge-success">
                                                            <CheckCircle size={14} />
                                                            Cleared
                                                        </span>
                                                    ) : task.requestSent ? (
                                                        <span className="badge badge-warning">
                                                            <Clock size={14} />
                                                            Pending Review
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-info">
                                                            <AlertCircle size={14} />
                                                            Not Started
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdvisorDashboard;