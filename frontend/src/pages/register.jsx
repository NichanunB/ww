// frontend/src/pages/register.jsx
import  { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/styles/login.css';

function Register() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const result = await register({
      user_name: userName,
      email,
      password,
    });

    if (result.success) {
      setSuccess('Registration successful! Please log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
          <h2>Sign up</h2>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <form onSubmit={handleSubmit}>
            <label>Username</label>
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <label>Confirm password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <button 
              className="login-btn" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p>
            Have an account? <Link to="/login">Log in</Link>
          </p>
          <button className="login-btn" onClick={handleClose}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;