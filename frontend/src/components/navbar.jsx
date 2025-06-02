// frontend/src/components/navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./styles/navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to homepage with search query
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">NovelSync</Link>
      </div>

      <div className="nav-controls">
        {!isLoggedIn && (
          <div className="signin-icon">
            <Link to="/login">Sign In</Link>
          </div>
        )}

        {isLoggedIn && user && (
          <div className="user-info">
            <span className="username">Hi, {user.user_name}</span>
          </div>
        )}

        <div className="menu-icon" onClick={toggleMenu}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </div>
      
      <div className={`menu-dropdown ${menuOpen ? "open" : ""}`}>
        <ul>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          {isLoggedIn && (
            <>
              <li><Link to="/edit" onClick={() => setMenuOpen(false)}>Create</Link></li>
              <li><Link to="/profile" onClick={() => setMenuOpen(false)}>Account</Link></li>
              <li><a href="#" onClick={() => setMenuOpen(false)}>Help</a></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          )}
          {!isLoggedIn && (
            <>
              <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
              <li><Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;