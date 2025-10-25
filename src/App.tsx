import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import ClassesPage from "./features/classes/pages/ClassesPage";
import ClassDetailPage from "./features/classes/pages/ClassDetailPage";
import EventsPage from "./features/events/pages/EventsPage";
import AttendancesPage from "./features/attendances/pages/AttendancesPage";
import ReportsPage from "./features/reports/pages/ReportsPage";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import Layout from "./shared/components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClassesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:classId"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClassDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Layout>
                  <EventsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendances"
            element={
              <ProtectedRoute>
                <Layout>
                  <AttendancesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
