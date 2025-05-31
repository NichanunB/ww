// frontend/src/main.jsx
import React from 'react';
import './index.css';
import ErrorPage from './pages/error';
import Edit from './pages/editpage';
import Home from './pages/homepage';
import Profile from './pages/profile';
import Login from './pages/login';
import Register from './pages/register';
import ForgotPassword from './pages/forgotpassword';
import ProjectView from './pages/projectview'; // New component for viewing projects
import Navbar from './components/navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

function AppContent() {
  const { isLoggedIn, logout } = useAuth();

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <>
          <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
          <Home />
        </>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: '/edit',
      element: (
        <>
          <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
          <Edit />
        </>
      ),
    },
    {
      path: '/edit/:projectId', // Edit existing project
      element: (
        <>
          <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
          <Edit />
        </>
      ),
    },
    {
      path: '/project/:projectId', // View project (read-only for others' projects)
      element: (
        <>
          <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
          <ProjectView />
        </>
      ),
    },
    {
      path: '/profile',
      element: (
        <>
          <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
          <Profile />
        </>
      ),
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />,
    }
  ]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);