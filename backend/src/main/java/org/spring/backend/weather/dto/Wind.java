package org.spring.backend.weather.dto;
import lombok.Data;

@Data
public class Wind {
    private String speed;
    private String deg;
    private String gust;
}
