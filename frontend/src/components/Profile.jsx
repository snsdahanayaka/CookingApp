import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProfileForm from './ProfileForm';
import userService from '../services/user.service';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userService.getUserProfile();
        setUserProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow-sm">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information and settings</p>
      </div>
      
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card profile-sidebar">
            <div className="card-body text-center">
              <div className="position-relative mb-4">
                <img 
                  src={userProfile?.profileImage || '//ssl.gstatic.com/accounts/ui/avatar_2x.png'}
                  alt="Profile avatar" 
                  className="avatar profile-avatar" 
                />
                <button className="btn btn-sm btn-primary position-absolute bottom-0 end-0">
                  <i className="bi bi-camera-fill"></i>
                </button>
              </div>
              
              <h4 className="mb-1">{currentUser.username}</h4>
              <p className="text-muted mb-3">{userProfile?.email}</p>
              
              <div className="d-grid gap-2 d-md-flex justify-content-center mb-4">
                <button 
                  type="button" 
                  className={`btn ${activeTab === 'edit' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('edit')}
                >
                  <i className="bi bi-pencil-fill me-2"></i> Edit Profile
                </button>
                <button 
                  type="button" 
                  className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('info')}
                >
                  <i className="bi bi-person-lines-fill me-2"></i> View Info
                </button>
              </div>
              
              <div className="user-stats">
                <div className="row g-0">
                  <div className="col">
                    <div className="p-3 border-end">
                      <h6 className="mb-1">Status</h6>
                      <p className="mb-0">
                        <span className="status-indicator status-active"></span>
                        Active
                      </p>
                    </div>
                  </div>
                  <div className="col">
                    <div className="p-3">
                      <h6 className="mb-1">Member Since</h6>
                      <p className="mb-0 text-muted">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card mt-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Account Details</h5>
              <span className="badge bg-primary">Active</span>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <div className="profile-stat">
                    <div className="profile-stat-icon">
                      <i className="bi bi-shield-lock"></i>
                    </div>
                    <div>
                      <h6 className="mb-0">Roles</h6>
                      <div>
                        {currentUser.roles &&
                          currentUser.roles.map((role, index) => (
                            <span key={index} className="badge bg-primary me-1">{role}</span>
                          ))}
                      </div>
                    </div>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="profile-stat">
                    <div className="profile-stat-icon">
                      <i className="bi bi-person-badge"></i>
                    </div>
                    <div>
                      <h6 className="mb-0">User ID</h6>
                      <p className="text-muted mb-0">{currentUser.id}</p>
                    </div>
                  </div>
                </li>
                <li className="list-group-item">
                  <div className="profile-stat">
                    <div className="profile-stat-icon">
                      <i className="bi bi-geo-alt"></i>
                    </div>
                    <div>
                      <h6 className="mb-0">Location</h6>
                      <p className="text-muted mb-0">{userProfile?.address || 'Not specified'}</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          {activeTab === 'info' ? (
            <div className="card mb-4 animate-slide-in">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Personal Information</h5>
                <button className="btn btn-sm btn-outline-primary" onClick={() => setActiveTab('edit')}>
                  <i className="bi bi-pencil me-1"></i> Edit
                </button>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-sm-4">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-person text-primary me-2"></i>
                      <h6 className="mb-0">Full Name</h6>
                    </div>
                    <p className="text-muted small mb-0">Your legal name</p>
                  </div>
                  <div className="col-sm-8">
                    <p className="mb-0 fw-medium">
                      {userProfile?.firstName ? `${userProfile.firstName} ${userProfile?.lastName || ''}` : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-sm-4">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-envelope text-primary me-2"></i>
                      <h6 className="mb-0">Email</h6>
                    </div>
                    <p className="text-muted small mb-0">Your contact email</p>
                  </div>
                  <div className="col-sm-8">
                    <p className="mb-0 fw-medium">{userProfile?.email}</p>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-sm-4">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-telephone text-primary me-2"></i>
                      <h6 className="mb-0">Phone</h6>
                    </div>
                    <p className="text-muted small mb-0">Your contact number</p>
                  </div>
                  <div className="col-sm-8">
                    <p className="mb-0 fw-medium">{userProfile?.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-sm-4">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-geo-alt text-primary me-2"></i>
                      <h6 className="mb-0">Address</h6>
                    </div>
                    <p className="text-muted small mb-0">Your residential address</p>
                  </div>
                  <div className="col-sm-8">
                    <p className="mb-0 fw-medium">{userProfile?.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-slide-in">
              <ProfileForm />
            </div>
          )}
          
          <div className="card mb-4 animate-slide-in" style={{animationDelay: '0.1s'}}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                Security Information
              </h5>
              <span className="badge bg-success">Secure</span>
            </div>
            <div className="card-body">
              <div className="security-item d-flex align-items-start mb-3">
                <div className="security-icon me-3">
                  <i className="bi bi-key-fill text-primary"></i>
                </div>
                <div>
                  <h6>Authentication Token</h6>
                  <div className="d-flex align-items-center">
                    <code className="small text-muted me-2">
                      {currentUser.token.substring(0, 15)}...{currentUser.token.substring(currentUser.token.length - 15)}
                    </code>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => navigator.clipboard.writeText(currentUser.token)}>
                      <i className="bi bi-clipboard"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="security-item d-flex align-items-start">
                <div className="security-icon me-3">
                  <i className="bi bi-clock-history text-primary"></i>
                </div>
                <div>
                  <h6>Last Login</h6>
                  <p className="small text-muted mb-0">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
