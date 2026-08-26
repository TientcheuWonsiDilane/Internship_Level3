import {
  House,
  SquareCheckBig,
  ListTodo,
  Folder,
  GitPullRequest,
  GitBranch,
  GitCommitHorizontal,
  Users,
  UserPlus,
  Shield,
  Bell,
  SlidersVertical,
  Activity,
  RefreshCw,
} from "lucide-react";

const sections = [
  {
    id: "overview",
    label: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", to: "/dashboard", icon: House },
      { id: "taskboard", label: "Task Board", to: "/projects", icon: SquareCheckBig },
      { id: "mytasks", label: "My Tasks", to: "/tasks/mine", icon: ListTodo },
    ],
  },
  {
    id: "repository",
    label: "REPOSITORY",
    items: [
      { id: "repositories", label: "Repositories", to: "/repositories", icon: Folder },
      { id: "pull_request", label: "Pull Requests", to: "/pull-requests", icon: GitPullRequest },
      { id: "branches", label: "Branches", to: "/branches", icon: GitBranch },
      { id: "commits", label: "Commits", to: "/commits", icon: GitCommitHorizontal },
      { id: "githubSync", label: "GitHub Sync", to: "/github-sync", icon: RefreshCw },
    ],
  },
  {
    id: "team",
    label: "TEAM",
    items: [
      // Viewable by all members; team head manages via the page itself.
      { id: "members", label: "Members", to: "/teams", icon: Users },
      // Team Head only.
      { id: "invitations", label: "Invitations", to: "/invitations", icon: UserPlus, requiresRole: true },
      { id: "roles", label: "Roles & Permissions", to: "/roles", icon: Shield, requiresRole: true },
    ],
  },
  {
    id: "insight",
    label: "INSIGHT",
    items: [
      { id: "activityLog", label: "Activity Log", to: "/activity", icon: Activity },
      { id: "notifications", label: "Notifications", to: "/notifications", icon: Bell },
      { id: "repositorysettings", label: "Repository Settings", to: "/repository-settings", icon: SlidersVertical, requiresRole: true },
    ],
  },
];

export default sections;
