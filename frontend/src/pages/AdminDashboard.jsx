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

  if (loading) return <p className="p-4">Loading admin data...</p>;

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Batch Stats */}
      {batchStats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Batch Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(batchStats.taskStatsByBatch || {}).map(([batch, stats]) => (
              <div key={batch} className="p-4 bg-white border rounded shadow">
                <h3 className="font-bold text-lg">{batch}</h3>
                <p>Tasks Assigned: {stats.totalTasks}</p>
                <p className="text-green-600">Completed: {stats.completed}</p>
                <p className="text-red-500">Pending: {stats.pending}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white border rounded shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">All Users</h2>
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Batch</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 capitalize">{user.role}</td>
                <td className="p-3">{user.batch || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
