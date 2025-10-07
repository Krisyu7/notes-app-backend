package com.example.notes.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class AuthUtil {
    
    public static Long getCurrentUserId() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        HttpServletRequest request = attrs.getRequest();
        
        // 首先尝试从JWT filter设置的属性中获取
        Object userId = request.getAttribute("userId");
        if (userId != null) {
            return (Long) userId;
        }
        
        // 向后兼容：尝试从User-Id header获取（临时支持）
        String userIdHeader = request.getHeader("User-Id");
        if (userIdHeader != null) {
            try {
                return Long.parseLong(userIdHeader);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid User-Id header format");
            }
        }
        
        throw new IllegalArgumentException("No user authentication information found");
    }
    
    public static String getCurrentUsername() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        HttpServletRequest request = attrs.getRequest();
        
        Object username = request.getAttribute("username");
        if (username != null) {
            return (String) username;
        }
        
        throw new IllegalArgumentException("No username information found");
    }
}