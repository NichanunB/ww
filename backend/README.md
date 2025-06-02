# NovelSync Backend

A Go backend API for the NovelSync character diagram application. This backend provides authentication, project management, and character relationship storage capabilities.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Project Management**: CRUD operations for character diagram projects  
- **Real-time Auto-save**: Automatic saving of diagram changes
- **File Upload Support**: Profile images and project cover images
- **MySQL Database**: Robust data storage with proper relationships
- **CORS Support**: Configured for frontend integration

## Tech Stack

- **Go 1.21+**
- **Gin Web Framework**: Fast HTTP router and middleware
- **MySQL**: Primary database
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing

## Quick Start

### Prerequisites

- Go 1.21 or higher
- MySQL 8.0 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd novelsync-backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Setup MySQL Database**
   ```bash
   mysql -u root -p < database_schema.sql
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

5. **Run the application**
   ```bash
   go run cmd/server/main.go
   ```

The server will start on `http://localhost:8080`

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration  
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=novelsync

# JWT Secret (use a long, random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=8080
GIN_MODE=debug

# CORS Configuration  
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## API Endpoints

### Authentication

- `POST /api/register` - User registration
- `POST /api/login` - User login  
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)
- `POST /api/user/logout` - Logout (protected)

### Projects

- `GET /api/projects` - Get public projects
- `POST /api/projects` - Create new project (protected)
- `GET /api/projects/my` - Get user's projects (protected)
- `GET /api/projects/:id` - Get specific project (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)
- `POST /api/projects/:id/save` - Save project data (protected)
- `POST /api/projects/:id/autosave` - Auto-save project (protected)

### Example API Usage

**User Registration:**
```bash
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "John Doe",
    "email": "john@example.com", 
    "password": "password123"
  }'
```

**User Login:**
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Create Project (with auth token):**
```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Fantasy Novel Characters",
    "description": "Character relationships for my fantasy story"
  }'
```

## Database Schema

The application uses the following main tables:

- **users**: User accounts and profiles
- **projects**: Character diagram projects  
- **characters**: Individual character data (optional structured storage)
- **relationships**: Character relationships (optional structured storage)
- **sessions**: JWT token management

## Project Structure

```
novelsync-backend/
├── cmd/
│   └── server/
│       └── main.go              # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go            # Configuration management
│   ├── database/
│   │   └── database.go          # Database connection
│   ├── handlers/
│   │   ├── auth.go              # Authentication handlers
│   │   └── project.go           # Project handlers
│   ├── middleware/
│   │   ├── auth.go              # JWT authentication middleware
│   │   └── logging.go           # Request logging middleware
│   ├── models/
│   │   ├── user.go              # User data models
│   │   ├── project.go           # Project data models
│   │   └── response.go          # API response models
│   ├── services/
│   │   ├── auth_service.go      # Authentication business logic
│   │   └── project_service.go   # Project business logic
│   └── routes/
│       └── routes.go            # Route definitions
├── .env.example                 # Environment variables template
├── database_schema.sql          # MySQL database schema
├── go.mod                       # Go module definition
└── README.md                    # This file
```

## Development

### Running Tests

```bash
go test ./...
```

### Building for Production

```bash
go build -o bin/server cmd/server/main.go
```

### Database Migrations

The application expects the database schema to be set up manually using the provided `database_schema.sql` file. For production, consider using a proper migration tool.

## Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: Secure token-based authentication  
- **CORS Protection**: Configurable origin restrictions
- **Input Validation**: Request data validation
- **SQL Injection Prevention**: Parameterized queries

## Deployment

For production deployment:

1. Set `GIN_MODE=release` in environment
2. Use a strong, unique JWT secret
3. Enable HTTPS
4. Configure database connection pooling
5. Set up proper logging and monitoring
6. Use environment variables for all sensitive configuration

## Frontend Integration

This backend is designed to work with the React frontend. Make sure to:

1. Configure CORS origins to include your frontend URL
2. Set the correct API base URL in your frontend
3. Handle JWT token storage and refresh in the frontend
4. Implement proper error handling for API responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable  
5. Submit a pull request

## License

This project is licensed under the MIT License.