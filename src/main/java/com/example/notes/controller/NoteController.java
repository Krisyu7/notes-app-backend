package com.example.notes.controller;

import com.example.notes.entity.Note;
import com.example.notes.service.NoteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.security.auth.Subject;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    // 获取当前用户的所有笔记
    @GetMapping
    public ResponseEntity<Page<Note>> getUserNotes(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
            Long userId = (Long) request.getAttribute("userId");

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);
        Page<Note> notes = noteService.getUserNotes(userId, pageable);
        return ResponseEntity.ok(notes);
    }

    // 根据ID获取用户的笔记
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(
            HttpServletRequest request,
            @PathVariable Long id) {
            Long userId = (Long) request.getAttribute("userId");

        return noteService.getUserNoteById(userId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 搜索用户笔记
    @GetMapping("/search")
    public ResponseEntity<Page<Note>> searchNotes(
            HttpServletRequest request,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isFavorite,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
            Long userId = (Long) request.getAttribute("userId");
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Note> notes = noteService.searchUserNotes(userId, keyword, subject, category, isFavorite, pageable);
        return ResponseEntity.ok(notes);
    }

    // 创建新笔记
    @PostMapping
    public ResponseEntity<Note> createNote(
            HttpServletRequest request,
            @Valid @RequestBody Note note) {
            Long userId = (Long) request.getAttribute("userId");

        Note savedNote = noteService.createNote(userId, note);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedNote);
    }


    // 更新笔记
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody Note noteDetails) {
            Long userId = (Long) request.getAttribute("userId");

        Note updatedNote = noteService.updateNote(userId, id, noteDetails);
        return ResponseEntity.ok(updatedNote);
    }


    // 删除笔记
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(
            HttpServletRequest request,
            @PathVariable Long id) {
            Long userId = (Long) request.getAttribute("userId");
        noteService.deleteNote(userId, id);
        return ResponseEntity.noContent().build();
    }

    // 批量删除笔记
    @DeleteMapping("/batch")
    public ResponseEntity<?> deleteNotes(
            HttpServletRequest request,
            @RequestBody List<Long> noteIds) {
            Long userId = (Long) request.getAttribute("userId");
        noteService.deleteNotes(userId, noteIds);
        return ResponseEntity.noContent().build();
    }

    // 获取用户的所有科目
    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getUserSubjects(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(noteService.getUserSubjects(userId));
    }

    // 获取用户的所有标签
    @GetMapping("/tags")
    public ResponseEntity<List<String>> getUserTags(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(noteService.getUserTags(userId));
    }

    // 获取用户的所有分类
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getUserCategories(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(noteService.getUserCategories(userId));
    }

    // 按科目获取笔记
    @GetMapping("/subject/{subject}")
    public ResponseEntity<Page<Note>> getNotesBySubject(
            HttpServletRequest request,
            @PathVariable String subject,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = (Long) request.getAttribute("userId");
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Note> notes = noteService.getUserNotesBySubject(userId, subject, pageable);
        return ResponseEntity.ok(notes);
    }

    // 按分类获取笔记
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<Note>> getNotesByCategory(
            HttpServletRequest request,
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = (Long) request.getAttribute("userId");
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Note> notes = noteService.getUserNotesByCategory(userId, category, pageable);
        return ResponseEntity.ok(notes);
    }

    // 按标签获取笔记
    @GetMapping("/tag/{tag}")
    public ResponseEntity<Page<Note>> getNotesByTag(
            HttpServletRequest request,
            @PathVariable String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = (Long) request.getAttribute("userId");
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Note> notes = noteService.getUserNotesByTag(userId, tag, pageable);
        return ResponseEntity.ok(notes);
    }

    // 切换收藏状态
    @PutMapping("/{id}/favorite")
    public ResponseEntity<Note> toggleFavorite(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        Note updatedNote = noteService.toggleFavorite(userId, id);
        return ResponseEntity.ok(updatedNote);
    }

    // 切换公开状态
    @PutMapping("/{id}/public")
    public ResponseEntity<Note> togglePublic(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        Note updatedNote = noteService.togglePublic(userId, id);
        return ResponseEntity.ok(updatedNote);
    }

    // 获取收藏笔记
    @GetMapping("/favorites")
    public ResponseEntity<Page<Note>> getFavoriteNotes(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = (Long) request.getAttribute("userId");
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Note> favorites = noteService.getUserFavoriteNotes(userId, pageable);
        return ResponseEntity.ok(favorites);
    }

    // 获取笔记统计信息
    @GetMapping("/stats")
    public ResponseEntity<NoteService.NoteStats> getNoteStats(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        NoteService.NoteStats stats = noteService.getUserNoteStats(userId);
        return ResponseEntity.ok(stats);
    }

    // 获取最近更新的笔记
    @GetMapping("/recent/updated")
    public ResponseEntity<List<Note>> getRecentlyUpdatedNotes(
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        List<Note> notes = noteService.getRecentlyUpdatedNotes(userId);
        return ResponseEntity.ok(notes);
    }

    // 获取最近创建的笔记
    @GetMapping("/recent/created")
    public ResponseEntity<List<Note>> getRecentlyCreatedNotes(
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        List<Note> notes = noteService.getRecentlyCreatedNotes(userId);
        return ResponseEntity.ok(notes);
    }

    // 获取公开笔记（不需要用户认证）
    @GetMapping("/public")
    public ResponseEntity<Page<Note>> getPublicNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Note> notes = noteService.getPublicNotes(pageable);
        return ResponseEntity.ok(notes);
    }

    // 获取用户的公开笔记
    @GetMapping("/public/mine")
    public ResponseEntity<Page<Note>> getMyPublicNotes(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
            Long userId = (Long) request.getAttribute("userId");

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Note> notes = noteService.getUserPublicNotes(userId, pageable);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Notes API is working! Current time: " + java.time.LocalDateTime.now());
    }
}