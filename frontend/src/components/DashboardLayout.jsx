import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LogOut,
  LayoutDashboard,
  User,
  Menu,
  X,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DashboardLayout = ({ children, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: `/${role}/dashboard`, icon: LayoutDashboard },
    { label: "Profile", path: `/${role}/profile`, icon: User, disabled: true }, // Placeholder
  ];

  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-slate-700"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 transform lg:transform-none transition-all duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="h-full p-4">
          <div className="h-full glass-panel rounded-3xl flex flex-col overflow-hidden relative">
            {/* Decorative Gradient Blob */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none" />

            {/* Logo Area */}
            <div className="p-8 pb-0">
              <div className="flex items-center gap-3 text-indigo-600 mb-8">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-heading text-slate-800 tracking-tight leading-none">
                    NoDue
                  </h1>
                  <span className="text-xs font-medium text-slate-500 tracking-widest uppercase">
                    Tracker
                  </span>
                </div>
              </div>

              {/* User Info Card */}
              <div className="p-4 bg-white/50 rounded-2xl border border-white/50 backdrop-blur-sm mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Logged in as
                </p>
                <p className="text-slate-800 font-bold capitalize text-lg">
                  {role}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.label}
                    disabled={item.disabled}
                    onClick={() => {
                      if (!item.disabled) navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                        : "text-slate-600 hover:bg-white/60 hover:text-indigo-600"
                      } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon size={20} className={isActive ? "text-indigo-200" : "text-slate-400 group-hover:text-indigo-500"} />
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight size={16} className="text-indigo-200" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-semibold border border-transparent hover:border-red-100"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 h-screen overflow-y-auto no-scrollbar scroll-smooth">
        <div className="max-w-7xl mx-auto pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
