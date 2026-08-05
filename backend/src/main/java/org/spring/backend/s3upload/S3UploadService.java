package org.spring.backend.s3upload;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3UploadService {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    /**
     * S3 파일 업로드
     */
    public String upload(MultipartFile multipartFile, String dirName) throws IOException {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 존재하지 않습니다.");
        }

        String originalFilename = multipartFile.getOriginalFilename();
        String ext = extractExtension(originalFilename);
        
        // S3 저장 파일명 생성 (예: member/uuid-xxxx.jpg)
        String storeFileName = dirName + "/" + UUID.randomUUID() + ext;

        // 메타데이터 설정
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(multipartFile.getSize());
        metadata.setContentType(multipartFile.getContentType());

        // S3 파일 업로드
        try (InputStream inputStream = multipartFile.getInputStream()) {
            amazonS3.putObject(new PutObjectRequest(bucket, storeFileName, inputStream, metadata));
        } catch (IOException e) {
            log.error("S3 파일 업로드 중 오류 발생: {}", e.getMessage());
            throw e;
        }

        return amazonS3.getUrl(bucket, storeFileName).toString();
    }

    /**
     * S3 파일 삭제
     * @param fileUrl 삭제할 S3 파일의 전체 URL (또는 S3 Key)
     */
    public void deleteFile(String fileUrl) {
        if (!StringUtils.hasText(fileUrl)) {
            return;
        }
        
        try {
            // URL 형태인 경우 Key 추출 (예: https://bucket.s3.amazonaws.com/member/xxx.jpg -> member/xxx.jpg)
            String fileKey = extractKeyFromUrl(fileUrl);
            amazonS3.deleteObject(bucket, fileKey);
            log.info("S3 파일 삭제 성공: {}", fileKey);
        } catch (Exception e) {
            log.error("S3 파일 삭제 실패: {}", e.getMessage());
        }
    }

    /**
     * 파일 확장자 추출
     */
    private String extractExtension(String originalFilename) {
        if (!StringUtils.hasText(originalFilename) || !originalFilename.contains(".")) {
            return ""; // 확장자가 없는 경우
        }
        return originalFilename.substring(originalFilename.lastIndexOf("."));
    }

    /**
     * URL에서 S3 Key(저장 경로) 추출
     */
    private String extractKeyFromUrl(String fileUrl) {
        // 버킷 기본 URL 패턴에 맞게 Split 처리
        int splitIdx = fileUrl.indexOf(".com/");
        if (splitIdx != -1) {
            return fileUrl.substring(splitIdx + 5);
        }
        return fileUrl;
    }
}