package com.chami.backend.services;

import com.chami.backend.dtos.LikeDTO;
import java.util.List;

public interface LikeService {
    
    // Like/unlike a post
    LikeDTO toggleLike(Long userId, Long postId);
    
    // Check if a user has liked a post
    boolean hasUserLikedPost(Long userId, Long postId);
    
    // Get all likes for a post
    List<LikeDTO> getPostLikes(Long postId);
    
    // Count total likes for a post
    int countPostLikes(Long postId);
    
    // Get all posts liked by a user
    List<LikeDTO> getUserLikes(Long userId);
}
