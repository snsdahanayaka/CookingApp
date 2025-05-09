package com.chami.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private String title;
    private String description;
    private String mediaUrl;
    private String mediaType;
    private Double rating;
    private List<String> tags = new ArrayList<>();
    private UserDTO createdBy;
    private int likeCount = 0;
    private boolean likedByCurrentUser = false;
    private List<CommentDTO> comments = new ArrayList<>();
    private int commentCount = 0;
    private int shareCount = 0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // This will be used only for post creation/update
    private Long userId;
}
