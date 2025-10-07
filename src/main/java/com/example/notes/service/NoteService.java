package com.example.notes.service;

import com.example.notes.entity.Note;
import com.example.notes.entity.User;
import com.example.notes.exception.NoteNotFoundException;
import com.example.notes.exception.UnauthorizedException;
import com.example.notes.repository.NoteRepository;
import com.example.notes.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteService(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    // 获取用户的所有笔记（分页）
    public Page<Note> getUserNotes(Long userId, Pageable pageable) {
        validateUser(userId);
        return noteRepository.findByUser_IdOrderByUpdatedAtDesc(userId, pageable);
    }

    // 获取用户的所有标签
    public List<String> getUserTags(Long userId) {
        validateUser(userId);
        return noteRepository.findAllTagsByUserId(userId);
    }

    // 获取用户的所有科目
    public List<String> getUserSubjects(Long userId) {
        validateUser(userId);
        return noteRepository.findAllSubjectsByUserId(userId);
    }

    // 获取用户的所有分类
    public List<String> getUserCategories(Long userId) {
        validateUser(userId);
        return noteRepository.findAllCategoriesByUserId(userId);
    }

    // 按科目获取用户笔记
    public Page<Note> getUserNotesBySubject(Long userId, String subject, Pageable pageable) {
        validateUser(userId);
        return noteRepository.findByUser_IdAndSubjectOrderByUpdatedAtDesc(userId, subject, pageable);
    }

    // 按分类获取用户笔记
    public Page<Note> getUserNotesByCategory(Long userId, String category, Pageable pageable) {
        validateUser(userId);
        return noteRepository.findByUser_IdAndCategoryOrderByUpdatedAtDesc(userId, category, pageable);
    }

    // 获取用户收藏笔记
    public Page<Note> getUserFavoriteNotes(Long userId, Pageable pageable) {
        validateUser(userId);
        return noteRepository.findByUser_IdAndIsFavoriteTrueOrderByUpdatedAtDesc(userId, pageable);
    }

    // 按标签查询用户笔记
    public Page<Note> getUserNotesByTag(Long userId, String tag, Pageable pageable) {
        validateUser(userId);
        return noteRepository.findByUser_IdAndTag(userId, tag, pageable);
    }

    // 搜索用户笔记
    public Page<Note> searchUserNotes(Long userId, String keyword, String subject,
                                      String category, Boolean isFavorite, Pageable pageable) {
        validateUser(userId);
        return noteRepository.searchUserNotes(userId, keyword, subject, category, isFavorite, pageable);
    }

    // 根据ID获取用户的笔记
    public Optional<Note> getUserNoteById(Long userId, Long noteId) {
        validateUser(userId);
        return noteRepository.findByIdAndUser_Id(noteId, userId);
    }

    // 创建新笔记
    public Note createNote(Long userId, Note note) {
        User user = validateUser(userId);

        // 设置默认值
        if (note.getIsFavorite() == null) {
            note.setIsFavorite(false);
        }
        if (note.getIsPublic() == null) {
            note.setIsPublic(false);
        }
        if (note.getTags() == null) {
            note.setTags(new java.util.HashSet<>());
        }

        // 关联用户
        note.setUser(user);

        return noteRepository.save(note);
    }

    // 更新笔记
    public Note updateNote(Long userId, Long noteId, Note noteDetails) {
        Note existingNote = noteRepository.findByIdAndUser_Id(noteId, userId)
                .orElseThrow(() -> new NoteNotFoundException("Note not found or access denied"));

        // 更新字段
        existingNote.setSubject(noteDetails.getSubject());
        existingNote.setTitle(noteDetails.getTitle());
        existingNote.setContent(noteDetails.getContent());
        existingNote.setCategory(noteDetails.getCategory());
        existingNote.setTags(noteDetails.getTags() != null ? noteDetails.getTags() : new java.util.HashSet<>());
        existingNote.setIsFavorite(noteDetails.getIsFavorite() != null ? noteDetails.getIsFavorite() : false);

        // 只有笔记所有者可以修改公开状态
        if (noteDetails.getIsPublic() != null) {
            existingNote.setIsPublic(noteDetails.getIsPublic());
        }

        return noteRepository.save(existingNote);
    }

    // 切换收藏状态
    public Note toggleFavorite(Long userId, Long noteId) {
        Note note = noteRepository.findByIdAndUser_Id(noteId, userId)
                .orElseThrow(() -> new NoteNotFoundException("Note not found or access denied"));

        note.setIsFavorite(!note.getIsFavorite());
        return noteRepository.save(note);
    }

    // 切换公开状态
    public Note togglePublic(Long userId, Long noteId) {
        Note note = noteRepository.findByIdAndUser_Id(noteId, userId)
                .orElseThrow(() -> new NoteNotFoundException("Note not found or access denied"));

        note.setIsPublic(!note.getIsPublic());
        return noteRepository.save(note);
    }

    // 删除笔记
    public void deleteNote(Long userId, Long noteId) {
        Note note = noteRepository.findByIdAndUser_Id(noteId, userId)
                .orElseThrow(() -> new NoteNotFoundException("Note not found or access denied"));

        noteRepository.delete(note);
    }

    // 批量删除笔记
    public void deleteNotes(Long userId, List<Long> noteIds) {
        validateUser(userId);

        for (Long noteId : noteIds) {
            Optional<Note> note = noteRepository.findByIdAndUser_Id(noteId, userId);
            if (note.isPresent()) {
                noteRepository.delete(note.get());
            }
        }
    }

    // 获取用户笔记统计
    public NoteStats getUserNoteStats(Long userId) {
        validateUser(userId);

        Long totalNotes = noteRepository.countByUserId(userId);
        Long favoriteNotes = noteRepository.countFavoritesByUserId(userId);
        List<String> subjects = noteRepository.findAllSubjectsByUserId(userId);
        List<String> categories = noteRepository.findAllCategoriesByUserId(userId);

        return new NoteStats(totalNotes, favoriteNotes, subjects.size(), categories.size());
    }

    // 获取最近更新的笔记
    public List<Note> getRecentlyUpdatedNotes(Long userId) {
        validateUser(userId);
        return noteRepository.findTop10ByUser_IdOrderByUpdatedAtDesc(userId);
    }

    // 获取最近创建的笔记
    public List<Note> getRecentlyCreatedNotes(Long userId) {
        validateUser(userId);
        return noteRepository.findTop10ByUser_IdOrderByCreatedAtDesc(userId);
    }

    // 获取公开笔记（不需要用户验证）
    public Page<Note> getPublicNotes(Pageable pageable) {
        return noteRepository.findPublicNotes(pageable);
    }

    // 获取用户的公开笔记
    public Page<Note> getUserPublicNotes(Long userId, Pageable pageable) {
        validateUser(userId);
        return noteRepository.findPublicNotesByUser_Id(userId, pageable);
    }

    // 辅助方法：验证用户存在性
    private User validateUser(Long userId) {
        return userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found or inactive"));
    }

    // 内部类：笔记统计
    public static class NoteStats {
        private final Long totalNotes;
        private final Long favoriteNotes;
        private final Integer totalSubjects;
        private final Integer totalCategories;

        public NoteStats(Long totalNotes, Long favoriteNotes, Integer totalSubjects, Integer totalCategories) {
            this.totalNotes = totalNotes;
            this.favoriteNotes = favoriteNotes;
            this.totalSubjects = totalSubjects;
            this.totalCategories = totalCategories;
        }

        // Getters
        public Long getTotalNotes() { return totalNotes; }
        public Long getFavoriteNotes() { return favoriteNotes; }
        public Integer getTotalSubjects() { return totalSubjects; }
        public Integer getTotalCategories() { return totalCategories; }
    }
}