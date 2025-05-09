package com.chami.backend.controllers;

import com.chami.backend.dtos.PostDTO;
import com.chami.backend.security.services.UserDetailsImpl;
import com.chami.backend.services.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createPost(
            @RequestBody PostDTO postDTO) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Set the current user as the creator
        postDTO.setUserId(userDetails.getId());
        
        // Create the post with direct media URL
        PostDTO createdPost = postService.createPostWithDirectMedia(postDTO);
        return ResponseEntity.ok(createdPost);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updatePost(
            @PathVariable Long id,
            @RequestBody PostDTO postDTO) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Set the current user as the updater
        postDTO.setUserId(userDetails.getId());
        
        // Update the post with direct media URL
        PostDTO updatedPost = postService.updatePostWithDirectMedia(id, postDTO);
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Get the post first to check ownership
        PostDTO post = postService.getPostById(id);
        
        // Check if the user is the owner or has admin rights
        if (!post.getCreatedBy().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.badRequest().body("You can only delete your own posts!");
        }
        
        postService.deletePost(id);
        return ResponseEntity.ok("Post deleted successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Long id) {
        PostDTO post = postService.getPostById(id);
        return ResponseEntity.ok(post);
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts() {
        List<PostDTO> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUser(@PathVariable Long userId) {
        List<PostDTO> posts = postService.getPostsByUser(userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(@RequestParam String keyword) {
        List<PostDTO> posts = postService.searchPosts(keyword);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/tag/{tag}")
    public ResponseEntity<?> getPostsByTag(@PathVariable String tag) {
        List<PostDTO> posts = postService.getPostsByTag(tag);
        return ResponseEntity.ok(posts);
    }
    
    // Media files are now served directly by the ResourceHandler configured in FileStorageConfig
    
    @PostMapping("/{id}/like")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> likePost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        PostDTO likedPost = postService.likePost(id, userDetails.getId());
        return ResponseEntity.ok(likedPost);
    }
    
    @PostMapping("/{id}/unlike")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> unlikePost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        PostDTO unlikedPost = postService.unlikePost(id, userDetails.getId());
        return ResponseEntity.ok(unlikedPost);
    }
    
    @PostMapping("/{id}/share")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> sharePost(@PathVariable Long id) {
        PostDTO sharedPost = postService.incrementShareCount(id);
        return ResponseEntity.ok(sharedPost);
    }
}
