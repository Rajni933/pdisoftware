import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';

// Dynamic route-level code splitting
const SignInPage = React.lazy(() => import('./pages/SignIn').then(m => ({ default: m.SignInPage })));
const VerifyOtpPage = React.lazy(() => import('./pages/VerifyOtp').then(m => ({ default: m.VerifyOtpPage })));
const DashboardPage = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.DashboardPage })));
const YardReceivingPage = React.lazy(() => import('./pages/YardReceiving').then(m => ({ default: m.YardReceivingPage })));
const BookingsPage = React.lazy(() => import('./pages/Bookings').then(m => ({ default: m.BookingsPage })));
const VehiclesPage = React.lazy(() => import('./pages/Vehicles').then(m => ({ default: m.VehiclesPage })));
const VehicleDetailPage = React.lazy(() => import('./pages/VehicleDetail').then(m => ({ default: m.VehicleDetailPage })));
const PdiQueuePage = React.lazy(() => import('./pages/PdiQueue').then(m => ({ default: m.PdiQueuePage })));
const PdiSessionPage = React.lazy(() => import('./pages/PdiSession').then(m => ({ default: m.PdiSessionPage })));
const RepairsPage = React.lazy(() => import('./pages/Repairs').then(m => ({ default: m.RepairsPage })));
const QaQueuePage = React.lazy(() => import('./pages/QaQueue').then(m => ({ default: m.QaQueuePage })));
const QaReviewPage = React.lazy(() => import('./pages/QaReview').then(m => ({ default: m.QaReviewPage })));
const ChallanInvoicingPage = React.lazy(() => import('./pages/ChallanInvoicing').then(m => ({ default: m.ChallanInvoicingPage })));
const CertificateViewPage = React.lazy(() => import('./pages/CertificateView').then(m => ({ default: m.CertificateViewPage })));
const AdminMasterPanelPage = React.lazy(() => import('./pages/AdminMasterPanel').then(m => ({ default: m.AdminMasterPanelPage })));
const ReportsPage = React.lazy(() => import('./pages/Reports').then(m => ({ default: m.ReportsPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-ink-3">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
    <span className="text-xs font-medium">Loading Autoprime Module...</span>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return <AppShell>{children}</AppShell>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <React.Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Navigate to="/signin" replace />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signin/verify" element={<VerifyOtpPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
            path="/receiving"
            element={
              <ProtectedRoute>
                <YardReceivingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <VehiclesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id"
            element={
              <ProtectedRoute>
                <VehicleDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdi"
            element={
              <ProtectedRoute>
                <PdiQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdi/:id"
            element={
              <ProtectedRoute>
                <PdiSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repairs"
            element={
              <ProtectedRoute>
                <RepairsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa"
            element={
              <ProtectedRoute>
                <QaQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa/:id"
            element={
              <ProtectedRoute>
                <QaReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoicing"
            element={
              <ProtectedRoute>
                <ChallanInvoicingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challans"
            element={
              <ProtectedRoute>
                <ChallanInvoicingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificate/:id"
            element={
              <ProtectedRoute>
                <CertificateViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates/:id"
            element={
              <ProtectedRoute>
                <CertificateViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminMasterPanelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};
