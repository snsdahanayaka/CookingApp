import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import learningPlanService from '../../services/learning-plan.service';

const LearningPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  const [plan, setPlan] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    materialLink: '',
    notes: '',
    status: 'NOT_STARTED'
  });

  useEffect(() => {
    fetchPlanAndTopics();
  }, [id]);

  const fetchPlanAndTopics = async () => {
    setLoading(true);
    try {
      // Fetch learning plan
      const planResponse = await learningPlanService.getPlanById(id);
      const planData = planResponse.data;
      setPlan(planData);
      
      // Fetch topics
      const topicsResponse = await learningPlanService.getTopicsByPlanId(id);
      setTopics(topicsResponse.data);
      
      // Check if current user is enrolled
      if (currentUser) {
        const enrollmentStatusResponse = await learningPlanService.checkEnrollmentStatus(id);
        const enrollmentStatus = enrollmentStatusResponse.data;
        setIsEnrolled(enrollmentStatus);
        
        if (enrollmentStatus) {
          // Fetch user's enrollments to get the enrollment ID
          const userEnrollmentsResponse = await learningPlanService.getUserEnrollments();
          const userEnrollment = userEnrollmentsResponse.data.find(e => e.learningPlanId === parseInt(id));
          if (userEnrollment) {
            setEnrollmentId(userEnrollment.id);
          }
        }
        
        // Fetch participants if the plan is public or shared
        if (planData.visibility !== 'PRIVATE' || planData.user.id === currentUser.id) {
          const participantsResponse = await learningPlanService.getPlanEnrollments(id);
          setParticipants(participantsResponse.data);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching learning plan data:', err);
      setError('Failed to load learning plan data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicInputChange = (e) => {
    const { name, value } = e.target;
    setNewTopic(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    
    if (!newTopic.title) {
      alert('Please enter a topic title');
      return;
    }
    
    try {
      // Add order index as the last item
      const topicWithOrder = {
        ...newTopic,
        orderIndex: topics.length
      };
      
      // Create topic
      await learningPlanService.createTopic(id, topicWithOrder);
      
      // Reset form
      setNewTopic({
        title: '',
        materialLink: '',
        notes: '',
        status: 'NOT_STARTED'
      });
      
      // Close add topic form
      setIsAddingTopic(false);
      
      // Refresh topics
      fetchPlanAndTopics();
      
      alert('Topic added successfully');
    } catch (err) {
      console.error('Error adding topic:', err);
      alert('Failed to add topic. Please try again.');
    }
  };

  const handleStatusChange = async (topicId, newStatus) => {
    try {
      await learningPlanService.updateTopicStatus(topicId, newStatus);
      
      // Update local state to reflect change
      setTopics(prevTopics => 
        prevTopics.map(topic => 
          topic.id === topicId 
            ? { ...topic, status: newStatus } 
            : topic
        )
      );
    } catch (err) {
      console.error('Error updating topic status:', err);
      alert('Failed to update topic status. Please try again.');
    }
  };

  const handleEnrollClick = async () => {
    try {
      await learningPlanService.enrollInPlan(id);
      alert('Successfully enrolled in the learning plan!');
      fetchPlanAndTopics(); // Refresh to update enrollment status
    } catch (err) {
      console.error('Error enrolling in plan:', err);
      alert('Failed to enroll in the learning plan. Please try again.');
    }
  };
  
  const handleUnenrollClick = async () => {
    if (!window.confirm('Are you sure you want to unenroll from this learning plan? Your progress will be lost.')) {
      return;
    }
    
    try {
      await learningPlanService.unenrollFromPlan(enrollmentId);
      alert('Successfully unenrolled from the learning plan');
      setIsEnrolled(false);
      setEnrollmentId(null);
      fetchPlanAndTopics(); // Refresh data
    } catch (err) {
      console.error('Error unenrolling from plan:', err);
      alert('Failed to unenroll from the learning plan. Please try again.');
    }
  };
  
  const handleShareClick = () => {
    // Copy the URL to clipboard
    const planUrl = window.location.href;
    navigator.clipboard.writeText(planUrl);
    
    setSharing(true);
    setTimeout(() => setSharing(false), 2000);
  };
  
  const handleVisibilityChange = async (newVisibility) => {
    try {
      await learningPlanService.updatePlanVisibility(id, newVisibility);
      
      // Update local plan data
      setPlan(prevPlan => ({
        ...prevPlan,
        visibility: newVisibility
      }));
      
      alert(`Plan visibility updated to ${newVisibility.toLowerCase()}`);
    } catch (err) {
      console.error('Error updating plan visibility:', err);
      alert('Failed to update plan visibility. Please try again.');
    }
  };
  
  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) {
      return;
    }
    
    try {
      await learningPlanService.deleteTopic(topicId);
      
      // Update local state
      setTopics(prevTopics => prevTopics.filter(topic => topic.id !== topicId));
      
      alert('Topic deleted successfully');
    } catch (err) {
      console.error('Error deleting topic:', err);
      alert('Failed to delete topic. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading learning plan...</p>
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
          onClick={fetchPlanAndTopics}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          Learning plan not found.
        </div>
        <Link to="/learning-plans" className="btn btn-primary">
          Back to Learning Plans
        </Link>
      </div>
    );
  }

  // Calculate progress
  const completedTopics = topics.filter(topic => topic.status === 'COMPLETED').length;
  const inProgressTopics = topics.filter(topic => topic.status === 'IN_PROGRESS').length;
  const totalTopics = topics.length;
  const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{plan.title}</h2>
        <div>
          {currentUser && plan.user && plan.user.id === currentUser.id && (
            <>
              <Link to={`/learning-plans/edit/${id}`} className="btn btn-outline-primary me-2">
                <i className="bi bi-pencil"></i> Edit Plan
              </Link>
              <div className="dropdown d-inline-block me-2">
                <button 
                  className="btn btn-outline-secondary dropdown-toggle" 
                  type="button" 
                  id="visibilityDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-eye"></i> {plan.visibility ? plan.visibility.charAt(0) + plan.visibility.slice(1).toLowerCase() : 'Private'}
                </button>
                <ul className="dropdown-menu" aria-labelledby="visibilityDropdown">
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => handleVisibilityChange('PRIVATE')}
                      disabled={plan.visibility === 'PRIVATE'}
                    >
                      <i className="bi bi-lock me-2"></i> Private
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => handleVisibilityChange('SHARED')}
                      disabled={plan.visibility === 'SHARED'}
                    >
                      <i className="bi bi-people me-2"></i> Shared
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => handleVisibilityChange('PUBLIC')}
                      disabled={plan.visibility === 'PUBLIC'}
                    >
                      <i className="bi bi-globe me-2"></i> Public
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
          
          {currentUser && plan.user && plan.user.id !== currentUser.id && !isEnrolled && (
            <button 
              className="btn btn-success me-2"
              onClick={handleEnrollClick}
            >
              <i className="bi bi-plus-circle me-1"></i> Join Plan
            </button>
          )}
          
          {currentUser && isEnrolled && plan.user && plan.user.id !== currentUser.id && (
            <button 
              className="btn btn-outline-danger me-2"
              onClick={handleUnenrollClick}
            >
              <i className="bi bi-dash-circle me-1"></i> Leave Plan
            </button>
          )}
          
          {(plan.visibility === 'PUBLIC' || plan.visibility === 'SHARED' || (currentUser && plan.user && plan.user.id === currentUser.id)) && (
            <button 
              className="btn btn-outline-info me-2" 
              onClick={handleShareClick}
              title="Copy link to clipboard"
            >
              <i className="bi bi-share me-1"></i> 
              {sharing ? 'Copied!' : 'Share'}
            </button>
          )}
          
          <Link to="/learning-plans" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left"></i> Back
          </Link>
        </div>
      </div>

      {plan.description && (
        <div className="mb-4">
          <p className="lead">{plan.description}</p>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title d-flex justify-content-between align-items-center">
            <span>Progress Overview</span>
            {plan.enrollmentCount > 0 && (
              <span className="badge bg-info">
                <i className="bi bi-people me-1"></i>
                {plan.enrollmentCount} {plan.enrollmentCount === 1 ? 'participant' : 'participants'}
              </span>
            )}
          </h5>
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <span className="badge bg-success me-2">{completedTopics} Completed</span>
              <span className="badge bg-warning me-2">{inProgressTopics} In Progress</span>
              <span className="badge bg-light text-dark">{totalTopics - completedTopics - inProgressTopics} Not Started</span>
            </div>
            <div>
              <strong>{progressPercentage}% Complete</strong>
            </div>
          </div>
          
          <div className="progress" style={{ height: '10px' }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${progressPercentage}%` }}
              aria-valuenow={progressPercentage} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
          
          {plan.startDate && plan.endDate && (
            <div className="mt-3 text-muted">
              <small>
                <i className="bi bi-calendar-date me-1"></i>
                Timeline: {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Participants section if the plan is public or shared */}
      {(plan.visibility === 'PUBLIC' || plan.visibility === 'SHARED' || (currentUser && plan.user && plan.user.id === currentUser.id)) && participants.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>
              <i className="bi bi-people me-2"></i>
              Participants ({participants.length})
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              {participants.map(participant => (
                <div className="col-md-6 mb-3" key={participant.id}>
                  <div className="d-flex align-items-center">
                    <div className="avatar-circle me-3">
                      {participant.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="mb-0">{participant.user.username}</h6>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1 me-2" style={{ height: '8px', width: '100px' }}>
                          <div 
                            className="progress-bar" 
                            role="progressbar" 
                            style={{ width: `${participant.progressPercentage}%` }}
                            aria-valuenow={participant.progressPercentage} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <small>{participant.progressPercentage}%</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Topics ({topics.length})</h5>
          {(!currentUser || (currentUser && plan.user && plan.user.id === currentUser.id)) && (
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => setIsAddingTopic(!isAddingTopic)}
            >
            {isAddingTopic ? (
              <>
                <i className="bi bi-x"></i> Cancel
              </>
            ) : (
              <>
                <i className="bi bi-plus"></i> Add Topic
              </>
            )}
          </button>
          )}
        </div>
        
        {isAddingTopic && (
          <div className="card-body border-bottom">
            <form onSubmit={handleAddTopic}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Topic Title*</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={newTopic.title}
                  onChange={handleTopicInputChange}
                  required
                  placeholder="e.g., Introduction to HTML"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="materialLink" className="form-label">Learning Material Link</label>
                <input
                  type="text"
                  className="form-control"
                  id="materialLink"
                  name="materialLink"
                  value={newTopic.materialLink}
                  onChange={handleTopicInputChange}
                  placeholder="e.g., https://example.com/course"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  value={newTopic.notes}
                  onChange={handleTopicInputChange}
                  rows="2"
                  placeholder="Any notes about this topic"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={newTopic.status}
                  onChange={handleTopicInputChange}
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              
              <div className="text-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={() => setIsAddingTopic(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="list-group list-group-flush">
          {topics.length === 0 ? (
            <div className="list-group-item text-center py-5">
              <p className="text-muted mb-0">No topics added yet. Add your first topic to get started!</p>
            </div>
          ) : (
            topics.map((topic, index) => (
              <div 
                key={topic.id} 
                className="list-group-item list-group-item-action d-flex align-items-start"
              >
                <div className="me-3 pt-1">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`topic-${topic.id}`}
                      checked={topic.status === 'COMPLETED'}
                      onChange={(e) => handleStatusChange(topic.id, e.target.checked ? 'COMPLETED' : 'NOT_STARTED')}
                    />
                  </div>
                </div>
                
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className={`mb-1 ${topic.status === 'COMPLETED' ? 'text-decoration-line-through' : ''}`}>
                      {topic.title}
                    </h6>
                    <span>
                      <div className="dropdown">
                        <button 
                          className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                          type="button" 
                          id={`dropdown-${topic.id}`} 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false"
                        >
                          Status
                        </button>
                        <ul className="dropdown-menu" aria-labelledby={`dropdown-${topic.id}`}>
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleStatusChange(topic.id, 'NOT_STARTED')}
                            >
                              Not Started
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleStatusChange(topic.id, 'IN_PROGRESS')}
                            >
                              In Progress
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleStatusChange(topic.id, 'COMPLETED')}
                            >
                              Completed
                            </button>
                          </li>
                        </ul>
                      </div>
                    </span>
                  </div>
                  
                  {topic.materialLink && (
                    <div className="mb-1">
                      <a 
                        href={topic.materialLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-decoration-none"
                      >
                        <i className="bi bi-link-45deg"></i> Learning Material
                      </a>
                    </div>
                  )}
                  
                  {topic.notes && (
                    <p className="text-muted small mb-1">{topic.notes}</p>
                  )}
                  
                  <div className="d-flex justify-content-between">
                    <div>
                      <span className={`badge ${getStatusBadgeClass(topic.status)} me-2`}>
                        {formatStatus(topic.status)}
                      </span>
                    </div>
                    <div>
                      <button 
                        className="btn btn-sm btn-link text-danger py-0"
                        onClick={() => handleDeleteTopic(topic.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-success';
    case 'IN_PROGRESS':
      return 'bg-warning';
    default:
      return 'bg-light text-dark';
  }
};

const formatStatus = (status) => {
  switch (status) {
    case 'NOT_STARTED':
      return 'Not Started';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    default:
      return status;
  }
};

export default LearningPlanDetail;
