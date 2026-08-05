package org.spring.backend.payment.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import org.spring.backend.common.LedgerType;
import org.spring.backend.common.PaymentType;
import org.spring.backend.common.RefundStatus;
import org.spring.backend.config.KakaoPayConfig;
import org.spring.backend.ledger.entity.LedgerEntity;
import org.spring.backend.ledger.repository.LedgerRepository;
import org.spring.backend.notification.service.NotificationService;
import org.spring.backend.payment.entity.PaymentEntity;
import org.spring.backend.payment.entity.PaymentItemEntity;
import org.spring.backend.payment.repository.PaymentItemRepository;
import org.spring.backend.payment.service.RefundService;
import org.spring.backend.settlement.dto.kakaoPay.KakaoPayCancelRequestDto;
import org.spring.backend.settlement.dto.kakaoPay.KakaoPayCancelResponseDto;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService { // yein 작성

  private final PaymentItemRepository paymentItemRepository;
  private final LedgerRepository ledgerRepository;
  private final NotificationService notificationService;
  private final KakaoPayConfig kakaoPayConfig; // application-open.yaml 값 -> 함수로 호출해서 사용

  // 실제 환불 실행 (크루 인원미달 / 모집취소 / 참가취소)
  @Override
  public void refundProcess(PaymentItemEntity item, String description) {
    // 환불이 완료된 요청은 바로 리턴
    if (item.getRefundStatus() == RefundStatus.REFUND) {
      return;
    }

    // 해당 결제 상세 내역의 결제 내역 불러오기 -> 카카오페이 tid 추출용
    PaymentEntity paymentEntity = item.getPaymentEntity();

    // 환불률 구하기 -> 인원미달 취소는 전액 환불
    BigDecimal rate = item.getRefundRate() == null ? BigDecimal.ONE : item.getRefundRate();

    // 환불할 크루 금액 -> 환불률 곱하고 소수점 버림
    int refundAmount = BigDecimal.valueOf(item.getCurrentPrice())
        .multiply(rate)
        .setScale(0, RoundingMode.DOWN)
        .intValue();

    try {
      // 결제 방법이 KAKAO -> 카카오페이 결제 취소 API 호출
      if (paymentEntity.getPaymentType() == PaymentType.KAKAO && refundAmount > 0) {
        requestKakaoCancel(paymentEntity, refundAmount);
      }

      // 환불 상태로 변경 / 변경 시간 기록
      item.setRefundStatus(RefundStatus.REFUND);
      item.setRefundedTime(LocalDateTime.now());

      // DB에 즉시 반영 -> 버전 충돌시 예외 발생, 나머지는 그대로 커밋됨
      paymentItemRepository.saveAndFlush(item);

      // 장부(Ledger) 기록
      ledgerRepository.save(LedgerEntity.builder()
          .ledgerType(LedgerType.REFUND_PAYOUT)
          .amount(-refundAmount)
          .relatedPaymentId(paymentEntity.getId())
          .description(description)
          .build());

      // 환불 완료 후 크루원들에게 알림 전송
      notificationService.sendPayment(paymentEntity.getMemberEntity().getId(),
          item.getCrewEntity().getCrewName() + " 크루 환불이 완료되었습니다.", "/payment/list?tab=CREW");
    } catch (Exception e) {
      // 환불 실패 처리 / 재시도 횟수 1 증가
      item.setRefundStatus(RefundStatus.REFUND_FAILED);
      item.setRefundRetryCount(item.getRefundRetryCount() + 1);
      // 트랜잭션 종료 안되게 예외처리 X, 로깅만 하기
      log.error("환불 처리 실패. paymentItemId={}", item.getId(), e);
    }
  }

  // 카카오페이 결제 취소 API 호출
  private void requestKakaoCancel(PaymentEntity paymentEntity, int cancelAmount) {
    // Request Body 작성
    KakaoPayCancelRequestDto requestDto = KakaoPayCancelRequestDto.builder()
        .cid(kakaoPayConfig.getCid())
        .tid(paymentEntity.getTid())
        .cancelAmount(cancelAmount)
        .cancelTaxFreeAmount(0)
        .build();

    // Header 작성
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "SECRET_KEY " + kakaoPayConfig.getSecretKey());
    headers.setContentType(MediaType.APPLICATION_JSON);

    // Header + Request Body
    HttpEntity<KakaoPayCancelRequestDto> httpEntity = new HttpEntity<>(requestDto, headers);

    // HTTP 요청 보낼 때 사용
    RestTemplate restTemplate = new RestTemplate();

    try {
      // 카카오 응답 타입 변환 -> JSON 에서 KakaoPayCancelResponseDto 객체로
      ResponseEntity<KakaoPayCancelResponseDto> response = restTemplate.postForEntity(
          kakaoPayConfig.getCancelUrl(), httpEntity, KakaoPayCancelResponseDto.class);

      // ResponseEntity에서 body(DTO) 꺼내오기
      KakaoPayCancelResponseDto body = response.getBody();

      // Response Body 내용이 비었을 경우 예외처리
      if (body == null) {
        throw new RuntimeException("카카오페이로부터 응답을 받지 못했습니다.");
      }

      // 결제 상태가 취소가 아니면 예외처리
      if (!body.getStatus().equals("CANCEL_PAYMENT")) {
        throw new RuntimeException("카카오페이 환불에 실패했습니다.");
      }

      // 환불할 크루 금액과 실제 환불 금액 불일치시 예외처리
      if (body.getApprovedCancelAmount().getTotal() != cancelAmount) {
        throw new RuntimeException("환불 금액이 일치하지 않습니다.");
      }
    } catch (Exception e) {
      // 예외 처리 -> 트랜잭션 롤백
      throw new RuntimeException("카카오페이 결제 취소 요청 실패: " + e.getMessage(), e);
    }
  }

}
