package com.example.notes.repository;

import com.example.notes.entity.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    // 用户相关的基础查询
    Page<Note> findByUser_IdOrderByUpdatedAtDesc(Long userId, Pageable pageable);

    List<Note> findByUser_IdOrderByUpdatedAtDesc(Long userId);

    Optional<Note> findByIdAndUser_Id(Long id, Long userId);

    // 按科目查询用户的笔记
    Page<Note> findByUser_IdAndSubjectOrderByUpdatedAtDesc(Long userId, String subject, Pageable pageable);

    // 查询用户的收藏笔记
    Page<Note> findByUser_IdAndIsFavoriteTrueOrderByUpdatedAtDesc(Long userId, Pageable pageable);

    // 按分类查询用户的笔记
    Page<Note> findByUser_IdAndCategoryOrderByUpdatedAtDesc(Long userId, String category, Pageable pageable);

    // 获取用户的所有标签
    @Query("SELECT DISTINCT t FROM Note n JOIN n.tags t WHERE n.user.id = :userId ORDER BY t")
    List<String> findAllTagsByUserId(@Param("userId") Long userId);

    // 获取用户的所有科目
    @Query("SELECT DISTINCT n.subject FROM Note n WHERE n.user.id = :userId ORDER BY n.subject")
    List<String> findAllSubjectsByUserId(@Param("userId") Long userId);

    // 获取用户的所有分类
    @Query("SELECT DISTINCT n.category FROM Note n WHERE n.user.id = :userId AND n.category IS NOT NULL ORDER BY n.category")
    List<String> findAllCategoriesByUserId(@Param("userId") Long userId);

    // 用户笔记的高级搜索
    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND " +
            "(:keyword IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:subject IS NULL OR n.subject = :subject) AND " +
            "(:category IS NULL OR n.category = :category) AND " +
            "(:isFavorite IS NULL OR n.isFavorite = :isFavorite) " +
            "ORDER BY n.updatedAt DESC")
    Page<Note> searchUserNotes(@Param("userId") Long userId,
                               @Param("keyword") String keyword,
                               @Param("subject") String subject,
                               @Param("category") String category,
                               @Param("isFavorite") Boolean isFavorite,
                               Pageable pageable);

    // 按标签搜索用户笔记
    @Query("SELECT n FROM Note n JOIN n.tags t WHERE n.user.id = :userId AND t = :tag ORDER BY n.updatedAt DESC")
    Page<Note> findByUser_IdAndTag(@Param("userId") Long userId, @Param("tag") String tag, Pageable pageable);

    // 查询用户笔记统计信息
    @Query("SELECT COUNT(n) FROM Note n WHERE n.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Note n WHERE n.user.id = :userId AND n.isFavorite = true")
    Long countFavoritesByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Note n WHERE n.user.id = :userId AND n.subject = :subject")
    Long countByUserIdAndSubject(@Param("userId") Long userId, @Param("subject") String subject);

    // 删除用户的所有笔记（用户注销时使用）
    @Modifying
    @Query("DELETE FROM Note n WHERE n.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    // 查询用户最近更新的笔记
    List<Note> findTop10ByUser_IdOrderByUpdatedAtDesc(Long userId);

    // 查询用户最近创建的笔记
    List<Note> findTop10ByUser_IdOrderByCreatedAtDesc(Long userId);

    // 公开笔记相关（如果后续需要分享功能）
    @Query("SELECT n FROM Note n WHERE n.isPublic = true ORDER BY n.updatedAt DESC")
    Page<Note> findPublicNotes(Pageable pageable);

    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND n.isPublic = true ORDER BY n.updatedAt DESC")
    Page<Note> findPublicNotesByUser_Id(@Param("userId") Long userId, Pageable pageable);
}