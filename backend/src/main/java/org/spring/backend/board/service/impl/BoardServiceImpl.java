package org.spring.backend.board.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.spring.backend.board.dto.BoardDto;
import org.spring.backend.board.dto.BoardLikeDto;
import org.spring.backend.board.entity.BoardEntity;
import org.spring.backend.board.entity.BoardFileEntity;
import org.spring.backend.board.entity.BoardLikeEntity;
import org.spring.backend.board.repository.BoardFileRepository;
import org.spring.backend.board.repository.BoardLikeRepository;
import org.spring.backend.board.repository.BoardRepository;
import org.spring.backend.board.service.BoardService;
import org.spring.backend.comment.repository.CommentRepository;
import org.spring.backend.common.BoardCategory;
import org.spring.backend.common.util.SecurityMemberUtil;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.repository.CrewRepository;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.mountain.repository.MountainRepository;
import org.spring.backend.notification.service.NotificationService;
import org.spring.backend.payment.repository.PaymentItemRepository;
import org.spring.backend.s3upload.S3UploadService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;
    private final SecurityMemberUtil securityMemberUtil; // 로그인 사용자 가져옴
    private final BoardFileRepository boardFileRepository;
    private final BoardLikeRepository boardLikeRepository;
    private final MemberRepository memberRepository;
    private final MountainRepository mountainRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final CrewRepository crewRepository;
    private final PaymentItemRepository paymentItemRepository;
    
    // S3 업로드 서비스 주입
    private final S3UploadService s3UploadService;

    // S3 폴더 디렉토리명
    private static final String S3_BOARD_DIR = "board";

    // < 게시글 등록>
    @Override
    public void boardsave(BoardDto boardDto) throws IOException {
        System.out.println("저장 전");
        MemberEntity memberEntity = securityMemberUtil.getLoginMember(); // 작성자 -> 예외처리까지 되어있음
        
        // 크루 선언
        CrewEntity crewEntity = null;
        // 산 선언
        MountainEntity mountainEntity = null;
        
        // 산+크루명 조회
        if (BoardCategory.REVIEW.equals(boardDto.getCategory())) {
            if (boardDto.getCrewId() != 0) {
                crewEntity = crewRepository.findById(boardDto.getCrewId())
                        .orElseThrow(() -> new IllegalArgumentException("크루 정보가 없습니다."));
            }

            if (boardDto.getMountainId() == null) {
                throw new IllegalArgumentException("리뷰 대상 산이 없습니다.");
            }

            mountainEntity = mountainRepository.findById(boardDto.getMountainId())
                    .orElseThrow(() -> new IllegalArgumentException("산 정보가 없습니다."));
        }

        // 첨부 할 파일이 없는 경우
        if (boardDto.getBoardFiles() == null || boardDto.getBoardFiles().isEmpty()) {
            BoardEntity boardEntity = BoardEntity.builder()
                    .title(boardDto.getTitle())
                    .content(boardDto.getContent())
                    .memberEntity(memberEntity)
                    .attachFile(false)
                    .boardCategory(boardDto.getCategory())
                    .mountainEntity(mountainEntity)
                    .viewCount(0)
                    .likeCount(0)
                    .crewEntity(crewEntity)
                    .build();

            BoardEntity savedBoard = boardRepository.save(boardEntity);
            System.out.println("저장 완료 id=" + savedBoard.getId());

            // 알림 발송
            sendBoardNotification(savedBoard);
            return;
        }

        // 파일 있는 경우
        BoardEntity boardEntity = BoardEntity.builder()
                .title(boardDto.getTitle())
                .content(boardDto.getContent())
                .memberEntity(memberEntity)
                .attachFile(true)
                .boardCategory(boardDto.getCategory())
                .mountainEntity(mountainEntity)
                .viewCount(0)
                .likeCount(0)
                .crewEntity(crewEntity)
                .build();

        // 게시물 저장
        BoardEntity savedBoard = boardRepository.save(boardEntity);

        // 알림 발송
        sendBoardNotification(savedBoard);

        // S3 파일 저장 -> 다건
        for (MultipartFile boardFile : boardDto.getBoardFiles()) {
            if (boardFile.isEmpty()) {
                continue;
            }
            
            String oldFileName = boardFile.getOriginalFilename();
            if (oldFileName == null || oldFileName.isBlank()) {
                continue;
            }

            // S3 업로드 실행 (S3 파일 전체 URL 리턴)
            String s3FileUrl = s3UploadService.upload(boardFile, S3_BOARD_DIR);

            BoardFileEntity boardFileEntity = BoardFileEntity.builder()
                    .oldFileName(oldFileName)
                    .newFileName(s3FileUrl) // newFileName 위치에 S3 URL 또는 Key 저장
                    .boardEntity(savedBoard)
                    .build();

            // db에 파일 정보 저장
            boardFileRepository.save(boardFileEntity);
        }
    }

    // 알림 발송 공통 로직 분리
    private void sendBoardNotification(BoardEntity savedBoard) {
        if (savedBoard.getBoardCategory() == BoardCategory.FREE) {
            notificationService.sendBoard(savedBoard.getMemberEntity().getId(), "게시물이 등록되었습니다.",
                    "/board/detail/" + savedBoard.getId());
        } else if (savedBoard.getBoardCategory() == BoardCategory.NOTICE) {
            notificationService.sendNotice(savedBoard.getMemberEntity().getId(), "공지사항이 등록되었습니다.",
                    "/board/detail/" + savedBoard.getId());
        }
    }

    // < 게시글 목록 조회 (전체)>
    @Override
    public List<BoardDto> boardList() {
        return boardRepository.findAll().stream()
                .map(BoardDto::toBoardDto)
                .collect(Collectors.toList());
    }

    // < 게시글 상세 조회 >
    @Override
    public BoardDto boardDetail(Long id) {
        BoardEntity boardEntity = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시물 입니다."));

        BoardDto boardDto = BoardDto.toBoardDto(boardEntity);

        // 댓글 개수
        boardDto.setCommentCount(commentRepository.countByBoardEntityId(id));

        return boardDto;
    }

    // 게시글 수정 (기존 이미지 S3 삭제 및 신규 S3 업로드)
    @Override
    public void boardUpdate(BoardDto boardDto) throws IOException {
        // (1) 로그인 사용자 및 수정할 게시글 조회
        MemberEntity loginMember = securityMemberUtil.getLoginMember();

        BoardEntity originBoard = boardRepository.findById(boardDto.getId())
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        if (!originBoard.getMemberEntity().getId().equals(loginMember.getId())) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        // (2) 게시글 제목/내용 수정
        originBoard.setTitle(boardDto.getTitle());
        originBoard.setContent(boardDto.getContent());

        // (3) 삭제 대상 파일 목록 S3 및 DB 삭제
        if (boardDto.getDeletedFileNames() != null) {
            List<BoardFileEntity> boardFileEntities = new ArrayList<>(originBoard.getBoardFileEntities());

            for (BoardFileEntity file : boardFileEntities) {
                if (boardDto.getDeletedFileNames().contains(file.getNewFileName())) {
                    // S3에서 삭제 실행
                    s3UploadService.deleteFile(file.getNewFileName());

                    // 연관관계 제거 (orphanRemoval = true 로 DB 자동 삭제)
                    originBoard.getBoardFileEntities().remove(file);
                }
            }
        }

        // (4) 새 파일이 있으면 S3 업로드 후 저장
        if (boardDto.getBoardFiles() != null) {
            for (MultipartFile uploadFile : boardDto.getBoardFiles()) {
                if (uploadFile.isEmpty()) {
                    continue;
                }

                String oldFileName = uploadFile.getOriginalFilename();
                if (oldFileName == null || oldFileName.isBlank()) {
                    throw new IllegalArgumentException("파일명이 없습니다.");
                }

                // S3 파일 업로드
                String s3FileUrl = s3UploadService.upload(uploadFile, S3_BOARD_DIR);

                BoardFileEntity boardFileEntity = BoardFileEntity.builder()
                        .oldFileName(oldFileName)
                        .newFileName(s3FileUrl)
                        .boardEntity(originBoard)
                        .build();

                originBoard.getBoardFileEntities().add(boardFileEntity);
            }
        }

        // (5) 게시글의 파일첨부 여부 변경
        originBoard.setAttachFile(!originBoard.getBoardFileEntities().isEmpty());

        // (6) 게시글 수정 최종 저장
        boardRepository.save(originBoard);
    }

    // <게시글 삭제>
    @Override
    public void boardDelete(Long id) {
        MemberEntity loginMember = securityMemberUtil.getLoginMember();

        BoardEntity board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        if (!board.getMemberEntity().getId().equals(loginMember.getId())) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        // 게시글에 첨부된 파일 목록 조회
        List<BoardFileEntity> fileList = boardFileRepository.findAllByBoardEntityId(id);

        // S3에서 첨부파일 삭제
        for (BoardFileEntity file : fileList) {
            s3UploadService.deleteFile(file.getNewFileName());
        }

        // 게시글 삭제 (BoardFileEntity도 Cascade 옵션에 의해 같이 삭제됨)
        boardRepository.delete(board);
    }

    // 조회수 증가
    @Override
    public int boardHit(Long boardId) {
        BoardEntity boardEntity = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        boardEntity.setViewCount(boardEntity.getViewCount() + 1);

        return boardEntity.getViewCount();
    }

    // <좋아요 기능> -> 토글방식 (on/off)
    @Transactional
    @Override
    public int addlikeboard(Long boardId) {
        MemberEntity loginMember = securityMemberUtil.getLoginMember();
        BoardEntity boardEntity = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        Optional<BoardLikeEntity> like = boardLikeRepository
                .findByMemberEntityAndBoardEntity(loginMember, boardEntity);

        if (like.isPresent()) {
            boardLikeRepository.delete(like.get());
            boardEntity.setLikeCount(boardEntity.getLikeCount() - 1);
        } else {
            BoardLikeEntity boardLikeEntity = BoardLikeEntity.builder()
                    .memberEntity(loginMember)
                    .boardEntity(boardEntity)
                    .build();

            boardLikeRepository.save(boardLikeEntity);
            boardEntity.setLikeCount(boardEntity.getLikeCount() + 1);
        }

        return boardEntity.getLikeCount();
    }

    // 카테고리 및 검색어로 게시글 목록 조회
    @Override
    public Page<BoardDto> boardList(BoardCategory category, Long memberId, Pageable pageable, String subject,
            String search) {

        Page<BoardEntity> boardEntities;

        if (subject == null || subject.isBlank() || search == null || search.isBlank()) {
            if (memberId != null) {
                if (category != null) {
                    boardEntities = boardRepository.findByBoardCategoryAndMemberEntityId(category, memberId, pageable);
                } else {
                    boardEntities = boardRepository.findByMemberEntityId(memberId, pageable);
                }
            } else {
                boardEntities = boardRepository.findByBoardCategory(category, pageable);
            }
            return boardEntities.map(BoardDto::toBoardDto);
        }

        if (memberId != null) {
            switch (subject) {
                case "title":
                    boardEntities = (category != null)
                            ? boardRepository.findByBoardCategoryAndMemberEntityIdAndTitleContaining(category, memberId, search, pageable)
                            : boardRepository.findByMemberEntityIdAndTitleContaining(memberId, search, pageable);
                    break;
                case "content":
                    boardEntities = (category != null)
                            ? boardRepository.findByBoardCategoryAndMemberEntityIdAndContentContaining(category, memberId, search, pageable)
                            : boardRepository.findByMemberEntityIdAndContentContaining(memberId, search, pageable);
                    break;
                case "mountain":
                    boardEntities = boardRepository.findByBoardCategoryAndMountainEntity_MountainNameContaining(
                            category, search, pageable);
                    break;
                default:
                    boardEntities = (category != null)
                            ? boardRepository.findByBoardCategoryAndMemberEntityId(category, memberId, pageable)
                            : boardRepository.findByMemberEntityId(memberId, pageable);
            }
        } else {
            switch (subject) {
                case "title":
                    boardEntities = boardRepository.findByBoardCategoryAndTitleContaining(category, search, pageable);
                    break;
                case "content":
                    boardEntities = boardRepository.findByBoardCategoryAndContentContaining(category, search, pageable);
                    break;
                case "mountain":
                    boardEntities = boardRepository.findByBoardCategoryAndMountainEntity_MountainNameContaining(
                            category, search, pageable);
                    break;
                case "writer":
                    boardEntities = boardRepository.findByBoardCategoryAndMemberEntity_UserNameContaining(
                            category, search, pageable);
                    break;
                default:
                    boardEntities = boardRepository.findByBoardCategory(category, pageable);
            }
        }

        return boardEntities.map(BoardDto::toBoardDto);
    }

    // <좋아요 누른 회원 조회>
    @Override
    public List<BoardLikeDto> likeMemberList(Long boardId) {
        BoardEntity boardEntity = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        List<BoardLikeEntity> likeList = boardLikeRepository.findAllByBoardEntity(boardEntity);

        return likeList.stream()
                .map(like -> BoardLikeDto.builder()
                        .memberId(like.getMemberEntity().getId())
                        .userName(like.getMemberEntity().getUserName())
                        .build())
                .toList();
    }
}