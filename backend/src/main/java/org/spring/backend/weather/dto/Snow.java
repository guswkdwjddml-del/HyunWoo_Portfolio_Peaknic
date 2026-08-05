package org.spring.backend.weather.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Snow {
    @JsonProperty("1h")
    private float snow1h;
}
