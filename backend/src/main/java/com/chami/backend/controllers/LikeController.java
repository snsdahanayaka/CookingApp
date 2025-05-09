package com.chami.backend.controllers;

import com.chami.backend.dtos.LikeDTO;
import com.chami.backend.security.services.UserDetailsImpl;
import com.chami.backend.services.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/likes")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @PostMapping("/toggle/{postId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> toggleLike(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Call the like service which will handle notification creation internally
        LikeDTO like = likeService.toggleLike(userDetails.getId(), postId);
        
        boolean isLiked = (like != null);
        Map<String, Object> response = new HashMap<>();
        response.put("liked", isLiked);
        response.put("likeCount", likeService.countPostLikes(postId));
        
        if (isLiked) {
            response.put("like", like);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<LikeDTO>> getPostLikes(@PathVariable Long postId) {
        List<LikeDTO> likes = likeService.getPostLikes(postId);
        return ResponseEntity.ok(likes);
    }

    @GetMapping("/post/{postId}/count")
    public ResponseEntity<Map<String, Integer>> countPostLikes(@PathVariable Long postId) {
        int count = likeService.countPostLikes(postId);
        
        Map<String, Integer> response = new HashMap<>();
        response.put("likeCount", count);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{postId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> checkLikeStatus(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        boolean hasLiked = likeService.hasUserLikedPost(userDetails.getId(), postId);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("liked", hasLiked);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<LikeDTO>> getUserLikes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        List<LikeDTO> likes = likeService.getUserLikes(userDetails.getId());
        return ResponseEntity.ok(likes);
    }
}
