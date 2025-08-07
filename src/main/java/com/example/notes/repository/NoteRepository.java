package com.example.notes.repository;

import com.example.notes.entity.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    // Find all notes ordered by update time
    Page<Note> findAllByOrderByUpdatedAtDesc(Pageable pageable);

    // Find notes by subject
    Page<Note> findBySubjectOrderByUpdatedAtDesc(String subject, Pageable pageable);

    // Find favorite notes
    Page<Note> findByIsFavoriteTrueOrderByUpdatedAtDesc(Pageable pageable);

    @Query("SELECT DISTINCT t FROM Note n JOIN n.tags t ORDER BY t")
    List<String> findAllTags();

    // Search notes with keyword and filters
    @Query("SELECT n FROM Note n WHERE " +
            "(:keyword IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:subject IS NULL OR n.subject = :subject) AND " +
            "(:isFavorite IS NULL OR n.isFavorite = :isFavorite)")
    Page<Note> searchNotes(@Param("keyword") String keyword,
                           @Param("subject") String subject,
                           @Param("isFavorite") Boolean isFavorite,
                           Pageable pageable);

    // Get all distinct subjects for dropdown selection
    @Query("SELECT DISTINCT n.subject FROM Note n ORDER BY n.subject")
    List<String> findAllSubjects();
}