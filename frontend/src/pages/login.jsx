import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/editpage.css';
import '../components/styles/login.css';
import { Link } from 'lucide-react';



function Login({ onLogin }) {
  const [editOpen, setEditOpen] = useState(false);
  const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Send login request to the server
            const response = await axios.post('http://localhost:8080/api/login', {
                email,
                password,
            });

            // Extract token and user_id from response
            const { token, user_id } = response.data;

            // Save token to localStorage or cookies
            localStorage.setItem('token', token);
            localStorage.setItem('user_id', user_id);

            // Call onLogin to update the app state
            onLogin({ user_id, email });
            // Redirect to home page
            // Redirect to home page
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid login credentials.');
        }
    };

    const handleClose = () => {
        // Close the login modal  
        navigate('/');
    };


  return (
    <div>
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
                        />
                        <div>
                            <label>Password</label>
                        </div>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <div className="remember-me">
                            <input 
                                type="checkbox" 
                                checked={rememberMe} 
                                onChange={() => setRememberMe(!rememberMe)} 
                            />
                            <label>Remember me</label>
                            <a href="/forgot-password" className='forgot-password'>Forgot Password?</a>
                        </div>
                        <button className='login-btn' type="submit">Login</button>
                    </form>
                    <p>No account? <a href="/register">Register here!</a></p>
                
                    <button className="login-btn" onClick={handleClose}>
                    back
                </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Login;
