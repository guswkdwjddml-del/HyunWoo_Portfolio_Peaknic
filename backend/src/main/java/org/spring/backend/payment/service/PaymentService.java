package org.spring.backend.payment.service;

import java.util.List;

import org.spring.backend.common.PaymentStatus;
import org.spring.backend.payment.dto.PaymentDto;
import org.spring.backend.payment.dto.PaymentInsertDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService { // yein 작성 -> 크루 결제 전용

  // 결제하기 -> 카카오페이(결제창 URL) / 그 외는 null 반환 => 장부 기록 (즉시 결제)
  String paymentInsert(PaymentInsertDto paymentInsertDto);

  // 카카오페이 결제 승인 -> 장바구니 아이템(결제 승인된 크루) ID 반환 (프론트 장바구니 상태 정리용) => 장부 기록
  List<Long> paymentKakaoApprove(String orderNumber, String pgToken);

  // 카카오페이 결제 취소/실패
  void paymentKakaoCancelFail(String orderNumber, PaymentStatus resultStatus);

  // 결제 내역 출력
  Page<PaymentDto> paymentList(Pageable pageable);

  // 결제 상세 내역 출력
  PaymentDto paymentDetail(String orderNumber);

  // 참여 확정
  void confirmParticipation(Long paymentItemId);

  // 결제 내역 삭제 (숨기기)
  void paymentHidden(Long paymentId);

  // ============ 관리자페이지 결제관리용(추가_sun) ==============//
  Page<PaymentDto> paymentListAll(Pageable pageable, String subject, String search, String paymentCategory);

  PaymentDto paymentDetailAdmin(Long id);
  // ========================================================//

}
