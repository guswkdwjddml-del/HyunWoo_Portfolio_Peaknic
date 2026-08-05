package org.spring.backend.comment.service.impl;

import java.util.List;
import java.util.Optional;

import org.spring.backend.board.entity.BoardEntity;
import org.spring.backend.board.repository.BoardRepository;
import org.spring.backend.comment.dto.CommentDto;
import org.spring.backend.comment.entity.CommentEntity;
import org.spring.backend.comment.entity.CommentLikeEntity;
import org.spring.backend.comment.repository.CommentLikeRepository;
import org.spring.backend.comment.repository.CommentRepository;
import org.spring.backend.comment.service.CommentService;
import org.spring.backend.common.BoardCategory;
import org.spring.backend.common.util.SecurityMemberUtil;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

        private final CommentRepository commentRepository;
        private final BoardRepository boardRepository;
        private final SecurityMemberUtil securityMemberUtil;// 로그인 사용자 가져옴
        private final CommentLikeRepository commentLikeRepository;
        private final NotificationService notificationService;

        // <댓글 등록>
        @Override
        public void commentSave(Long boardId, CommentDto commentDto) {

                // 로그인 회원 조회
                MemberEntity memberEntity = securityMemberUtil.getLoginMember();

                // 게시글 조회
                BoardEntity boardEntity = boardRepository.findById(boardId)
                                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

                // 댓글 저장
                CommentEntity commentEntity = CommentEntity.builder()
                                .content(commentDto.getContent())
                                .memberEntity(memberEntity)
                                .boardEntity(boardEntity)
                                .likeCount(0)
                                .build();

                commentRepository.save(commentEntity);

                // 댓글 알림
                if (boardEntity.getMemberEntity() != null
                                && !boardEntity.getMemberEntity().getId().equals(memberEntity.getId())) {

                        String message = switch (boardEntity.getBoardCategory()) {
                                case FREE -> "게시물에 댓글이 등록되었습니다.";
                                case NOTICE -> "공지사항에 댓글이 등록되었습니다.";
                                case REVIEW -> "리뷰에 댓글이 등록되었습니다.";
                                default -> null;
                        };

                        if (message != null) {
                                notificationService.sendComment(
                                                boardEntity.getMemberEntity().getId(),
                                                message,
                                                "/board/detail/" + boardEntity.getId());
                        }
                }
        }

        // <댓글 수정>
        @Override
        public void commentUpdate(CommentDto commentDto) {

                MemberEntity loginMember = securityMemberUtil.getLoginMember();

                CommentEntity commentEntity = commentRepository.findById(commentDto.getId())
                                .orElseThrow(() -> new IllegalArgumentException("댓글이 없습니다."));

                // 댓글 작성자 확인
                if (!commentEntity.getMemberEntity().getId().equals(loginMember.getId())) {
                        throw new IllegalArgumentException("댓글 수정 권한이 없습니다.");
                }

                commentEntity.setContent(commentDto.getContent());

                commentRepository.save(commentEntity);
        }

        // <댓글 목록 조회>
        @Override
        public List<CommentDto> commentList(Long boardId) {

                List<CommentEntity> comments = commentRepository.findByBoardEntityIdOrderByCreateTimeAsc(boardId);

                return comments.stream()
                                .map(comment -> CommentDto.builder()
                                                .id(comment.getId())
                                                .content(comment.getContent())
                                                .likeCount(comment.getLikeCount())
                                                .memberEmail(comment.getMemberEntity().getUserEmail())
                                                .memberName(comment.getMemberEntity().getUserName())
                                                .createTime(comment.getCreateTime())
                                                .updateTime(comment.getUpdateTime())
                                                .build())
                                .toList();
        }

        // <댓글 삭제>
        @Override
        public void commentDelete(Long id) {

                MemberEntity loginMember = securityMemberUtil.getLoginMember();

                CommentEntity commentEntity = commentRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("댓글이 없습니다."));

                // 댓글 작성자 확인
                if (!commentEntity.getMemberEntity().getId().equals(loginMember.getId())) {
                        throw new IllegalArgumentException("댓글 삭제 권한이 없습니다.");
                }

                commentRepository.delete(commentEntity);
        }

        // <댓글 좋아요>
        @Transactional
        @Override
        public int addLikeComment(Long commentId) {

                MemberEntity loginMember = securityMemberUtil.getLoginMember();

                CommentEntity commentEntity = commentRepository.findById(commentId)
                                .orElseThrow(() -> new IllegalArgumentException("댓글이 없습니다."));

                Optional<CommentLikeEntity> like = commentLikeRepository.findByMemberEntityAndCommentEntity(
                                loginMember,
                                commentEntity);

                // 좋아요 취소
                if (like.isPresent()) {

                        commentLikeRepository.delete(like.get());

                        commentEntity.setLikeCount(
                                        commentEntity.getLikeCount() - 1);

                } else {

                        // 좋아요 추가
                        CommentLikeEntity commentLikeEntity = CommentLikeEntity.builder()
                                        .memberEntity(loginMember)
                                        .commentEntity(commentEntity)
                                        .build();

                        commentLikeRepository.save(commentLikeEntity);

                        commentEntity.setLikeCount(
                                        commentEntity.getLikeCount() + 1);
                }

                return commentEntity.getLikeCount();
        }
}