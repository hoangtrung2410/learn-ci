import { type RouteConfig, index, route, layout } from '@react-router/dev/routes';

export default [
    // Public routes
    route("login", "routers/LoginView.tsx"),

    // Authenticated Application Routes
    // These correspond to the pages currently managed by App.tsx
    
    // Default home page -> Dashboard
    index("routers/Dashboard.tsx"),
    
    // Main Feature Routes
    route("home", "routers/Dashboard.tsx"),
    route("runs", "routers/Runs.tsx"),
    
    // Module Routes
    route("insights", "components/InsightsView.tsx"),
    route("optimizer", "components/optimizer/SystemOptimizerView.tsx"),
    route("security", "components/security/SecurityView.tsx"),
    
    // Configuration
    route("settings", "routers/Settings.tsx"),

] satisfies RouteConfig;