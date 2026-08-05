package org.spring.backend.payment.gateway;

import org.spring.backend.config.KakaoPayConfig;
import org.spring.backend.payment.dto.kakaoPay.KakaoPayApproveRequestDto;
import org.spring.backend.payment.dto.kakaoPay.KakaoPayApproveResponseDto;
import org.spring.backend.payment.dto.kakaoPay.KakaoPayReadyRequestDto;
import org.spring.backend.payment.dto.kakaoPay.KakaoPayReadyResponseDto;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class KakaoPayGateway { // yein 작성

  private final KakaoPayConfig kakaoPayConfig; // application-open.yaml 값 -> 함수로 호출해서 사용

  @Value("${cors.allowed-origin}")
    private String FRONT_URL;

  // ready API 반환용 DTO
  public record ReadyResult(String tid, String redirectUrl) {
  }

  // 카카오페이 결제 준비(ready) API 호출 -> tid & 리다이렉트 URL 반환
  public ReadyResult ready(String orderNumber, Long memberId, String itemName, int totalPrice, String urlPrefix) {
    // Request Body 작성
    KakaoPayReadyRequestDto requestDto = KakaoPayReadyRequestDto.builder()
        .cid(kakaoPayConfig.getCid())
        .partnerOrderId(orderNumber)
        .partnerUserId(String.valueOf(memberId))
        .itemName(itemName)
        .quantity(1)
        .totalAmount(totalPrice)
        .taxFreeAmount(0)
        // .approvalUrl("http://localhost:3000" + urlPrefix + "/approval/" + orderNumber)
        // .cancelUrl("http://localhost:3000" + urlPrefix + "/cancel/" + orderNumber)
        // .failUrl("http://localhost:3000" + urlPrefix + "/fail/" + orderNumber)
        .approvalUrl(FRONT_URL + urlPrefix + "/approval/" + orderNumber)
        .cancelUrl(FRONT_URL + urlPrefix + "/cancel/" + orderNumber)
        .failUrl(FRONT_URL + urlPrefix + "/fail/" + orderNumber)
        .build();

    // Header 작성
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "SECRET_KEY " + kakaoPayConfig.getSecretKey());
    headers.setContentType(MediaType.APPLICATION_JSON);

    // Header + Request Body
    HttpEntity<KakaoPayReadyRequestDto> httpEntity = new HttpEntity<>(requestDto, headers);

    // HTTP 요청 보낼 때 사용
    RestTemplate restTemplate = new RestTemplate();

    try {
      // 카카오 응답 타입 변환 -> JSON 에서 KakaoPayReadyResponseDto 객체로
      ResponseEntity<KakaoPayReadyResponseDto> response = restTemplate.postForEntity(
          kakaoPayConfig.getReadyUrl(), httpEntity, KakaoPayReadyResponseDto.class);

      // ResponseEntity에서 body(DTO) 꺼내오기
      KakaoPayReadyResponseDto body = response.getBody();

      // Response Body 내용이 비었을 경우 예외처리
      if (body == null) {
        throw new RuntimeException("카카오페이로부터 응답을 받지 못했습니다.");
      }

      // 결제 고유 번호(tid) & 카카오페이 결제 리다이렉트 URL 반환
      return new ReadyResult(body.getTid(), body.getNextRedirectPcUrl());
    } catch (Exception e) {
      // 예외 처리 -> 트랜잭션 롤백
      throw new RuntimeException("카카오페이 결제 준비 요청 실패: " + e.getMessage(), e);
    }
  }

  // 카카오페이 결제 승인 API 호출 -> 응답 객체(DTO) 반환
  public KakaoPayApproveResponseDto approve(String tid, String orderNumber, Long memberId, String pgToken) {
    // Request Body 작성
    KakaoPayApproveRequestDto requestDto = KakaoPayApproveRequestDto.builder()
        .cid(kakaoPayConfig.getCid())
        .tid(tid)
        .partnerOrderId(orderNumber)
        .partnerUserId(String.valueOf(memberId))
        .pgToken(pgToken)
        .build();

    // Header 작성
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "SECRET_KEY " + kakaoPayConfig.getSecretKey());
    headers.setContentType(MediaType.APPLICATION_JSON);

    // Header + Request Body
    HttpEntity<KakaoPayApproveRequestDto> httpEntity = new HttpEntity<>(requestDto, headers);

    // HTTP 요청 보낼 때 사용
    RestTemplate restTemplate = new RestTemplate();

    try {
      // 카카오 응답 타입 변환 -> JSON 에서 KakaoPayApproveResponseDto 객체로
      ResponseEntity<KakaoPayApproveResponseDto> response = restTemplate.postForEntity(
          kakaoPayConfig.getApproveUrl(), httpEntity, KakaoPayApproveResponseDto.class);

      // ResponseEntity에서 body(DTO) 꺼내오기
      KakaoPayApproveResponseDto body = response.getBody();

      // Response Body 내용이 비었을 경우 예외처리
      if (body == null) {
        throw new RuntimeException("카카오페이로부터 승인 응답을 받지 못했습니다.");
      }

      // 카카오 결제 승인 응답 객체(DTO) 반환
      return body;
    } catch (Exception e) {
      // 예외 처리 -> 트랜잭션 롤백
      throw new RuntimeException("카카오페이 결제 승인 요청 실패: " + e.getMessage(), e);
    }
  }

}
