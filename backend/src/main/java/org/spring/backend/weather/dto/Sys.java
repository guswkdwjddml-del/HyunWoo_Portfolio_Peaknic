package org.spring.backend.weather.dto;
import lombok.Data;

@Data
public class Sys {
    private String id;
    private String type;
    private String country;
    private String sunrise;
    private String sunset;
}
