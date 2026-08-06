<a id="project-intro"></a>
# 🏔️ Peak-nic - 함께 떠나는 등산 모임

> **산, 등산로, 날씨 정보 제공, 커뮤니티**공통 기능과 등산 크루 활동을 위한 **가입, 모임 생성/관리, 결제/환불/구독, 리뷰, 알림, 챗봇** 기능을 하나의 서비스로 제공하는 **산악인들을 위한 올인원 플랫폼**입니다. 🏔️✨  
>
> **등산 준비부터 모임 모집, 결제, 그리고 종료 후 후기 공유까지 하나의 플렛폼에서 자연스럽게 연결합니다.** 😊  
>
> 제작기간 2026.06.26 ~ 2026.07.31

---

<a href="http://54.116.208.12/" style="display: block;">
  <img width="100%" height="120px" alt="banner" src="https://github.com/user-attachments/assets/206d561d-f8f9-4767-a9bb-3c9717485dba" />
</a>

---

| [프로젝트 소개](#project-intro) | [사용 기술 스택](#tech-stack) | [팀원 & 담당 역할](#team-roles) | [프로젝트 구조](#project-structure) | [프로젝트 규칙](#project-rules) | [주요 기능](#main-features) | [기능 개발 (김현우)](#feature-dev-kim) | [프로젝트 후기](#project-review) |

---

<a id="tech-stack"></a>
## 🛠️ 사용 기술 스택

<table>
  <tr>
    <th>Frontend</th>
    <th>Backend</th>
    <th>Infra / DevOps</th>
    <th>Database</th>
    <th>External API</th>
  </tr>

  <tr>
    <!-- Frontend -->
    <td>
      <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
      <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
      <img src="https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white"/>
      <img src="https://img.shields.io/badge/Axios-671DDF?style=for-the-badge&logo=axios&logoColor=white"/>
      <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white"/>
      <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white"/><br/>
      <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
      <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
      <img src="https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white"/>
      <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white"/>
      <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/><br/>
      <img src="https://img.shields.io/badge/FullCalendar-0288D1?style=for-the-badge&logo=googlecalendar&logoColor=white"/>
      <img src="https://img.shields.io/badge/Redux%20Toolkit-593D88?style=for-the-badge&logo=redux&logoColor=white"/>
      <img src="https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white"/>
    </td>
    <!-- Backend -->
    <td>
      <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
      <img src="https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white"/>
      <img src="https://img.shields.io/badge/Spring%20Data%20JPA-59666C?style=for-the-badge"/><br/>
      <img src="https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=openjdk&logoColor=white"/>
      <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
      <img src="https://img.shields.io/badge/REST%20API-005571?style=for-the-badge"/><br/>
      <img src="https://img.shields.io/badge/STOMP-000000?style=for-the-badge"/>
      <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white"/>
      <img src="https://img.shields.io/badge/KOMORAN-000000?style=for-the-badge"/><br/>
      <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white"/>
      <img src="https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white"/>
    </td>
    <!-- Infra / DevOps -->
    <td>
      <img src="https://img.shields.io/badge/AWS%20EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white"/>
      <img src="https://img.shields.io/badge/AWS%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white"/>
      <img src="https://img.shields.io/badge/AWS%20RDS-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white"/><br/>
      <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
      <img src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
      <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white"/><br/>
      <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white"/>
      <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white"/>
      <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/>
    </td>
    <!-- Database -->
    <td>
      <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
    </td>
    <!-- External API -->
    <td>
      <img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white"/>
      <img src="https://img.shields.io/badge/Kakao%20Map-FFCD00?style=for-the-badge&logo=kakao&logoColor=black"/>
      <img src="https://img.shields.io/badge/VWORLD-1E88E5?style=for-the-badge"/>
      <img src="https://img.shields.io/badge/Forest%20Service-0288D1?style=for-the-badge"/>
      <img src="https://img.shields.io/badge/DATA.go.kr-0052CC?style=for-the-badge"/>
      <img src="https://img.shields.io/badge/OpenWeather-0A6EB4?style=for-the-badge"/>
      <img src="https://img.shields.io/badge/KakaoPay-FFCD00?style=for-the-badge&logo=kakaotalk&logoColor=black"/>
      <img src="https://img.shields.io/badge/Google%20OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
      <img src="https://img.shields.io/badge/Naver%20OAuth-03C75A?style=for-the-badge&logo=naver&logoColor=white"/>
    </td>
  </tr>
</table>

---

<a id="team-roles"></a>
## 👥 팀원 & 담당 역할

| 이름 | 역할 |
|------|------|
| 👨‍💻 **김현우(팀장)** | **Git 관리, 전체 프로젝트 관리, CICD 배포, Security/JWT, 회원가입/로그인, OAuth2, 마이페이지, 챗봇(RabbitMQ+WebSocket+STOMP)** | 
| 👩‍💻 김XX | 공공 API 구조 설계, 산정보 및 등산로, 크루, 알림 기능 | 
| 👨‍💻 민XX | 백엔드 DB 구조 설계, 장바구니, 결제/Kakao Pay, 취소 및 환불 | 
| 👨‍💻 이XX | 프론트엔드 구조 설계, admin, paging | 
| 👨‍💻 이XX | 프론트엔드 구조 설계, 커뮤니티/리뷰, 댓글 | 

---

<a id="project-structure"></a>
## 📂 프로젝트 구조

<table>
  <tr>
    <th>⭐ Spring Boot 백엔드  </th>
    <th>⭐ React 프론트엔드 (Vite 기반) </th>
  </tr>
  <tr>
    <td>
      Project-Peak-nic/   <br>
       ┣ backend/                           <br>  
       ┃ ┣ src/main/java/org/spring/backend/ <br>
       ┃ ┃ ┣ admin/                                <br>
       ┃ ┃ ┣ board/                                <br>
       ┃ ┃ ┣ calender/                                 <br>
       ┃ ┃ ┣ cart/                             <br>
       ┃ ┃ ┣ chatbot/                             <br>
       ┃ ┃ ┣ comment/                             <br>
       ┃ ┃ ┣ common/                               <br>
       ┃ ┃ ┣ config/                               <br>
       ┃ ┃ ┣ crew/                                 <br>
       ┃ ┃ ┣ customcourse/                                <br>
       ┃ ┃ ┣ exception/                                 <br>
       ┃ ┃ ┣ hikingrecord/                                 <br>
       ┃ ┃ ┣ ledger/                                 <br>
       ┃ ┃ ┣ member/                               <br>
       ┃ ┃ ┣ mountain/                               <br>
       ┃ ┃ ┣ notification/                               <br>
       ┃ ┃ ┣ payment/                              <br>
       ┃ ┃ ┣ review/                              <br>
       ┃ ┃ ┣ s3upload/                     <br>
       ┃ ┃ ┣ settlement/                     <br>
       ┃ ┃ ┣ subscribe/                     <br>
       ┃ ┃ ┣ trail/                     <br>
       ┃ ┃ ┣ weather/                     <br>
       ┃ ┃                                         <br>
       ┃ ┣ src/main/resources/                     <br>
       ┃ ┃ ┣ application-oauth2.yaml                       <br>
       ┃ ┃ ┣ application-open.yaml                       <br>
       ┃ ┃ ┣ application.yaml                       <br>
       ┃ ┃                                         <br>
       ┃ ┣ build.gradle                            <br>
       ┃ ┗ Dockerfile                              <br>
       ┃                                           <br>
    </td>
    <td>
       ┣ vite-front/      <br>
       ┃ ┣ public/                                 <br>
       ┃ ┣ src/                                    <br>
       ┃ ┃ ┣ apis/                                 <br>
       ┃ ┃ ┣ components/                           <br>
       ┃ ┃ ┣ css/                                  <br>
       ┃ ┃ ┣ js/                                   <br>
       ┃ ┃ ┣ layout/                               <br>
       ┃ ┃ ┣ pages/                                <br>
       ┃ ┃ ┣ router/                               <br>
       ┃ ┃ ┣ utils/                                <br>
       ┃ ┃ ┗ store/                                <br>
       ┃ ┣ package.json                            <br>
       ┃ ┣ nginx.conf                            <br>
       ┃ ┗ Dockerfile                              <br>
       ┃                                           <br>
       ┣ .github/workflows/deploy.yml              <br>
       ┣ docker-compose.yml                        <br>
       ┗ README.md                                 
    </td>
  </tr>
</table>

---

<a id="project-rules"></a>
## 👥 프로젝트 규칙

| 번호 | 규칙 |
|------|------|
| **1.** | 작업은 개인 Branch(hyun, gyu, yein, sun, sue) 에서만 진행 후 push | 
| **2.** | 매일 5시에 팀장이 Merge(dev) 실행 후 팀원 간 회의를 통해 오류 수정 | 
| **3.** | 추가적인 라이브러리, 의존성 사용 시 필수적으로 README.md 에 추가 기재 | 
| **4.** | 작업 완료 후 README.md에 개인별 작업사항 및 작업일지 필수 작성 | 
| **5.** | **매주 금요일 정기회의를 진행하여 코드리뷰 및 일정체크, 추가 개발사항 논의 및 추가** | 

---

<a id="main-features"></a>
## ⚙️ 주요 기능
<!-- 
<a id="screen-flow"></a>
### 🔀 화면 흐름도
![Image](https://github.com/user-attachments/assets/9e7050b5-6bb6-462e-b8b5-5eb4a674274b) -->

<a id="feature-dev-kim"></a>
### 🧩 **회원가입/로그인, 마이페이지, 챗봇, CICD 배포 (김현우)**

- 🌐 회원가입/로그인
        <table>
          <tr>
            <th colspan="2">로그인</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="1_로그인" src="https://github.com/user-attachments/assets/23cf6337-cbd4-445a-98fe-b878e3880d35" />
            </td>
            <td>
              - 이메일 형식의 아이디를 사용합니다. <br>
              - OAuth2 API(네이버,구글)을 활용하여 간편로그인 기능을 구현하였습니다.<br/>
              - 간편로그인 첫 로그인 시 해당 유저의 이메일, 이름 등을 받아오며 부족한 데이터는 회원가입 페이지로 넘어가 추가 입력 후 가입시키도록 구현하였습니다.<br/>
            </td>
          </tr>
          <tr>
            <th colspan="2">회원가입</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="2_회원가입" src="https://github.com/user-attachments/assets/179cbbd3-3615-478c-bc38-0a0592beba28" />
            </td>
            <td>
              - 이메일 중복확인 버튼 구현하여 이메일중복을 방지합니다. <br>
              - 정보수신동의 동의함 상태인 유저는 관리자페이지에서 알림 발송이 가능합니다.<br/>
              - 프로필이미지 설정 시 사이트에서 제공하는 기본 이미지 7종 중 선택하거나 자신의 데스크탑에서 직접 이미지 파일을 업로드 합니다.
            </td>
          </tr>
          <tr>
            <th colspan="2">로그인 성공 시</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="3_로그인후" src="https://github.com/user-attachments/assets/3b5f25a6-b6fd-4787-bc33-dda89e1456ba" />
            </td>
            <td>
              - 로그인 시 JWT 토큰(Access, Refresh)을 발급하여 로컬스토리지에 저장하며 Redis에도 Refresh 토큰을 저장합니다. <br>
              - 연장 버튼을 클릭하거나 타이머가 1분이상 지났을 때 백엔드에 요청을 보낼 경우 로컬스토리지에 저장된 Refresh 토큰과 Redis 서버에 저장된 Refresh 토큰을 비교하여 일치할 경우 유저의 Access 토큰 재발급하는 방식으로 로그인상태를 유지시킵니다. <br/>
              - 로그아웃 버튼을 클릭하거나 타이머의 시간이 만료되었을 경우 로컬스토리지에 저장된 JWT 토큰과 Redis에 저장되어 있는 Refresh 토큰을 삭제시키며 유저를 로그아웃 시킵니다.
            </td>
          </tr>
        </table>
<br>
- 📅 마이페이지
         <table>
          <tr>
            <th colspan="2">대시보드</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="4_대시보드" src="https://github.com/user-attachments/assets/f6214c82-753c-4ea2-a06b-227f5b706386" />  
            </td>
            <td>
              - 프로필 정보, 최근 알림 3개, 최근 참여한 모임 5개가 직관적으로 보이도록 구현하였습니다.<br>
              - 마이페이지 하위메뉴는 회원정보관리, 모임관리, 결제관리, 게시물관리로 나누었습니다.
            </td>
          </tr>
          <tr>
            <th colspan="2">회원정보 수정</th>
          </tr>
          <tr>
            <td width="400">
               <img width="400" alt="5_-ezgif com-resize" src="https://github.com/user-attachments/assets/998c9b54-6b5b-499b-81dd-87b854db4063" />
            </td>
            <td>
              - 프로필수정을 제외한 각 메뉴들은 비밀번호 확인(password 검증)이 되어야 이용 가능합니다.<br>
              - 회원탈퇴 시 member 테이블과 연관관계로 맺어진 모든 테이블들이 자동으로 DROP되어 회원관련정보도 삭제됩니다.<br>
            </td>
          </tr>
        </table>

<br>
- 🤖 챗봇
        <table>
          <tr>
            <th colspan="2">챗봇 기능</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="6_챗봇기능" src="https://github.com/user-attachments/assets/b7cab45b-f3e7-46ca-9a72-0cedb690dc09" />
            </td>
            <td>
              - RabbitMQ, WebSocket, Stomp를 활용하여 양방향 메시징 시스템 챗봇(Peak-Bot)을 구현하였습니다.<br>
              - Footer에 챗봇 open/close 버튼 을 추가하여 어느 화면에서도 사용 가능하도록 하였습니다.<br>
              - 챗봇 오픈 시 “/ws-stomp” 경로로 연결(WebSocket 접속) 이후 STOMP 를 이용해 연결이 끊기지 않고 메시지를 주고 받습니다.
            </td>
          </tr>
          <tr>
            <th colspan="2">Gemini API</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="7_제미나이" src="https://github.com/user-attachments/assets/05573c7c-e056-4747-9175-28de4ad2c17b" />
            </td>
            <td>
              - 제미나이AI API 를 활용한 등산 관련 질문-응답 시스템 구현하였습니다.<br>
              - 메시지 입력 – 전송 시 해당 메시지를 제미나이(3.1-flash-lite 버전) 에게 규칙과 함께 JSON 형태로 변환하여 보낸 후 대답을 추출하여 응답하는 시스템 구현하였습니다.<br>
              - 백엔드에 작성된 규칙을 벗어난 질문을 할 경우 응답에 실패하며 예외처리됩니다.
            </td>
          </tr>
          <tr>
            <th colspan="2">산 검색 / 나의 일정</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="8_산검색나의일정" src="https://github.com/user-attachments/assets/9b7a3d63-a331-4987-8834-bea5e6dac0ea" />
            </td>
            <td>
              - 산 검색 버튼 클릭 후 메시지 입력 시 해당 이름을 DB에서 조회하여 저장되어 있는 해당 산에 대한 정보를 대답해주는 기능을 구현하였습니다.<br>
              - 나의 일정 버튼은 로그인 시에만 노출됩니다.<br>
              - 나의 일정 버튼 클릭 시 해당 유저가 가입된 크루의 목록들 중 출발시간이 가장 가까운 크루 2개를 대답해주는 기능 구현하였습니다.
            </td>
          </tr>
        </table>

<br>
- 📡 CICD 배포
        <table>
          <tr>
            <th colspan="2">AWS – EC2</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="9_awsec2" src="https://github.com/user-attachments/assets/2cc2af71-1453-4a07-aa71-8d99658b56fe" />
            </td>
            <td>
              - 인스턴스 생성 및 최초 연결 후 퍼블릭 IPv4 주소 로 탄력적 IP 주소 생성 및 할당하였습니다.<br>
              - EC2 내에 기본패키지, Java, Docker를 설치하였습니다.<br>
              - 인바운드 규칙은 포트 443(https), 8088(back), 22(ssh), 80(기본, front)를 설정하였습니다.
            </td>
          </tr>
          <tr>
            <th colspan="2">AWS – RDS</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="9_awsrds" src="https://github.com/user-attachments/assets/aa2d09b5-d8cd-42ba-93eb-8a3b17bb57ca" />
            </td>
            <td>
              - 인바운드 규칙 포트 3306을 EC2 보안그룹과 연결하여 backend 에서만 접속 및 CRUD가 가능하도록 설정하였습니다.<br>
              - 아웃바운드 규칙은 0.0.0.0/0 로 설정하여 전체공개 하였습니다.
            </td>
          </tr>
          <tr>
            <th colspan="2">AWS – S3/IAM</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="9_awss3" src="https://github.com/user-attachments/assets/43b3cafe-9cfa-4d72-830d-dd3f0751778e" />
            </td>
            <td>
              - 요청받은 모든 요청들 중 읽기, 가져오기 만 허용한 버킷 정책(JSON 형태로 작성)을 등록하였습니다.<br>
              - S3 버킷에 대한 모든 접근권한을 허용 하는 IAM 권한 생성하였습니다.<br>
              - 백엔드에 IAM 권한을 부여하여 백엔드에서만 S3에 등록,삭제 요청이 가능하도록 설정하였습니다.
            </td>
          </tr>
          <tr>
            <th colspan="2">구조 설계</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="10_배포1" src="https://github.com/user-attachments/assets/004e6f19-64b4-4519-8a29-f483e9a088c8" />
            </td>
            <td>
              - Github actions 실행 및 배포를 위한 deploy.yml 파일을 설정하였습니다.<br>
              - Docker 이미지 및 컨테이너 정의를 위한 docker-compose.yml 파일을 설정하였습니다.<br>
              - 백엔드 및 프론트엔드 빌드/실행을 위한 Dockerfile 파일을 설정하였습니다.<br>
              - Nginx 사용 및 실행을 위한 설정파일 nginx.conf 파일을 설정하였습니다.<br>
              - Git에 api key, 비밀번호, url 등 개인정보사항을 시크릿키 에 등록하였습니다.
            </td>
          </tr>
          <tr>
            <th colspan="2">Nginx</th>
          </tr>
          <tr>
            <td width="400">
              <img width="400" alt="10_배포2" src="https://github.com/user-attachments/assets/c4791659-fa2a-4174-b122-b0281a2b4e33" />
            </td>
            <td>
              - 포트 80번으로 들어오는 모든 요청을 낚아채어 수신하도록 설정하였습니다.<br>
              - 만약 “/back” 이 앞에 붙은 요청이 들어오면 이 요청은 backend(Apache)로 넘기고 이외에는 모두 Nginx에서 처리하도록 설정하였습니다.<br>
              - WebSocket 요청은 웹소켓 프로토콜을 사용하도록 스위칭(업그레이드) 설정(Handshake)하였습니다.
            </td>
          </tr>
        </table>

<br/>


---

<a id="project-review"></a>
## 🧐 프로젝트 후기
기획·설계 단계에서 역할분담과 프로젝트 작업 규칙을 체계적으로 수립한 덕에 프로젝트를 예상보다 빠르고 안정적으로 진행했습니다.<br>
또한, 매주 팀원간 회의와 각자의 코드리뷰를 진행 한 덕에 다른 팀원이 작성한 코드에 추가/수정 할 일이 생길 경우 해당 작업분야의 코드에 이해도가 기본적으로 깔려있어 오류가 발생하는 일이 적었습니다.<br>
이러한 경험들로 초기 기획단계의 작업분배와 규칙들의 설정이 매우 중요하다는 것을 깨달았고, <br>
이를 설정하고 적용시키는 실무에서의 리더의 역할이 중요함을 배웠습니다.<br>
다만 배포 단계에서 AWS S3에 대한 사전지식 부족으로 전용 의존성과 서비스 사용사실을 뒤늦게 알게 되어 이를 프로젝트 내에 적용하기 위해 코드 수정이 크게 발생한 점이 아쉬웠습니다.<br>
이로 인해 기획단계에서 단순히 코드를 작성하는 업무만이 아닌 그 다음단계인 배포/유지보수 까지 생각하여 기획단계를 확립하여야 한다는 것을 배웠습니다.

---

| [프로젝트 소개](#project-intro) | [사용 기술 스택](#tech-stack) | [팀원 & 담당 역할](#team-roles) | [프로젝트 구조](#project-structure) | [프로젝트 규칙](#project-rules) | [주요 기능](#main-features) | [화면 흐름도](#screen-flow) | [기능 개발 (김현우)](#feature-dev-kim) | [프로젝트 후기](#project-review) |
