# backend 폴더 DockerFile 입니다 (최상위/backend/DockerFile)

# ----------------------------------------------------
# STAGE 1: Gradle/Java 빌드 단계
# ----------------------------------------------------
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Gradle 래퍼 및 설정 파일 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# 실행 권한 부여
RUN chmod +x ./gradlew

# 의존성 미리 다운로드 (캐시 활용)
RUN ./gradlew dependencies --no-daemon || true

# 전체 소스코드 복사 및 빌드 (테스트 제외)
COPY src src
RUN ./gradlew bootJar -x test --no-daemon


# ----------------------------------------------------
# STAGE 2: 런타임 실행 단계 (경량 JRE 사용)
# ----------------------------------------------------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 빌드된 jar 파일만 런타임 이미지로 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 백엔드 내부 포트 노출 (예: 8080)
EXPOSE 8088

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]