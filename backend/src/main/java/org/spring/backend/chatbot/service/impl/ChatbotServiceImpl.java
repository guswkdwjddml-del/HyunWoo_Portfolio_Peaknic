package org.spring.backend.chatbot.service.impl;

import lombok.RequiredArgsConstructor;
import org.spring.backend.chatbot.dto.ChatRequestDto;
import org.spring.backend.chatbot.dto.ChatResponseDto;
import org.spring.backend.chatbot.dto.MountainDetailDto;
import org.spring.backend.chatbot.dto.ScheduleCardDto;
import org.spring.backend.chatbot.service.ChatbotService;
import org.spring.backend.chatbot.service.GeminiService;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.repository.CrewRepository;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.mountain.repository.MountainRepository;
import org.spring.backend.weather.dto.WeatherDto;
import org.spring.backend.weather.service.WeatherService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatbotServiceImpl implements ChatbotService {

    private final MountainRepository mountainRepository;
    private final WeatherService weatherService;
    private final GeminiService geminiService;
    private final CrewRepository crewRepository;
    private final MemberRepository memberRepository;

    @Override
    public ChatResponseDto processBotMessage(ChatRequestDto requestDto) {
        String inputMessage = requestDto.getMessage() != null ? requestDto.getMessage().trim() : "";
        String userEmail = requestDto.getUserEmail();
        String mode = requestDto.getMode(); // ('GEMINI', 'MOUNTAIN', 'SCHEDULE')
        boolean isGuest = userEmail == null || userEmail.isBlank() || "guest@test.com".equals(userEmail);

        // null/빈값 방어 코드 (기본값 GEMINI로 설정)
        if (mode == null || mode.isBlank()) {
            mode = "GEMINI";
        }

        switch (mode) {
            // 💳 1. 일정 조회 모드
            case "SCHEDULE":
                if (isGuest) {
                    return createTextResponse("🔒 [나의 일정 내역]은 로그인 후 이용 가능한 서비스입니다.");
                }
                // TODO: 실제 결제/예약 DB 테이블 연동 로직 적용
                return processScheduleResponse(userEmail);

            // ⛰️ 2. 산 검색 모드
            case "MOUNTAIN":
                if (inputMessage.isBlank()) {
                    return createTextResponse("⛰️ 검색하실 산 이름을 입력해 주세요.");
                }
                List<MountainEntity> mountains = mountainRepository.findByMountainNameContaining(inputMessage);
                
                if (!mountains.isEmpty()) {
                    MountainEntity mountain = mountains.get(0);
                    return createMountainCardResponse(mountain);
                } else {
                    return createTextResponse("⛰️ 입력하신 '" + inputMessage + "'에 대한 산 정보를 찾지 못했습니다. 산 이름을 정확히 입력해주세요.");
                }

            // ✨ 3. 제미나이 AI 모드 (기본값)
            case "GEMINI":
            default:
                if (inputMessage.isBlank()) {
                    return createTextResponse("✨ 질문할 내용을 입력해 주세요!");
                }
                // 사용자가 입력한 메시지 그대로 Gemini API에 전달
                String aiReply = geminiService.askGemini(inputMessage);
                return createTextResponse(aiReply);
        }
    }




    // 🌟 [신규 구현] 나의 일정(생성한 크루 + 참여한 크루) 2건 로직
    private ChatResponseDto processScheduleResponse(String userEmail) {
        MemberEntity member = memberRepository.findByUserEmail(userEmail)
                .orElse(null);

        if (member == null) {
            return createTextResponse("⚠️ 회원 정보를 찾을 수 없습니다.");
        }

        LocalDateTime now = LocalDateTime.now();

        // 1. 내가 모임장인 미래 일정 (최대 2개)
        List<CrewEntity> createdCrews = crewRepository.findUpcomingCreatedCrews(member.getId(), now);
        // 2. 내가 참여한 미래 일정 (최대 2개)
        List<CrewEntity> joinedCrews = crewRepository.findUpcomingJoinedCrews(member.getId(), now);

        // 중복 방지 및 구분 Map (개설한 방에 본인이 참가자로 들어간 경우 중복 제거)
        Map<Long, ScheduleCardDto> scheduleMap = new HashMap<>();

        for (CrewEntity crew : createdCrews) {
            scheduleMap.put(crew.getId(), convertToScheduleCardDto(crew, "모임장"));
        }

        for (CrewEntity crew : joinedCrews) {
            // 리더로 등록된 게 없으면 "참여 멤버"로 추가
            scheduleMap.putIfAbsent(crew.getId(), convertToScheduleCardDto(crew, "멤버"));
        }

        // 3. crewStartDate 기준 오름차순(가장 가까운 미래) 정렬 후 2개 추출
        List<ScheduleCardDto> upcomingSchedules = scheduleMap.values().stream()
                .sorted(Comparator.comparing(ScheduleCardDto::getCrewStartDate))
        .limit(2)
        .collect(Collectors.toList());

        if (upcomingSchedules.isEmpty()) {
            return createTextResponse("📅 다가오는 예정된 등산 일정이 없습니다.");
        }

        return ChatResponseDto.builder()
                .messageType("SCHEDULE_CARD")
                .botMessage("📅 다가오는 일정 중 가장 가까운 2건의 모임입니다.")
                .scheduleData(upcomingSchedules)
                .timestamp(getFormattedTime())
                .build();
    }

    private ScheduleCardDto convertToScheduleCardDto(CrewEntity crew, String role) {
        String mountainName = crew.getMountainEntity() != null ? crew.getMountainEntity().getMountainName() : "미지정 산";
        String location = crew.getMountainEntity() != null ? crew.getMountainEntity().getLocation() : "";

        return ScheduleCardDto.builder()
                .crewId(crew.getId())
                .crewName(crew.getCrewName())
                .mountainName(mountainName)
                .crewStartDate(crew.getCrewStartDate())
                .role(role)
                .crewStatus(crew.getCrewStatus().name())
                .location(location)
                .build();
    }





    // 🌟 [신규 구현] 산 정보 및 날씨 카드 응답 생성
    private ChatResponseDto createMountainCardResponse(MountainEntity mountain) {
        // 날씨 데이터 조회 (위경도가 존재하면 사용, 없을 시 기본 서울 좌표값 설정)
        Double lat = (mountain.getWeather() != null && mountain.getWeather().getLat() != null) 
                     ? mountain.getWeather().getLat() : 37.5665;
        Double lon = (mountain.getWeather() != null && mountain.getWeather().getLon() != null) 
                     ? mountain.getWeather().getLon() : 126.9780;

        WeatherDto weatherDto = weatherService.weatherByMountain(mountain.getMountainName(), lat, lon);

        MountainDetailDto detailDto = MountainDetailDto.builder()
                .mountainName(mountain.getMountainName())
                .location(mountain.getLocation())
                .height(mountain.getHeight())
                .description(mountain.getDescription() != null ? mountain.getDescription() : "정보 준비중")
                .weatherDesc(weatherDto != null ? weatherDto.getDescription() : "정보 없음")
                .temperature(weatherDto != null ? weatherDto.getTemperature() : "-")
                .humidity(weatherDto != null ? weatherDto.getHumidity() : 0)
                .weatherSource(weatherDto != null ? weatherDto.getSource() : "기상청")
                .build();

        return ChatResponseDto.builder()
                .messageType("MOUNTAIN_CARD")
                .botMessage("⛰️ 요청하신 산 정보 검색 결과입니다.")
                .mountainData(detailDto)
                .timestamp(getFormattedTime())
                .build();
    }

    // 🌟 [신규 구현] 텍스트 응답 생성 헬퍼
    private ChatResponseDto createTextResponse(String text) {
        return ChatResponseDto.builder()
                .messageType("TEXT")
                .botMessage(text)
                .timestamp(getFormattedTime())
                .build();
    }

    // 🌟 [신규 구현] 현재 시간 포맷터
    private String getFormattedTime() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("a h:mm"));
    }
}