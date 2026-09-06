import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-brand-group">
        <Link to="/" className="brand">
          APWCFS
        </Link>
        <span className="navbar-team-badge">
          Unhandled Exceptions
        </span>
      </div>

      {/* Dynamic Center Platform Indicator */}
      <div className="navbar-status-indicator">
        <span className="live-status-dot"></span>
        <span className="live-status-text">Weather–Chemistry Coupled</span>
      </div>

      {/* Dynamic Navigation Links */}
      <div className={`nav-links ${mobileMenuOpen ? 'nav-links-mobile-open' : ''}`}>
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          Home
        </NavLink>
        <NavLink 
          to="/about" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          About
        </NavLink>
        <NavLink 
          to="/science" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Science
        </NavLink>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/policy" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Policy
        </NavLink>
        <NavLink 
          to="/validation" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Validation
        </NavLink>
        <NavLink 
          to="/roadmap" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Roadmap
        </NavLink>
      </div>

      {/* Mobile Hamburger Toggle */}
      <button 
        className="navbar-mobile-toggle"
        onClick={() => setMobileMenuOpen(prev => !prev)}
        aria-label="Toggle navigation menu"
      >
        <div style={{ width: '20px', height: '2px', background: 'var(--text-main)', transition: 'all 0.3s', transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></div>
        <div style={{ width: '20px', height: '2px', background: 'var(--text-main)', transition: 'all 0.3s', opacity: mobileMenuOpen ? 0 : 1 }}></div>
        <div style={{ width: '20px', height: '2px', background: 'var(--text-main)', transition: 'all 0.3s', transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></div>
      </button>
    </nav>
  );
}
