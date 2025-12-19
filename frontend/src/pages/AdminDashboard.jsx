import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";

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
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Admin Overview</h1>
          <p className="text-gray-500">System statistics and user management.</p>
        </div>

        {/* Stats Grid */}
        {batchStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(batchStats.taskStatsByBatch || {}).map(([batch, stats]) => (
              <div key={batch} className="glass-card p-6 rounded-2xl bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{batch}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Assignments</span>
                    <span className="font-bold">{stats.totalTasks}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(stats.completed / stats.totalTasks) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold pt-1">
                    <span className="text-green-600">{stats.completed} Cleared</span>
                    <span className="text-red-500">{stats.pending} Pending</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Table */}
        <div className="glass-card rounded-2xl overflow-hidden bg-white/50">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">User Directory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-50/50 text-indigo-900 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-left">Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{user.role}</span></td>
                    <td className="px-6 py-4 text-gray-500">{user.batch || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
