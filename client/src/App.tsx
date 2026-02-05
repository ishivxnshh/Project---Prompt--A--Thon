import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Planner from './pages/Planner';
import Profile from './pages/Profile';
import Reminders from './pages/Reminders';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { GlobalTimerWidget } from './components/GlobalTimerWidget';

import { TimerProvider } from './context/TimerContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TimerProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="planner" element={<Planner />} />
                <Route path="reminders" element={<Reminders />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Catch all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <GlobalTimerWidget />
          </ThemeProvider>
        </TimerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
