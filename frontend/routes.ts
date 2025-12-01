import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  route("login", "routers/LoginView.tsx"),

  // Default home page -> Dashboard
  index("routers/Dashboard.tsx"),

  // Main Feature Routes
  route("home", "routers/Dashboard.tsx"),
  route("runs", "routers/Runs.tsx"),
  route("projects", "routers/Projects.tsx"),

  // Module Routes
  route("insights", "routers/Insights.tsx"),
  route("optimizer", "routers/Optimizer.tsx"),
  route("security", "routers/Security.tsx"),

  // Configuration
  route("settings", "routers/Settings.tsx"),
] satisfies RouteConfig;
