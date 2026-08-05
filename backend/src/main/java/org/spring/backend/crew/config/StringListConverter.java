package org.spring.backend.crew.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

// CrewEntity -> private List<String> tags  프론트에서 바로쓸수없어서 문자열로 변환하는 클래스
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {
    @Override
    public String convertToDatabaseColumn(List<String> list) {
        if (list == null || list.isEmpty()) return "";
        return String.join(",", list); // 배열을 "초보,20대" 형태의 문자열로 변환하여 DB 저장
    }

    @Override
    public List<String> convertToEntityAttribute(String joined) {
        if (joined == null || joined.isEmpty()) return List.of();
        return Arrays.stream(joined.split(",")).collect(Collectors.toList());
    }
}