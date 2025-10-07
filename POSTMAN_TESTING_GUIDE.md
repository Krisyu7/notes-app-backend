# Smart Notes API - Postman 完整测试指南 🧪

## 测试前准备

### 1. 启动应用
```bash
# 确保 .env 文件已配置
mvn spring-boot:run
```

### 2. 基础URL
```
http://localhost:8080
```

### 3. 测试用户数据
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

---

## 📋 完整测试清单

### **阶段 1: 基础连接测试**

#### ✅ Test 1.1: 服务器连通性
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/auth/test`
- **预期结果**: 200 OK
- **Response**: `"Auth API is working! Current time: ..."`

#### ✅ Test 1.2: Notes API连通性
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/test`
- **预期结果**: 200 OK
- **Response**: `"Notes API is working! Current time: ..."`

---

### **阶段 2: 用户注册和认证测试**

#### ✅ Test 2.1: 用户注册 (成功)
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```
- **预期结果**: 201 Created
- **预期Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...", 
  "username": "testuser",
  "email": "test@example.com",
  "displayName": "testuser"
}
```
- **⚠️ 保存token**: 后续测试需要！

#### ✅ Test 2.2: 重复注册 (应该失败)
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/register`
- **Body**: 同上
- **预期结果**: 409 Conflict
- **预期Response**:
```json
{
  "error": "Conflict",
  "message": "Username already exists",
  "timestamp": "..."
}
```

#### ✅ Test 2.3: 注册验证失败
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/register`
- **Body**:
```json
{
  "username": "ab",
  "email": "invalid-email",
  "password": "123"
}
```
- **预期结果**: 400 Bad Request
- **预期Response**: 包含验证错误详情

#### ✅ Test 2.4: 用户登录 (成功)
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/login`
- **Body**:
```json
{
  "usernameOrEmail": "testuser",
  "password": "password123"
}
```
- **预期结果**: 200 OK
- **预期Response**: 包含JWT token
- **⚠️ 更新token**: 使用最新的token

#### ✅ Test 2.5: 登录失败
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/login`
- **Body**:
```json
{
  "usernameOrEmail": "testuser",
  "password": "wrongpassword"
}
```
- **预期结果**: 401 Unauthorized
- **预期Response**:
```json
{
  "error": "Unauthorized",
  "message": "Invalid username/email or password"
}
```

#### ✅ Test 2.6: 邮箱登录
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/login`
- **Body**:
```json
{
  "usernameOrEmail": "test@example.com",
  "password": "password123"
}
```
- **预期结果**: 200 OK

---

### **阶段 3: JWT认证测试**

#### ✅ Test 3.1: 获取用户资料 (JWT)
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/auth/profile`
- **Headers**: 
  - `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK
- **预期Response**:
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "displayName": "testuser",
  "avatarUrl": null,
  "createdAt": "...",
  "lastLoginAt": "..."
}
```

#### ✅ Test 3.2: 无Token访问 (应该失败)
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/auth/profile`
- **Headers**: 无Authorization
- **预期结果**: 401 Unauthorized

#### ✅ Test 3.3: 无效Token (应该失败)
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/auth/profile`
- **Headers**: `Authorization: Bearer invalid_token`
- **预期结果**: 401 Unauthorized

#### ✅ Test 3.4: 旧方式认证 (向后兼容)
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/auth/profile`
- **Headers**: `User-Id: 1`
- **预期结果**: 200 OK (但应该有警告日志)

---

### **阶段 4: 用户管理功能测试**

#### ✅ Test 4.1: 更新用户资料
- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/auth/profile`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:
```json
{
  "displayName": "Test User Updated",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```
- **预期结果**: 200 OK

#### ✅ Test 4.2: 修改密码
- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/auth/password`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```
- **预期结果**: 200 OK

#### ✅ Test 4.3: 用错误旧密码修改 (应该失败)
- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/auth/password`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:
```json
{
  "oldPassword": "wrongpassword",
  "newPassword": "newpassword123"
}
```
- **预期结果**: 400 Bad Request

#### ✅ Test 4.4: 检查用户名可用性
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/auth/check-username/availableuser`
- **预期结果**: 200 OK
- **预期Response**:
```json
{
  "available": true
}
```

#### ✅ Test 4.5: 检查已存在用户名
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/auth/check-username/testuser`
- **预期结果**: 200 OK
- **预期Response**:
```json
{
  "available": false
}
```

#### ✅ Test 4.6: 检查邮箱可用性
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/auth/check-email/new@example.com`
- **预期结果**: 200 OK

---

### **阶段 5: 笔记管理测试**

#### ✅ Test 5.1: 创建笔记
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/notes`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:
```json
{
  "subject": "数学",
  "title": "微积分基础",
  "content": "导数的定义和基本性质...",
  "tags": ["数学", "微积分", "导数"],
  "category": "学习笔记",
  "isFavorite": false,
  "isPublic": false
}
```
- **预期结果**: 201 Created
- **⚠️ 保存noteId**: 后续测试需要

#### ✅ Test 5.2: 获取用户所有笔记
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK
- **预期Response**: 分页的笔记列表

#### ✅ Test 5.3: 分页测试
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes?page=0&size=5&sortBy=createdAt&sortDir=desc`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 5.4: 根据ID获取笔记
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/{noteId}`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 5.5: 获取不存在的笔记
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/99999`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 404 Not Found

#### ✅ Test 5.6: 更新笔记
- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/notes/{noteId}`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:
```json
{
  "subject": "数学",
  "title": "微积分基础 - 更新版",
  "content": "更新后的内容...",
  "tags": ["数学", "微积分"],
  "category": "学习笔记",
  "isFavorite": true,
  "isPublic": false
}
```
- **预期结果**: 200 OK

#### ✅ Test 5.7: 切换收藏状态
- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/notes/{noteId}/favorite`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 5.8: 切换公开状态
- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/notes/{noteId}/public`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

---

### **阶段 6: 笔记搜索和筛选测试**

#### ✅ Test 6.1: 关键词搜索
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/search?keyword=微积分`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 6.2: 按科目筛选
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/search?subject=数学`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 6.3: 按分类筛选
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/search?category=学习笔记`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 6.4: 只显示收藏
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/search?isFavorite=true`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 6.5: 复合搜索
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/search?keyword=微积分&subject=数学&isFavorite=true`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 6.6: 按科目获取笔记
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/subject/数学`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 6.7: 按标签获取笔记
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/tag/数学`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

---

### **阶段 7: 笔记元数据测试**

#### ✅ Test 7.1: 获取用户所有科目
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/subjects`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK
- **预期Response**: `["数学", "物理", ...]`

#### ✅ Test 7.2: 获取用户所有标签
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/tags`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 7.3: 获取用户所有分类
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/categories`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 7.4: 获取收藏笔记
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/favorites`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 7.5: 获取笔记统计
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/stats`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK
- **预期Response**:
```json
{
  "totalNotes": 5,
  "favoriteNotes": 2,
  "totalSubjects": 3,
  "totalCategories": 2
}
```

#### ✅ Test 7.6: 获取最近更新的笔记
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/recent/updated`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

#### ✅ Test 7.7: 获取最近创建的笔记
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/recent/created`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

---

### **阶段 8: 批量操作测试**

#### ✅ Test 8.1: 创建多个笔记 (准备数据)
创建3-5个不同的笔记用于批量操作测试

#### ✅ Test 8.2: 批量删除笔记
- **Method**: `DELETE`
- **URL**: `http://localhost:8080/api/notes/batch`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**: `[1, 2, 3]` (笔记ID数组)
- **预期结果**: 204 No Content

#### ✅ Test 8.3: 删除单个笔记
- **Method**: `DELETE`
- **URL**: `http://localhost:8080/api/notes/{noteId}`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 204 No Content

---

### **阶段 9: 公开笔记功能测试**

#### ✅ Test 9.1: 创建公开笔记
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/notes`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:
```json
{
  "subject": "编程",
  "title": "JavaScript基础",
  "content": "JavaScript是一种编程语言...",
  "isPublic": true
}
```
- **预期结果**: 201 Created

#### ✅ Test 9.2: 获取所有公开笔记 (无需认证)
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/public`
- **预期结果**: 200 OK

#### ✅ Test 9.3: 获取我的公开笔记
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes/public/mine`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

---

### **阶段 10: 错误处理和边界测试**

#### ✅ Test 10.1: 创建无效笔记
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/notes`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:
```json
{
  "subject": "",
  "title": "",
  "content": ""
}
```
- **预期结果**: 400 Bad Request

#### ✅ Test 10.2: 超长内容测试
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/notes`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**: content字段超过10000字符
- **预期结果**: 400 Bad Request

#### ✅ Test 10.3: 访问其他用户的笔记 (应该失败)
创建第二个用户，尝试访问第一个用户的笔记
- **预期结果**: 404 Not Found

#### ✅ Test 10.4: Token过期测试
等待token过期或使用过期token
- **预期结果**: 401 Unauthorized

#### ✅ Test 10.5: 大分页测试
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/notes?size=200`
- **预期结果**: size应该被限制为100

---

### **阶段 11: 退出登录测试**

#### ✅ Test 11.1: 退出登录
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/logout`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **预期结果**: 200 OK

---

## 🎯 测试检查清单

### 必须通过的核心测试:
- [ ] 服务器连通性 (Test 1.1, 1.2)
- [ ] 用户注册和登录 (Test 2.1, 2.4)
- [ ] JWT认证工作正常 (Test 3.1)
- [ ] 创建和获取笔记 (Test 5.1, 5.2, 5.4)
- [ ] 更新和删除笔记 (Test 5.6, 8.3)
- [ ] 搜索功能 (Test 6.1-6.3)
- [ ] 基本错误处理 (Test 2.2, 2.5, 5.5)

### 高级功能测试:
- [ ] 分页和排序 (Test 5.3)
- [ ] 批量操作 (Test 8.2)
- [ ] 公开笔记 (Test 9.1-9.3)
- [ ] 用户管理 (Test 4.1-4.6)

### 安全性测试:
- [ ] 无Token访问被拒绝 (Test 3.2)
- [ ] 无效Token被拒绝 (Test 3.3)
- [ ] 登录失败处理 (Test 2.5)
- [ ] 输入验证 (Test 2.3, 10.1)

---

## 🚨 常见问题排查

### 如果测试失败:
1. **检查应用是否启动**: 访问 `http://localhost:8080/api/auth/test`
2. **检查环境变量**: 确认 `.env` 文件配置正确
3. **检查数据库**: 确认MySQL运行且数据库存在
4. **检查Token**: JWT是否正确设置在Authorization header中
5. **检查Content-Type**: POST/PUT请求需要 `application/json`

### Token格式:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInVzZXJJZCI6MSwiaWF0IjoxNjk5...
```

**记住**: 每个测试都很重要，不要跳过任何一个！ 🧪