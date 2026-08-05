package org.spring.backend.admin.service.impl;

import java.util.List;

import org.spring.backend.admin.dto.CrewCountDto;
import org.spring.backend.admin.dto.CrewStatusChartDto;
import org.spring.backend.admin.dto.DashboardDto;
import org.spring.backend.admin.dto.MemberCountDto;
import org.spring.backend.admin.dto.NoticeWidgetDto;
import org.spring.backend.admin.dto.PaymentChartDto;
import org.spring.backend.admin.dto.PaymentCountDto;
import org.spring.backend.admin.dto.PopularMountainDto;
import org.spring.backend.admin.dto.SettlementCountDto;
import org.spring.backend.admin.service.DashboardService;
import org.spring.backend.board.repository.BoardRepository;
import org.spring.backend.crew.dto.CrewDto;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.repository.CrewRepository;
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.mountain.repository.MountainRepository;
import org.spring.backend.payment.repository.PaymentRepository;
import org.spring.backend.settlement.repository.SettlementRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

        private final MemberRepository memberRepository;
        private final CrewRepository crewRepository;
        private final PaymentRepository paymentRepository;
        private final BoardRepository boardRepository;
        private final MountainRepository mountainRepository;
        private final SettlementRepository settlementRepository;

        private CrewDto crewEntityToDto(CrewEntity crew) {
                return CrewDto.builder()
                                .id(crew.getId())
                                .crewName(crew.getCrewName())
                                .crewStartDate(crew.getCrewStartDate())
                                .crewPrice(crew.getCrewPrice())
                                .crewPeople(crew.getCrewPeople())
                                .currentPeople(crew.getCurrentPeople())
                                .mountainName(crew.getMountainEntity().getMountainName())
                                .build();
        }

        @Override
        public DashboardDto getDashboard() {

                MemberCountDto memberCount = memberRepository.countMemberByRole();
                CrewCountDto crewCount = crewRepository.countCrewByStatus();
                PaymentCountDto paymentCount = paymentRepository.countPaymentSummary();
                SettlementCountDto settlementCount = settlementRepository.countSettlementSummary();

                List<PaymentChartDto> paymentChart = paymentRepository.paymentChart()
                                .stream()
                                .map(p -> PaymentChartDto.builder()
                                                .date(p.getDate())
                                                .count(p.getCount())
                                                .amount(p.getAmount())
                                                .build())
                                .toList();

                List<CrewStatusChartDto> crewStatusChart = crewRepository.crewStatusChart();

                List<CrewDto> upcomingCrews = crewRepository.findUpcomingCrews(
                                PageRequest.of(0, 5))
                                .stream()
                                .map(this::crewEntityToDto)
                                .toList();

                List<PopularMountainDto> popularMountains = mountainRepository
                                .findPopularMountains(PageRequest.of(0, 5));

                List<NoticeWidgetDto> notices = boardRepository.findRecentNotice(
                                PageRequest.of(0, 5));

                return DashboardDto.builder()
                                .memberCount(memberCount)
                                .crewCount(crewCount)
                                .paymentCount(paymentCount)
                                .upcomingCrews(upcomingCrews)
                                .paymentChart(paymentChart)
                                .settlementCount(settlementCount)
                                .crewStatusChart(crewStatusChart)
                                .popularMountains(popularMountains)
                                .notices(notices)
                                .build();
        }

}
