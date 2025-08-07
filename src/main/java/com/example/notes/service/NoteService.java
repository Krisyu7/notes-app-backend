package com.example.notes.service;

import com.example.notes.entity.Note;
import com.example.notes.exception.NoteNotFoundException;
import com.example.notes.repository.NoteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    // Get all notes with pagination
    public Page<Note> getAllNotes(Pageable pageable) {
        return noteRepository.findAllByOrderByUpdatedAtDesc(pageable);
    }

    public List<String> getAllTags() {
        return noteRepository.findAllTags();
    }

    // Delete note by ID
    public void deleteNote(Long id) {
        if (!noteRepository.existsById(id)) {
            throw new NoteNotFoundException(id);
        }
        noteRepository.deleteById(id);
    }

    // Get notes by subject
    public Page<Note> getNotesBySubject(String subject, Pageable pageable) {
        return noteRepository.findBySubjectOrderByUpdatedAtDesc(subject, pageable);
    }

    // Search notes with filters
    public Page<Note> searchNotes(String keyword, String subject, Boolean isFavorite, Pageable pageable) {
        return noteRepository.searchNotes(keyword, subject, isFavorite, pageable);
    }

    // Save new note
    public Note saveNote(Note note) {
        // Ensure default values for new fields
        if (note.getIsFavorite() == null) {
            note.setIsFavorite(false);
        }
        if (note.getTags() == null) {
            note.setTags(new java.util.HashSet<>());
        }
        return noteRepository.save(note);
    }

    // Update existing note
    public Note updateNote(Long id, Note noteDetails) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new NoteNotFoundException(id));

        note.setSubject(noteDetails.getSubject());
        note.setTitle(noteDetails.getTitle());
        note.setContent(noteDetails.getContent());
        note.setTags(noteDetails.getTags() != null ? noteDetails.getTags() : new java.util.HashSet<>());
        note.setIsFavorite(noteDetails.getIsFavorite() != null ? noteDetails.getIsFavorite() : false);

        return noteRepository.save(note);
    }


    // Get all distinct subjects
    public List<String> getAllSubjects() {
        return noteRepository.findAllSubjects();
    }

    // Toggle favorite status
    public Note toggleFavorite(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new NoteNotFoundException(id));

        note.setIsFavorite(!note.getIsFavorite());
        return noteRepository.save(note);
    }

    // Get favorite notes
    public Page<Note> getFavoriteNotes(Pageable pageable) {
        return noteRepository.findByIsFavoriteTrueOrderByUpdatedAtDesc(pageable);
    }

    // Get note by ID
    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }
}