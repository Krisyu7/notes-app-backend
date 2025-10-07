# 环境配置指南 🔧

## 重要提醒 ⚠️
**绝对不要将 `.env` 文件提交到Git！**
所有敏感信息都应该通过环境变量配置。

## 快速开始

### 1. 复制环境变量模板
```bash
cp .env.example .env
```

### 2. 编辑 .env 文件
打开 `.env` 文件，填入你的实际配置：

```bash
# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/notes_db?useSSL=false&serverTimezone=UTC&characterEncoding=utf8&allowPublicKeyRetrieval=true
DB_USERNAME=your_database_username
DB_PASSWORD=your_secure_password

# Google Gemini API Configuration
GEMINI_API_KEY=your_actual_google_api_key

# JWT Configuration - 请生成一个强密钥
JWT_SECRET=your_very_secure_and_long_jwt_secret_key
JWT_EXPIRATION=86400000

# Server Configuration
SERVER_PORT=8080

# Application Environment
SPRING_PROFILES_ACTIVE=dev
```

## 环境变量说明

### 数据库配置
- **DB_URL**: MySQL数据库连接字符串
- **DB_USERNAME**: 数据库用户名
- **DB_PASSWORD**: 数据库密码

### Google Gemini API
- **GEMINI_API_KEY**: 从 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取

### JWT 安全配置
- **JWT_SECRET**: JWT签名密钥，建议至少256位
- **JWT_EXPIRATION**: Token过期时间（毫秒），默认24小时

### 服务器配置
- **SERVER_PORT**: 应用运行端口，默认8080

## 生成强JWT密钥

### 方法1: 使用在线工具
访问 https://jwtsecret.com/generate 生成256位密钥

### 方法2: 使用命令行
```bash
# Linux/macOS
openssl rand -base64 64

# Windows PowerShell
[System.Web.Security.Membership]::GeneratePassword(64, 0)
```

### 方法3: 使用Node.js
```javascript
require('crypto').randomBytes(64).toString('base64')
```

## 不同环境配置

### 开发环境 (.env)
```bash
SPRING_PROFILES_ACTIVE=dev
DB_URL=jdbc:mysql://localhost:3306/notes_db_dev
```

### 生产环境 (.env.production)
```bash
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://your-prod-server:3306/notes_db_prod
```

### 测试环境 (.env.test)
```bash
SPRING_PROFILES_ACTIVE=test
DB_URL=jdbc:mysql://localhost:3306/notes_db_test
```

## 部署指南

### Docker部署
```bash
# 使用环境变量文件
docker run --env-file .env your-app-image

# 或直接设置环境变量
docker run -e DB_PASSWORD=your_password your-app-image
```

### 云平台部署
在云平台（如Heroku、AWS、Azure）中设置环境变量：

1. **Heroku**:
```bash
heroku config:set DB_PASSWORD=your_password
heroku config:set JWT_SECRET=your_jwt_secret
```

2. **Docker Compose**:
```yaml
services:
  notes-app:
    environment:
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
```

## 安全最佳实践

### 1. 环境变量命名
- 使用大写字母和下划线
- 避免特殊字符
- 使用描述性名称

### 2. 密钥管理
- JWT密钥至少256位
- 定期轮换密钥
- 不要在代码中硬编码任何密钥

### 3. Git安全
- 确保 `.env` 在 `.gitignore` 中
- 只提交 `.env.example` 模板
- 绝不提交真实的API密钥

### 4. 数据库安全
- 使用强密码
- 限制数据库用户权限
- 启用SSL连接

## 故障排除

### 常见错误

1. **应用启动失败**
   - 检查 `.env` 文件是否存在
   - 验证所有必需的环境变量是否设置

2. **数据库连接失败**
   - 确认数据库服务运行
   - 检查连接字符串格式
   - 验证用户名和密码

3. **JWT错误**
   - 确保JWT_SECRET长度足够
   - 检查密钥格式

### 环境变量检查
在应用启动时，可以添加以下代码检查环境变量：

```java
@PostConstruct
public void checkEnvironmentVariables() {
    String[] required = {"DB_URL", "DB_USERNAME", "DB_PASSWORD", "JWT_SECRET"};
    for (String var : required) {
        if (System.getenv(var) == null) {
            throw new IllegalStateException("Required environment variable not set: " + var);
        }
    }
}
```

## 团队协作

### 新成员设置
1. 克隆项目后立即复制 `.env.example` 为 `.env`
2. 向团队成员索要实际的配置值
3. 不要在聊天工具中分享敏感信息

### 配置更新
- 有新的环境变量时，更新 `.env.example`
- 通知团队成员更新本地 `.env` 文件
- 更新此文档

---

**记住：安全性是团队的责任！** 🛡️