import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, BarChart3, Database, ShieldCheck, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [batchStats, setBatchStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/admin/users`, { headers }),
          axios.get(`${API_URL}/admin/batch-status`, { headers }),
        ]);

        setUsers(usersRes.data);
        setBatchStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
        <p className="text-slate-500 font-medium">Loading System Data...</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Overview</h1>
          <p className="text-slate-500 mt-1">System statistics and user management.</p>
        </div>

        {/* Stats Grid */}
        {batchStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(batchStats.taskStatsByBatch || {}).map(([batch, stats], index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={batch}
                className="glass-card p-6 rounded-2xl bg-white relative overflow-hidden border border-white/50"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-600">
                  <BarChart3 size={100} />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Database size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Batch {batch}</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Total Assignments</span>
                    <span className="font-bold text-slate-800">{stats.totalTasks}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${stats.totalTasks ? (stats.completed / stats.totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold pt-1">
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{stats.completed} Cleared</span>
                    <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">{stats.pending} Pending</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* User Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl"
        >
          <div className="p-6 border-b border-slate-100/50 flex items-center gap-3">
            <Users className="text-indigo-600" size={20} />
            <h2 className="text-xl font-bold text-slate-800">User Directory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-left">Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{user.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1.5
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'teacher' ? 'bg-indigo-100 text-indigo-700' :
                            user.role === 'advisor' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'}
                      `}>
                        {user.role === 'admin' && <ShieldCheck size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-sm">{user.batch || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
