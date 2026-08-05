package org.spring.backend.board.repository;
import java.util.List;
import java.util.Optional;

import org.spring.backend.board.entity.BoardFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardFileRepository extends JpaRepository <BoardFileEntity,Long> {

  Optional<BoardFileEntity> findByBoardEntityId(Long id);

  List<BoardFileEntity> findAllByBoardEntityId(Long id);
}

  

