package com.neurotutor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.neurotutor.service.ClaudeAIService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final ClaudeAIService claudeService;
    private final ObjectMapper objectMapper;
    private final com.neurotutor.repository.ChatSessionRepository sessionRepo;
    private final com.neurotutor.service.UserService userService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(@RequestBody QuizRequest req, java.security.Principal principal) {
        // Track activity
        try {
            com.neurotutor.model.User user = userService.findByEmail(principal.getName());
            sessionRepo.save(com.neurotutor.model.ChatSession.builder()
                .user(user)
                .subject(req.getSubject())
                .mode("quiz")
                .build());
        } catch (Exception e) {
            // Silently fail activity logging
        }

        try {
            String raw = claudeService.generateQuiz(req.getSubject(), req.getDifficulty(), req.getCount());
            // Clean any accidental markdown
            raw = raw.replaceAll("```json", "").replaceAll("```", "").trim();
            List<?> questions = objectMapper.readValue(raw, List.class);
            return ResponseEntity.ok(Map.of("questions", questions));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Quiz generation failed: " + e.getMessage()));
        }
    }

    @Data
    public static class QuizRequest {
        private String subject;
        private String difficulty;
        private int count;
    }
}
