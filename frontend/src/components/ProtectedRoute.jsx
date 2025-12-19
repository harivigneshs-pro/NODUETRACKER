import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  if (!token) {
    // Not logged in → redirect to login
    return <Navigate to="/login" />;
  }
  if (role && userRole !== role) {
    // Logged in but wrong role → redirect to login
    alert("Access denied for your role!");
    return <Navigate to="/login" />;
  }
  // Logged in and correct role → render children
  return children;
};
export default ProtectedRoute;
