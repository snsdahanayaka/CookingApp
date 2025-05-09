import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import PostCard from './PostCard';
import postService from '../../services/post.service';

const MyPosts = () => {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getPostsByUser(currentUser.id);
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching your posts. Please try again later.');
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await postService.deletePost(postId);
        setPosts(posts.filter(post => post.id !== postId));
      } catch (error) {
        setError('Error deleting post. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-posts-container">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title">My Posts</h1>
          <p className="page-subtitle">Manage your shared skills and content</p>
        </div>
        <Link to="/posts/create" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i> Create Post
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-6 text-muted mb-4">
            <i className="bi bi-journal-x"></i>
          </div>
          <h3>You haven't created any posts yet</h3>
          <p className="text-muted">Share your skills and knowledge with the community!</p>
          <Link to="/posts/create" className="btn btn-primary mt-3">
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5>Post Statistics</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <div className="stat-item">
                    <h3>{posts.length}</h3>
                    <p className="text-muted mb-0">Total Posts</p>
                  </div>
                  <div className="stat-item">
                    <h3>{posts.reduce((total, post) => total + (post.views || 0), 0)}</h3>
                    <p className="text-muted mb-0">Total Views</p>
                  </div>
                  <div className="stat-item">
                    <h3>{posts.reduce((total, post) => total + (post.likes || 0), 0)}</h3>
                    <p className="text-muted mb-0">Total Likes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mt-4">
              <div className="card-header">
                <h5>Your Popular Tags</h5>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {Array.from(
                    new Set(posts.flatMap((post) => post.tags || []))
                  ).map((tag, index) => (
                    <Link
                      key={index}
                      to={`/posts/tag/${tag}`}
                      className="badge bg-secondary text-decoration-none"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
