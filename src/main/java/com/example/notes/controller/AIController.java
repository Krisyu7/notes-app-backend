package com.example.notes.controller;

import com.example.notes.dto.AIRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AIController {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key:your-api-key-here}")
    private String geminiApiKey;

    public AIController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chatWithAI(@RequestBody AIRequest request) {
        try {
            String prompt = String.format(
                    "你是一个专业的学习助手。用户正在学习这篇笔记：\n\n【笔记内容】\n%s\n\n【用户问题】\n%s\n\n请基于笔记内容给出详细、有帮助的回答。用中文回答，语气友好专业。",
                    request.getNoteContent(),
                    request.getQuestion()
            );

            // 使用官方指南的正确格式
            String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-goog-api-key", geminiApiKey);  // 使用正确的header

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, String> text = new HashMap<>();
            text.put("text", prompt);
            content.put("parts", Arrays.asList(text));
            requestBody.put("contents", Arrays.asList(content));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> candidateContent = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) candidateContent.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String aiResponse = (String) parts.get(0).get("text");

                        Map<String, Object> result = new HashMap<>();
                        result.put("response", aiResponse);
                        result.put("success", true);
                        return ResponseEntity.ok(result);
                    }
                }
            }

            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "AI服务响应异常");
            errorResult.put("success", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);

        } catch (Exception e) {
            System.err.println("AI API调用异常: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "AI服务暂时不可用：" + e.getMessage());
            errorResult.put("success", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testAI() {
        if (geminiApiKey == null || geminiApiKey.equals("your-api-key-here")) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("AI服务未配置API密钥");
        }
        return ResponseEntity.ok("AI service is running with Gemini");
    }
}