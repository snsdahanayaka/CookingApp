import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Post components
import PostFeed from './components/posts/PostFeed';
import PostDetail from './components/posts/PostDetail';
import PostForm from './components/posts/PostForm';
import MyPosts from './components/posts/MyPosts';

// Learning Plan components
import LearningPlansDashboard from './components/learning-plans/LearningPlansDashboard';
import LearningPlanForm from './components/learning-plans/LearningPlanForm';
import LearningPlanDetail from './components/learning-plans/LearningPlanDetail';
import DiscoverLearningPlans from './components/learning-plans/DiscoverLearningPlans';

// Notification components
import NotificationsPage from './components/notifications/NotificationsPage';

import './App.css';
import './styles/theme.css';
import './styles/navbar.css';
import './styles/post-feed.css';
import './styles/post-card.css';
import './styles/skeleton.css';
import './styles/toast.css';
import './styles/auth.css';

// Import fonts
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="app-wrapper">
          <Navbar />
          <main className="page-container">
            <div className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Post Routes */}
                <Route path="/posts" element={<PostFeed />} />
                <Route path="/posts/:id" element={<PostDetail />} />
                <Route path="/posts/tag/:tag" element={<PostFeed />} />
                <Route 
                  path="/posts/create" 
                  element={
                    <ProtectedRoute>
                      <PostForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/posts/edit/:id" 
                  element={
                    <ProtectedRoute>
                      <PostForm isEditing={true} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-posts" 
                  element={
                    <ProtectedRoute>
                      <MyPosts />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Learning Plan Routes */}
                <Route 
                  path="/learning-plans" 
                  element={
                    <ProtectedRoute>
                      <LearningPlansDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/learning-plans/:id" 
                  element={
                    <ProtectedRoute>
                      <LearningPlanDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/learning-plans/new" 
                  element={
                    <ProtectedRoute>
                      <LearningPlanForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/learning-plans/edit/:id" 
                  element={
                    <ProtectedRoute>
                      <LearningPlanForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/learning-plans/discover" 
                  element={
                    <ProtectedRoute>
                      <DiscoverLearningPlans />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Notification Routes */}
                <Route 
                  path="/notifications" 
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </main>
          <footer className="app-footer">
            <div className="container">
              <p className="text-center text-muted">© {new Date().getFullYear()} CookingInsta. All rights reserved.</p>
            </div>
          </footer>
        </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
