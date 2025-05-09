import api from './api';

class PostService {
  getAllPosts() {
    return api.get('/posts');
  }

  getPostById(id) {
    return api.get(`/posts/${id}`);
  }

  getPostsByUser(userId) {
    return api.get(`/posts/user/${userId}`);
  }

  createPost(postData) {
    return api.post("/posts", postData);
  }

  updatePost(id, postData) {
    return api.put(`/posts/${id}`, postData);
  }

  deletePost(id) {
    return api.delete(`/posts/${id}`);
  }

  likePost(id) {
    return api.post(`/posts/${id}/like`);
  }

  unlikePost(id) {
    return api.post(`/posts/${id}/unlike`);
  }

  sharePost(id) {
    return api.post(`/posts/${id}/share`);
  }

  getCommentsByPost(postId) {
    return api.get(`/comments/post/${postId}`);
  }

  addComment(postId, content) {
    return api.post('/comments', {
      postId: postId,
      content: content
    });
  }

  updateComment(id, content) {
    return api.put(`/comments/${id}`, { content });
  }

  deleteComment(id) {
    return api.delete(`/comments/${id}`);
  }

  searchPosts(keyword) {
    // Use encodeURIComponent to properly handle special characters in the search term
    return api.get(`/posts/search?keyword=${encodeURIComponent(keyword)}`);
  }

  getPostsByTag(tag) {
    return api.get(`/posts/tag/${tag}`);
  }
}

export default new PostService();
