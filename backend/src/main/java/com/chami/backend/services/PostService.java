package com.chami.backend.services;

import com.chami.backend.dtos.PostDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {
    PostDTO createPost(PostDTO postDTO, MultipartFile mediaFile);
    PostDTO updatePost(Long id, PostDTO postDTO, MultipartFile mediaFile);
    
    // New methods for direct URL handling
    PostDTO createPostWithDirectMedia(PostDTO postDTO);
    PostDTO updatePostWithDirectMedia(Long id, PostDTO postDTO);
    
    // Methods for likes and shares
    PostDTO likePost(Long postId, Long userId);
    PostDTO unlikePost(Long postId, Long userId);
    PostDTO incrementShareCount(Long postId);
    void deletePost(Long id);
    PostDTO getPostById(Long id);
    List<PostDTO> getAllPosts();
    List<PostDTO> getPostsByUser(Long userId);
    List<PostDTO> searchPosts(String keyword);
    List<PostDTO> getPostsByTag(String tag);
}
