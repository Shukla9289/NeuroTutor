package com.neurotutor.controller;

import com.neurotutor.model.User;
import com.neurotutor.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final UserService userService;
    private final com.neurotutor.repository.ChatSessionRepository sessionRepo;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Principal principal) {
        User user = userService.findByEmail(principal.getName());
        
        // Fetch top subjects
        List<Object[]> topSubsRaw = sessionRepo.findTopSubjectsByUser(user, org.springframework.data.domain.PageRequest.of(0, 4));
        List<String> topSubjects = topSubsRaw.stream().map(row -> (String) row[0]).toList();

        return ResponseEntity.ok(Map.of(
                "xp", user.getXp(),
                "streak", user.getStreak(),
                "quizzes", 12,
                "sessions", 28,
                "topSubjects", topSubjects
        ));
    }

    @GetMapping("/full")
    public ResponseEntity<?> getFullProgress(Principal principal) {
        User user = userService.findByEmail(principal.getName());
        return ResponseEntity.ok(Map.of(
                "xp", user.getXp(),
                "streak", user.getStreak(),
                "quizzes", 12,
                "sessions", 28,
                "rank", 34
        ));
    }

    @PostMapping("/xp/add")
    public ResponseEntity<?> addXp(@RequestBody Map<String, Integer> body, Principal principal) {
        User user = userService.addXp(principal.getName(), body.get("amount"));
        return ResponseEntity.ok(Map.of("newXp", user.getXp()));
    }
}
