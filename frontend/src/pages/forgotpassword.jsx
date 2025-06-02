import React, { useState } from "react";
import {Link} from "react-router-dom";
import "../components/styles/login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setMessage("If this email is registered, a password reset link has been sent.");
    }, 1000);
  };

  return (
    <div className="login-container">
    <div className="login-box">
      <form onSubmit={handleSubmit} className="form-group">
        <h2>Forgot Password</h2>
        <label htmlFor="email">Email Address:</label>
        <input
          type="email"
          id="email"
          className="box-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          
        />
        <label htmlFor="password">New Password:</label>
        <input
          type="password"
          id="password"
          className="box-input"
          
        />
        <label htmlFor="confirm-password">Confirm Password:</label>
        <input
          type="password"
          id="confirm-password"
          className="box-input"
          
        />
        <button className="login-btn" type="submit">Reset password</button>
      <Link to="/login"><button className="back-btn">back</button></Link>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
    </div>
  );
}

export default ForgotPassword;