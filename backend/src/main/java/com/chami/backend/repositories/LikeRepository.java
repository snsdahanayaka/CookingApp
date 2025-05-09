package com.chami.backend.repositories;

import com.chami.backend.models.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    // Find like by user and post
    Optional<Like> findByUserIdAndPostId(Long userId, Long postId);
    
    // Check if a like exists
    boolean existsByUserIdAndPostId(Long userId, Long postId);
    
    // Find all likes for a post
    List<Like> findByPostId(Long postId);
    
    // Count likes for a post
    int countByPostId(Long postId);
    
    // Find all posts liked by a user
    List<Like> findByUserId(Long userId);
}
