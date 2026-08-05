package org.spring.backend.subscribe.service;

import org.spring.backend.common.PaymentStatus;
import org.spring.backend.subscribe.dto.SubscribeDto;
import org.spring.backend.subscribe.dto.SubscribeInsertDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SubscribeService { // yein 작성 -> 구독권 결제 전용

  // 결제하기 -> 카카오페이(결제창 URL) / 그 외는 null 반환 => 장부 기록 (즉시 결제)
  String subscribeInsert(SubscribeInsertDto subscribeInsertDto);

  // 카카오페이 결제 승인 => 장부 기록
  void subscribeKakaoApprove(String orderNumber, String pgToken);

  // 카카오페이 결제 취소/실패
  void subscribeKakaoCancelFail(String orderNumber, PaymentStatus resultStatus);

  // 구독 내역 출력 (구독 현황)
  SubscribeDto subscribeDetail();

  // 구독 결제 내역 출력
  Page<SubscribeDto> subscribeList(Pageable pageable);

}
