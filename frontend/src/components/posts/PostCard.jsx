import { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import postService from '../../services/post.service';

// Extract YouTube video ID from various YouTube URL formats
const getYoutubeVideoId = (url) => {
  if (!url) return null;
  
  // Match patterns like youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/;
  const match = url.match(regex);
  
  return match ? match[1] : null;
};

const PostCard = ({ post, onDelete, updatePosts }) => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isLiked, setIsLiked] = useState(post.likedByCurrentUser || false);
  const [shareCount, setShareCount] = useState(post.shareCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [loading, setLoading] = useState(false);
  
  // Truncate description for card view
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  // Toggle expanding long descriptions
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Handle like button click
  const handleLikeClick = async () => {
    if (!currentUser) {
      alert("Please log in to like posts");
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      if (isLiked) {
        // Unlike the post
        await postService.unlikePost(post.id);
        setIsLiked(false);
        setLikeCount(prevCount => Math.max(0, prevCount - 1));
      } else {
        // Like the post
        await postService.likePost(post.id);
        setIsLiked(true);
        setLikeCount(prevCount => prevCount + 1);
      }
      // Update posts in parent component if update function is provided
      if (updatePosts) {
        updatePosts();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Error processing your like');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle share button click
  const handleShareClick = async () => {
    if (!currentUser) {
      alert("Please log in to share posts");
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const response = await postService.sharePost(post.id);
      setShareCount(response.data.shareCount);
      
      // Copy post URL to clipboard
      const postUrl = `${window.location.origin}/posts/${post.id}`;
      navigator.clipboard.writeText(postUrl);
      alert('Post link copied to clipboard!');
      
      // Update posts in parent component if update function is provided
      if (updatePosts) {
        updatePosts();
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Error sharing the post');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // References for animation effects
  const likeIconRef = useRef(null);
  const cardRef = useRef(null);
  
  // Add hover effect to the card on mount
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, 
      { threshold: 0.1 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);
  
  // Create like animation effect
  const createLikeEffect = () => {
    if (!likeIconRef.current) return;
    
    const icon = document.createElement('i');
    icon.className = 'bi bi-heart-fill interaction-animation';
    icon.style.color = 'var(--accent)';
    icon.style.fontSize = '2rem';
    icon.style.left = `${Math.random() * 80 + 10}%`;
    icon.style.top = `${Math.random() * 80 + 10}%`;
    
    likeIconRef.current.appendChild(icon);
    
    setTimeout(() => {
      if (icon.parentNode) {
        icon.parentNode.removeChild(icon);
      }
    }, 700);
  };

  return (
    <div className="card post-card" ref={cardRef}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <Link to={`/profile/${post.createdBy.id}`} className="text-decoration-none">
            <div className="avatar-sm me-2">
              {post.createdBy.username.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div>
            <Link to={`/profile/${post.createdBy.id}`} className="text-decoration-none">
              <h6 className="mb-0 creator-name">{post.createdBy.username}</h6>
            </Link>
            <small className="text-muted">{formatDate(post.createdAt)}</small>
          </div>
        </div>
        {onDelete && (
          <div className="dropdown">
            <button className="btn btn-sm btn-icon" data-bs-toggle="dropdown" aria-expanded="false">
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link to={`/posts/edit/${post.id}`} className="dropdown-item">
                  <i className="bi bi-pencil me-2"></i> Edit
                </Link>
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={() => onDelete(post.id)}>
                  <i className="bi bi-trash me-2"></i> Delete
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
      
      <Link to={`/posts/${post.id}`} className="media-link">
        {post.mediaUrl && (
          <div className="post-media" ref={likeIconRef}>
            {post.mediaType === 'image' ? (
              <>
                <img 
                  src={post.mediaUrl} 
                  alt={post.title} 
                  loading="lazy"
                  className="card-img-top post-image"
                  onError={(e) => {
                    console.log('Image failed to load');
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }} 
                />
                <div className="media-error alert alert-warning" style={{display: 'none', margin: '10px'}}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Image could not be loaded
                </div>
              </>
            ) : post.mediaType === 'youtube' ? (
              <div className="youtube-embed-container">
                <iframe 
                  width="100%" 
                  height="225"
                  src={`https://www.youtube.com/embed/${getYoutubeVideoId(post.mediaUrl)}`}
                  title="YouTube video player"
                  frameBorder="0"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : post.mediaType === 'video' ? (
              <>
                <video 
                  src={post.mediaUrl} 
                  className="card-img-top post-video" 
                  controls
                  preload="metadata"
                  onError={(e) => {
                    console.log('Video failed to load');
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                <div className="media-error alert alert-warning" style={{display: 'none', margin: '10px'}}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Video could not be loaded
                </div>
              </>
            ) : null}
          </div>
        )}
      </Link>
      
      <div className="card-body">
        <Link to={`/posts/${post.id}`} className="text-decoration-none">
          <h5 className="card-title">{post.title}</h5>
        </Link>
        <p className="card-text">
          {expanded ? post.description : truncateText(post.description, 150)}
        </p>
        {post.description.length > 150 && (
          <button 
            className="read-more-btn" 
            onClick={toggleExpand}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <Link 
                key={index} 
                to={`/posts/tag/${tag}`} 
                className="post-tag"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        
        <div className="post-actions">
          <div className="d-flex gap-2">
            <button 
              className={`action-button ${isLiked ? 'liked' : ''}`}
              onClick={(e) => {
                handleLikeClick();
                if (!isLiked) createLikeEffect();
              }}
              disabled={loading}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              <span>{likeCount}</span>
            </button>
            
            <Link to={`/posts/${post.id}#comments`} className="action-button">
              <i className="bi bi-chat"></i>
              <span>{commentCount}</span>
            </Link>
            
            <button 
              className="action-button"
              onClick={handleShareClick}
              disabled={loading}
              aria-label="Share post"
            >
              <i className="bi bi-share"></i>
              <span>{shareCount}</span>
            </button>
          </div>
          
          <Link to={`/posts/${post.id}`} className="btn btn-sm btn-outline-primary view-details-btn">
            <i className="bi bi-arrow-right-circle me-1"></i> Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
