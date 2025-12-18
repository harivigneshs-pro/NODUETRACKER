import { Link } from "react-router-dom";

const Sidebar = ({ role }) => {
  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-5">
      <h2 className="text-lg font-semibold mb-6 capitalize">
        {role} Panel
      </h2>

      <nav className="space-y-3">
        <Link className="block hover:text-indigo-400" to="">
          Dashboard
        </Link>

        {role === "student" && (
          <Link className="block hover:text-indigo-400" to="">
            My Dues
          </Link>
        )}

        {role === "teacher" && (
          <Link className="block hover:text-indigo-400" to="">
            Approvals
          </Link>
        )}

        {role === "admin" && (
          <Link className="block hover:text-indigo-400" to="">
            Manage Users
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
