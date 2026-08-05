# 🏔️ Peak-nic - 함께 떠나는 등산 모임

> **산, 등산로, 날씨 정보 제공, 커뮤니티**공통 기능과 등산 크루 활동을 위한 **가입, 모임 생성/관리, 결제/환불/구독, 리뷰, 알림, 챗봇** 기능을 하나의 서비스로 제공하는 **산악인들을 위한 올인원 플랫폼**입니다. 🏔️✨  
>
> **등산 준비부터 모임 모집, 결제, 그리고 종료 후 후기 공유까지 하나의 플렛폼에서 자연스럽게 연결하는 것이 목표입니다.** 😊  
>
> 제작기간 2026.06.26 ~ 2026.07.31

---

<a href="http://54.116.208.12/" style="display: block;">
  <img width="100%" height="120px" alt="banner" src="https://github.com/user-attachments/assets/206d561d-f8f9-4767-a9bb-3c9717485dba" />
</a>

---

| [프로젝트 소개](🏔️-Peak-nic---함께-떠나는-등산-모임) | [사용 기술 스택](#️-사용-기술-스택) | [팀원 & 담당 역할](#-팀원--담당-역할) | [프로젝트 구조](#-프로젝트-구조) |  [프로젝트 규칙](#-프로젝트-규칙) | [주요 기능](#️-주요-기능) | [화면 흐름도](#-화면-흐름도) | [기능 개발 (김현우)](#-db설계--챗봇--내크루-전반-허린) | [프로젝트 후기](#-프로젝트-후기) |

---

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

## 👥 팀원 & 담당 역할

| 이름 | 역할 |
|------|------|
| 👨‍💻 **김현우(팀장)** | **Git 관리, 전체 프로젝트 관리, CICD 배포, Security/JWT, 회원가입/로그인, OAuth2, 마이페이지, 챗봇(RabbitMQ+WebSocket+STOMP)** | 
| 👩‍💻 김XX | 공공 API 구조 설계, 산정보 및 등산로, 크루, 알림 기능 | 
| 👨‍💻 민XX | 백엔드 DB 구조 설계, 장바구니, 결제/Kakao Pay, 취소 및 환불 | 
| 👨‍💻 이XX | 프론트엔드 구조 설계, admin, paging | 
| 👨‍💻 이XX | 프론트엔드 구조 설계, 커뮤니티/리뷰, 댓글 | 

---

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
       ┃ ┃ ┣ s3upload/                    <br>
       ┃ ┃ ┣ settlement/                    <br>
       ┃ ┃ ┣ subscribe/                    <br>
       ┃ ┃ ┣ trail/                    <br>
       ┃ ┃ ┣ weather/                    <br>
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

## 👥 프로젝트 규칙

| 번호 | 규칙 |
|------|------|
| **1.** | 작업은 개인 Branch(hyun, gyu, yein, sun, sue) 에서만 진행 후 push | 
| **2.** | 매일 5시에 팀장이 Merge(dev) 실행 후 팀원 간 회의를 통해 오류 수정 | 
| **3.** | 추가적인 라이브러리, 의존성 사용 시 필수적으로 README.md 에 추가 기재 | 
| **4.** | 작업 완료 후 README.md에 개인별 작업사항 및 작업일지 필수 작성 | 
| **5.** | **매주 금요일 정기회의를 진행하여 코드리뷰 및 일정체크, 추가 개발사항 논의 및 추가** | 

---

## ⚙️ 주요 기능

### 🔀 화면 흐름도
![Image](https://github.com/user-attachments/assets/9e7050b5-6bb6-462e-b8b5-5eb4a674274b)

###  🧩 **회원가입/로그인, 마이페이지, 챗봇, CICD 배포 (김현우)**

- 🗄️ 회원가입/로그인
        <table>
            <tr>
                <th colspan="2">로그인</th>
            </tr>
            <tr>
                <td>
                  <img width="400px" height="300px" alt="1_로그인" src="https://github.com/user-attachments/assets/23cf6337-cbd4-445a-98fe-b878e3880d35" />
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
                <td>
                  <img width="400px" height="300px" alt="2_회원가입" src="https://github.com/user-attachments/assets/179cbbd3-3615-478c-bc38-0a0592beba28" />
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
                <td>
                  <img width="400px" height="300px" alt="3_로그인후" src="https://github.com/user-attachments/assets/3b5f25a6-b6fd-4787-bc33-dda89e1456ba" />
                </td>
                <td>
                - 로그인 시 JWT 토큰(Access, Refresh)을 발급하여 로컬스토리지에 저장하며 Redis에도 Refresh 토큰을 저장합니다. <br>
                - 연장 버튼을 클릭하거나 타이머가 1분이상 지났을 때 백엔드에 요청을 보낼 경우 로컬스토리지에 저장된 Refresh 토큰과 Redis 서버에 저장된 Refresh 토큰을 비교하여 일치할 경우 유저의 Access 토큰 재발급하는 방식으로 로그인상태를 유지시킵니다. <br/>
                - 로그아웃 버튼을 클릭하거나 타이머의 시간이 만료되었을 경우 로컬스토리지에 저장된 JWT 토큰과 Redis에 저장되어 있는 Refresh 토큰을 삭제시키며 유저를 로그아웃 시킵니다.
                </td>
            </tr>
        </table>
  
 - 🤖 챗봇
   
        <table>
            <tr>
                <th>ChatBot</th>
                <th>KOMORAN,<br>RabbitMQ(Docker)</th>
            </tr>
            <tr>
                <td>
                   <img width="400" height="300" alt="Image" src="https://github.com/user-attachments/assets/28f6cef7-0d40-4336-bd8b-5de9609c9354" />
                </td>
                <td>
                  크루 일정 관련 질문을 자동 응답하는 챗봇 기능<br/>
                  - "오늘 일정 있어?", "이번 주 몇 개야?" 등 자연어 질문 처리<br/>
                  - 챗봇 응답은 WebSocket+STOMP을 통해 채팅방으로 실시간 전송<br/>
                  - KOMORAN으로 날짜·요일·크루 키워드 추출<br/>
                  - 추출된 키워드로 의도 판단(true/false)<br/>
                  - RabbitMQ를 Docker로 구성해 별도 설치/환경 설정 없이<br/>
                    큐·익스체인지 자동 생성 및 메시지 전달 구조 즉시 사용<br/>
                  - CI/CD Ec2, GitHub Actions, Docker Compose를 활용해 배포 시 자동 구성
                </td>
            </tr>
        </table>


- 🏃‍♂️ 내 크루 전반
        <table>
            <tr>
              <td>Main</td>
              <td> <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/1f7fdb1d-758c-4c6b-8abc-b371fab3e683"/></td>
              <td>Join</td>
               <td><img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/d8e13db7-fee5-4496-b168-5d250fffe8cb"/></td>
            </tr>
            <tr>
              <td>Calendar</td>
               <td><img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/462d410c-282e-4586-854e-b51d40e429d5" /></td>
                <td>Schedule<br>Member</td>
               <td><img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/0a4cc536-a54c-4c13-ba61-47fba60555c6" /></td>
            </tr>
            <tr>
              <td>Member</td>
               <td><img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/9a96e1f8-8bba-4ca0-9a02-04d2f5ea4723" /></td>
              <td>Join<br>Request</td>
              <td>
                <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/d4d82310-5c04-44ba-8da8-9c728babc893" />
              </td>
            </tr>
        </table>

<br/>

####  🔐 회원가입 / 로그인,OAuth2 / 인증,인가 / MyPage / Admin(박XX)

<details>
    <summary>🔍 자세히 보기</summary>
        <table>
            <tr>
                <td>회원가입</td>
               <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/3c683e73-683c-4d1c-85d4-f498422380bb" /></td>
                <td>로그인</td>
                  <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/226f2eea-c479-4e46-9539-7fa8db0dca18" /></td>
            </tr>
           <tr>
                <td>인증,인가</td>
                <td> <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/98b6df9a-17a5-40af-ae9c-430765c44c24" /></td>
                <td>PaymentAdmin</td>
                <td> <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/8e2c3a9a-e358-48bc-8038-1b17011e8c87" /></td>
            </tr>
            <tr>
                <td>MyPage</td>
                <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/1a9b5031-1bca-4af3-92bf-89537beb609f" /></td>
            </tr>
        </table>
</details>

####  ⚙️ CI/CD / GitHub / 라우터 / 공통 UI / 게시판 (정XX)

<details>
    <summary>🔍 자세히 보기</summary>
       <table>
            <tr>
                <td>CI/CD</td>
               <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/bb2169e4-7dbb-4e69-8479-3d74d947fcce" /></td>
                <td>GitHub</td>
                  <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/7ffd0f06-c632-4ca0-8255-b6f568e7f7af" /></td>
            </tr>
           <tr>
                <td>라우터</td>
                <td> <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/0a95c6a8-0c95-4a96-bd5f-a3a2fd8a098f" /></td>
                <td>공통 UI</td>
                <td> <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/8e2c3a9a-e358-48bc-8038-1b17011e8c87" /></td>
            </tr>
            <tr>
                <td>게시판</td>
                <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/bf0da571-34e6-46b6-a277-75f58b192a86" /></td>
            </tr>
        </table>
</details>

####  🛠️ Admin / 대시보드 (이XX)

<details>
    <summary>🔍 자세히 보기</summary>
        <table>
            <tr>
                <td>AdminLayout</td>
               <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/17a36510-6efd-43fc-b949-a585423dfe16" /></td>
                <td>AdminPayment</td>
                  <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/d12a00ca-2d75-40ae-b78e-b6e0e94b0a42" /></td>
            </tr>
           <tr>
                <td>AdminBoard</td>
                <td> <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/be0707c3-8081-4516-b1b3-ddca426740d7" /></td>
                <td>AdminItem</td>
                <td> <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/6ad1ca1e-455a-4aac-a80c-4a4e99a05982" /></td>
            </tr>
            <tr>
                <td>대시보드</td>
                <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/be5ae80a-851b-4d0b-8cab-f78137a40629" /></td>
            </tr>
        </table>
</details>

####  🛒 장바구니 / 결제,KakaoPay / OpenAPI / 주문상태관리  (천XX)

<details>
    <summary>🔍 자세히 보기</summary>
         <table>
            <tr>
                <td>장바구니</td>
               <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/092ca248-d060-443d-9218-6aa2334b7ba3" /></td>
                <td>결제,<br/>KakaoPay</td>
                  <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/4f6f6d26-efc6-4270-b097-25b0316eec4f" /></td>
            </tr>
           <tr>
                <td>주문상태관리</td>
                <td> <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/5bbf9e33-1c9e-4426-acec-877a0bee060a" /></td>
                <td>OpenAPI</td>
                <td> <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/a94e4010-bbf9-44f7-8ad6-6b1b82bc0636" /></td>
            </tr>
        </table>
</details>

####  💬 크루 전반 / 내 크루 게시판 /  내 크루 채팅방  (유XX)

<details>
    <summary>🔍 자세히 보기</summary>
       <table>
            <tr>
                <td>크루목록</td>
               <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/dec8f6d6-8c68-4538-a452-3e5e56a05217" /></td>
                <td>크루수정</td>
                  <td> <img width="270" height="300" alt="Image" src="https://github.com/user-attachments/assets/24624900-0c1f-47b0-ab11-3c08dcb3df00" /></td>
            </tr>
           <tr>
                <td>크루 게시판</td>
                <td> <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/0dfafbf5-9005-43b8-a779-a50300cde12d" /></td>
                <td>크루 채팅방</td>
                <td> <img width="380" height="300" alt="Image" src="https://github.com/user-attachments/assets/5f545233-5fb0-42bb-a4f4-b344ab22c725" /></td>
            </tr>
        </table>
</details>

---

## 🧐 프로젝트 후기
기획·설계 단계에서 역할분담과 프로젝트 작업 규칙을 체계적으로 수립한 덕에 프로젝트를 예상보다 빠르고 안정적으로 진행했습니다.<br>
또한, 매주 팀원간 회의와 각자의 코드리뷰를 진행 한 덕에 다른 팀원이 작성한 코드에 추가/수정 할 일이 생길 경우 해당 작업분야의 코드에 이해도가 기본적으로 깔려있어 오류가 발생하는 일이 적었습니다.<br>
이러한 경험들로 초기 기획단계의 작업분배와 규칙들의 설정이 매우 중요하다는 것을 깨달았고, <br>
이를 설정하고 적용시키는 실무에서의 리더의 역할이 중요함을 배웠습니다.<br>
다만 배포 단계에서 AWS S3에 대한 사전지식 부족으로 전용 의존성과 서비스 사용사실을 뒤늦게 알게 되어 이를 프로젝트 내에 적용하기 위해 코드 수정이 크게 발생한 점이 아쉬웠습니다.<br>
이로 인해 기획단계에서 단순히 코드를 작성하는 업무만이 아닌 그 다음단계인 배포/유지보수 까지 생각하여 기획단계를 확립하여야 한다는 것을 배웠습니다.



