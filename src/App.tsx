import { Toaster } from "@/components/ui/toaster";
// Temporariamente desabilitei o Toaster da lib Sonner para isolar erro de DOM (removeChild)
// import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { routes } from "./routes/routes";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const Router = () => {
  return useRoutes(routes);
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
  <Toaster />
  {/* Sonner Toaster desabilitado temporariamente. Se necessário reabilite import e componente acima */}
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
