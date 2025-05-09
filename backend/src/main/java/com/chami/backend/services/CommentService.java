package com.chami.backend.services;

import com.chami.backend.dtos.CommentDTO;
import java.util.List;

public interface CommentService {
    CommentDTO createComment(CommentDTO commentDTO);
    CommentDTO updateComment(Long id, CommentDTO commentDTO);
    void deleteComment(Long id);
    CommentDTO getCommentById(Long id);
    List<CommentDTO> getCommentsByPostId(Long postId);
}
