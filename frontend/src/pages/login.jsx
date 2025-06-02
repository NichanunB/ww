// frontend/src/pages/login.jsx
import  { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/styles/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login({ email, password });
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="form-group">
          <h2>Log in</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <div>
              <label>Password</label>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <div className="remember-me">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)} 
                disabled={isLoading}
              />
              <label>Remember me</label>
              <Link to="/forgot-password" className='forgot-password'>
                Forgot Password?
              </Link>
            </div>
            <button 
              className='login-btn' 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p>
            No account? <Link to="/register">Register here!</Link>
          </p>
          
          <button className="login-btn" onClick={handleClose}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;