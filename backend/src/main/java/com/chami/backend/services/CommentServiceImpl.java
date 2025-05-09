package com.chami.backend.services;

import com.chami.backend.dtos.CommentDTO;
import com.chami.backend.dtos.UserDTO;
import com.chami.backend.models.Comment;
import com.chami.backend.models.Post;
import com.chami.backend.models.User;
import com.chami.backend.repositories.CommentRepository;
import com.chami.backend.repositories.PostRepository;
import com.chami.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public CommentDTO createComment(CommentDTO commentDTO) {
        User user = userRepository.findById(commentDTO.getCreatedBy().getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + commentDTO.getCreatedBy().getId()));

        Post post = postRepository.findById(commentDTO.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + commentDTO.getPostId()));

        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setPost(post);
        comment.setCreatedBy(user);

        Comment savedComment = commentRepository.save(comment);
        
        // Send notification to post owner if commenter is not the post owner
        Long postOwnerId = post.getCreatedBy().getId();
        Long commenterId = user.getId();
        
        if (!postOwnerId.equals(commenterId)) {
            notificationService.createCommentNotification(
                commenterId, 
                postOwnerId, 
                post.getId(), 
                "POST"
            );
        }
        
        return convertToDTO(savedComment);
    }

    @Override
    @Transactional
    public CommentDTO updateComment(Long id, CommentDTO commentDTO) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));

        // Only the author should update their comment
        if (!comment.getCreatedBy().getId().equals(commentDTO.getCreatedBy().getId())) {
            throw new RuntimeException("You are not authorized to update this comment");
        }

        comment.setContent(commentDTO.getContent());
        Comment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    @Override
    @Transactional
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    @Override
    public CommentDTO getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
        return convertToDTO(comment);
    }

    @Override
    public List<CommentDTO> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        return comments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO commentDTO = new CommentDTO();
        commentDTO.setId(comment.getId());
        commentDTO.setContent(comment.getContent());
        commentDTO.setPostId(comment.getPost().getId());
        commentDTO.setCreatedAt(comment.getCreatedAt());
        commentDTO.setUpdatedAt(comment.getUpdatedAt());

        // Map user details
        UserDTO userDTO = new UserDTO();
        userDTO.setId(comment.getCreatedBy().getId());
        userDTO.setUsername(comment.getCreatedBy().getUsername());
        userDTO.setEmail(comment.getCreatedBy().getEmail());
        commentDTO.setCreatedBy(userDTO);

        return commentDTO;
    }
}
