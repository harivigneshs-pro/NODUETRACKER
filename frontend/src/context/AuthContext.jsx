import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../api/authApi";
// import { useNavigate } from "react-router-dom"; // Context usually shouldn't navigate, but can return promises

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const name = localStorage.getItem("name");
        const id = localStorage.getItem("id");

        if (token) {
            setUser({ token, role, name, id });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await loginUser({ email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("name", res.data.user.name);
        localStorage.setItem("id", res.data.user._id);
        setUser({
            token: res.data.token,
            role: res.data.user.role,
            name: res.data.user.name,
            id: res.data.user._id
        });
        return res.data.user; // Return user so component knows where to redirect
    };

    const register = async (name, email, password, role, batch) => {
        const res = await registerUser({ name, email, password, role, batch });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("name", res.data.user.name);
        localStorage.setItem("id", res.data.user._id);
        setUser({
            token: res.data.token,
            role: res.data.user.role,
            name: res.data.user.name,
            id: res.data.user._id
        });
        return res.data.user;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
