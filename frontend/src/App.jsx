import { StrictMode } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import Invitations from "./pages/Invitations";
import Organizations from "./pages/Organizations";
import Organization from "./pages/Organization";
import Projects from "./pages/Projects";
import Project from "./pages/Project";
import Repositories from "./pages/Repositories";
import Repository from "./pages/Repository";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Teams from "./pages/Teams";
import Team from "./pages/Team";

function App() {
  const PublicLayout = () => (
    <div className="p-0 m-0">
      <Header />
      <Outlet />
    </div>
  );

  const SidebarLayout = () => (
    <div className="min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-72">
        <Outlet />
      </main>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/organizations/:id" element={<Organization />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<Project />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/repositories/:id" element={<Repository />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<Team />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
