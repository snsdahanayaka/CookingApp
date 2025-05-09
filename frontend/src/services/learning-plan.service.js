import api from './api';

class LearningPlanService {
  // Learning Plans
  getAllPlans() {
    return api.get('/learning-plans');
  }

  getPlanById(id) {
    return api.get(`/learning-plans/${id}`);
  }

  getUserPlans(userId) {
    return api.get(`/learning-plans/user/${userId}`);
  }

  createPlan(planData) {
    return api.post("/learning-plans", planData);
  }

  updatePlan(id, planData) {
    return api.put(`/learning-plans/${id}`, planData);
  }

  deletePlan(id) {
    return api.delete(`/learning-plans/${id}`);
  }
  
  // Social Features - Plan Discovery
  getPublicPlans(page = 0, size = 10) {
    return api.get(`/learning-plans/discover/public?page=${page}&size=${size}`);
  }
  
  searchPublicPlans(query, page = 0, size = 10) {
    return api.get(`/learning-plans/discover/search?query=${query}&page=${page}&size=${size}`);
  }
  
  getPopularPlans(page = 0, size = 10) {
    return api.get(`/learning-plans/discover/popular?page=${page}&size=${size}`);
  }
  
  getRecentPlans(page = 0, size = 10) {
    return api.get(`/learning-plans/discover/recent?page=${page}&size=${size}`);
  }
  
  updatePlanVisibility(id, visibility) {
    return api.patch(`/learning-plans/${id}/visibility`, { visibility });
  }

  // Plan Topics
  getTopicsByPlanId(planId) {
    return api.get(`/plan-topics/plan/${planId}`);
  }

  getTopicById(id) {
    return api.get(`/plan-topics/${id}`);
  }

  createTopic(planId, topicData) {
    return api.post(`/plan-topics/plan/${planId}`, topicData);
  }

  updateTopic(id, topicData) {
    return api.put(`/plan-topics/${id}`, topicData);
  }

  updateTopicStatus(id, status) {
    return api.patch(`/plan-topics/${id}/status`, { status });
  }

  deleteTopic(id) {
    return api.delete(`/plan-topics/${id}`);
  }
  
  // Enrollments
  enrollInPlan(planId) {
    return api.post(`/plan-enrollments/enroll/${planId}`);
  }
  
  unenrollFromPlan(enrollmentId) {
    return api.delete(`/plan-enrollments/${enrollmentId}`);
  }
  
  updateEnrollmentProgress(enrollmentId, completedTopics) {
    return api.patch(`/plan-enrollments/${enrollmentId}/progress`, { completedTopics });
  }
  
  getUserEnrollments() {
    return api.get('/plan-enrollments/user');
  }
  
  getPlanEnrollments(planId) {
    return api.get(`/plan-enrollments/plan/${planId}`);
  }
  
  checkEnrollmentStatus(planId) {
    return api.get(`/plan-enrollments/status/${planId}`);
  }
}

export default new LearningPlanService();
