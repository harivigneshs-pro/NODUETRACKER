import axios from "axios";

const API = axios.create({
  baseURL: "https://noduetrackerbackend.onrender.com/api",
});

// REGISTER
export const registerUser = (data) =>
  API.post("/auth/register", data);

// LOGIN
export const loginUser = (data) =>
  API.post("/auth/login", data);
