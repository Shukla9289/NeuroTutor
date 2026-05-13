package com.neurotutor.controller;

import com.neurotutor.model.Note;
import com.neurotutor.model.User;
import com.neurotutor.repository.NoteRepository;
import com.neurotutor.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteRepository noteRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes(Principal principal) {
        User user = userService.findByEmail(principal.getName());
        return ResponseEntity.ok(noteRepository.findByUserOrderByUpdatedAtDesc(user));
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody Note note, Principal principal) {
        System.out.println("DEBUG: Creating note: " + note.getTitle() + " for user: " + principal.getName());
        User user = userService.findByEmail(principal.getName());
        note.setUser(user);
        return ResponseEntity.ok(noteRepository.save(note));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note noteDetails, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        note.setTitle(noteDetails.getTitle());
        note.setContent(noteDetails.getContent());
        note.setCategory(noteDetails.getCategory());

        return ResponseEntity.ok(noteRepository.save(note));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        noteRepository.delete(note);
        return ResponseEntity.ok().build();
    }
}
