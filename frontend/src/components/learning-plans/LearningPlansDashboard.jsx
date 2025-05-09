import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import learningPlanService from '../../services/learning-plan.service';

const LearningPlansDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserPlans();
  }, []);

  const fetchUserPlans = async () => {
    setLoading(true);
    try {
      const response = await learningPlanService.getAllPlans();
      setPlans(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching learning plans:', err);
      setError('Failed to load learning plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this learning plan?')) {
      return;
    }

    try {
      await learningPlanService.deletePlan(id);
      alert('Learning plan deleted successfully');
      fetchUserPlans(); // Refresh the list
    } catch (err) {
      console.error('Error deleting learning plan:', err);
      alert('Failed to delete learning plan. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your learning plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchUserPlans}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Learning Plans</h2>
        <div>
          <Link to="/learning-plans/discover" className="btn btn-outline-info me-2">
            <i className="bi bi-globe me-2"></i>
            Discover Plans
          </Link>
          <Link to="/learning-plans/new" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Create New Plan
          </Link>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-journal-text fs-1 text-muted"></i>
            <h3 className="mt-3">No Learning Plans Yet</h3>
            <p className="text-muted">
              Create your first learning plan to start tracking your progress!
            </p>
            <Link to="/learning-plans/new" className="btn btn-primary mt-2">
              Create Your First Plan
            </Link>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {plans.map(plan => (
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
                        style={{ 
                          width: `${getCompletionPercentage(plan)}%`,
                          backgroundColor: getProgressColor(getCompletionPercentage(plan))
                        }}
                        aria-valuenow={getCompletionPercentage(plan)} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <small className="text-muted">{getCompletionPercentage(plan)}%</small>
                  </div>
                  
                  {plan.startDate && plan.endDate && (
                    <div className="text-muted mt-2">
                      <small>
                        <i className="bi bi-calendar-date me-1"></i>
                        {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                      </small>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex justify-content-between">
                    <Link to={`/learning-plans/${plan.id}`} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-eye me-1"></i> View Details
                    </Link>
                    <div>
                      <Link to={`/learning-plans/edit/${plan.id}`} className="btn btn-sm btn-outline-secondary me-1">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper functions
const getCompletionPercentage = (plan) => {
  if (!plan.topics || plan.topics.length === 0) return 0;
  
  const completedTopics = plan.topics.filter(topic => topic.status === 'COMPLETED').length;
  return Math.round((completedTopics / plan.topics.length) * 100);
};

const getProgressColor = (percentage) => {
  if (percentage < 30) return '#dc3545'; // red
  if (percentage < 70) return '#ffc107'; // yellow
  return '#198754'; // green
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default LearningPlansDashboard;
