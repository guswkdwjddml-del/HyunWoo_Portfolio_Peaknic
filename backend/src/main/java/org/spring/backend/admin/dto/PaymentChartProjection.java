package org.spring.backend.admin.dto;

public interface PaymentChartProjection {

  String getDate();

  Long getCount();

  Long getAmount();
}
