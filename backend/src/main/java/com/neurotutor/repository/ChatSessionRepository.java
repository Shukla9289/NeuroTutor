package com.neurotutor.repository;

import com.neurotutor.model.ChatSession;
import com.neurotutor.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    
    @Query("SELECT s.subject, COUNT(s) as count FROM ChatSession s WHERE s.user = :user GROUP BY s.subject ORDER BY count DESC")
    List<Object[]> findTopSubjectsByUser(@Param("user") User user, Pageable pageable);
}
