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
  route("pipeline/:id", "routers/dashboard/PipelineDetail.tsx"),
  route("pipeline", "routers/dashboard/Pipeline.tsx"),
  route("projects", "routers/Projects.tsx"),

  // Module Routes
  route("insights", "routers/Insights.tsx"),
  route("optimizer", "routers/Optimizer.tsx"),
  route("security", "routers/Security.tsx"),

  // Configuration
  route("settings", "routers/Settings.tsx"),
] satisfies RouteConfig;
