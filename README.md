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
- **H2 Database** - In-memory database
- **Google Gemini API** - AI conversation functionality

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern styling and animations
- **Fetch API** - HTTP requests

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.6+
- Google Gemini API Key

### 1. Clone the Project

```bash
git clone https://github.com/yourusername/smart-notes.git
cd smart-notes
```

### 2. Configure Backend

```bash
cd backend
```

Copy configuration template:
```bash
cp application.properties.template application.properties
```

Edit `application.properties` and add your API key:
```properties
gemini.api.key=YOUR_GEMINI_API_KEY
```

### 3. Start Backend Service

```bash
mvn spring-boot:run
```

Backend service will start at `http://localhost:8080`

### 4. Start Frontend

Open `frontend/index.html` directly in browser, or use a local server:

```bash
cd frontend
# If you have Python
python -m http.server 3000

# Or using Node.js
npx serve .
```

### 5. Access Application

Open browser and visit:
- Frontend: `http://localhost:3000` (if using local server)
- Backend API: `http://localhost:8080/api`

## Usage Guide

### Basic Operations
1. **Create Note** - Click "New Note" button
2. **View Note** - Click on note card to view details
3. **Edit Note** - Click "Edit" button in note detail page
4. **Search Notes** - Use search box at the top
5. **Filter Notes** - Click filter chips

### AI Assistant
1. Open any note detail page
2. Enter your question in the AI assistant area
3. Click "Ask" button to get AI response

### Keyboard Shortcuts
- `Ctrl/Cmd + N` - New note
- `Ctrl/Cmd + /` - Focus search
- `Ctrl/Cmd + T` - Toggle theme
- `ESC` - Close modal

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `gemini.api.key` | Google Gemini API key | Required |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get notes list |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/{id}` | Get single note |
| PUT | `/api/notes/{id}` | Update note |
| DELETE | `/api/notes/{id}` | Delete note |
| PUT | `/api/notes/{id}/favorite` | Toggle favorite status |
| GET | `/api/notes/search` | Search notes |
| GET | `/api/notes/subjects` | Get subjects list |
| GET | `/api/notes/tags` | Get tags list |
| POST | `/api/ai/chat` | AI chat |

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