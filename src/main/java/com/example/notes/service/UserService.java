package com.example.notes.service;

import com.example.notes.entity.User;
import com.example.notes.exception.UserAlreadyExistsException;
import com.example.notes.exception.UserNotFoundException;
import com.example.notes.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 用户注册
    public User registerUser(String username, String email, String password) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(username)) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setDisplayName(username); // 默认显示名为用户名
        user.setIsActive(true);

        return userRepository.save(user);
    }

    // 用户登录验证
    public Optional<User> authenticateUser(String usernameOrEmail, String password) {
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getIsActive() && passwordEncoder.matches(password, user.getPassword())) {
                // 更新最后登录时间
                updateLastLoginTime(user.getId());
                return Optional.of(user);
            }
        }

        return Optional.empty();
    }

    // 根据ID获取用户
    public Optional<User> getUserById(Long id) {
        return userRepository.findByIdAndIsActiveTrue(id);
    }

    // 根据用户名获取用户
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsernameAndIsActiveTrue(username);
    }

    // 根据邮箱获取用户
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email);
    }

    // 更新用户信息
    public User updateUser(Long userId, String displayName, String avatarUrl) {
        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (displayName != null && !displayName.trim().isEmpty()) {
            user.setDisplayName(displayName.trim());
        }

        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }

        return userRepository.save(user);
    }

    // 更改密码
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid old password");
        }

        // 设置新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // 重置密码（忘记密码功能）
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // 更新用户名
    public User updateUsername(Long userId, String newUsername) {
        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // 检查新用户名是否已被占用
        if (userRepository.existsByUsernameAndIdNot(newUsername, userId)) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        user.setUsername(newUsername);
        return userRepository.save(user);
    }

    // 更新邮箱
    public User updateEmail(Long userId, String newEmail) {
        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // 检查新邮箱是否已被占用
        if (userRepository.existsByEmailAndIdNot(newEmail, userId)) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        user.setEmail(newEmail);
        return userRepository.save(user);
    }

    // 停用用户账户
    public void deactivateUser(Long userId) {
        userRepository.updateUserStatus(userId, false);
    }

    // 激活用户账户
    public void activateUser(Long userId) {
        userRepository.updateUserStatus(userId, true);
    }

    // 删除用户（软删除，实际是停用）
    public void deleteUser(Long userId) {
        deactivateUser(userId);
    }

    // 更新最后登录时间
    public void updateLastLoginTime(Long userId) {
        userRepository.updateLastLoginTime(userId, LocalDateTime.now());
    }

    // 验证用户名可用性
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    // 验证邮箱可用性
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    // 获取活跃用户列表（管理功能）
    public List<User> getActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }

    // 搜索用户（管理功能）
    public List<User> searchUsers(String keyword) {
        return userRepository.searchUsers(keyword);
    }

    // 用户统计
    public UserStats getUserStats() {
        Long activeUsers = userRepository.countActiveUsers();
        Long newUsersThisMonth = userRepository.countUsersCreatedAfter(
                LocalDateTime.now().minusMonths(1)
        );

        return new UserStats(activeUsers, newUsersThisMonth);
    }

    // 内部类：用户统计
    public static class UserStats {
        private final Long activeUsers;
        private final Long newUsersThisMonth;

        public UserStats(Long activeUsers, Long newUsersThisMonth) {
            this.activeUsers = activeUsers;
            this.newUsersThisMonth = newUsersThisMonth;
        }

        public Long getActiveUsers() { return activeUsers; }
        public Long getNewUsersThisMonth() { return newUsersThisMonth; }
    }
}