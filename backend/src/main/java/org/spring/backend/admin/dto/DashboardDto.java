package org.spring.backend.admin.dto;

import java.util.List;

import org.spring.backend.crew.dto.CrewDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {

    // 상단 카드
    private MemberCountDto memberCount;
    private CrewCountDto crewCount;
    private PaymentCountDto paymentCount;
    private SettlementCountDto settlementCount;

    private List<PaymentChartDto> paymentChart;

    private List<CrewDto> upcomingCrews; // 마감된 크루 중 출발일 가까운 5건

    private List<CrewStatusChartDto> crewStatusChart;

    private List<PopularMountainDto> popularMountains;

    private List<NoticeWidgetDto> notices;

}