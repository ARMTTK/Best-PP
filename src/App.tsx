import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ParkingSpotDetail } from './pages/ParkingSpotDetail';
import { BookingPage } from './pages/BookingPage';
import { BookingsPage } from './pages/BookingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { AddParkingSpot } from './pages/AddParkingSpot';
import { EditParkingSpot } from './pages/EditParkingSpot';
import { ManageAvailability } from './pages/ManageAvailability';
import { SettingsPage } from './pages/SettingsPage';
import { AdminBookingsPage } from './pages/AdminBookingsPage';
import { AdminReviewsPage } from './pages/AdminReviewsPage';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to={user.userType === 'owner' ? '/admin' : '/'} replace /> : <LoginPage />} 
        />
        
        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Navbar />
            <div className="pt-16">
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={
                  user?.userType === 'owner' ? <Navigate to="/admin" replace /> : <HomePage />
                } />
                <Route path="/spot/:id" element={<ParkingSpotDetail />} />
                <Route path="/book/:id" element={<BookingPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                
                {/* Owner-only routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requireOwner>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/add-spot" element={
                  <ProtectedRoute requireOwner>
                    <AddParkingSpot />
                  </ProtectedRoute>
                } />
                <Route path="/admin/edit-spot/:id" element={
                  <ProtectedRoute requireOwner>
                    <EditParkingSpot />
                  </ProtectedRoute>
                } />
                <Route path="/admin/availability/:id" element={
                  <ProtectedRoute requireOwner>
                    <ManageAvailability />
                  </ProtectedRoute>
                } />
                <Route path="/admin/bookings" element={
                  <ProtectedRoute requireOwner>
                    <AdminBookingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/reviews" element={
                  <ProtectedRoute requireOwner>
                    <AdminReviewsPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;