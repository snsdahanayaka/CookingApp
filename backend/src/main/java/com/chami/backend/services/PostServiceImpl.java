package com.chami.backend.services;

import com.chami.backend.dtos.PostDTO;
import com.chami.backend.dtos.UserDTO;
import com.chami.backend.models.Post;
import com.chami.backend.models.User;
import com.chami.backend.repositories.PostRepository;
import com.chami.backend.repositories.UserRepository;
import com.chami.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    @Transactional
    public PostDTO createPost(PostDTO postDTO, MultipartFile mediaFile) {
        User user = userRepository.findById(postDTO.getUserId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + postDTO.getUserId()));

        Post post = new Post();
        post.setTitle(postDTO.getTitle());
        post.setDescription(postDTO.getDescription());
        post.setTags(postDTO.getTags());
        post.setCreatedBy(user);
        
        // Handle media file if present
        if (mediaFile != null && !mediaFile.isEmpty()) {
            String fileName = fileStorageService.storeFile(mediaFile);
            String mediaUrl = fileStorageService.getFileUrl(fileName);
            String mediaType = fileStorageService.getMediaType(fileName);
            
            post.setMediaUrl(mediaUrl);
            post.setMediaType(mediaType);
        }
        
        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost);
    }
    
    @Override
    @Transactional
    public PostDTO createPostWithDirectMedia(PostDTO postDTO) {
        User user = userRepository.findById(postDTO.getUserId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + postDTO.getUserId()));

        Post post = new Post();
        post.setTitle(postDTO.getTitle());
        post.setDescription(postDTO.getDescription());
        post.setTags(postDTO.getTags());
        post.setCreatedBy(user);
        
        // Handle direct media URL if present
        if (postDTO.getMediaUrl() != null && !postDTO.getMediaUrl().isEmpty()) {
            post.setMediaUrl(postDTO.getMediaUrl());
            post.setMediaType(postDTO.getMediaType() != null ? postDTO.getMediaType() : 
                (postDTO.getMediaUrl().toLowerCase().matches(".*\\.(jpe?g|png|gif|bmp)$") ? "image" : "video"));
        }
        
        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost);
    }

    @Override
    @Transactional
    public PostDTO updatePost(Long id, PostDTO postDTO, MultipartFile mediaFile) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        
        // Check if the user is the owner of the post
        if (!post.getCreatedBy().getId().equals(postDTO.getUserId())) {
            throw new RuntimeException("You are not authorized to update this post");
        }
        
        post.setTitle(postDTO.getTitle());
        post.setDescription(postDTO.getDescription());
        post.setTags(postDTO.getTags());
        
        // Handle media file if present
        if (mediaFile != null && !mediaFile.isEmpty()) {
            String fileName = fileStorageService.storeFile(mediaFile);
            String mediaUrl = fileStorageService.getFileUrl(fileName);
            String mediaType = fileStorageService.getMediaType(fileName);
            
            post.setMediaUrl(mediaUrl);
            post.setMediaType(mediaType);
        }
        
        Post updatedPost = postRepository.save(post);
        return convertToDTO(updatedPost);
    }
    
    @Override
    @Transactional
    public PostDTO updatePostWithDirectMedia(Long id, PostDTO postDTO) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        
        // Check if the user is the owner of the post
        if (!post.getCreatedBy().getId().equals(postDTO.getUserId())) {
            throw new RuntimeException("You are not authorized to update this post");
        }
        
        post.setTitle(postDTO.getTitle());
        post.setDescription(postDTO.getDescription());
        post.setTags(postDTO.getTags());
        
        // Handle direct media URL if present
        if (postDTO.getMediaUrl() != null && !postDTO.getMediaUrl().isEmpty()) {
            post.setMediaUrl(postDTO.getMediaUrl());
            post.setMediaType(postDTO.getMediaType() != null ? postDTO.getMediaType() : 
                (postDTO.getMediaUrl().toLowerCase().matches(".*\\.(jpe?g|png|gif|bmp)$") ? "image" : "video"));
        }
        
        Post updatedPost = postRepository.save(post);
        return convertToDTO(updatedPost);
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        
        postRepository.delete(post);
    }

    @Override
    @Transactional(readOnly = true)
    public PostDTO getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
                
        // Get current logged-in user, if available
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            return convertToDTO(post, userDetails.getId());
        }
        
        return convertToDTO(post);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostDTO> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostDTO> getPostsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        
        return postRepository.findByCreatedBy(user)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostDTO> searchPosts(String keyword) {
        return postRepository.findByTitleContainingOrDescriptionContaining(keyword, keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostDTO> getPostsByTag(String tag) {
        return postRepository.findByTagsContaining(tag)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public PostDTO likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        
        post.addLike(user);
        Post updatedPost = postRepository.save(post);
        
        PostDTO postDTO = convertToDTO(updatedPost);
        postDTO.setLikedByCurrentUser(true);
        return postDTO;
    }
    
    @Override
    @Transactional
    public PostDTO unlikePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        
        post.removeLike(user);
        Post updatedPost = postRepository.save(post);
        
        PostDTO postDTO = convertToDTO(updatedPost);
        postDTO.setLikedByCurrentUser(false);
        return postDTO;
    }
    
    @Override
    @Transactional
    public PostDTO incrementShareCount(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        
        post.incrementShareCount();
        Post updatedPost = postRepository.save(post);
        
        return convertToDTO(updatedPost);
    }
    
    private PostDTO convertToDTO(Post post) {
        PostDTO postDTO = new PostDTO();
        postDTO.setId(post.getId());
        postDTO.setTitle(post.getTitle());
        postDTO.setDescription(post.getDescription());
        postDTO.setMediaUrl(post.getMediaUrl());
        postDTO.setMediaType(post.getMediaType());
        postDTO.setRating(post.getRating());
        postDTO.setTags(post.getTags());
        postDTO.setCreatedAt(post.getCreatedAt());
        postDTO.setUpdatedAt(post.getUpdatedAt());
        
        // Set user info
        UserDTO userDTO = new UserDTO();
        userDTO.setId(post.getCreatedBy().getId());
        userDTO.setUsername(post.getCreatedBy().getUsername());
        userDTO.setEmail(post.getCreatedBy().getEmail());
        postDTO.setCreatedBy(userDTO);
        
        // Set like and comment counts
        postDTO.setLikeCount(post.getLikeCount());
        postDTO.setCommentCount(post.getComments().size());
        postDTO.setShareCount(post.getShareCount());
        
        return postDTO;
    }
    
    private PostDTO convertToDTO(Post post, Long currentUserId) {
        PostDTO postDTO = convertToDTO(post);
        
        // Check if the current user has liked this post
        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser != null) {
                postDTO.setLikedByCurrentUser(post.isLikedBy(currentUser));
            }
        }
        
        return postDTO;
    }
}
