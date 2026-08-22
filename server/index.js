import express from "express";
import cors from "cors";
import "dotenv/config";
import dbConnect from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import repositoryRoutes from "./routes/repositoryRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";

const app = express();
app.use(express.json());
app.use(cors({origin: 'http://localhost:5173', credentials: true}));
app.use(cookieParser());
const port = process.env.PORT || 5500;

dbConnect();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
