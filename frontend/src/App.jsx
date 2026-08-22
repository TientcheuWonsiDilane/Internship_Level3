import { StrictMode, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext";
import ModalHost from "./components/ModalHost";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import PublicTeams from "./pages/PublicTeams";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import Invitations from "./pages/Invitations";
import Organizations from "./pages/Organizations";
import Organization from "./pages/Organization";
import OrganizationOnboard from "./pages/OrganizationOnboard";
import Projects from "./pages/Projects";
import Project from "./pages/Project";
import Repositories from "./pages/Repositories";
import Repository from "./pages/Repository";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Teams from "./pages/Teams";
import Team from "./pages/Team";

function App() {
  useEffect(() => {
    let scrollTimer;

    const setScrolling = () => {
      document.documentElement.classList.add("scrolling");
      document.body.classList.add("scrolling");

      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        document.documentElement.classList.remove("scrolling");
        document.body.classList.remove("scrolling");
      }, 180);
    };

    window.addEventListener("scroll", setScrolling, { passive: true });
    return () => {
      window.removeEventListener("scroll", setScrolling);
      window.clearTimeout(scrollTimer);
      document.documentElement.classList.remove("scrolling");
      document.body.classList.remove("scrolling");
    };
  }, []);

  const PublicLayout = () => (
    <div className="p-0 m-0">
      <Header />
      <div className="mt-12">
        <Outlet />
      </div>
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
      <AuthProvider>
        <ModalProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/for-teams" element={<PublicTeams />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            <Route
              path="/organizations/:id/onboard"
              element={
                <ProtectedRoute>
                  <OrganizationOnboard />
                </ProtectedRoute>
              }
            />

            <Route
              element={
                <ProtectedRoute>
                  <SidebarLayout />
                </ProtectedRoute>
              }>
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
          <ModalHost />
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
