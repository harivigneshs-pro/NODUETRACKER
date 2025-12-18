import DashboardLayout from "../components/DashboardLayout";

const TeacherDashboard = () => {
  return (
    <DashboardLayout role="teacher">
      <h1>Welcome, {localStorage.getItem("name")}</h1>
      <p>Teacher-specific content here.</p>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
