import DashboardLayout from "../components/DashboardLayout";

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin">
      <h1>Welcome, {localStorage.getItem("name")}</h1>
      <p>Admin-specific content here.</p>
    </DashboardLayout>
  );
};

export default AdminDashboard;
