import { createBrowserRouter, Outlet } from "react-router";
import { RoleSelection } from "./pages/RoleSelection";
import { Login } from "./pages/Login";
import { Catalogue } from "./pages/Catalogue";
import { UnlockedCourses } from "./pages/UnlockedCourses";
import { SettingsProvider } from "./contexts/SettingsContext";
import { UserProvider } from "./contexts/UserContext";
import { Toaster } from "./components/ui/sonner";

import { CustomerService } from "./pages/CustomerService";
import { AiLearning } from "./pages/AiLearning";
import { ResetPassword } from "./pages/ResetPassword";

// Forcing a re-render to clear HMR issue
function Root() {
  return (
    <SettingsProvider>
      <UserProvider>
        <Outlet />
        <Toaster position="top-right" />
      </UserProvider>
    </SettingsProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    errorElement: <div>Error loading app. Please refresh the page.</div>,
    children: [
      {
        index: true,
        Component: RoleSelection,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "catalogue",
        Component: Catalogue,
      },
      {
        path: "unlocked-courses",
        Component: UnlockedCourses,
      },
      {
        path: "customer-service",
        Component: CustomerService,
      },
      {
        path: "ai-learning",
        Component: AiLearning,
      },
      {
        path: "reset-password",
        Component: ResetPassword,
      }
    ]
  }
]);