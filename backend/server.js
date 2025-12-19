const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");
const connectDB = require("./config/db");
dotenv.config();
connectDB();
const app = express();
app.use(cors());
// const cors = require("cors");
// app.use(cors({ origin: "http://localhost:5174", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/auth", require("./routes/authRoutes"));
// app.get("/", (req, res) => {
//   res.send("No Due Tracker Backend Running");
// });
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
