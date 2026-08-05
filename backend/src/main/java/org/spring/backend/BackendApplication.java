package org.spring.backend;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;

@EnableScheduling // 스케쥴러 (db예약저장, 내정보 일정, 챗봇, 크루상태변경)
@SpringBootApplication
@EnableJpaAuditing
public class BackendApplication {

	@PostConstruct
    public void started() {
        // time zone 한국 시간 고정
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
    }

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}


}

