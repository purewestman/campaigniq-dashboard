import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Router, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OverrideProvider } from "./contexts/OverrideContext";
import { ModificationProvider } from "./contexts/ModificationContext";
import Home from "./pages/Home";

function AppRouter() {
  // Vite sets BASE_URL to /campaigniq-dashboard/ in prod, / in dev
  const base = import.meta.env.BASE_URL;
  
  return (
    <Router base={base}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <ModificationProvider>
          <OverrideProvider>
            <TooltipProvider>
              <Toaster />
              <AppRouter />
            </TooltipProvider>
          </OverrideProvider>
        </ModificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
