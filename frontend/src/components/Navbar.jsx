import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './notifications/NotificationBell';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  
  const isActive = (path) => location.pathname === path;
  
  // Check if current page is displaying post feed content
  const isPostFeedPage = location.pathname === '/posts' || 
                         location.pathname.startsWith('/posts/tag/') ||
                         location.pathname.match(/^\/posts\/\d+$/);
                         
  // Handle scroll effects for navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add box shadow when scrolled
      setScrolled(currentScrollTop > 10);
      
      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollTop > lastScrollTop && currentScrollTop > 80) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      
      setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  return (
    <nav className={`navbar navbar-expand-md navbar-dark ${scrolled ? 'navbar-scrolled' : ''} ${navVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
      <div className="container">
        <Link to="/posts" className="navbar-brand">
          <div className="brand-logo">
            <span className="brand-text">Cooking</span>
            <span className="brand-accent">Insta</span>
            <span className="brand-dot"></span>
          </div>
        </Link>
        
        <button
          className={`navbar-toggler custom-toggler ${menuOpen ? 'is-active' : ''}`}
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-controls="navbarContent"
          aria-expanded={menuOpen ? 'true' : 'false'}
          aria-label="Toggle navigation"
        >
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        
        <div className={`collapse navbar-collapse ${menuOpen ? 'show animate-fade-in' : ''}`} id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Only show Post Feed button when not on post feed pages */}
            {!isPostFeedPage && (
              <li className="nav-item animated-item">
                <Link to="/posts" className={`nav-link nav-link-hover ${isActive('/posts') ? 'active' : ''}`}>
                  <div className="nav-icon-wrapper">
                    <i className="bi bi-grid"></i>
                  </div>
                  <span>Post Feed</span>
                </Link>
              </li>
            )}

            {currentUser && (
              <>
                <li className="nav-item animated-item">
                  <Link to="/profile" className={`nav-link nav-link-hover ${isActive('/profile') ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper">
                      <i className="bi bi-person"></i>
                    </div>
                    <span>Profile</span>
                  </Link>
                </li>
                <li className="nav-item animated-item">
                  <Link to="/my-posts" className={`nav-link nav-link-hover ${isActive('/my-posts') ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper">
                      <i className="bi bi-journal-text"></i>
                    </div>
                    <span>My Posts</span>
                  </Link>
                </li>
                <li className="nav-item animated-item">
                  <Link to="/learning-plans" className={`nav-link nav-link-hover ${isActive('/learning-plans') ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper">
                      <i className="bi bi-mortarboard"></i>
                    </div>
                    <span>Learning Plans</span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="navbar-nav ms-auto">
            {currentUser ? (
              <>
                {/* Notification Bell */}
                <li className="nav-item notification-item animated-item">
                  <NotificationBell />
                </li>
                <li className="nav-item dropdown animated-item">
                  <a
                    className="nav-link dropdown-toggle user-profile-link"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span className="user-avatar pulse-on-hover">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </span>
                    <span className="d-none d-md-inline ms-2 username-text">{currentUser.username}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end custom-dropdown" aria-labelledby="navbarDropdown">
                    <li>
                      <Link to="/profile" className="dropdown-item dropdown-item-animate">
                        <i className="bi bi-person-circle me-2"></i> My Profile
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a
                        href="#"
                        className="dropdown-item dropdown-item-animate text-danger"
                        onClick={(e) => {
                          e.preventDefault();
                          logout();
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </a>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item animated-item">
                  <Link to="/login" className={`nav-link nav-link-hover ${isActive('/login') ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper">
                      <i className="bi bi-box-arrow-in-right"></i>
                    </div>
                    <span>Login</span>
                  </Link>
                </li>
                <li className="nav-item animated-item">
                  <Link to="/register" className="nav-link">
                    <button className="btn btn-primary sign-up-btn pulse-on-hover">
                      Sign Up
                    </button>
                  </Link>
                </li>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
