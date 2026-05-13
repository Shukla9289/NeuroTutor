package com.neurotutor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ClaudeAIService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    private final WebClient webClient = WebClient.builder().build();

    public String sendMessage(String userMessage, List<Map<String, String>> history, String systemPrompt) {
        if (apiKey == null || apiKey.isBlank()) {
            return "AI service is not configured. Set GROQ_API_KEY in the root .env file and restart the backend.";
        }

        List<Map<String, Object>> messages = new ArrayList<>();

        // System prompt
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // History
        if (history != null) {
            for (Map<String, String> h : history) {
                messages.add(Map.of("role", h.get("role"), "content", h.get("content")));
            }
        }

        // Current message
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("max_tokens", 2048);
        body.put("messages", messages);

        try {
            Map response = webClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");

        } catch (WebClientResponseException.Unauthorized e) {
            return "AI service error: Groq rejected the API key. Check GROQ_API_KEY in .env, then restart the backend.";
        } catch (WebClientResponseException e) {
            return "AI service error: Groq returned " + e.getStatusCode() + ". " + e.getResponseBodyAsString();
        } catch (Exception e) {
            return "AI service error: " + e.getMessage();
        }
    }

    public String generateQuiz(String subject, String difficulty, int count) {
        String prompt = """
            Generate %d multiple choice quiz questions about %s at %s level.
            Return ONLY valid JSON array (no markdown) in this exact format:
            [{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]
            correct is the 0-based index of the correct option.
            """.formatted(count, subject, difficulty);

        return sendMessage(prompt, null,
                "You are a quiz generator. Return only valid JSON, no other text.");
    }

    public String reviewCode(String code, String language) {
        String prompt = "Review this " + language + " code:\n```\n" + code + "\n```\nProvide: bugs, improvements, best practices.";
        return sendMessage(prompt, null, "You are an expert code reviewer. Be concise and actionable.");
    }
}
