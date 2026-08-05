# 🏃‍♀️ 같이 달리조 - 러너들을 위한 올인원 플랫폼

> 러너들을 위한 **상품, 날씨,마라톤대회 정보 제공, 커뮤니티**공통 기능과 러닝 크루 활동을 위한 **가입, 일정 생성/관리, 커뮤니티, 채팅, 챗봇** 기능을  
> 하나의 서비스로 제공하는 **러너들을 위한 올인원 플랫폼**입니다. 🏃‍♂️✨  
>
> **러닝 활동의 모든 흐름을 하나의 플렛폼에서 자연스럽게 연결하는 것이 목표입니다.** 😊  
>
> 제작기간 2025.11.03 ~ 2025.12.05

---

| [프로젝트 소개](#%E2%80%8D%EF%B8%8F-같이-달리조---러너들을-위한-올인원-플랫폼) | [사용 기술 스택](#️-사용-기술-스택) | [팀원 & 담당 역할](#-팀원--담당-역할) | [프로젝트 구조](#-프로젝트-구조) | [주요 기능](#️-주요-기능) | [화면 흐름도](#-화면-흐름도) | [기능 개발 (허린)](#-db설계--챗봇--내크루-전반-허린) | [프로젝트 후기](#-프로젝트-후기) |

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
      <img src="https://img.shields.io/badge/Kakao%20Map-FFCD00?style=for-the-badge&logo=kakao&logoColor=black"/>
      <img src="https://img.shields.io/badge/OpenWeather-0A6EB4?style=for-the-badge"/>
      <img src="https://img.shields.io/badge/DATA.go.kr-0052CC?style=for-the-badge"/>
    </td>
  </tr>
</table>

---

## 👥 팀원 & 담당 역할

| 이름 | 역할 |
|------|------|
| 👨‍💻 **허린** | **서비스 아이디어 제안, DB 설계, 크루 가입, 크루 메인/회원/일정(FullCalendar), 크루 챗봇(KOMORAN+RabbitMQ+WebSocket+STOMP)** | 
| 👩‍💻 박XX (팀장) | JWT, Spring Security, 회원가입/수정/탈퇴, MyPage, OAuth2 로그인, 권한/보안 설계, admin | 
| 👨‍💻 정XX | 라우터 설계, 게시판 CRUD, 스토어 메인 UI, CI/CD 설계 및 배포, GitHub 관리| 
| 👨‍💻 이XX | Admin, 관리자 대시보드, 통계/차트 구현 | 
| 👨‍💻 천XX | 장바구니, 결제/Kakao Pay 연동, 주문/배송 상태 관리, 외부 Open API(마라톤/날씨/지도) 연동 | 
| 👨‍💻 유XX | 크루 목록/검색/페이징, 크루 상세/수정, 마이 크루 게시판·댓글, 마이 크루 채팅(WebSocket/STOMP) 구현 |

---

## 📂 프로젝트 구조

<table>
  <tr>
    <th>⭐ Spring Boot 백엔드  </th>
    <th>⭐ React 프론트엔드 (Vite 기반) </th>
  </tr>
  <tr>
    <td>
      FullStackProject/   <br>
       ┣ backendspring/                           <br>  
       ┃ ┣ src/main/java/org/spring/backendspring/ <br>
       ┃ ┃ ┣ API/                                  <br>
       ┃ ┃ ┣ admin/                                <br>
       ┃ ┃ ┣ board/                                <br>
       ┃ ┃ ┣ cart/                                 <br>
       ┃ ┃ ┣ checkout/                             <br>
       ┃ ┃ ┣ common/                               <br>
       ┃ ┃ ┣ config/                               <br>
       ┃ ┃ ┣ crew/                                 <br>
       ┃ ┃ ┣ event/                                <br>
       ┃ ┃ ┣ item/                                 <br>
       ┃ ┃ ┣ member/                               <br>
       ┃ ┃ ┣ payment/                              <br>
       ┃ ┃ ┣ rabbitmqWebsocket/                    <br>
       ┃ ┃                                         <br>
       ┃ ┣ src/main/resources/                     <br>
       ┃ ┃ ┣ application.yml                       <br>
       ┃ ┃                                         <br>
       ┃ ┣ build.gradle                            <br>
       ┃ ┗ Dockerfile                              <br>
       ┃                                           <br>
    </td>
    <td>
       ┣ vite-front/      <br>
       ┃ ┣ nginx/                                  <br> 
       ┃ ┗ nginx.conf                              <br>
       ┃ ┣ public/                                 <br>
       ┃ ┣ src/                                    <br>
       ┃ ┃ ┣ apis/                                 <br>
       ┃ ┃ ┣ components/                           <br>
       ┃ ┃ ┃ ┣ common/                             <br>
       ┃ ┃ ┃ ┗ container/                          <br>
       ┃ ┃ ┣ css/                                  <br>
       ┃ ┃ ┣ js/                                   <br>
       ┃ ┃ ┣ layout/                               <br>
       ┃ ┃ ┣ pages/                                <br>
       ┃ ┃ ┣ router/                               <br>
       ┃ ┃ ┣ slice/                                <br>
       ┃ ┃ ┗ store/                                <br>
       ┃ ┣ package.json                            <br>
       ┃ ┗ Dockerfile                              <br>
       ┃                                           <br>
       ┣ .github/workflows/                        <br>
       ┣ docker-compose.yml                        <br>
       ┣ README.md                                 <br>
       ┗ .gitignore   
    </td>
  </tr>
</table>

---

## ⚙️ 주요 기능

### 🔀 화면 흐름도
![Image](https://github.com/user-attachments/assets/9e7050b5-6bb6-462e-b8b5-5eb4a674274b)

###  🧩 **DB설계 / 챗봇 / 내크루 전반 (허린)**

- 🗄️ DB 설계
        <table>
            <tr>
                <th>ERD</th>
                <th>설계 목표</th>
            </tr>
            <tr>
                <td>
                  <img width="400" height="300" alt="Image" src="https://github.com/user-attachments/assets/6bacc21c-5c26-4c55-ad94-df38cd4d6793" />
                </td>
                <td>도메인 기반으로 테이블을 분리하고, <br>
                3NF 기준 정규화를 적용해 중복을 최소화한<br> 구조를 목표로 설계했습니다.<br/> 
                회원(member_tb)을 중심으로 <br>크루, 게시판, 일정, 스토어(상품/주문/결제)<br> 등의
                도메인으로 구성했습니다.</td>
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
제가 제안한 서비스 아이디어가 채택 되어서, 서비스에 어떤 기능이 필요할지부터 전체 흐름을 직접 고민하고, <br> 
그에 맞춰 DB설계, 서비스기능들을 생각하고 로직을 설계하는게 재밌었고 의미있는 경험이었습니다. <br> 
아쉬운 점은 DB부분에서 초기 배포 이후에 협업과 각자의 기능 확장 과정에서 일부 정규화가 깨진 점과  <br>
작업 중에 member_tb에 역할이 과하게 집중되는 구조가 좋지 않다는 걸 깨 달았고, <br>
초기부터 역할 기준으로 더 세분화하지 못한 점, 이처럼 사후 관리를 충분히 하지 못한 점이 아쉬운 부분입니다. <br>
이번 프로젝트로 리팩토링의 중요성을 깨달았고 앞으로는 사후 리팩토링까지 책임지는 개발자가 되겠다는 목표를 갖게 되었습니다.


