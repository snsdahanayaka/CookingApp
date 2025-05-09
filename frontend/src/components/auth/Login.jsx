import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/posts');
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      setMessage(resMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-image-container">
            <div className="auth-image">
              <div className="auth-image-overlay"></div>
              <div className="auth-image-content">
                <h2>Welcome Back!</h2>
                <p>Log in to continue your culinary journey and explore new recipes from around the world.</p>
                <div className="auth-features">
                  <div className="auth-feature-item">
                    <i className="bi bi-journal-richtext"></i>
                    <span>Your recipe collection</span>
                  </div>
                  <div className="auth-feature-item">
                    <i className="bi bi-bookmark-heart"></i>
                    <span>Saved favorites</span>
                  </div>
                  <div className="auth-feature-item">
                    <i className="bi bi-chat-square-dots"></i>
                    <span>Cook conversations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="auth-card">
            <div className="auth-content">
              <div className="auth-header">
                <h1 className="auth-title">Sign In</h1>
                <p className="auth-subtitle">Welcome back to CookingInsta</p>
              </div>
              
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-floating mb-4">
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="username">
                    <i className="bi bi-person me-2"></i>Username
                  </label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="password">
                    <i className="bi bi-lock me-2"></i>Password
                  </label>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <Link to="#" className="auth-link small">Forgot password?</Link>
                </div>

                <div className="form-group">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100 rounded-pill" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </div>
                
                {message && (
                  <div className="alert alert-danger alert-dismissible fade show mt-4 mb-0" role="alert">
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                  </div>
                )}
              </form>
              
              <div className="auth-footer mt-4 text-center">
                <p>Don't have an account? <Link to="/register" className="auth-link">Sign up now</Link></p>
              </div>
              
              <div className="auth-social mt-4">
                <div className="divider">
                  <span>or continue with</span>
                </div>
                <div className="social-buttons mt-3">
                  <button className="btn btn-outline-secondary social-btn">
                    <i className="bi bi-google"></i>
                  </button>
                  <button className="btn btn-outline-secondary social-btn">
                    <i className="bi bi-facebook"></i>
                  </button>
                  <button className="btn btn-outline-secondary social-btn">
                    <i className="bi bi-twitter"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
