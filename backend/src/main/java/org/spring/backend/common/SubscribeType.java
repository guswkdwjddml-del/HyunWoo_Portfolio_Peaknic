package org.spring.backend.common;

// 구독 타입 (가격, 구독일수)
public enum SubscribeType { // yein 작성
  WEEK(1500, 7),
  MONTH(4900, 30),
  YEAR(55000, 365);

  private final int price;
  private final int days;

  SubscribeType(int price, int days) {
    this.price = price;
    this.days = days;
  }

  // 구독 타입별 가격 호출
  public int getPrice() {
    return price;
  }

  // 구독 타입별 구독일수 호출 -> 만료일자 계산
  public int getDays() {
    return days;
  }
}
