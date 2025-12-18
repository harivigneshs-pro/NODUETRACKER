import DashboardLayout from "../components/DashboardLayout";

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold mb-4">
        Admin Dashboard
      </h1>
      <p>Manage users, batches, and permissions.</p>
    </DashboardLayout>
  );
};

export default AdminDashboard;
