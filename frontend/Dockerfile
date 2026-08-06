# frontend 폴더 DockerFile 입니다 (최상위/frontend/DockerFile)

# ----------------------------------------------------
# STAGE 1: React 소스코드 빌드 단계 (Node.js 환경)
# ----------------------------------------------------
FROM node:20-alpine AS builder

# 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# GitHub Actions에서 넘겨받을 ARG 선언
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ARG VITE_DOMAIN_URL
ENV VITE_DOMAIN_URL=$VITE_DOMAIN_URL

# 패키지 설치를 위해 package.json 및 lock 파일 복사
COPY package*.json ./

# 의존성 패키지 설치
RUN npm ci

# 전체 프론트엔드 소스코드 복사
COPY . .

# React 웹 애플리케이션 빌드 (dist 또는 build 폴더 생성)
RUN npm run build

# ----------------------------------------------------
# STAGE 2: Nginx를 통한 정적 파일 서빙 단계 (실행 환경)
# ----------------------------------------------------
FROM nginx:alpine

# 기존 Nginx 기본 설정 파일 삭제
RUN rm /etc/nginx/conf.d/default.conf

# 프로젝트에 작성한 custom nginx.conf 파일을 Nginx 설정 경로로 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# STAGE 1에서 빌드 완료된 결과물(dist 또는 build)을 Nginx 웹 루트 경로로 복사
# ※ 프로젝트 환경(Vite=dist, CRA=build)에 맞춰 경로를 조정하세요. (기본: dist)
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 기본 포트 80 노출
EXPOSE 80

# Nginx 데몬을 포그라운드에서 지속 실행
CMD ["nginx", "-g", "daemon off;"]
