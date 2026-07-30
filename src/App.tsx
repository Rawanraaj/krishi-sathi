import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './viewmodels/useAuth';
import { Navbar } from './views/components/Navbar';
import { Footer } from './views/components/Footer';

import { HomeView } from './views/pages/HomeView';
import { LoginView } from './views/pages/LoginView';
import { SignupView } from './views/pages/SignupView';
import { ListingsView } from './views/pages/ListingsView';
import { NewListingView } from './views/pages/NewListingView';
import { FavoritesView } from './views/pages/FavoritesView';
import { DashboardView } from './views/pages/DashboardView';

import { ProtectedRoute } from './views/components/ProtectedRoute';
import { RoleGuard } from './views/components/RoleGuard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomeView />} />
              <Route path="/login" element={<LoginView />} />
              <Route path="/signup" element={<SignupView />} />
              <Route path="/listings" element={<ListingsView />} />

              {/* Protected Farmer-Only Route */}
              <Route
                path="/listings/new"
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredRole="farmer">
                      <NewListingView />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Protected Authenticated Routes */}
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <FavoritesView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardView />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
