package com.chami.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String title;

    @NotBlank
    @Size(max = 5000)
    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 1000)
    @Column(length = 1000)
    private String mediaUrl; // Direct URL to external image/video
    
    private String mediaType; // "image" or "video"
    
    private Double rating;
    
    @ElementCollection
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToMany
    @JoinTable(
        name = "post_likes",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> likes = new HashSet<>();
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
    
    private int shareCount = 0;
    
    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }
    
    public Set<User> getLikes() {
        return likes;
    }
    
    public void setLikes(Set<User> likes) {
        this.likes = likes;
    }
    
    public int getLikeCount() {
        return likes.size();
    }
    
    public boolean isLikedBy(User user) {
        return likes.contains(user);
    }
    
    public void addLike(User user) {
        likes.add(user);
    }
    
    public void removeLike(User user) {
        likes.remove(user);
    }
    
    public int getShareCount() {
        return shareCount;
    }
    
    public void setShareCount(int shareCount) {
        this.shareCount = shareCount;
    }
    
    public void incrementShareCount() {
        this.shareCount++;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
