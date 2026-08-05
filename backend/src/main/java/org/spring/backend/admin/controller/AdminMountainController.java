package org.spring.backend.admin.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.spring.backend.mountain.dto.MountainDto;
import org.spring.backend.mountain.service.MountainService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/mountain")
@RequiredArgsConstructor
public class AdminMountainController {

  private final MountainService mountainService;

  @GetMapping("")
  public ResponseEntity<?> mountainList(
      @PageableDefault(page = 0, size = 5, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
      @RequestParam(value = "subject", required = false) String subject,
      @RequestParam(value = "search", required = false) String search,
      @RequestParam(value = "noImg", required = false) Boolean noImg,
      @RequestParam(value = "noDescription", required = false) Boolean noDescription) {
    Page<MountainDto> mountainList = mountainService.mountainList(pageable, subject, search, noImg, noDescription);

    Map<String, Object> map = new HashMap<>();
    map.put("mountainList", mountainList);

    return ResponseEntity.ok(map);
  }

  @PutMapping(value = "/{id}", consumes = "multipart/form-data")
  public ResponseEntity<?> mountainUpdate(@PathVariable("id") Long id, @ModelAttribute MountainDto mountainDto) throws IOException {
    mountainDto.setId(id);
    mountainService.mountainUpdate(mountainDto);
    return ResponseEntity.ok().build();
  }

}
