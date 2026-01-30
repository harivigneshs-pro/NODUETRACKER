import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, BarChart3, Database, ShieldCheck, Loader2, Plus, X, UserPlus, Mail, Lock } from "lucide-react";

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

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "teacher", batch: "" });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/auth/register`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User created successfully!");
      setShowAddUser(false);
      setNewUser({ name: "", email: "", password: "", role: "teacher", batch: "" });
      // Refresh user list
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

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
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-600" /> Create New User
              </h3>
              <button onClick={() => setShowAddUser(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  placeholder="e.g. Prof. Smith"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    placeholder="email@college.edu"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      <option value="advisor">Advisor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {newUser.role === 'student' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Batch</label>
                    <input
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      placeholder="2024-A"
                      value={newUser.batch}
                      onChange={(e) => setNewUser({ ...newUser, batch: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <button type="submit" className="w-full btn-primary py-3 rounded-xl mt-2 text-lg font-bold shadow-lg shadow-indigo-500/20">
                Create Account
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Admin Overview</h1>
            <p className="text-slate-500 mt-2 text-lg">System statistics and user management portal.</p>
          </div>
          <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold text-sm">
            {users.length} Total Users
          </div>
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
                className="glass-card p-6 rounded-2xl bg-white/60 relative overflow-hidden border border-white/60 hover:border-indigo-200 transition-colors group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-600 transform scale-150 translate-x-4 -translate-y-4 group-hover:scale-175 transition-transform duration-700">
                  <BarChart3 size={100} />
                </div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-inner">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Batch {batch}</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Performance</p>
                  </div>
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
          className="glass-panel rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl"
        >
          <div className="p-8 border-b border-slate-100/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Users size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">User Directory</h2>
            </div>
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
            >
              <Plus size={18} /> Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100/50">
                <tr>
                  <th className="px-8 py-5 text-left pl-10">Name</th>
                  <th className="px-8 py-5 text-left">Email</th>
                  <th className="px-8 py-5 text-left">Role</th>
                  <th className="px-8 py-5 text-left">Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5 pl-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-medium">{user.email}</td>
                    <td className="px-8 py-5">
                      <span className={`
                        px-3 py-1.5 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1.5 shadow-sm
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          user.role === 'teacher' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                            user.role === 'advisor' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              'bg-emerald-100 text-emerald-700 border border-emerald-200'}
                      `}>
                        {user.role === 'admin' && <ShieldCheck size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-mono text-sm">
                      {user.batch ? (
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                          {user.batch}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
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
