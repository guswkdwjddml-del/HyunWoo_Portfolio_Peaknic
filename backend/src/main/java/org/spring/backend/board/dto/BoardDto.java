package org.spring.backend.board.dto;

import java.time.LocalDateTime;
import org.spring.backend.crew.entity.CrewFileEntity;
import java.util.List;

import org.spring.backend.board.entity.BoardEntity;
import org.spring.backend.board.entity.BoardFileEntity;
import org.spring.backend.common.BoardCategory;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.entity.CrewFileEntity;
import org.springframework.web.multipart.MultipartFile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BoardDto {

        // 화면에 보여주기로 한 값

        private Long id;

        private BoardCategory category; // 게시글 카테고리 (NOTICE, FREE, QNA, FAQ, REVIEW)

        private int commentCount; // 댓글

        private Long mountainId; // REVIEW 게시글 대상 산

        private String mountainName; // 산 이름

        private String title; // 게시글 제목

        private String content; // 게시글 내용

        private Long writer; // 게시물 작성자인지 확인

        private String userName; // 게시물 목록에서 보여줄 이름

        private String userEmail; // 수정, 삭제 시 권한 비교

        private int viewCount; // 조회수

        private int likeCount; // 좋아요개수 (BoardLikeEntity와 연동)

        private LocalDateTime createTime;

        private LocalDateTime updateTime;

        // ===================리뷰 페이지=======================
        private Long crewId; // 크루 아이디
        private String crewName; // 크루명
        private String crewImage; // 크루 이미지
        private LocalDateTime crewStartDate; // 크루 시작일
        private String crewMemberName; // 크루 방장 이름
        // ================================================

        private boolean attachFile; // 파일이 있을 경우 1, 없을 경우 0

        List<MultipartFile> boardFiles;// 실제 파일(이미지) 단건-> 다건 업로드 기능 확장- 260709

        private List<String> newFileNames; // 새이름 ->DB,로컬저장소 저장이름

        private List<String> oldFileNames; // 새이름 ->DB,로컬저장소 저장이름

        private boolean deleteFile; // 수정시 빈파일 유무 , true일때 빈파일 -> 기존있으면 삭제 attachFile=false

        private Long paymentItemId;

        // ============ 관리자페이지 커뮤니티 관리용(추가_sun) ==============//
        private List<String> deletedFileNames; // 기존 게시글에 첨부된 파일 삭제시 삭제된 파일 목록
        // =============================================================//

        // map-> 리스트 변환 (메서드 없으면 오류남)
        public static BoardDto toBoardDto(BoardEntity boardEntity) {

                BoardDto boardDto = new BoardDto();

                boardDto.setId(boardEntity.getId());
                boardDto.setCategory(boardEntity.getBoardCategory());

                if (boardEntity.getMountainEntity() != null) {
                        boardDto.setMountainId(
                                        boardEntity.getMountainEntity().getId());

                        boardDto.setMountainName(
                                        boardEntity.getMountainEntity().getMountainName());
                }

                boardDto.setWriter(
                                boardEntity.getMemberEntity().getId()); // 로그인 사용자 정보 가져옴-> 권한 확인용

                boardDto.setTitle(boardEntity.getTitle());

                boardDto.setContent(boardEntity.getContent());

                boardDto.setViewCount(boardEntity.getViewCount());

                boardDto.setLikeCount(boardEntity.getLikeCount());

                boardDto.setAttachFile(boardEntity.isAttachFile());

                boardDto.setCreateTime(boardEntity.getCreateTime());

                boardDto.setUpdateTime(boardEntity.getUpdateTime());

                boardDto.setUserName(
                                boardEntity.getMemberEntity().getUserName()); // 작성자 이름

                boardDto.setUserEmail(
                                boardEntity.getMemberEntity().getUserEmail()); // 작성자 이메일(권한 비교용)

                // 화면에 파일명 담아줘야함(null 값 방지)
                if (boardEntity.getBoardFileEntities() != null) {

                        boardDto.setNewFileNames(
                                        boardEntity.getBoardFileEntities()
                                                        .stream()
                                                        .map(BoardFileEntity::getNewFileName)
                                                        .toList());

                        boardDto.setOldFileNames(
                                        boardEntity.getBoardFileEntities()
                                                        .stream()
                                                        .map(BoardFileEntity::getOldFileName)
                                                        .toList());
                }

                // 리뷰 게시판 조회시
                CrewEntity crew = boardEntity.getCrewEntity();

                if (crew != null) {

                        boardDto.setCrewId(
                                        crew.getId());

                        boardDto.setCrewName(
                                        crew.getCrewName());

                        boardDto.setCrewMemberName(
                                        crew.getMemberEntity().getUserName());

                        boardDto.setCrewStartDate(
                                        crew.getCrewStartDate());

                        boardDto.setCrewImage(
                                        crew.getCrewFileEntities()
                                                        .stream()
                                                        .findFirst()
                                                        .map(CrewFileEntity::getFilePath)
                                                        .orElse(null));
                }

                return boardDto;
        }
}
