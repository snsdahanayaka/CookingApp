import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import postService from '../../services/post.service';

const PostForm = ({ isEditing = false }) => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    mediaUrl: '',
    mediaType: 'image' // Default to image
  });
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);
  
  useEffect(() => {
    // If editing, fetch the post data
    if (isEditing && id) {
      const fetchPost = async () => {
        try {
          const response = await postService.getPostById(id);
          const post = response.data;
          
          // Check if user is the creator of the post
          if (post.createdBy.id !== currentUser.id) {
            setMessage("You don't have permission to edit this post.");
            return;
          }
          
          setFormData({
            title: post.title,
            description: post.description,
            tags: post.tags.join(', '),
            mediaUrl: post.mediaUrl,
            mediaType: post.mediaType
          });
          
          if (post.mediaUrl) {
            setMediaPreview(post.mediaUrl);
          }
        } catch (error) {
          setMessage('Error fetching post: ' + (error.response?.data?.message || error.message));
        }
      };
      
      fetchPost();
    }
  }, [isEditing, id, currentUser.id]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Extract YouTube video ID from various YouTube URL formats
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    
    // Match patterns like youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/;
    const match = url.match(regex);
    
    return match ? match[1] : null;
  };
  
  const handleMediaUrlChange = (e) => {
    const url = e.target.value;
    setFormData({
      ...formData,
      mediaUrl: url
    });
    
    // Check if it's a YouTube URL
    const youtubeId = getYoutubeVideoId(url);
    
    if (youtubeId) {
      // It's a YouTube URL, set media type to video
      setFormData(prev => ({
        ...prev,
        mediaUrl: url,
        mediaType: 'youtube'
      }));
      // Preview will be handled by the youtube embed preview
      setMediaPreview(url);
    } else if (url) {
      // Only set the preview if the URL has a valid protocol
      if (url.startsWith('http://') || url.startsWith('https://')) {
        setMediaPreview(url);
      } else {
        // Don't set preview for invalid URLs
        setMediaPreview(null);
      }
    } else {
      setMediaPreview(null);
    }
  };
  
  const handleMediaTypeChange = (e) => {
    setFormData({
      ...formData,
      mediaType: e.target.value
    });
  };
  
  const removeMedia = () => {
    setFormData({
      ...formData,
      mediaUrl: ''
    });
    setMediaPreview(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccessful(false);
    
    // Validate URL if present
    if (formData.mediaUrl && !(formData.mediaUrl.startsWith('http://') || formData.mediaUrl.startsWith('https://'))) {
      setMessage('Error: Media URL must start with http:// or https://');
      setLoading(false);
      return;
    }
    
    try {
      // Create cleaned post data with valid URL and properly formatted tags
      const postData = {
        title: formData.title,
        description: formData.description,
        mediaUrl: formData.mediaUrl,
        mediaType: formData.mediaType,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };
      
      let response;
      
      if (isEditing) {
        // Update existing post
        response = await postService.updatePost(id, postData);
      } else {
        // Create new post
        response = await postService.createPost(postData);
      }
      
      if (response && response.data) {
        setMessage('Post ' + (isEditing ? 'updated' : 'created') + ' successfully!');
        setSuccessful(true);
        setTimeout(() => {
          navigate(isEditing ? `/posts/${id}` : '/posts');
        }, 1500);
      }
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <h3>{isEditing ? 'Edit Post' : 'Create New Post'}</h3>
        <p className="text-muted">Share your skills, knowledge, or experiences with the community</p>
      </div>
      <div className="card-body">
        {message && (
          <div className={`alert ${successful ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              minLength={3}
              maxLength={100}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
              required
              minLength={10}
              maxLength={5000}
            ></textarea>
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
              placeholder="e.g. javascript, webdev, programming (comma separated)"
            />
            <div className="form-text">Add relevant tags to help others find your post</div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="mediaUrl" className="form-label">Media URL (Optional)</label>
            <input 
              type="text" 
              className="form-control" 
              id="mediaUrl" 
              placeholder="https://example.com/image.jpg"
              value={formData.mediaUrl}
              onChange={handleMediaUrlChange}
              disabled={loading}
            />
            <div className="form-text">Enter a URL to an image or video to share your skills.</div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="mediaType" className="form-label">Media Type</label>
            <select
              className="form-select"
              id="mediaType"
              value={formData.mediaType}
              onChange={handleMediaTypeChange}
              disabled={loading || getYoutubeVideoId(formData.mediaUrl)}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="youtube">YouTube Video</option>
            </select>
            {getYoutubeVideoId(formData.mediaUrl) && (
              <div className="form-text text-info">
                <i className="bi bi-info-circle me-1"></i>
                YouTube URL detected. Media type set automatically.
              </div>
            )}
          </div>
          
          {mediaPreview && (
            <div className="mb-4">
              <label className="form-label">Media Preview</label>
              <div className="media-preview position-relative">
                {formData.mediaType === 'youtube' ? (
                  <div>
                    <iframe 
                      width="100%" 
                      height="315"
                      src={`https://www.youtube.com/embed/${getYoutubeVideoId(mediaPreview)}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : formData.mediaType === 'video' ? (
                  <video 
                    src={mediaPreview} 
                    className="img-fluid" 
                    controls
                    onError={(e) => {
                      console.log('Video failed to load', e);
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  ></video>
                ) : (
                  <img 
                    src={mediaPreview} 
                    alt="Preview" 
                    className="img-fluid" 
                    onError={(e) => {
                      console.log('Image failed to load', e);
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                )}
                <div className="media-error-message alert alert-danger" style={{display: 'none'}}>
                  Failed to load media. Please check your URL.
                </div>
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                  onClick={removeMedia}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          )}
          
          <div className="d-grid gap-2 d-md-flex">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
              {isEditing ? 'Update Post' : 'Create Post'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
