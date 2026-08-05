package org.spring.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class KakaoPayConfig { // yein 작성

  // application-open.yaml 값 -> 함수로 호출해서 사용

  @Value("${api.kakaopay.secret-key}")
  private String secretKey;

  @Value("${api.kakaopay.cid}")
  private String cid;

  @Value("${api.kakaopay.ready-url}")
  private String readyUrl;

  @Value("${api.kakaopay.approve-url}")
  private String approveUrl;

  @Value("${api.kakaopay.cancel-url}")
  private String cancelUrl;

  public String getSecretKey() {
    return secretKey;
  }

  public String getCid() {
    return cid;
  }

  public String getReadyUrl() {
    return readyUrl;
  }

  public String getApproveUrl() {
    return approveUrl;
  }

  public String getCancelUrl() {
    return cancelUrl;
  }

}
