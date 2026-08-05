package org.spring.backend.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice //모든 controller에서 발생하는 예외 관리
public class GlobalExceptionHandler {
    
    // //클라이언트에서 응답해주는 타입      //예외매시지, 상태코드
    // //응답 관련  공통 메서드 따로 만들어줌
    // private ResponseEntity<String> buildResponse(String message, HttpStatus status) {
    //     //사용자에게 보여줄 메시지
    //     String html = "<script> " +
    //             " alert('" + message + "'); " +
    //             " history.go(-1); " +
    //             " </script>";
    //     //상태, HTML -> 클라이언트(사용자) 응답
    //     return ResponseEntity.status(status).body(html);
    // }

    // React 프론트엔드가 이해할 수 있도록 JSON(Map) 형태로 에러를 응답
    private ResponseEntity<Map<String, String>> buildResponse(String message, HttpStatus status) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("status", String.valueOf(status.value()));
        errorResponse.put("error", status.getReasonPhrase());
        errorResponse.put("message", message);
        
        return ResponseEntity.status(status).body(errorResponse);
    }

    //예외 발생하면 -> 아래 메서드 실행
    // 잘못된 값 (파라미터 오류)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleBadRequest(IllegalArgumentException e) {
        return buildResponse(e.getMessage(), HttpStatus.BAD_REQUEST);//400
    }

    // 상태 충돌 (회원 가입 시 중복 이메일 등)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleConflict(IllegalStateException e) {
        return buildResponse(e.getMessage(), HttpStatus.CONFLICT);//409
    }

    // 조회 시 데이터 없음
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleNotFound(NoSuchElementException e) {
        return buildResponse(e.getMessage(), HttpStatus.NOT_FOUND);//404
    }

    // null 에러 (서버 문제에 가까움)
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<?> handleNull(NullPointerException e) {
        e.printStackTrace();
        return buildResponse("서버 처리 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);//500
    }

    // 못 잡은 예외 (최종 fallback)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception e) {
        e.printStackTrace();
        return buildResponse("알 수 없는 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);//500
    }
}

