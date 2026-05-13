package com.neurotutor.controller;

import com.neurotutor.service.ClaudeAIService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.util.Map;
import java.util.concurrent.*;

@Slf4j
@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
public class CodeController {

    private final ClaudeAIService claudeService;

    @PostMapping("/execute")
    public ResponseEntity<?> executeCode(@RequestBody CodeRequest req) {
        String lang = req.getLanguage().toLowerCase();
        String code = req.getCode();
        
        try {
            String extension;
            String[] command;
            File tempFile;

            switch (lang) {
                case "python":
                    extension = ".py";
                    command = new String[]{"python", ""}; // second arg filled below
                    break;
                case "javascript":
                    extension = ".js";
                    command = new String[]{"node", ""};
                    break;
                case "java":
                    extension = ".java";
                    command = new String[]{"java", ""}; // Java 11+ supports direct source run
                    break;
                case "cpp":
                    extension = ".cpp";
                    File cppFile = File.createTempFile("nt_code_", ".cpp");
                    File exeFile = new File(cppFile.getAbsolutePath().replace(".cpp", ".exe"));
                    try (var writer = new java.io.FileWriter(cppFile)) {
                        writer.write(code);
                    }
                    // Compile
                    Process compile = new ProcessBuilder("g++", cppFile.getAbsolutePath(), "-o", exeFile.getAbsolutePath()).start();
                    if (!compile.waitFor(10, TimeUnit.SECONDS) || compile.exitValue() != 0) {
                        String err = new String(compile.getErrorStream().readAllBytes());
                        return ResponseEntity.ok(Map.of("output", "❌ Compilation Error:\n" + err));
                    }
                    command = new String[]{exeFile.getAbsolutePath()};
                    tempFile = exeFile; // To delete later
                    return runProcess(command, 10, new File[]{cppFile, exeFile});

                default:
                    return ResponseEntity.ok(Map.of("output", "⚠️ Language '" + lang + "' is not yet supported in this environment."));
            }

            tempFile = File.createTempFile("nt_code_", extension);
            try (var writer = new java.io.FileWriter(tempFile)) {
                writer.write(code);
            }
            command[command.length - 1] = tempFile.getAbsolutePath();
            
            return runProcess(command, 10, new File[]{tempFile});

        } catch (Exception e) {
            log.error("Code execution error", e);
            return ResponseEntity.ok(Map.of("output", "⚠️ Execution error: " + e.getMessage()));
        }
    }

    private ResponseEntity<?> runProcess(String[] command, int timeoutSec, File[] filesToDelete) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        boolean finished = process.waitFor(timeoutSec, TimeUnit.SECONDS);
        String output;
        if (!finished) {
            process.destroyForcibly();
            output = "⏰ Execution timed out (" + timeoutSec + "s limit)";
        } else {
            output = new String(process.getInputStream().readAllBytes());
        }

        for (File f : filesToDelete) {
            if (f.exists()) f.delete();
        }
        
        return ResponseEntity.ok(Map.of("output", output.isEmpty() ? "(No output)" : output));
    }

    @PostMapping("/review")
    public ResponseEntity<?> reviewCode(@RequestBody CodeRequest req) {
        String review = claudeService.reviewCode(req.getCode(), req.getLanguage());
        return ResponseEntity.ok(Map.of("review", review));
    }

    @Data
    public static class CodeRequest {
        private String code;
        private String language;
    }
}
