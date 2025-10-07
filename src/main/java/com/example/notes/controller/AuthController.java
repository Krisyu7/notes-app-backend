package com.example.notes.controller;

import com.example.notes.entity.User;
import com.example.notes.service.UserService;
import com.example.notes.dto.LoginRequest;
import com.example.notes.dto.RegisterRequest;
import com.example.notes.dto.AuthResponse;
import com.example.notes.dto.UserProfileResponse;
import com.example.notes.dto.ErrorResponse;
import com.example.notes.config.JwtUtil;
import com.example.notes.exception.AuthenticationException;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // 用户注册
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.registerUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword()
        );

        // 生成JWT token
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());
        AuthResponse response = new AuthResponse(
                token,
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 用户登录
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOpt = userService.authenticateUser(
                request.getUsernameOrEmail(),
                request.getPassword()
        );

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // 生成JWT token
            String token = jwtUtil.generateToken(user.getUsername(), user.getId());
            AuthResponse response = new AuthResponse(
                    token,
                    user.getUsername(),
                    user.getEmail(),
                    user.getDisplayName()
            );

            return ResponseEntity.ok(response);
        } else {
            ErrorResponse errorResponse = ErrorResponse.unauthorized("Invalid username/email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    // 获取用户资料
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            // 向后兼容支持
            String userIdHeader = request.getHeader("User-Id");
            if (userIdHeader != null) {
                userId = Long.parseLong(userIdHeader);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }
        Optional<User> userOpt = userService.getUserById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            UserProfileResponse profile = new UserProfileResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getDisplayName(),
                    user.getAvatarUrl(),
                    user.getCreatedAt(),
                    user.getLastLoginAt()
            );
            return ResponseEntity.ok(profile);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 更新用户资料
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            HttpServletRequest request,
            @RequestBody UpdateProfileRequest updateRequest) {
        
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            // 向后兼容支持
            String userIdHeader = request.getHeader("User-Id");
            if (userIdHeader != null) {
                userId = Long.parseLong(userIdHeader);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

        User updatedUser = userService.updateUser(
                userId,
                updateRequest.getDisplayName(),
                updateRequest.getAvatarUrl()
        );

        UserProfileResponse profile = new UserProfileResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getDisplayName(),
                updatedUser.getAvatarUrl(),
                updatedUser.getCreatedAt(),
                updatedUser.getLastLoginAt()
        );

        return ResponseEntity.ok(profile);
    }

    // 修改密码
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            HttpServletRequest request,
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            // 向后兼容支持
            String userIdHeader = request.getHeader("User-Id");
            if (userIdHeader != null) {
                userId = Long.parseLong(userIdHeader);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

        userService.changePassword(userId, changePasswordRequest.getOldPassword(), changePasswordRequest.getNewPassword());
        return ResponseEntity.ok().build();
    }

    // 检查用户名是否可用
    @GetMapping("/check-username/{username}")
    public ResponseEntity<AvailabilityResponse> checkUsername(@PathVariable String username) {
        boolean available = userService.isUsernameAvailable(username);
        return ResponseEntity.ok(new AvailabilityResponse(available));
    }

    // 检查邮箱是否可用
    @GetMapping("/check-email/{email}")
    public ResponseEntity<AvailabilityResponse> checkEmail(@PathVariable String email) {
        boolean available = userService.isEmailAvailable(email);
        return ResponseEntity.ok(new AvailabilityResponse(available));
    }

    // 登出（暂时只是客户端清除token）
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // JWT模式下，登出主要是客户端删除token
        // 如果需要服务器端登出，可以维护一个黑名单
        return ResponseEntity.ok().build();
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Auth API is working! Current time: " + java.time.LocalDateTime.now());
    }

    // 内部DTO类
    public static class UpdateProfileRequest {
        private String displayName;
        private String avatarUrl;

        // Getters and setters
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;

        // Getters and setters
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class AvailabilityResponse {
        private boolean available;

        public AvailabilityResponse(boolean available) {
            this.available = available;
        }

        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
    }
}