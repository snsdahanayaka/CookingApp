import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import learningPlanService from '../../services/learning-plan.service';

const DiscoverLearningPlans = () => {
  const { currentUser } = useContext(AuthContext);
  const [popularPlans, setPopularPlans] = useState([]);
  const [recentPlans, setRecentPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      // Fetch popular plans
      const popularResponse = await learningPlanService.getPopularPlans();
      setPopularPlans(popularResponse.data.content);
      
      // Fetch recent plans
      const recentResponse = await learningPlanService.getRecentPlans();
      setRecentPlans(recentResponse.data.content);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching learning plans:', err);
      setError('Failed to load learning plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await learningPlanService.searchPublicPlans(searchQuery);
      setSearchResults(response.data.content);
      setActiveTab('search');
      setError(null);
    } catch (err) {
      console.error('Error searching learning plans:', err);
      setError('Failed to search learning plans. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleEnroll = async (planId) => {
    try {
      await learningPlanService.enrollInPlan(planId);
      alert('Successfully enrolled in the learning plan!');
      
      // Refresh plans to update enrollment status
      fetchPlans();
    } catch (err) {
      console.error('Error enrolling in plan:', err);
      alert('Failed to enroll in the learning plan. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Discovering learning plans...</p>
      </div>
    );
  }

  const renderPlanCard = (plan) => (
    <div className="col" key={plan.id}>
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title">{plan.title}</h5>
          <p className="card-text text-muted mb-2">
            {plan.description ? (
              plan.description.length > 100 ? 
                `${plan.description.substring(0, 100)}...` : 
                plan.description
            ) : (
              <span className="fst-italic">No description</span>
            )}
          </p>
          
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              {plan.topics?.length || 0} topics
            </small>
            <div className="progress flex-grow-1 mx-2" style={{ height: '8px' }}>
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ width: `${getCompletionPercentage(plan)}%` }}
                aria-valuenow={getCompletionPercentage(plan)} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
            <small className="text-muted">{getCompletionPercentage(plan)}%</small>
          </div>
          
          {plan.enrollmentCount > 0 && (
            <div className="mt-2">
              <small className="text-muted">
                <i className="bi bi-people me-1"></i>
                {plan.enrollmentCount} {plan.enrollmentCount === 1 ? 'learner' : 'learners'}
              </small>
            </div>
          )}
          
          <div className="mt-2">
            <small className="text-muted">
              Created by: <span className="fw-bold">{plan.user.username}</span>
            </small>
          </div>
        </div>
        <div className="card-footer bg-transparent">
          <div className="d-flex justify-content-between">
            <Link to={`/learning-plans/${plan.id}`} className="btn btn-sm btn-outline-primary">
              <i className="bi bi-eye me-1"></i> View Details
            </Link>
            {currentUser && !plan.isEnrolled && (
              <button 
                className="btn btn-sm btn-success"
                onClick={() => handleEnroll(plan.id)}
              >
                <i className="bi bi-plus-circle me-1"></i> Join
              </button>
            )}
            {currentUser && plan.isEnrolled && (
              <button className="btn btn-sm btn-outline-success" disabled>
                <i className="bi bi-check-circle me-1"></i> Enrolled
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Discover Learning Plans</h2>
        <Link to="/learning-plans" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i> My Plans
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search learning plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={searching || !searchQuery.trim()}
            >
              {searching ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-search"></i>
              )}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'popular' ? 'active' : ''}`}
                onClick={() => setActiveTab('popular')}
              >
                <i className="bi bi-fire me-1"></i> Popular
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'recent' ? 'active' : ''}`}
                onClick={() => setActiveTab('recent')}
              >
                <i className="bi bi-clock me-1"></i> Recent
              </button>
            </li>
            {searchResults.length > 0 && (
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
                  onClick={() => setActiveTab('search')}
                >
                  <i className="bi bi-search me-1"></i> Search Results
                </button>
              </li>
            )}
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'popular' && (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {popularPlans.length > 0 ? (
                popularPlans.map(plan => renderPlanCard(plan))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-muted mb-0">No popular learning plans found.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'recent' && (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {recentPlans.length > 0 ? (
                recentPlans.map(plan => renderPlanCard(plan))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-muted mb-0">No recent learning plans found.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'search' && (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {searchResults.length > 0 ? (
                searchResults.map(plan => renderPlanCard(plan))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-muted mb-0">No learning plans found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function
const getCompletionPercentage = (plan) => {
  if (!plan.topics || plan.topics.length === 0) return 0;
  
  const completedTopics = plan.topics.filter(topic => topic.status === 'COMPLETED').length;
  return Math.round((completedTopics / plan.topics.length) * 100);
};

export default DiscoverLearningPlans;
