import React, {useState} from 'react';
import './index.css';
import ErrorPage from './pages/error';
import Edit from './pages/editpage';
import Home from './pages/homepage';
import Profile from './pages/profile';
import Login from './pages/login';
import Register from './pages/register';
import ForgotPassword from './pages/forgotpassword';
import Navbar from './components/navbar';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <>
          <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          <Home />
        </>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: '/edit',
      element: (
        <>
          <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          <Edit />
        </>
      ),
    },
    {
      path: '/profile',
      element: (
        <>
          <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          <Profile />
        </>
      ),
    },
    {
      path: '/login',
      element: <Login onLogin={handleLogin} />,
    },
    {
      path: '/register',
      element: <Register onLogin={handleLogin} />,
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword onLogin={handleLogin} />,
    }
    
  ]);

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

