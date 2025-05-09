import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import learningPlanService from '../../services/learning-plan.service';

const LearningPlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    visibility: 'PRIVATE',
    tags: '',
    topics: []
  });

  useEffect(() => {
    if (isEditMode) {
      fetchLearningPlan();
    }
  }, [id]);

  const fetchLearningPlan = async () => {
    try {
      const response = await learningPlanService.getPlanById(id);
      const plan = response.data;
      
      // Convert dates to format that works with date inputs
      const formattedPlan = {
        ...plan,
        startDate: plan.startDate ? plan.startDate.split('T')[0] : '',
        endDate: plan.endDate ? plan.endDate.split('T')[0] : ''
      };
      
      setFormData(formattedPlan);
    } catch (err) {
      console.error('Error fetching learning plan:', err);
      setError('Failed to load learning plan data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      alert('Please enter a title for the learning plan');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditMode) {
        await learningPlanService.updatePlan(id, formData);
        alert('Learning plan updated successfully');
      } else {
        await learningPlanService.createPlan(formData);
        alert('Learning plan created successfully');
      }
      
      navigate('/learning-plans');
    } catch (err) {
      console.error('Error saving learning plan:', err);
      setError('Failed to save learning plan. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading plan data...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h2>{isEditMode ? 'Edit Learning Plan' : 'Create New Learning Plan'}</h2>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title*</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Web Development Fundamentals"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe what you want to learn and your goals"
              />
            </div>
            
            <div className="row mb-3">
              <div className="col">
                <label htmlFor="startDate" className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col">
                <label htmlFor="endDate" className="form-label">Target End Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="visibility" className="form-label">Visibility</label>
              <select
                className="form-select"
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleInputChange}
              >
                <option value="PRIVATE">Private - Only visible to you</option>
                <option value="PUBLIC">Public - Anyone can discover and enroll</option>
                <option value="SHARED">Shared - Only those with the link can access</option>
              </select>
              <div className="form-text">
                {formData.visibility === 'PUBLIC' && (
                  <span className="text-success">
                    <i className="bi bi-globe me-1"></i>
                    Your plan will be listed in the public directory for anyone to discover and join
                  </span>
                )}
                {formData.visibility === 'SHARED' && (
                  <span className="text-info">
                    <i className="bi bi-people me-1"></i>
                    Share the link directly with others you want to invite
                  </span>
                )}
                {formData.visibility === 'PRIVATE' && (
                  <span className="text-muted">
                    <i className="bi bi-lock me-1"></i>
                    Only you can see and access this plan
                  </span>
                )}
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="tags" className="form-label">Tags</label>
              <input
                type="text"
                className="form-control"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., programming, javascript, web development (comma separated)"
              />
              <div className="form-text">Add tags to help others discover your learning plan</div>
            </div>
            
            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/learning-plans')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Plan' : 'Create Plan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LearningPlanForm;
