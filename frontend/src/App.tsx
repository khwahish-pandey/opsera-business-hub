import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Challans } from './pages/Challans';
import { CreateChallan } from './pages/CreateChallan';
import { ChallanDetail } from './pages/ChallanDetail';
import { Reports } from './pages/Reports';
import { UsersPage } from './pages/Users';
import { Role } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-sm font-semibold">
        Verifying NEXORA Session...
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const RoleRoute: React.FC<{ children: React.ReactNode; roles: Role[] }> = ({ children, roles }) => {
  const { user, hasRole, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user || !hasRole(...roles)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Dashboard Layout Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Customers CRM Routes */}
              <Route
                path="customers"
                element={
                  <RoleRoute roles={['ADMIN', 'SALES', 'ACCOUNTS']}>
                    <Customers />
                  </RoleRoute>
                }
              />
              <Route
                path="customers/:id"
                element={
                  <RoleRoute roles={['ADMIN', 'SALES', 'ACCOUNTS']}>
                    <CustomerDetail />
                  </RoleRoute>
                }
              />

              {/* Products Catalog Routes */}
              <Route
                path="products"
                element={
                  <RoleRoute roles={['ADMIN', 'SALES', 'WAREHOUSE']}>
                    <Products />
                  </RoleRoute>
                }
              />

              {/* Inventory Operations Routes */}
              <Route
                path="inventory"
                element={
                  <RoleRoute roles={['ADMIN', 'WAREHOUSE']}>
                    <Inventory />
                  </RoleRoute>
                }
              />

              {/* Sales Challans Routes */}
              <Route path="challans" element={<Challans />} />
              <Route
                path="challans/new"
                element={
                  <RoleRoute roles={['ADMIN', 'SALES']}>
                    <CreateChallan />
                  </RoleRoute>
                }
              />
              <Route path="challans/:id" element={<ChallanDetail />} />

              {/* Reports & Analytics Routes */}
              <Route
                path="reports"
                element={
                  <RoleRoute roles={['ADMIN', 'ACCOUNTS']}>
                    <Reports />
                  </RoleRoute>
                }
              />

              {/* User Management Route */}
              <Route
                path="users"
                element={
                  <RoleRoute roles={['ADMIN']}>
                    <UsersPage />
                  </RoleRoute>
                }
              />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
