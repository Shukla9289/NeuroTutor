package com.neurotutor.controller;

import com.neurotutor.service.ClaudeAIService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ClaudeAIService claudeService;
    private final com.neurotutor.repository.ChatSessionRepository sessionRepo;
    private final com.neurotutor.service.UserService userService;

    @PostMapping("/message")
    public ResponseEntity<?> sendMessage(@RequestBody ChatRequest req, Principal principal) {
        // Track usage
        try {
            com.neurotutor.model.User user = userService.findByEmail(principal.getName());
            sessionRepo.save(com.neurotutor.model.ChatSession.builder()
                .user(user)
                .subject(req.getSubject())
                .mode(req.getMode())
                .build());
        } catch (Exception e) {
            // Silently fail logging if error
        }

        String systemPrompt = buildSystemPrompt(req.getMode(), req.getSubject());
        String reply = claudeService.sendMessage(req.getMessage(), req.getHistory(), systemPrompt);
        return ResponseEntity.ok(Map.of("reply", reply));
    }

    private String buildSystemPrompt(String mode, String subject) {
        return switch (mode) {
            case "socratic" -> """
                You are a Socratic AI tutor specializing in %s.
                NEVER give direct answers. Guide the student with questions.
                Lead them to discover the answer themselves.
                If they're stuck, give progressively bigger hints.
                """.formatted(subject);
            case "debate" -> """
                You are a debate partner for %s topics.
                Play devil's advocate. Challenge the student's assumptions.
                Present counter-arguments to help them think critically.
                """.formatted(subject);
            case "project" -> """
                You are a project-based learning mentor for %s.
                Give real-world, end-to-end projects (not toy examples).
                Break them into concrete, actionable steps.
                """.formatted(subject);
            case "communication" -> """
                You are a Communication Skills Coach.
                Your goal is to help the student improve their English speaking and writing by discussing %s.
                1. Conduct a conversation entirely in English specifically about %s topics.
                2. After EACH user response, provide a brief 'Performance Rating' (e.g., 7/10).
                3. Give specific feedback on Grammar, Fluency, and Vocabulary.
                4. Start with Basic concepts of %s and progressively move to Advanced professional discussions as they improve.
                Format your response like this:
                ---
                [Rating: X/10]
                Feedback: ...
                ---
                Your reply: ...
                """.formatted(subject, subject, subject);
            default -> """
                You are an expert AI tutor for %s.
                Explain concepts clearly with examples.
                Detect if the student seems frustrated and adapt your tone.
                Be encouraging, precise, and thorough.
                """.formatted(subject);
        };
    }

    @Data
    public static class ChatRequest {
        private String message;
        private String mode;
        private String subject;
        private List<Map<String, String>> history;
    }
}
