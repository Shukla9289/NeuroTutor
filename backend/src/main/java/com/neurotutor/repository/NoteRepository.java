package com.neurotutor.repository;

import com.neurotutor.model.Note;
import com.neurotutor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserOrderByUpdatedAtDesc(User user);
    List<Note> findByUserAndCategoryOrderByUpdatedAtDesc(User user, String category);
}
