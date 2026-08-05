package org.spring.backend.crew.dto;

import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.common.CrewStatus;
import org.spring.backend.customcourse.dto.CustomCourseDto;
import org.springframework.web.multipart.MultipartFile;

import lombok.*;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CrewDto {
  
  private Long id;

  private String crewName;                // 크루명

  private int crewPrice;                  // 크루 참가비

  private String crewDetail;              // 크루 설명글

  private int crewPeople;                 // 총 모집 인원

  private int currentPeople;              // 현재 참여 중인 인원 (결제 완료시 +1)

  private Integer minPeople;              // 최소 출발 인원 (마감날짜까지 미 충족시 CANCELLED로 변경)

  private LocalDateTime crewDeadline;     // 크루 모집 마감 날짜

  private LocalDateTime crewStartDate;    // 크루 모임 시작 날짜

  private LocalDateTime crewEndDate;      // 크루 모임 끝나는 날짜

  private String meetingPlace;            // 크루 집합 장소

  private boolean attachFile;             // 추가 이미지 파일 여부 (0,1)

  private String color;                   // 캘린더에 표시될 라벨 색상   

  private List<Long> keepFile;            // 프론트에서 DB로 저장할때 기존이미지 (수정시 비교하여 db에서 삭제하기위함)
  

  // 나중에 파일도 추가

  private Long memberId;                  // 크루장 아이디

  private Long mountainId;                // 산 아이디

  private String mountainName;            // 산 이름

  private LocalDateTime createTime;
  private LocalDateTime updateTime;


  // =================================    gyu   ================================= //
  private String chatLink;                // 소통을 위한 오픈채팅방 링크 (결제자에게만 공개용)
  private Integer minAge;                 // 최소 연령 제한 int(기본자료형) => null일경우 0 / integer(객체래퍼클래스) => null값 가능  => 연령제한없음,최소인원 없음 등등 
  private Integer maxAge;                 // 최대 연령 제한
  private String crewLevel;               // 코스난이도
  private Long customCourseId;            // 커스텀 코스 ID
  private String memberName;              // 방장 닉네임/이름
  private String customCourseName;        // 커스텀 코스 이름
  private String mountainImageUrl;        // 산 썸네일 (목록 표시용)
  private CrewStatus crewStatus;          // 방 상태 : RECRUITING(모집중), CLOSED(마감), COMPLETED(완료), DELETE(DB는 남아있다)
  private int viewCount;                  // 조회수 (인기 크루 정렬용)
  private String tags;                    // 태그 (20대,30대,초보환영,,,)
  private CustomCourseDto courseData;     // 프론트에서 crewCreate시 코스경로 저장

  private List<MultipartFile> files;      // 프론트에서 백엔드로 '파일'을 보낼 때 받는 용도
  private List<CrewFileDto> crewFiles;    // 백엔드에서 프론트로 '저장된 사진 정보'를 보낼 때 쓰는 용도
  private Double meetingLat;              // 모임장소 위도
  private Double meetingLng;              // 모임장소 경도
  private LocalDateTime deletedAt;        // 삭제 일시
  private LocalDateTime recruitClosedAt;  // 모집 마감 일시
  private LocalDateTime completedAt;      // 산행 완료 일시
  private String userEmail;               // id 대신 회원 확인용
  private String schedules;  // 관리용 (수정등등)
  // =================================    gyu   ================================= //
}
