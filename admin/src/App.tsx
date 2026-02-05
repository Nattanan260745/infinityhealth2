import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import './App.css';

import MainLayout from './layouts/MainLayout';

import ExerciseList from './pages/exercises/ExerciseList';
import ExerciseForm from './pages/exercises/ExerciseForm';
import MissionList from './pages/missions/MissionList';
import MissionForm from './pages/missions/MissionForm';
import UserList from './pages/users/UserList';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/missions" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ExerciseList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ExerciseForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises/edit/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ExerciseForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/missions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MissionList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/missions/new"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MissionForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/missions/edit/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MissionForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
