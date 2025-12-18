import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="h-14 bg-indigo-600 text-white flex items-center justify-between px-6 shadow">
      <h1 className="text-xl font-bold">No Due Tracker</h1>

      <button
        onClick={logout}
        className="bg-white text-indigo-600 px-4 py-1 rounded-md font-semibold hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
