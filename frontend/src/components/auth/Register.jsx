import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [successful, setSuccessful] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Track password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }
    
    // Simple password strength calculation
    let strength = 0;
    if (formData.password.length >= 8) strength += 1;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
    
    setPasswordStrength(strength);
    
    // Set feedback based on strength
    const feedbacks = [
      'Too weak',
      'Could be stronger',
      'Pretty good',
      'Strong password!'
    ];
    
    setPasswordFeedback(feedbacks[strength - 1] || '');
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccessful(false);
    setLoading(true);
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (passwordStrength < 2) {
      setMessage('Please use a stronger password');
      setLoading(false);
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      setSuccessful(true);
      setMessage('Registration successful!');
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      setMessage(resMessage);
      setSuccessful(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-card">
            <div className="auth-content">
              <div className="auth-header">
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join our community of food enthusiasts</p>
              </div>
              
              {!successful && (
                <form onSubmit={handleRegister} className="auth-form">
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
                      minLength="3"
                      maxLength="20"
                    />
                    <label htmlFor="username">
                      <i className="bi bi-person me-2"></i>Username
                    </label>
                  </div>

                  <div className="form-floating mb-4">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="email">
                      <i className="bi bi-envelope me-2"></i>Email
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
                      minLength="6"
                    />
                    <label htmlFor="password">
                      <i className="bi bi-lock me-2"></i>Password
                    </label>
                  </div>
                  
                  {formData.password && (
                    <div className="password-strength mb-4">
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar bg-${passwordStrength === 1 ? 'danger' : passwordStrength === 2 ? 'warning' : passwordStrength === 3 ? 'info' : 'success'}`} 
                          role="progressbar" 
                          style={{ width: `${passwordStrength * 25}%` }}
                          aria-valuenow={passwordStrength * 25} 
                          aria-valuemin="0" 
                          aria-valuemax="100">
                        </div>
                      </div>
                      {passwordFeedback && (
                        <small className="form-text text-muted d-block mt-1">
                          {passwordFeedback}
                        </small>
                      )}
                    </div>
                  )}
                  
                  <div className="form-floating mb-4">
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="confirmPassword">
                      <i className="bi bi-shield-lock me-2"></i>Confirm Password
                    </label>
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
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          <span>Create Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {message && (
                <div className={`alert ${successful ? "alert-success" : "alert-danger"} alert-dismissible fade show mt-4 mb-0 text-center`}
                     role="alert"
                >
                  {message}
                  <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                </div>
              )}
              
              <div className="auth-footer mt-4 text-center">
                <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
              </div>
            </div>
          </div>
          
          <div className="auth-image-container">
            <div className="auth-image">
              <div className="auth-image-overlay"></div>
              <div className="auth-image-content">
                <h2>Share Your Culinary Journey</h2>
                <p>Join thousands of food enthusiasts sharing their favorite recipes and culinary creations.</p>
                <div className="auth-features">
                  <div className="auth-feature-item">
                    <i className="bi bi-camera"></i>
                    <span>Share your dishes</span>
                  </div>
                  <div className="auth-feature-item">
                    <i className="bi bi-heart"></i>
                    <span>Discover recipes</span>
                  </div>
                  <div className="auth-feature-item">
                    <i className="bi bi-people"></i>
                    <span>Connect with others</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
