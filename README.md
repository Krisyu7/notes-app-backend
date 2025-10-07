# Smart Notes - Intelligent Note Management System

A modern note management application with integrated AI assistant functionality to help users record and learn more efficiently.

## Features

- **Note Management** - Create, edit, delete, and search notes
- **Tag System** - Support for multi-tag categorization and filtering
- **Favorites** - Bookmark important notes
- **Smart Search** - Keyword search with multi-condition filtering
- **AI Assistant** - Intelligent Q&A powered by Google Gemini
- **Theme Toggle** - Support for light and dark themes
- **Responsive Design** - Perfect for desktop and mobile devices

## Tech Stack

### Backend
- **Spring Boot 3.1.0** - Main framework
- **Spring Data JPA** - Data persistence
- **MySQL** - Relational database
- **Spring Security + JWT** - Authentication and authorization
- **Google Gemini API** - AI conversation functionality

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern styling and animations
- **Fetch API** - HTTP requests

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Google Gemini API Key

### 1. Clone the Project

```bash
git clone https://github.com/Krisyu7/notes-app-backend.git
cd notes-app-backend
```

### 2. Setup Database

Create a MySQL database:
```sql
CREATE DATABASE notes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and configure your settings:
```properties
# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/notes_db?useSSL=false&serverTimezone=UTC&characterEncoding=utf8&allowPublicKeyRetrieval=true
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

# Google Gemini API Configuration
GEMINI_API_KEY=your_google_gemini_api_key_here

# JWT Configuration - Use a strong, unique secret key
JWT_SECRET=your_very_secure_jwt_secret_key_at_least_256_bits_long
JWT_EXPIRATION=86400000

# Server Configuration
SERVER_PORT=8080
```

**⚠️ Security Notice**: Never commit your `.env` file to version control!

### 4. Start Backend Service

```bash
mvn spring-boot:run
```

Backend service will start at `http://localhost:8080`

### 5. Access Application

- Backend API: `http://localhost:8080/api`
- API Documentation: `http://localhost:8080/swagger-ui.html` (if enabled)
- Test endpoints using tools like Postman or curl

For the complete application with frontend, see: [notes-app](https://github.com/Krisyu7/notes-app)

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile (requires JWT) |

### Note Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notes` | Get all notes | Yes |
| POST | `/api/notes` | Create note | Yes |
| GET | `/api/notes/{id}` | Get single note | Yes |
| PUT | `/api/notes/{id}` | Update note | Yes |
| DELETE | `/api/notes/{id}` | Delete note | Yes |
| PUT | `/api/notes/{id}/favorite` | Toggle favorite status | Yes |
| GET | `/api/notes/search` | Search notes | Yes |
| GET | `/api/notes/subjects` | Get subjects list | Yes |
| GET | `/api/notes/tags` | Get tags list | Yes |

### AI Assistant Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ai/chat` | AI chat | Yes |

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_URL` | MySQL database connection URL | Yes | - |
| `DB_USERNAME` | Database username | Yes | - |
| `DB_PASSWORD` | Database password | Yes | - |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `JWT_SECRET` | JWT signing secret (min 256 bits) | Yes | - |
| `JWT_EXPIRATION` | JWT token expiration (milliseconds) | No | 86400000 (24h) |
| `SERVER_PORT` | Server port | No | 8080 |

### Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Use strong JWT secret** - Minimum 256 bits, randomly generated
3. **Change default credentials** - Update all default passwords
4. **Enable HTTPS in production** - Use SSL/TLS certificates
5. **Regular security updates** - Keep dependencies up to date

## Contributing

1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- [Google Gemini](https://ai.google.dev/) - AI conversation functionality
- [Font Awesome](https://fontawesome.com/) - Icon library
- [Google Fonts](https://fonts.google.com/) - Font service

## Contact

For questions or suggestions, please create an [Issue](https://github.com/yourusername/smart-notes/issues) or contact:

- Email: minghao.yu0304@gmail.com
- GitHub: [@Krisyu7](https://github.com/Krisyu7)