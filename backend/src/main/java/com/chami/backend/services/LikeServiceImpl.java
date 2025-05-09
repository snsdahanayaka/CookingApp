package com.chami.backend.services;

import com.chami.backend.dtos.LikeDTO;
import com.chami.backend.dtos.UserDTO;
import com.chami.backend.models.Like;
import com.chami.backend.models.Post;
import com.chami.backend.models.User;
import com.chami.backend.repositories.LikeRepository;
import com.chami.backend.repositories.PostRepository;
import com.chami.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LikeServiceImpl implements LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public LikeDTO toggleLike(Long userId, Long postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        Optional<Like> existingLike = likeRepository.findByUserIdAndPostId(userId, postId);

        if (existingLike.isPresent()) {
            // Unlike the post
            likeRepository.delete(existingLike.get());
            return null;
        } else {
            // Like the post
            Like newLike = new Like();
            newLike.setUser(user);
            newLike.setPost(post);
            
            Like savedLike = likeRepository.save(newLike);
            
            // Send notification to post owner if liker is not the post owner
            Long postOwnerId = post.getCreatedBy().getId();
            if (!userId.equals(postOwnerId)) {
                notificationService.createLikeNotification(
                    userId,
                    postOwnerId,
                    postId,
                    "POST"
                );
            }
            
            return convertToDTO(savedLike);
        }
    }

    @Override
    public boolean hasUserLikedPost(Long userId, Long postId) {
        return likeRepository.existsByUserIdAndPostId(userId, postId);
    }

    @Override
    public List<LikeDTO> getPostLikes(Long postId) {
        return likeRepository.findByPostId(postId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public int countPostLikes(Long postId) {
        return likeRepository.countByPostId(postId);
    }

    @Override
    public List<LikeDTO> getUserLikes(Long userId) {
        return likeRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private LikeDTO convertToDTO(Like like) {
        if (like == null) return null;
        
        LikeDTO dto = new LikeDTO();
        dto.setId(like.getId());
        dto.setPostId(like.getPost().getId());
        dto.setCreatedAt(like.getCreatedAt());
        
        UserDTO userDTO = new UserDTO();
        userDTO.setId(like.getUser().getId());
        userDTO.setUsername(like.getUser().getUsername());
        dto.setUser(userDTO);
        
        return dto;
    }
}
