import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/auth`
    : "http://localhost:5000/api/auth",
});

// REGISTER
export const registerUser = (data) =>
  API.post("/register", data);

// LOGIN
export const loginUser = (data) =>
  API.post("/login", data);
