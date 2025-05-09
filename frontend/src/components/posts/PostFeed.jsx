import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PostCard from './PostCard';
import postService from '../../services/post.service';
import { PostFeedSkeleton } from '../common/Skeleton';
import { useToast } from '../../context/ToastContext';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const { showToast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getAllPosts();
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error fetching posts. Please try again later.');
      showToast('Failed to load posts. Please try again.', 'error');
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchPosts();
      return;
    }
    
    try {
      setLoading(true);
      console.log('Searching for:', searchTerm);
      const response = await postService.searchPosts(searchTerm.trim());
      console.log('Search response:', response);
      setPosts(response.data);
      setActiveFilter('all'); // Reset filter when searching
      setLoading(false);
      
      // Show success toast with count of results
      if (response.data.length === 0) {
        showToast(`No posts found for "${searchTerm}"`, 'info');
      } else {
        showToast(`Found ${response.data.length} post${response.data.length !== 1 ? 's' : ''} for "${searchTerm}"`, 'success');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Error searching posts. Please try again.');
      showToast('Search failed. Please try again.', 'error');
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      // No filtering needed, show all posts
      return;
    }
    
    let filteredPosts = [...posts];
    
    if (filter === 'popular') {
      // Sort by likes
      filteredPosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else if (filter === 'recent') {
      // Sort by date (newest first)
      filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setPosts(filteredPosts);
  };

  // Use skeleton loading instead of spinner
  if (loading) {
    return (
      <div className="post-feed-container animate-fade-in">
        {/* Hero section skeleton */}
        <div className="page-header d-flex justify-content-between align-items-center mb-4 hero-section skeleton-hero">
          <div className="hero-content">
            <div className="skeleton-pulse" style={{ height: '40px', width: '250px', marginBottom: '10px' }}></div>
            <div className="skeleton-pulse" style={{ height: '20px', width: '400px', marginBottom: '20px' }}></div>
            <div className="d-flex gap-2 mt-3 d-none d-md-flex">
              <div className="skeleton-pulse" style={{ height: '24px', width: '120px', borderRadius: '50px' }}></div>
              <div className="skeleton-pulse" style={{ height: '24px', width: '150px', borderRadius: '50px' }}></div>
              <div className="skeleton-pulse" style={{ height: '24px', width: '140px', borderRadius: '50px' }}></div>
            </div>
          </div>
          <div className="skeleton-pulse" style={{ height: '40px', width: '150px', borderRadius: '50px' }}></div>
        </div>
        
        {/* Search box skeleton */}
        <div className="search-container mb-4 animate-slide-in">
          <div className="search-card">
            <div className="card-body">
              <div className="search-form">
                <div className="search-input-wrapper" style={{ height: '50px' }}>
                  <div className="skeleton-pulse" style={{ height: '100%', width: '100%', borderRadius: '25px' }}></div>
                </div>
                <div className="skeleton-pulse" style={{ height: '50px', width: '100px', borderRadius: '25px' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="row content-container">
          <div className="col-md-8 posts-column">
            <PostFeedSkeleton count={3} />
          </div>
          <div className="col-md-4 sidebar-column">
            <div className="skeleton-pulse" style={{ height: '400px', width: '100%', borderRadius: '16px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-feed-container animate-fade-in">
      <div className="page-header d-flex justify-content-between align-items-center mb-4 hero-section">
        <div className="hero-content">
          <h1 className="page-title hero-title">Skill Sharing Feed</h1>
          <p className="page-subtitle hero-subtitle">Discover insights, share knowledge, and connect with our community of learners</p>
          <div className="hero-tags mt-3 d-none d-md-block">
            <span className="trending-tag">#TrendingSkills</span>
            <span className="trending-tag">#ContinuousLearning</span>
            <span className="trending-tag">#KnowledgeSharing</span>
          </div>
        </div>
        <Link to="/posts/create" className="btn btn-primary create-post-btn">
          <i className="bi bi-plus-lg me-2"></i> Create Post
          <div className="btn-glow"></div>
        </Link>
      </div>

      <div className="search-container mb-4 animate-slide-in" style={{animationDelay: '0.2s'}}>
        <div className="search-card">
          <div className="card-body">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search posts by title, description or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search posts"
                />
              </div>
              <button className="btn btn-primary search-btn" type="submit">
                <span className="d-none d-md-inline">Search</span>
                <i className="bi bi-search d-md-none"></i>
              </button>
            </form>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="empty-state-container animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div className="empty-state-illustration">
            <i className="bi bi-journal-text"></i>
          </div>
          <h3 className="empty-state-title">No posts found</h3>
          <p className="empty-state-message">Be the first to share your skills and knowledge with our community!</p>
          <Link to="/posts/create" className="btn btn-primary empty-state-action mt-3">
            <i className="bi bi-plus-lg me-2"></i> Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="row content-container">
          <div className="col-md-8 posts-column animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="posts-header">
              <h4 className="section-title">Latest Posts</h4>
              <div className="post-filters">
                <button 
                  className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${activeFilter === 'popular' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('popular')}
                >
                  Popular
                </button>
                <button 
                  className={`filter-btn ${activeFilter === 'recent' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('recent')}
                >
                  Recent
                </button>
              </div>
            </div>
            <div className="post-list">
              {posts.map((post, index) => (
                <div key={post.id} className="post-card-wrapper" style={{animationDelay: `${0.1 * (index + 1)}s`}}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-4 sidebar-column animate-slide-in" style={{animationDelay: '0.5s'}}>
            <div className="sidebar-card sticky-top" style={{ top: "1rem" }}>
              <div className="sidebar-header">
                <h5><i className="bi bi-hash me-2"></i>Popular Tags</h5>
              </div>
              <div className="sidebar-body">
                <div className="tags-cloud">
                  {Array.from(
                    new Set(posts.flatMap((post) => post.tags || []))
                  ).map((tag, index) => (
                    <Link
                      key={index}
                      to={`/posts/tag/${tag}`}
                      className="tag-badge"
                      style={{ animationDelay: `${0.05 * index}s` }}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
                <div className="sidebar-divider"></div>
                <div className="sidebar-cta">
                  <h6 className="cta-title">Have knowledge to share?</h6>
                  <p className="cta-description">Contribute to our community by sharing your skills and experiences.</p>
                  <Link to="/posts/create" className="btn btn-sm btn-outline-primary w-100">
                    <i className="bi bi-pencil-square me-1"></i> Write a Post
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
