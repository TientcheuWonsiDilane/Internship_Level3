import {
  House,
  SquareCheckBig,
  LayoutDashboard,
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
  User,
  Settings,
  LogOut,
  RefreshCw,
} from "lucide-react";

const sections = [
  {
    id: "overview",
    label: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", to: "/dashboard", icon: House },
      {
        id: "taskboard",
        label: "Task Board",
        to: "/projects",
        icon: SquareCheckBig,
      },
    ],
  },
  {
    id: "repository",
    label: "REPOSITORY",
    items: [
      {
        id: "repositories",
        label: "Repositories",
        to: "/repositories",
        icon: Folder,
      },
      {
        id: "pull_request",
        label: "Pull Requests",
        to: "/pullRequests",
        icon: GitPullRequest,
      },
      {
        id: "branches",
        label: "Branches",
        to: "/branches",
        icon: GitBranch,
      },
      {
        id: "commits",
        label: "Commits",
        to: "/commits",
        icon: GitCommitHorizontal,
      },
      {
        id: "githubSync",
        label: "GitHub Sync",
        to: "/githubSync",
        icon: RefreshCw,
      },
    ],
  },
  {
    id: "team",
    label: "TEAM",
    items: [
      { id: "members", label: "Members", to: "/teams", icon: Users },
      {
        id: "invitations",
        label: "Invitations",
        to: "/invitations",
        icon: UserPlus,
      },
      { id: "roles", label: "Roles & Permissions", to: "/roles", icon: Shield },
    ],
  },
  {
    id: "insight",
    label: "INSIGHT",
    items: [
      {
        id: "activityLog",
        label: "Activity Log",
        to: "/activitylog",
        icon: Activity,
      },
      {
        id: "notifications",
        label: "Notifications",
        to: "/notifications",
        icon: Bell,
      },
      {
        id: "repositorysettings",
        label: "Repository Settings",
        to: "/repositorysettings",
        icon: SlidersVertical,
      },
    ],
  },
];

export default sections;
