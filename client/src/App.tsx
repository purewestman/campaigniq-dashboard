import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Router, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OverrideProvider } from "./contexts/OverrideContext";
import { ModificationProvider } from "./contexts/ModificationContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TourProvider } from "./contexts/TourContext";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";

function AppRouter() {
  const base = import.meta.env.BASE_URL;
  return (
    <Router base={base}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function Root() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <LoginPage />;
  return <AppRouter />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <ModificationProvider>
            <OverrideProvider>
              <TourProvider>
                <TooltipProvider>
                  <Toaster />
                  <Root />
                </TooltipProvider>
              </TourProvider>
            </OverrideProvider>
          </ModificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
