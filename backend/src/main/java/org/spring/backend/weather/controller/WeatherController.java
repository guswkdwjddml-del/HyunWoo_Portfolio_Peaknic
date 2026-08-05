package org.spring.backend.weather.controller;

import org.spring.backend.weather.dto.WeatherDto;
import org.spring.backend.weather.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

  private final WeatherService weatherService;

  // GET /api/weather?mountainName=북한산&lat=37.123&lon=126.123
  @GetMapping
  public ResponseEntity<WeatherDto> getWeather(
      @RequestParam("mountainName") String mountainName,
      @RequestParam("lat") Double lat,
      @RequestParam("lon") Double lon) {

    WeatherDto result = weatherService.weatherUpdate(mountainName, lat, lon);
    return ResponseEntity.ok(result);
  }

}
