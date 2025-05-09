import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

const PostDetail = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const commentInputRef = useRef(null);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        // Fetch post details
        const postResponse = await postService.getPostById(id);
        const postData = postResponse.data;
        setPost(postData);
        setLikeCount(postData.likeCount || 0);
        setShareCount(postData.shareCount || 0);
        setIsLiked(postData.likedByCurrentUser || false);
        
        // Fetch comments
        fetchComments();
      } catch (err) {
        setError('Failed to load post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id]);
  
  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const commentsResponse = await postService.getCommentsByPost(id);
      setComments(commentsResponse.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if(window.confirm('Are you sure you want to delete this post?')) {
      deletePost();
    }
  };
  
  const deletePost = async () => {
    try {
      await postService.deletePost(id);
      navigate('/posts');
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };
  
  // Handle like button click
  const handleLikeClick = async () => {
    if (!currentUser) {
      alert("Please log in to like posts");
      navigate('/login');
      return;
    }
    
    try {
      if (isLiked) {
        // Unlike the post
        await postService.unlikePost(id);
        setIsLiked(false);
        setLikeCount(prevCount => Math.max(0, prevCount - 1));
      } else {
        // Like the post
        await postService.likePost(id);
        setIsLiked(true);
        setLikeCount(prevCount => prevCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Error processing your like');
    }
  };
  
  // Handle share button click
  const handleShareClick = async () => {
    if (!currentUser) {
      alert("Please log in to share posts");
      navigate('/login');
      return;
    }
    
    try {
      const response = await postService.sharePost(id);
      setShareCount(response.data.shareCount);
      
      // Copy post URL to clipboard
      const postUrl = `${window.location.origin}/posts/${id}`;
      navigator.clipboard.writeText(postUrl);
      alert('Post link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Error sharing the post');
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      await postService.addComment(id, newComment.trim());
      setNewComment('');
      fetchComments(); // Refresh comments
      alert('Comment posted successfully!');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting your comment');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    setSubmitting(true);
    try {
      await postService.deleteComment(commentId);
      fetchComments(); // Refresh comments
      alert('Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting your comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="alert alert-warning" role="alert">
        Post not found.
      </div>
    );
  }

  const isAuthor = currentUser && post.createdBy && currentUser.id === post.createdBy.id;

  return (
    <div className="post-detail-container">
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/posts">All Posts</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Post Details
                  </li>
                </ol>
              </nav>

              <h1 className="card-title mb-3">{post.title}</h1>
              
              <div className="d-flex align-items-center mb-4">
                <div className="avatar-sm me-3">
                  {post.createdBy.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h6 className="mb-0">{post.createdBy.username}</h6>
                  <small className="text-muted">Posted on {formatDate(post.createdAt)}</small>
                </div>
              </div>
              
              {isAuthor && (
                <div className="mb-4">
                  <Link to={`/posts/edit/${post.id}`} className="btn btn-sm btn-outline-primary me-2">
                    <i className="bi bi-pencil me-1"></i> Edit Post
                  </Link>
                  <button className="btn btn-sm btn-outline-danger" onClick={handleDeleteClick}>
                    <i className="bi bi-trash me-1"></i> Delete Post
                  </button>
                </div>
              )}
              
              {post.mediaUrl && (
                <div className="post-media mb-4">
                  {post.mediaType === 'image' ? (
                    <>
                      <img 
                        src={post.mediaUrl} 
                        alt={post.title} 
                        className="img-fluid rounded"
                        onError={(e) => {
                          console.log('Image failed to load');
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'block';
                        }}
                      />
                      <div className="alert alert-warning mt-2" style={{display: 'none'}}>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        The image could not be loaded. The URL may be invalid or inaccessible.
                      </div>
                    </>
                  ) : post.mediaType === 'youtube' ? (
                    <div className="youtube-embed-container">
                      <iframe 
                        width="100%" 
                        height="450"
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(post.mediaUrl)}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : post.mediaType === 'video' ? (
                    <>
                      <video 
                        src={post.mediaUrl} 
                        className="img-fluid rounded" 
                        controls
                        onError={(e) => {
                          console.log('Video failed to load');
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'block';
                        }}
                      />
                      <div className="alert alert-warning mt-2" style={{display: 'none'}}>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        The video could not be loaded. The URL may be invalid or inaccessible.
                      </div>
                    </>
                  ) : null}
                </div>
              )}
              
              <div className="post-content mb-4">
                <p className="card-text">{post.description}</p>
              </div>
              
              <div className="post-tags mb-4">
                <h5>Tags</h5>
                <div className="d-flex flex-wrap gap-2">
                  {post.tags && post.tags.map((tag, index) => (
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
              
              <div className="post-actions d-flex justify-content-between">
                <div>
                  <button className="btn btn-primary me-2">
                    <i className="bi bi-hand-thumbs-up me-1"></i> Like
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-share me-1"></i> Share
                  </button>
                </div>
                {post.rating && (
                  <div className="rating">
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    <span>{post.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5>Comments</h5>
            </div>
            <div className="card-body">
              {currentUser ? (
                <div className="mb-3">
                  <form onSubmit={handleCommentSubmit}>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      ref={commentInputRef}
                      disabled={submitting}
                      required
                    ></textarea>
                    <div className="mt-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={submitting || !newComment.trim()}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1"></span> 
                            Posting...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="alert alert-info mb-3">
                  <Link to="/login">Sign in</Link> to leave a comment.
                </div>
              )}
              
              <div className="comments-section">
                {commentsLoading ? (
                  <div className="text-center py-3">
                    <span className="spinner-border text-primary"></span>
                    <p className="mt-2">Loading comments...</p>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map(comment => (
                    <div className="comment-item card mb-3" key={comment.id}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="comment-author mb-0">{comment.createdBy.username}</h6>
                          <small className="text-muted">
                            {new Date(comment.createdAt).toLocaleString()}
                          </small>
                        </div>
                        <p className="comment-content mb-2">{comment.content}</p>
                        
                        {/* Comment Actions */}
                        {currentUser && comment.createdBy.id === currentUser.id && (
                          <div className="comment-actions">
                            <button 
                              className="btn btn-sm btn-link text-danger" 
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={submitting}
                            >
                              <i className="bi bi-trash"></i> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted mb-0">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5>About the Author</h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="avatar me-3">
                  {post.createdBy.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h5 className="mb-0">{post.createdBy.username}</h5>
                  <p className="text-muted mb-0">Member</p>
                </div>
              </div>
              <Link to={`/user/${post.createdBy.id}`} className="btn btn-outline-primary w-100">
                View Profile
              </Link>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5>Related Posts</h5>
            </div>
            <div className="card-body">
              <div className="text-center py-3">
                <p className="text-muted mb-0">No related posts found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
